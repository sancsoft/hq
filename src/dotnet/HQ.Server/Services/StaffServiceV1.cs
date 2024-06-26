﻿using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Staff;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services;

public class StaffServiceV1
{
    private readonly HQDbContext _context;

    public StaffServiceV1(HQDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UpsertStaffV1.Response>> UpsertStaffV1(UpsertStaffV1.Request request, CancellationToken ct = default)
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

        return new UpsertStaffV1.Response()
        {
            Id = staff.Id
        };
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

        var sortMap = new Dictionary<GetStaffV1.SortColumn, string>()
        {
            { Abstractions.Staff.GetStaffV1.SortColumn.Name, "Name" },
            { Abstractions.Staff.GetStaffV1.SortColumn.FirstName, "FirstName" },
            { Abstractions.Staff.GetStaffV1.SortColumn.LastName, "LastName" },
            { Abstractions.Staff.GetStaffV1.SortColumn.StartDate, "StartDate" },
            { Abstractions.Staff.GetStaffV1.SortColumn.EndDate, "EndDate" },
            { Abstractions.Staff.GetStaffV1.SortColumn.VacationHours, "VacationHours" },
            { Abstractions.Staff.GetStaffV1.SortColumn.WorkHours, "WorkHours" },

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

        var mapped = records.Select(t => new GetStaffV1.Record()
        {
            Id = t.Id,
            Name = t.Name,
            WorkHours = t.WorkHours,
            VacationHours = t.VacationHours,
            Jurisdiciton = t.Jurisdiciton,
            StartDate = t.StartDate,
            EndDate = t.EndDate,
            FirstName = t.FirstName,
            LastName = t.LastName,
            Email = t.Email
        });

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