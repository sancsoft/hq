using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Holiday;
using HQ.Abstractions.Times;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;

public class HolidayServiceV1
{
    private readonly HQDbContext _context;

    private readonly ILogger<ProjectStatusReportServiceV1> _logger;

    public HolidayServiceV1(HQDbContext context, ILogger<ProjectStatusReportServiceV1> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<UpsertHolidayV1.Response>> UpsertHolidayV1(UpsertHolidayV1.Request request, CancellationToken ct = default)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct))
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var weekStart = today.GetPeriodStartDate(Period.Week);
            var weekEnd = today.GetPeriodEndDate(Period.Week);

            try
            {
                var validationResult = Result.Merge(
            Result.FailIf(string.IsNullOrEmpty(request.Name), "Name is required."),
            Result.FailIf(await _context.Holidays.AnyAsync(t => t.Id != request.Id && t.Date == request.Date && t.Jurisdiciton == request.Jurisdiciton, ct), "Another holiday already exists on that date.")
        );

                if (validationResult.IsFailed)
                {
                    return validationResult;
                }

                var holiday = await _context.Holidays.FindAsync(request.Id);
                if (holiday == null)
                {
                    holiday = new();
                    _context.Holidays.Add(holiday);
                }

                holiday.Name = request.Name;
                holiday.Jurisdiciton = request.Jurisdiciton;
                holiday.Date = request.Date;

                await _context.SaveChangesAsync(ct);

                var holidayChargeCode = await _context.ChargeCodes.Where(t => t.Project!.Name.ToLower().Contains("holiday")).FirstOrDefaultAsync(ct);
                if (holidayChargeCode == null)
                {
                    return Result.Fail<UpsertHolidayV1.Response>("Holiday charge code not found");
                }
                if (holiday.Date >= weekStart && holiday.Date <= weekEnd)
                {
                    await GenerateTimeEntriesForHoliday(holiday, holidayChargeCode, ct);
                }
                await transaction.CommitAsync(ct);

                return new UpsertHolidayV1.Response()
                {
                    Id = holiday.Id
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Fail(new Error("An error occurred while upserting the Chargecode.").CausedBy(ex));
            }
        }
    }

    public async Task<Result<DeleteHolidayV1.Response?>> DeleteHolidayV1(DeleteHolidayV1.Request request, CancellationToken ct = default)
    {
        var holiday = await _context.Holidays.FindAsync(request.Id, ct);
        if (holiday == null)
        {
            return Result.Ok<DeleteHolidayV1.Response?>(null);
        }

        _context.Holidays.Remove(holiday);

        await _context.SaveChangesAsync(ct);

        return new DeleteHolidayV1.Response();
    }

    public async Task<Result<GetHolidayV1.Response>> GetHolidayV1(GetHolidayV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Holidays
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();


        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Name.ToLower().Contains(request.Search.ToLower())
            );
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        if (request.Jurisdiciton.HasValue)
        {
            records = records.Where(t => t.Jurisdiciton == request.Jurisdiciton.Value);
        }
        if (request.Date.HasValue)
        {
            records = records.Where(t => t.Date == request.Date.Value);
        }

        if (request.UpcomingOnly.HasValue && request.UpcomingOnly.Value)
        {
            var lastWeek = DateOnly.FromDateTime(DateTime.Today).GetPeriodStartDate(Period.Week);
            records = records.Where(t => t.Date >= lastWeek);
        }

        var total = await records.CountAsync(ct);

        var sortMap = new Dictionary<GetHolidayV1.SortColumn, string>()
        {
            { Abstractions.Holiday.GetHolidayV1.SortColumn.Name, "Name" },
            { Abstractions.Holiday.GetHolidayV1.SortColumn.Date, "Date" },
            { Abstractions.Holiday.GetHolidayV1.SortColumn.Jurisdiciton, "Jurisdiction" },

        };

        var sortProperty = sortMap[request.SortBy];

        records = request.SortDirection == SortDirection.Asc ?
            records.OrderBy(t => EF.Property<object>(t, sortProperty)) :
            records.OrderByDescending(t => EF.Property<object>(t, sortProperty));

        if (request.Skip.HasValue)
        {
            records = records.Skip(request.Skip.Value);
        }

        if (request.Take.HasValue)
        {
            records = records.Take(request.Take.Value);
        }

        var mapped = records.Select(t => new GetHolidayV1.Record()
        {
            Id = t.Id,
            Name = t.Name,
            Jurisdiciton = t.Jurisdiciton,
            Date = t.Date,

        });

        var response = new GetHolidayV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }

    public async Task<Result<ImportHolidayV1.Response>> ImportHolidayV1(ImportHolidayV1.Request request, CancellationToken ct = default)
    {
        var conf = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            MissingFieldFound = null,
            HeaderValidated = null
        };

        await using var transaction = await _context.Database.BeginTransactionAsync(ct);
        using var reader = new StreamReader(request.File);
        using var csv = new CsvReader(reader, conf);

        var allHoliday = await _context.Holidays.ToListAsync(ct);
        var holidayById = allHoliday.ToDictionary(t => t.Id);
        var holidayByName = allHoliday.ToDictionary(t => t.Name);

        var records = csv.GetRecords<UpsertHolidayV1.Request>()
            .OrderByDescending(t => t.Id.HasValue)
            .ToList();

        var created = 0;
        var updated = 0;

        foreach (var record in records)
        {
            Holiday holiday;
            if (record.Id.HasValue && holidayById.ContainsKey(record.Id.Value))
            {
                holiday = holidayById[record.Id.Value];
                updated++;
            }
            else if (!record.Id.HasValue && !String.IsNullOrEmpty(record.Name.ToLower()) && holidayByName.ContainsKey(record.Name.ToLower()))
            {
                holiday = holidayByName[record.Name.ToLower()];
                updated++;
            }
            else
            {
                holiday = new();
                _context.Holidays.Add(holiday);

                created++;
            }

            holiday.Name = record.Name.ToLower();
            holiday.Jurisdiciton = record.Jurisdiciton;
            holiday.Date = record.Date;

            holidayById[holiday.Id] = holiday;
            holidayByName[holiday.Name] = holiday;
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ImportHolidayV1.Response()
        {
            Created = created,
            Updated = updated
        };
    }

    private async Task GenerateTimeEntriesForHoliday(Holiday holiday, ChargeCode holidayChargeCode, CancellationToken ct)
    {
        var jurisdiciton = holiday.Jurisdiciton;
        var staff = _context.Staff.
        AsNoTracking()
        .AsQueryable();

        staff = staff.Where(t => t.EndDate == null && t.Jurisdiciton == jurisdiciton);
        var times = _context.Times
        .AsNoTracking()
        .AsQueryable()
        .Include(t => t.Staff);
        var staffWithHoliday = await times.Where(t => t.Date == holiday.Date && t.ChargeCode.Id == holidayChargeCode.Id && t.Staff.Jurisdiciton == jurisdiciton && t.Staff.EndDate == null).AsNoTracking().Select(t => t.Staff).ToListAsync(ct);

        var staffWithHolidayIds = staffWithHoliday.Select(s => s.Id).ToList();
        var staffWithoutEnteredHoliday = await staff.Where(t => !staffWithHolidayIds.Contains(t.Id)).ToListAsync(ct);

        _logger.LogInformation($"Creating time entries for Holiday {holiday.Name} for staff count {staffWithoutEnteredHoliday.Count()}");
        foreach (var staffMember in staffWithoutEnteredHoliday)
        {
            var timeEntry = new Time
            {
                ChargeCodeId = holidayChargeCode.Id,
                Hours = 8,
                HoursApproved = 8,
                Notes = holiday.Name,
                StaffId = staffMember.Id,
                Date = holiday.Date,
                Status = TimeStatus.Accepted,
                HolidayId = holiday.Id
            };
            _context.Times.Add(timeEntry);
        }
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation($"Created time entries for Holiday {holiday.Name} for staff count {staffWithoutEnteredHoliday.Count()}");
    }

    public async Task BackgroundAutoGenerateHolidayTimeEntryV1(CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.GetPeriodStartDate(Period.Week).AddPeriod(Period.Week, 1);
        var endDate = today.GetPeriodEndDate(Period.Week).AddPeriod(Period.Week, 1);

        var holidays = _context.Holidays
        .AsNoTracking()
        .AsQueryable();
        var holidayChargeCode = await _context.ChargeCodes.Where(t => t.Project!.Name.ToLower().Contains("holiday")).FirstOrDefaultAsync(ct);
        if (holidayChargeCode == null)
        {
            return;
        }

        var upcomingHolidays = await holidays.Where(t => t.Date >= startDate && t.Date <= endDate).ToListAsync(ct);
        foreach (var upcomingHoliday in upcomingHolidays)
        {

            await GenerateTimeEntriesForHoliday(upcomingHoliday, holidayChargeCode, ct);
        }
    }
}