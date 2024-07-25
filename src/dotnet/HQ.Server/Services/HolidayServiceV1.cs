using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

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

        return new UpsertHolidayV1.Response()
        {
            Id = holiday.Id
        };
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

        var total = await records.CountAsync(ct);

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
    public async Task BackgroundAutoGenerateHolidayTimeEntryV1(CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var holidays = _context.Holidays
        .AsNoTracking()
        .AsQueryable();
        // retrieve upcoming holiday based on today's date
        var upcomingHoliday = await holidays.Where(t => t.Date >= today && t.Jurisdiciton == Jurisdiciton.USA).FirstOrDefaultAsync(ct);
        if (upcomingHoliday == null)
        {
            return;
        }
        var staff = _context.Staff.
        AsNoTracking()
        .AsQueryable();
        var vacationChargeCode = await _context.ChargeCodes.Where(t => t.Code == "S1001").FirstOrDefaultAsync(ct); // S1001 is the code for vacation
        if (vacationChargeCode == null)
        {
            return;
        }
        staff = staff.Where(t => t.EndDate == null && t.Jurisdiciton == Jurisdiciton.USA);
        var times = _context.Times
        .AsNoTracking()
        .AsQueryable()
        .Include(t => t.Staff);
        var staffWithVacation = await times.Where(t => t.Date == upcomingHoliday.Date && t.ChargeCode == vacationChargeCode && t.Staff.Jurisdiciton == Jurisdiciton.USA && t.Staff.EndDate == null).Select(t => t.Staff).ToListAsync(ct);

        var staffWithVacationIds = staffWithVacation.Select(s => s.Id).ToList();
        var staffWithoutEnteredVacation = await staff.Where(t => !staffWithVacationIds.Contains(t.Id)).ToListAsync(ct);

        _logger.LogInformation($"Creating time entries for Holiday {upcomingHoliday.Name} for staff count {staffWithoutEnteredVacation.Count()}");
        foreach (var staffMember in staffWithoutEnteredVacation)
        {

            var timeEntry = new Time
            {
                ChargeCodeId = vacationChargeCode.Id,
                Hours = 8,
                HoursApproved = 8,
                Notes = upcomingHoliday.Name,
                StaffId = staffMember.Id,
                Date = upcomingHoliday.Date,
                Status = TimeStatus.Accepted,
            };
            _context.Times.Add(timeEntry);
        }
        await _context.SaveChangesAsync(ct);


        _logger.LogInformation($"Created time entries for Holiday {upcomingHoliday.Name} for staff count {staffWithoutEnteredVacation.Count()}");
    }

}