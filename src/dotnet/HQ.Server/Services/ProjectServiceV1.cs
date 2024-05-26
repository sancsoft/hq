using CsvHelper;
using CsvHelper.Configuration;
using FluentResults;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Projects;
using HQ.Abstractions.Staff;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Formats.Asn1;
using System.Globalization;

namespace HQ.Server.Services;

public class ProjectServiceV1
{
    private readonly HQDbContext _context;

    public ProjectServiceV1(HQDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UpsertProjectV1.Response>> UpsertProjectV1(UpsertProjectV1.Request request, CancellationToken ct = default)
    {
        var validationResult = Result.Merge(
            Result.FailIf(string.IsNullOrEmpty(request.Name), "Name is required.")
        );

        if (validationResult.IsFailed)
        {
            return validationResult;
        }

        var project = await _context.Projects.FindAsync(request.Id);
        if (project == null)
        {
            project = new();
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

        await _context.SaveChangesAsync(ct);

        return new UpsertProjectV1.Response()
        {
            Id = project.Id,
            ChargeCode = "P12345"
        };
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
            BookingHours = t.BookingHours,
            BookingPeriod = t.BookingPeriod,
            StartDate = t.StartDate,
            EndDate = t.EndDate,
            Status = t.Quote != null ? (int)t.Quote.Status : 0
        });

        var sortMap = new Dictionary<GetProjectsV1.SortColumn, string>()
        {
            { Abstractions.Projects.GetProjectsV1.SortColumn.ProjectName, "Name" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.ProjectManagerName, "ProjectManagerName" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.StartDate, "StartDate" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.EndDate, "EndDate" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.ClientName, "ClientName" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.ChargeCode, "ChargeCode" },
            { Abstractions.Projects.GetProjectsV1.SortColumn.Status, "Status" }
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
}
