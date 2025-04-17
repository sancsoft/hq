using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Projects;
using HQ.Abstractions.Staff;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;

public class ProjectServiceV1
{
    private readonly HQDbContext _context;
    private readonly ILogger<ProjectServiceV1> _logger;
    private readonly ChargeCodeServiceV1 _chargeCodeServiceV1;


    public ProjectServiceV1(ChargeCodeServiceV1 chargeCodeServiceV1, HQDbContext context, ILogger<ProjectServiceV1> logger)
    {
        _chargeCodeServiceV1 = chargeCodeServiceV1;
        _context = context;
        _logger = logger;
    }

    public async Task<Result<UpsertProjectV1.Response>> UpsertProjectV1(UpsertProjectV1.Request request, CancellationToken ct = default)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct))
        {
            try
            {
                var validationResult = Result.Merge(
                    Result.FailIf(string.IsNullOrEmpty(request.Name), "Name is required."),
                    Result.FailIf(
                        request.Type == ProjectType.Quote &&
                        (!request.QuoteId.HasValue || !await _context.Quotes.AnyAsync(t => t.Id == request.QuoteId.Value)),
                        "Invalid quote."
                    )
                );

                if (validationResult.IsFailed)
                {
                    return validationResult;
                }

                var project = await _context.Projects
                    .Include(t => t.ChargeCode)
                    .Include(p => p.Quote)
                    .FirstOrDefaultAsync(p => p.Id == request.Id);

                if (project == null)
                {
                    project = new Project();
                    _context.Projects.Add(project);
                }

                project.ClientId = request.ClientId;
                project.ProjectManagerId = request.ProjectManagerId;
                project.Name = request.Name;
                project.QuoteId = request.QuoteId;
                project.HourlyRate = request.HourlyRate;
                project.BookingHours = request.BookingHours;
                project.BookingPeriod = request.BookingPeriod;
                project.StartDate = request.StartDate;
                project.EndDate = request.EndDate;
                project.Type = request.Type;
                project.Status = request.Status;
                project.TotalHours = request.TotalHours;
                project.TimeEntryMaxHours = request.TimeEntryMaxHours ?? 4; // default to 4 hours
                project.RequireTask = request.RequireTask;

                switch (request.Type)
                {
                    case ProjectType.General:
                        if (project.ChargeCode == null)
                        {
                            project.ChargeCode = new();
                            project.ChargeCode.Activity = ChargeCodeActivity.General;

                            var latestGeneralNumber = _context.ChargeCodes
                                .Where(t => t.Code.StartsWith("S"))
                                .Select(t => t.Code.Substring(1))
                                .Select(Int32.Parse)
                                .DefaultIfEmpty(1000)
                                .Max();

                            var newGeneralNumber = latestGeneralNumber + 1;
                            project.ChargeCode.Code = "S" + newGeneralNumber;
                        }
                        break;
                    case ProjectType.Ongoing:
                        var latestProjectNumber = await _context.Projects.Where(t => t.Id != request.Id).MaxAsync((q) => q.ProjectNumber, ct);
                        var nextProjectNumber = latestProjectNumber + 1;

                        if (request.ProjectNumber.HasValue)
                        {
                            if (await _context.Projects.AnyAsync(t => t.ProjectNumber == request.ProjectNumber && t.Id != request.Id, ct))
                            {
                                return Result.Fail(new Error("This project number already exists."));
                            }
                            else
                            {
                                project.ProjectNumber = request.ProjectNumber.Value;
                            }
                        }
                        else
                        {
                            project.ProjectNumber = nextProjectNumber;
                        }

                        if (project.ChargeCode == null)
                        {
                            project.ChargeCode = new();
                            project.ChargeCode.Activity = ChargeCodeActivity.Project;
                        }

                        project.ChargeCode.Code = "P" + project.ProjectNumber.Value;

                        break;
                    case ProjectType.Quote:
                        var quote = await _context.Quotes.FindAsync(request.QuoteId!.Value, ct);

                        if (project.ChargeCode == null)
                        {
                            project.ChargeCode = new();
                            project.ChargeCode.QuoteId = quote!.Id;
                            project.ChargeCode.Activity = ChargeCodeActivity.Quote;
                            project.ChargeCode.Code = "Q" + quote!.QuoteNumber;
                        }

                        if (await _context.Projects.AnyAsync(t => t.QuoteId == request.QuoteId && t.Id != request.Id, ct))
                        {
                            return Result.Fail(new Error("A project for that quote already exists."));
                        }

                        if (project.Quote != null)
                        {
                            project.Quote.Status = project.Status;
                        }

                        break;
                    case ProjectType.Service:
                        // project.ChargeCode = new();
                        // project.ChargeCode.Activity = ChargeCodeActivity.Service;
                        // TODO: Set to S number
                        break;
                }

                if (project.ChargeCode == null)
                {
                    return Result.Fail("Invalid charge code.");
                }

                project.ChargeCode.ProjectId = project.Id;
                project.ChargeCode.Billable = request.Billable;
                project.ChargeCode.Active = request.Status == ProjectStatus.InProduction || request.Status == ProjectStatus.Ongoing;

                await _context.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                var response = new UpsertProjectV1.Response
                {
                    Id = project.Id,
                };

                return Result.Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while upserting the project");
                await transaction.RollbackAsync(ct);
                return Result.Fail(new Error("An error occurred while upserting the project.").CausedBy(ex));
            }
        }
    }



    public async Task<Result<DeleteProjectV1.Response?>> DeleteProjectV1(DeleteProjectV1.Request request, CancellationToken ct = default)
    {
        var project = await _context.Projects.FindAsync(request.Id, ct);
        if (project == null)
        {
            return Result.Ok<DeleteProjectV1.Response?>(null);
        }

        _context.Projects.Remove(project);

        await _context.SaveChangesAsync(ct);

        return new DeleteProjectV1.Response();
    }

    public async Task<Result<GetProjectsV1.Response>> GetProjectsV1(GetProjectsV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Projects
            .Where(t => t.ChargeCode != null)
            .Include(t => t.Client)
            .Include(t => t.ProjectManager)
            .Include(t => t.Quote)
            .Include(t => t.ChargeCode)
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        if (request.clientId.HasValue)
        {
            records = records.Where(t => t.ClientId == request.clientId);
        }

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Name.ToLower().Contains(request.Search.ToLower()) ||
                t.Client.Name.ToLower().Contains(request.Search.ToLower()) ||
                (t.ChargeCode != null ? t.ChargeCode.Code.ToLower().Contains(request.Search.ToLower()) : false)
            );
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }
        if (request.ProjectManagerId.HasValue)
        {
            records = records.Where(t => t.ProjectManager != null ? t.ProjectManager.Id.Equals(request.ProjectManagerId.Value) : false);
        }

        if (request.ProjectStatus.HasValue && request.ProjectStatus != null)
        {
            records = records.Where(t => t.Status == request.ProjectStatus);
        }
        if (request.CurrentOnly.HasValue)
        {
            if (request.CurrentOnly.Value)
            {
                records = records.Where(t => t.Status == ProjectStatus.InProduction || t.Status == ProjectStatus.Ongoing);
            }
        }
        var bookingStartDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodStartDate(Period.Month);
        var bookingEndDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodEndDate(Period.Month);


        var listRecord = records.ToList();

        var mapped = records.Select(t => new GetProjectsV1.Record()
        {
            Id = t.Id,
            ProjectNumber = t.ProjectNumber,
            ChargeCode = t.ChargeCode != null ? t.ChargeCode.Code : null,
            ClientId = t.ClientId,
            ClientName = t.Client.Name,
            ProjectManagerId = t.ProjectManagerId,
            ProjectManagerName = t.ProjectManager != null ? t.ProjectManager.Name : null,
            Name = t.Name,
            QuoteId = t.QuoteId,
            QuoteNumber = t.Quote != null ? t.Quote.QuoteNumber : null,
            HourlyRate = t.HourlyRate,
            BookingPeriod = t.BookingPeriod,
            ProjectBookingHours = t.BookingHours,
            TimeEntryMaxHours = t.TimeEntryMaxHours,
            StartDate = t.StartDate,
            EndDate = t.EndDate,
            BillingEmail = t.Client.BillingEmail,
            OfficialName = t.Client.OfficialName,
            Status = t.Quote != null ? (int)t.Quote.Status : 0,
            ProjectStatus = t.Status,
            Type = t.Type,
            Billable = t.ChargeCode!.Billable,
            ProjectTotalHours = t.TotalHours,
            RequireTask = t.RequireTask,

            BookingStartDate = t.ChargeCode!.Times.Where(x => x.Date >= bookingStartDate && x.Date <= bookingEndDate).Min(x => x.Date),
            BookingEndDate = t.ChargeCode!.Times.Where(x => x.Date >= bookingStartDate && x.Date <= bookingEndDate).Max(x => x.Date),
            BookingHours = t.ChargeCode!.Times.Where(x => x.Date >= bookingStartDate && x.Date <= bookingEndDate).Sum(x => x.HoursApproved ?? x.Hours),
            BookingAvailableHours = t.BookingHours - t.ChargeCode!.Times.Where(x => x.Date >= bookingStartDate && x.Date <= bookingEndDate).Sum(x => x.HoursApproved ?? x.Hours),
            BookingPercentComplete = t.BookingHours == 0 ? 0 : t.ChargeCode!.Times.Where(x => x.Date >= bookingStartDate && x.Date <= bookingEndDate).Sum(x => x.HoursApproved ?? x.Hours) / t.BookingHours,

            TotalHours = t.ChargeCode!.Times.Sum(x => x.HoursApproved ?? x.Hours),
            TotalAvailableHours = t.TotalHours != null ? t.TotalHours.Value - t.ChargeCode!.Times.Sum(x => x.HoursApproved ?? x.Hours) : null,
            TotalPercentComplete = !t.TotalHours.HasValue || t.TotalHours == 0 ? null : t.ChargeCode!.Times.Sum(x => x.HoursApproved ?? x.Hours) / t.TotalHours.Value,
            TotalPercentCompleteSort = !t.TotalHours.HasValue || t.TotalHours == 0 ? -1 : t.ChargeCode!.Times.Sum(x => x.HoursApproved ?? x.Hours) / t.TotalHours.Value,
            TotalStartDate = t.ChargeCode.Times.Min(t => t.Date),
            TotalEndDate = t.ChargeCode.Times.Max(t => t.Date),
        })
        .Select(t => new GetProjectsV1.Record()
        {
            Id = t.Id,
            ProjectNumber = t.ProjectNumber,
            ChargeCode = t.ChargeCode,
            ClientId = t.ClientId,
            ClientName = t.ClientName,
            ProjectManagerId = t.ProjectManagerId,
            ProjectManagerName = t.ProjectManagerName,
            Name = t.Name,
            QuoteId = t.QuoteId,
            QuoteNumber = t.QuoteNumber,
            HourlyRate = t.HourlyRate,
            BookingPeriod = t.BookingPeriod,
            ProjectBookingHours = t.ProjectBookingHours,
            TimeEntryMaxHours = t.TimeEntryMaxHours,
            StartDate = t.StartDate,
            EndDate = t.EndDate,
            BillingEmail = t.BillingEmail,
            OfficialName = t.OfficialName,
            Status = t.Status,
            ProjectStatus = t.ProjectStatus,
            Type = t.Type,
            Billable = t.Billable,
            ProjectTotalHours = t.ProjectTotalHours,
            RequireTask = t.RequireTask,

            BookingStartDate = t.BookingStartDate,
            BookingEndDate = t.BookingEndDate,
            BookingHours = t.BookingHours,
            BookingAvailableHours = t.BookingAvailableHours,
            BookingPercentComplete = t.BookingPercentComplete,

            TotalHours = t.TotalHours,
            TotalAvailableHours = t.TotalAvailableHours,
            TotalPercentComplete = t.TotalPercentComplete,
            TotalPercentCompleteSort = t.TotalPercentCompleteSort,
            TotalStartDate = t.TotalStartDate,
            TotalEndDate = t.TotalEndDate,

            SummaryHoursTotal = t.Type == ProjectType.Ongoing ? t.BookingHours : t.TotalHours,
            SummaryHoursAvailable = t.Type == ProjectType.Ongoing ? t.BookingAvailableHours : t.TotalAvailableHours,
            SummaryPercentComplete = t.Type == ProjectType.Ongoing ? t.BookingPercentComplete : t.TotalPercentComplete,
            SummaryPercentCompleteSort = t.Type == ProjectType.Ongoing ? t.BookingPercentComplete : t.TotalPercentCompleteSort,
        });

        var sortMap = new Dictionary<GetProjectsV1.SortColumn, string>()
        {
            { Abstractions.Projects.GetProjectsV1.SortColumn.ProjectName, "Name" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.ProjectManagerName, "ProjectManagerName" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.StartDate, "StartDate" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.EndDate, "EndDate" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.ClientName, "ClientName" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.ChargeCode, "ChargeCode" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.Status, "ProjectStatus" },
             { Abstractions.Projects.GetProjectsV1.SortColumn.BookingPeriod, "BookingPeriod" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.BookingStartDate, "BookingStartDate" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.BookingEndDate, "BookingEndDate" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.TotalHours, "TotalHours" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.TotalAvailableHours, "TotalAvailableHours" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.ThisHours, "ThisHours" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.ThisPendingHours, "ThisPendingHours" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.LastHours, "LastHours" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.BookingHours, "BookingHours" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.BookingAvailableHours, "BookingAvailableHours" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.TotalPercentComplete, "TotalPercentCompleteSort" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.BookingPercentComplete, "BookingPercentComplete" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.SummaryHoursTotal, "SummaryHoursTotal" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.SummaryHoursAvailable, "SummaryHoursAvailable" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.SummaryPercentComplete, "SummaryPercentCompleteSort" },
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

        var response = new GetProjectsV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }

    public async Task<Result<ImportProjectsV1.Response>> ImportProjectsV1(ImportProjectsV1.Request request, CancellationToken ct = default)
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

        var allProjects = await _context.Projects.ToListAsync(ct);
        var projectsById = allProjects.ToDictionary(t => t.Id);

        var records = csv.GetRecords<UpsertProjectV1.Request>()
            .OrderByDescending(t => t.Id.HasValue)
            .ToList();

        var created = 0;
        var updated = 0;

        foreach (var record in records)
        {
            // TODO: Validate

            Project project;
            if (record.Id.HasValue && projectsById.ContainsKey(record.Id.Value))
            {
                project = projectsById[record.Id.Value];
                updated++;
            }
            else
            {
                project = new();
                _context.Projects.Add(project);

                created++;
            }

            project.ClientId = record.ClientId;
            project.ProjectManagerId = record.ProjectManagerId;
            project.Name = record.Name;
            project.QuoteId = record.QuoteId;
            project.HourlyRate = record.HourlyRate;
            project.BookingHours = record.BookingHours;
            project.BookingPeriod = record.BookingPeriod;
            project.StartDate = record.StartDate;
            project.EndDate = record.EndDate;

            projectsById[project.Id] = project;
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ImportProjectsV1.Response()
        {
            Created = created,
            Updated = updated
        };
    }

    public async Task<Result<DeleteProjectActivityV1.Response?>> DeleteProjectActivityV1(DeleteProjectActivityV1.Request request, CancellationToken ct = default)
    {
        if (await _context.Times.AnyAsync(t => t.ActivityId == request.Id))
        {
            return Result.Fail("Activity has time associated with it, unable to delete");
        }
        var projectActivity = await _context.ProjectActivities.SingleOrDefaultAsync(t => t.ProjectId == request.ProjectId && t.Id == request.Id, ct);
        if (projectActivity != null)
        {
            _context.ProjectActivities.Remove(projectActivity);
            await _context.SaveChangesAsync(ct);
        }
        return new DeleteProjectActivityV1.Response();
    }
    public async Task<Result<GetProjectActivitiesV1.Response>> GetProjectActivitiesV1(GetProjectActivitiesV1.Request request, CancellationToken ct = default)
    {
        var records = _context.ProjectActivities.Where(t => request.ProjectId == null || t.ProjectId == request.ProjectId)
            .Select(t => new GetProjectActivitiesV1.Record()
            {
                Id = t.Id,
                Name = t.Name,
                Sequence = t.Sequence,
                ProjectId = t.ProjectId
            })
            .OrderBy(t => t.Name);
        return new GetProjectActivitiesV1.Response()
        {
            Records = await records.ToListAsync(ct)
        };
    }

    public async Task<Result<UpsertProjectActivityV1.Response>> UpsertProjectActivityV1(UpsertProjectActivityV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
            Result.FailIf(string.IsNullOrEmpty(request.Name), "Name is required."),
            Result.FailIf(await _context.ProjectActivities.AnyAsync(t => t.ProjectId == request.ProjectId && t.Name == request.Name, ct), "Name must be unique.")
        );

        if (validationResult.IsFailed)
        {
            return validationResult;
        }

        var activity = await _context.ProjectActivities.FindAsync(request.Id);
        if (activity == null)
        {
            activity = new();
            _context.ProjectActivities.Add(activity);
        }

        activity.Name = request.Name;
        activity.ProjectId = request.ProjectId;
        activity.Sequence = request.Sequence;

        await _context.SaveChangesAsync(ct);

        return new UpsertProjectActivityV1.Response()
        {
            Id = activity.Id
        };
    }

    public async Task<Result<AddProjectMemberV1.Response>> AddProjectMemberV1(AddProjectMemberV1.Request request, CancellationToken ct = default)
    {
        var projectMember = await _context.ProjectMembers.SingleOrDefaultAsync(t => t.ProjectId == request.ProjectId && t.StaffId == request.StaffId, ct);
        if (projectMember == null)
        {
            projectMember = new ProjectMember()
            {
                ProjectId = request.ProjectId,
                StaffId = request.StaffId
            };

            _context.ProjectMembers.Add(projectMember);
            await _context.SaveChangesAsync(ct);
        }

        return new AddProjectMemberV1.Response()
        {
            Id = projectMember.Id
        };
    }

    public async Task<Result<RemoveProjectMemberV1.Response>> RemoveProjectMemberV1(RemoveProjectMemberV1.Request request, CancellationToken ct = default)
    {
        var projectMember = await _context.ProjectMembers.SingleOrDefaultAsync(t => t.ProjectId == request.ProjectId && t.StaffId == request.StaffId, ct);
        if (projectMember != null)
        {
            _context.ProjectMembers.Remove(projectMember);
            await _context.SaveChangesAsync(ct);
        }

        return new RemoveProjectMemberV1.Response();
    }
}