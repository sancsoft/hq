using CsvHelper;
using CsvHelper.Configuration;
using FluentResults;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.ProjectStatusReports;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Formats.Asn1;
using System.Globalization;

namespace HQ.Server.Services;

public class ProjectStatusReportServiceV1
{
    private readonly HQDbContext _context;

    public ProjectStatusReportServiceV1(HQDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GenerateWeeklyProjectStatusReportsV1.Response>> GenerateWeeklyProjectStatusReportsV1(GenerateWeeklyProjectStatusReportsV1.Request request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        int createdCount = 0;
        int skippedCount = 0;

        var projects = await _context.Projects.Where(t => t.ChargeCode != null && t.ChargeCode.Active)
            .ToListAsync(ct);

        DateOnly startDate = DateOnly.FromDateTime(DateTime.Today.AddDays(DayOfWeek.Monday - DateTime.Today.DayOfWeek - 7));
        DateOnly endDate = startDate.AddDays(6);

        foreach (var project in projects)
        {
            if (await _context.ProjectStatusReports.AnyAsync(t => t.StartDate == startDate && t.EndDate == endDate, ct))
            {
                skippedCount++;
                continue;
            }

            var psr = new ProjectStatusReport();
            psr.StartDate = startDate;
            psr.EndDate = endDate;
            psr.ProjectId = project.Id;
            psr.ProjectManagerId = project.ProjectManagerId;
            psr.Status = ProjectStatus.Unknown;

            _context.ProjectStatusReports.Add(psr);
            createdCount++;
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new GenerateWeeklyProjectStatusReportsV1.Response()
        {
            Created = createdCount,
            Skipped = skippedCount
        };
    }

    public async Task<Result<GetProjectStatusReportsV1.Response>> GetProjectStatusReportsV1(GetProjectStatusReportsV1.Request request, CancellationToken ct = default)
    {
        var records = _context.ProjectStatusReports
            .AsNoTracking()
            .Include(t => t.Project).ThenInclude(t => t.ChargeCode)
            .Include(t => t.Project).ThenInclude(t => t.Client)
            .Include(t => t.ProjectManager)
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Project.Name.ToLower().Contains(request.Search.ToLower()) ||
                t.Project.ChargeCode != null && t.Project.ChargeCode.Code.ToLower().Contains(request.Search.ToLower()) ||
                t.Project.ProjectManager != null && t.Project.ProjectManager.Name.ToLower().Contains(request.Search.ToLower())
            );
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value);
        }

        if (request.ProjectId.HasValue)
        {
            records = records.Where(t => t.ProjectId == request.ProjectId.Value);
        }

        if (request.ProjectManagerId.HasValue)
        {
            records = records.Where(t => t.Project.ProjectManagerId == request.ProjectManagerId.Value);
        }

        var mapped = records
            .Select(t => new {
                Row = t,
                Previous = _context.ProjectStatusReports.Where(x => x.ProjectId == t.ProjectId && x.StartDate < t.StartDate).OrderByDescending(x => x.StartDate).FirstOrDefault()
            })
            .Select(t => new GetProjectStatusReportsV1.Record()
            {
                Id = t.Row.Id,
                StartDate = t.Row.StartDate,
                EndDate = t.Row.EndDate,
                ChargeCode = t.Row.Project.ChargeCode != null ? t.Row.Project.ChargeCode.Code : null,
                ProjectName = t.Row.Project.Name,
                ClientName= t.Row.Project. Client.Name,
                ProjectManagerName = t.Row.Project.ProjectManager != null ? t.Row.Project.ProjectManager.Name : null,
                Status = t.Row.Status,
                TotalHours = t.Row.Project.ChargeCode != null ? t.Row.Project.ChargeCode.Times.Where(x => x.Date >= t.Row.StartDate && x.Date <= t.Row.EndDate).Sum(x => x.Hours) : 0,
                LastId = t.Previous != null ? t.Previous.Id : null,
                LastHours = t.Previous != null && t.Previous.Project.ChargeCode != null ? t.Previous.Project.ChargeCode.Times.Where(x => x.Date >= t.Previous.StartDate && x.Date <= t.Previous.EndDate).Sum(x => x.Hours) : null,
                HoursAvailable = 0, // TODO: Calculate
                PercentComplete = 0, // TODO: Calculate
            });

        var totalHours = await mapped.SumAsync(t => t.TotalHours, ct);
        var total = await mapped.CountAsync(ct);

