using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Staff;
using HQ.Abstractions.Users;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HQ.Server.Services;

public class StaffServiceV1
{
    private readonly HQDbContext _context;
    private readonly UserServiceV1 _UserServiceV1;
    private readonly ILogger<StaffServiceV1> _logger;

    public StaffServiceV1(HQDbContext context, UserServiceV1 userServiceV1, ILogger<StaffServiceV1> logger)
    {
        _context = context;
        _UserServiceV1 = userServiceV1;
        _logger = logger;
    }

    public async Task<Result<UpsertStaffV1.Response>> UpsertStaffV1(UpsertStaffV1.Request request, CancellationToken ct = default)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct))
        {
            try
            {
                var validationResult = Result.Merge(
            Result.FailIf(string.IsNullOrEmpty(request.Name), "Name is required."),
            Result.FailIf(await _context.Staff.AnyAsync(t => t.Id != request.Id && t.Name == request.Name, ct), "Name must be unique.")
        );

                if (validationResult.IsFailed)
                {
                    return validationResult;
                }

                var staff = await _context.Staff.FindAsync(request.Id);
                if (staff == null)
                {
                    staff = new();
                    _context.Staff.Add(staff);
                }

                staff.Name = request.Name;
                staff.WorkHours = request.WorkHours;
                staff.VacationHours = request.VacationHours;
                staff.Jurisdiciton = request.Jurisdiciton;
                staff.StartDate = request.StartDate;
                staff.EndDate = request.EndDate;
                staff.FirstName = request.FirstName;
                staff.LastName = request.LastName;
                staff.Email = request.Email;

                await _context.SaveChangesAsync(ct);
                if (request.CreateUser)
                {
                    var upsertUserRequest = new UpsertUserV1.Request
                    {
                        FirstName = staff.FirstName,
                        LastName = staff.LastName,
                        IsStaff = true,
                        Enabled = true,
                        StaffId = staff.Id,
                        Email = staff.Email,
                    };
                    var createdUser = await _UserServiceV1.UpsertUserV1(upsertUserRequest, ct);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync(ct);
                    return new UpsertStaffV1.Response()
                    {
                        Id = staff.Id,
                        UserId = createdUser.Value.Id
                    };
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync(ct);
                return new UpsertStaffV1.Response()
                {
                    Id = staff.Id
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Fail(new Error("An error occurred while upserting the staff.").CausedBy(ex));
            }
        }

    }

    public async Task<Result<DeleteStaffV1.Response?>> DeleteStaffV1(DeleteStaffV1.Request request, CancellationToken ct = default)
    {
        var staff = await _context.Staff.FindAsync(request.Id, ct);
        if (staff == null)
        {
            return Result.Ok<DeleteStaffV1.Response?>(null);
        }

        _context.Staff.Remove(staff);

        await _context.SaveChangesAsync(ct);

        return new DeleteStaffV1.Response();
    }

    public async Task<Result<GetStaffV1.Response>> GetStaffV1(GetStaffV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Staff
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();


        var timezone = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
        var currentTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timezone);
        var today = DateOnly.FromDateTime(currentTime);
        var startYearDate = today.GetPeriodStartDate(Period.Year);
        var endYearDate = today.GetPeriodEndDate(Period.Year);

        var startMonthDate = today.GetPeriodStartDate(Period.Month);
        var endMonthDate = today.GetPeriodEndDate(Period.Month);


        if (!string.IsNullOrEmpty(request.Search))
        {
            if (Enum.TryParse<Jurisdiciton>(request.Search.Trim().ToLower(), true, out Jurisdiciton parsedJurisdiction))
            {
                records = records.Where(t => t.Jurisdiciton.Equals(parsedJurisdiction));
            }
            else
            {
                records = records.Where(t =>
                  t.Name.ToLower().Contains(request.Search.ToLower()));
            }
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        if (request.Jurisdiciton.HasValue)
        {
            records = records.Where(t => t.Jurisdiciton == request.Jurisdiciton.Value);
        }

        if (request.IsAssignedProjectManager.HasValue)
        {
            if (request.IsAssignedProjectManager.Value)
            {
                records = records.Where(t => _context.Projects.Any(x => x.ProjectManagerId == t.Id));
            }
            else
            {
                records = records.Where(t => !_context.Projects.Any(x => x.ProjectManagerId == t.Id));
            }
        }
        if (request.CurrentOnly.HasValue)
        {
            if (request.CurrentOnly.Value)
            {
                records = records.Where(t => t.EndDate == null || t.EndDate >= today);
            }
        }

        if (request.ProjectId.HasValue)
        {
            records = records.Where(t => t.ProjectMembers.Any(x => x.ProjectId == request.ProjectId.Value));
        }
        if (request.ExcludeProjectId.HasValue)
        {
            records = records.Where(t => !t.ProjectMembers.Any(x => x.ProjectId == request.ExcludeProjectId.Value));
        }


        if (!String.IsNullOrEmpty(request.Status))
        {

            records = records.Where(t => t.Plans.Any(x => x.Date == today && x.Status!.ToLower() == request.Status.ToLower()));
        }

        var mapped = records.Select(t => new GetStaffV1.Record()
        {
            Id = t.Id,
            Name = t.Name,
            WorkHours = t.WorkHours,
            VacationHours = t.VacationHours,
            Jurisdiciton = t.Jurisdiciton,
            StartDate = t.StartDate,
            EndDate = t.EndDate,
            Status = t.Plans.Where(t => t.Date == today).Select(x => x.Status).SingleOrDefault(),
            Hrs = t.Times.Where(x => x.StaffId == t.Id && x.Date >= startYearDate && x.Date <= endYearDate).Sum(y => y.Hours),
            BillableHrs = t.Times.Where(x => x.StaffId == t.Id && x.Date >= startYearDate && x.Date <= endYearDate && x.ChargeCode.Billable == true).Sum(y => y.Hours),
            HrsThisMonth = t.Times.Where(x => x.StaffId == t.Id && x.Date >= startMonthDate && x.Date <= endMonthDate).Sum(y => y.Hours),
            FirstName = t.FirstName,
            LastName = t.LastName,
            Email = t.Email
        });


        var sortMap = new Dictionary<GetStaffV1.SortColumn, string>()
        {
            { Abstractions.Staff.GetStaffV1.SortColumn.Name, "Name" },
            { Abstractions.Staff.GetStaffV1.SortColumn.FirstName, "FirstName" },
            { Abstractions.Staff.GetStaffV1.SortColumn.Hrs, "Hrs" },
            { Abstractions.Staff.GetStaffV1.SortColumn.BillableHrs, "BillableHrs" },
            { Abstractions.Staff.GetStaffV1.SortColumn.Jurisdiciton, "Jurisdiciton" },
            { Abstractions.Staff.GetStaffV1.SortColumn.Status, "Status" },
            { Abstractions.Staff.GetStaffV1.SortColumn.LastName, "LastName" },
            { Abstractions.Staff.GetStaffV1.SortColumn.StartDate, "StartDate" },
            { Abstractions.Staff.GetStaffV1.SortColumn.EndDate, "EndDate" },
            { Abstractions.Staff.GetStaffV1.SortColumn.VacationHours, "VacationHours" },
            { Abstractions.Staff.GetStaffV1.SortColumn.WorkHours, "WorkHours" },

        };

        var sortProperty = sortMap[request.SortBy];

        mapped = request.SortDirection == SortDirection.Asc ?
            mapped.OrderBy(t => EF.Property<object>(t, sortProperty)) :
            mapped.OrderByDescending(t => EF.Property<object>(t, sortProperty));

        if (request.Skip.HasValue)
        {
            mapped = mapped.Skip(request.Skip.Value);
        }

        if (request.Take.HasValue)
        {
            mapped = mapped.Take(request.Take.Value);
        }
        var total = await records.CountAsync(ct);

        var response = new GetStaffV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }

    public async Task<Result<ImportStaffV1.Response>> ImportStaffV1(ImportStaffV1.Request request, CancellationToken ct = default)
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

        var allStaff = await _context.Staff.ToListAsync(ct);
        var staffById = allStaff.ToDictionary(t => t.Id);
        var staffByName = allStaff.ToDictionary(t => t.Name);

        var records = csv.GetRecords<UpsertStaffV1.Request>()
            .OrderByDescending(t => t.Id.HasValue)
            .ToList();

        var created = 0;
        var updated = 0;

        foreach (var record in records)
        {
            Staff staff;
            if (record.Id.HasValue && staffById.ContainsKey(record.Id.Value))
            {
                staff = staffById[record.Id.Value];
                updated++;
            }
            else if (!record.Id.HasValue && !String.IsNullOrEmpty(record.Name.ToLower()) && staffByName.ContainsKey(record.Name.ToLower()))
            {
                staff = staffByName[record.Name.ToLower()];
                updated++;
            }
            else
            {
                staff = new();
                _context.Staff.Add(staff);

                created++;
            }

            staff.Name = record.Name.ToLower();
            staff.WorkHours = record.WorkHours;
            staff.VacationHours = record.VacationHours;
            staff.Jurisdiciton = record.Jurisdiciton;
            staff.StartDate = record.StartDate;
            staff.EndDate = record.EndDate;
            staff.FirstName = record.FirstName;
            staff.LastName = record.LastName;
            staff.Email = record.Email;

            staffById[staff.Id] = staff;
            staffByName[staff.Name] = staff;
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ImportStaffV1.Response()
        {
            Created = created,
            Updated = updated
        };
    }

    public async Task BackgroundBulkSetTimeEntryCutoffV1(CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var currentWeekStart = today.GetPeriodStartDate(Period.Week);

        _logger.LogInformation("Bulk updating staff time entry cutoff date to {CutoffDate}.", currentWeekStart);
        var bulkUpdateResponse = await BulkSetTimeEntryCutoffV1(new()
        {
            TimeEntryCutoffDate = currentWeekStart
        }, ct);
        _logger.LogInformation("Updated {UpdateCount} staff.", bulkUpdateResponse.Value.Updated);
    }

    public async Task<Result<BulkSetTimeEntryCutoffV1.Response>> BulkSetTimeEntryCutoffV1(BulkSetTimeEntryCutoffV1.Request request, CancellationToken ct = default)
    {
        var staff = _context.Staff
            .Where(t => t.TimeEntryCutoffDate != request.TimeEntryCutoffDate)
            .AsQueryable();

        if (request.StaffId.HasValue)
        {
            staff = staff.Where(t => t.Id == request.StaffId.Value);
        }

        if (request.Jurisdiciton.HasValue)
        {
            staff = staff.Where(t => t.Jurisdiciton == request.Jurisdiciton.Value);
        }

        var updateCount = await staff.ExecuteUpdateAsync(t => t
            .SetProperty(x => x.TimeEntryCutoffDate, x => request.TimeEntryCutoffDate)
        , ct);

        return new BulkSetTimeEntryCutoffV1.Response()
        {
            Updated = updateCount
        };
    }
}