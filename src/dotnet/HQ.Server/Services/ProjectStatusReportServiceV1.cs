using CsvHelper;
using CsvHelper.Configuration;
using FluentResults;
using HQ.Abstractions.Clients;
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
        DateOnly endDate = startDate.AddDays(7);

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

        var mapped = records.Select(t => new GetProjectStatusReportsV1.Record()
        {
            Id = t.Id,
            ChargeCode = t.Project.ChargeCode != null ? t.Project.ChargeCode.Code : null,
            ProjectName = t.Project.Name,
            ClientName= t.Project. Client.Name,
            ProjectManagerName = t.Project.ProjectManager != null ? t.Project.ProjectManager.Name : null,
            Status = t.Status,
            TotalHours = t.Project.ChargeCode != null ? t.Project.ChargeCode.Times.Where(x => x.Date >= t.StartDate && x.Date <= t.EndDate).Sum(t => t.Hours) : 0,
            HoursAvailable = 0, // TODO: Calculate
            PercentComplete = 0 // TODO: Calculate
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
}