        var sortMap = new Dictionary<GetProjectStatusReportsV1.SortColumn, string>()
        {
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ChargeCode, "ChargeCode" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ClientName, "ClientName" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ProjectName, "ProjectName" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ProjectManagerName, "ProjectManagerName" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.TotalHours, "TotalHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.HoursAvailable, "HoursAvailable" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.Status, "Status" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.PercentComplete, "PercentComplete" },
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

        var response = new GetProjectStatusReportsV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total,
            TotalHours = totalHours,
        };

        return response;
    }

    public async Task<Result<GetProjectStatusReportTimeV1.Response>> GetProjectStatusReportTimeV1(GetProjectStatusReportTimeV1.Request request, CancellationToken ct = default)
    {
        var records = _context.ProjectStatusReports
            .AsNoTracking()
            .Where(t => t.Id == request.ProjectStatusReportId)
            .SelectMany(t => t.Project.ChargeCode!.Times.Where(x => x.Date >= t.StartDate && x.Date <= t.EndDate))
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Staff.Name.ToLower().Contains(request.Search.ToLower()) ||
                t.ChargeCode.Code.ToLower().Contains(request.Search.ToLower()) ||
                t.Notes != null && t.Notes.ToLower().Contains(request.Search.ToLower())
            );
        }

        var mapped = records
            .Select(t => new GetProjectStatusReportTimeV1.Record()
            {
                Id = t.Id,
                Status = t.Status,
                Activity = "TBD", // TODO: Schema update
                Hours = t.Hours,
                BillableHours = t.HoursApproved.HasValue ? t.HoursApproved.Value : t.Hours,
                ChargeCode = t.ChargeCode.Code,
                Date = t.Date,
                Description = t.Notes,
                StaffName = t.Staff.Name
            });

        var total = await mapped.CountAsync(ct);

        var sortMap = new Dictionary<GetProjectStatusReportTimeV1.SortColumn, string>()
        {
            { Abstractions.ProjectStatusReports.GetProjectStatusReportTimeV1.SortColumn.BillableHours, "BillableHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportTimeV1.SortColumn.Hours, "Hours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportTimeV1.SortColumn.Date, "Date" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportTimeV1.SortColumn.ChargeCode, "ChargeCode" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportTimeV1.SortColumn.StaffName, "StaffName" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportTimeV1.SortColumn.Activity, "Activity" }
        };

        var sortProperty = sortMap[request.SortBy];

        mapped = request.SortDirection == SortDirection.Asc ?
            mapped.OrderBy(t => EF.Property<object>(t, sortProperty)) :
            mapped.OrderByDescending(t => EF.Property<object>(t, sortProperty));

        var response = new GetProjectStatusReportTimeV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }

    public async Task<Result<ApproveProjectStatusReportTimeRequestV1.Response>> ApproveProjectStatusReportTimeRequestV1(ApproveProjectStatusReportTimeRequestV1.Request request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var approvedCount = 0;

        var times = await _context.ProjectStatusReports
            .AsNoTracking()
            .Where(t => t.Id == request.ProjectStatusReportId)
            .SelectMany(t => t.Project.ChargeCode!.Times.Where(x => x.Date >= t.StartDate && x.Date <= t.EndDate && request.TimeIds.Contains(x.Id)))
            .ToListAsync(ct);

        foreach(var time in times)
        {
            time.Status = TimeStatus.Accepted;
            approvedCount++;
        }

        await _context.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ApproveProjectStatusReportTimeRequestV1.Response()
        {
            Approved = approvedCount
        };
    }

    public async Task<Result<RejectProjectStatusReportTimeV1.Response>> RejectProjectStatusReportTimeV1(RejectProjectStatusReportTimeV1.Request request, CancellationToken ct = default)
    {
        var time = await _context.ProjectStatusReports
            .AsNoTracking()
            .Where(t => t.Id == request.ProjectStatusReportId)
            .SelectMany(t => t.Project.ChargeCode!.Times.Where(x => x.Date >= t.StartDate && x.Date <= t.EndDate && request.TimeId == x.Id))
            .SingleOrDefaultAsync(ct);

        if(time == null)
        {
            return Result.Fail("Unable to find time entry.");
        }

        time.Status = TimeStatus.Rejected;
        time.RejectionNotes = request.Notes;

        await _context.SaveChangesAsync(ct);

        return new RejectProjectStatusReportTimeV1.Response();
    }
}
