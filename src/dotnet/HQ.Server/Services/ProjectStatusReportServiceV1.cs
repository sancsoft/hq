﻿using System.Formats.Asn1;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using DocumentFormat.OpenXml.Bibliography;

using FluentResults;

using HQ.Abstractions;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.ProjectStatusReports;
using HQ.Server.Data;
using HQ.Server.Data.Models;

using Microsoft.AspNetCore.Components.Forms;
using Microsoft.EntityFrameworkCore;

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

        var projects = await _context.Projects.Where(t => t.ChargeCode != null && t.ChargeCode.Active && (t.Status == ProjectStatus.InProduction || t.Status == ProjectStatus.Ongoing))
            .ToListAsync(ct);

        DateOnly startDate = request.ForDate.GetPeriodStartDate(Period.Week);
        DateOnly endDate = request.ForDate.GetPeriodEndDate(Period.Week);

        foreach (var project in projects)
        {
            if (await _context.ProjectStatusReports.AnyAsync(t => t.ProjectId == project.Id && t.StartDate == startDate && t.EndDate == endDate, ct))
            {
                skippedCount++;
                continue;
            }

            var psr = new ProjectStatusReport();
            psr.StartDate = startDate;
            psr.EndDate = endDate;
            psr.ProjectId = project.Id;
            psr.ProjectManagerId = project.ProjectManagerId;
            psr.BookingPeriod = project.BookingPeriod;
            psr.Status = project.Status;

            switch (project.BookingPeriod)
            {
                case Period.Year:
                    psr.BookingStartDate = new DateOnly(startDate.Year, 1, 1);
                    psr.BookingEndDate = new DateOnly(startDate.Year, 1, 1).AddYears(1).AddDays(-1);
                    break;
                case Period.Quarter:
                    var quarter = (startDate.Month + 2) / 3;
                    psr.BookingStartDate = new DateOnly(startDate.Year, (quarter - 1) * 3 + 1, 1);
                    psr.BookingEndDate = psr.BookingStartDate.AddMonths(3).AddDays(-1);
                    break;
                case Period.Month:
                    psr.BookingStartDate = new DateOnly(startDate.Year, startDate.Month, 1);
                    psr.BookingEndDate = new DateOnly(startDate.Year, startDate.Month, 1).AddMonths(1).AddDays(-1);
                    break;
                case Period.Week:
                default:
                    psr.BookingStartDate = psr.StartDate;
                    psr.BookingEndDate = psr.EndDate;
                    break;
            }

            var totalTime = await _context.Times
                .Where(t => t.Date >= psr.StartDate && t.Date <= psr.EndDate && t.ChargeCode!.ProjectId == psr.ProjectId)
                .SumAsync(t => t.Hours, ct);

            if (totalTime == 0 && project.BookingHours == 0)
            {
                psr.SubmittedAt = DateTime.UtcNow;
                psr.Report = @"No planned activities.";
            }

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
                t.Project.Client.Name!.ToLower().Contains(request.Search.ToLower()) ||
                t.Project.ChargeCode!.Code.ToLower().Contains(request.Search.ToLower()) ||
                t.Project.ProjectManager!.Name.ToLower().Contains(request.Search.ToLower())
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

        if (request.StartDate.HasValue && !request.EndDate.HasValue)
        {
            records = records.Where(t => t.StartDate >= request.StartDate);
        }

        if (request.EndDate.HasValue && !request.StartDate.HasValue)
        {
            records = records.Where(t => t.EndDate <= request.EndDate);
        }

        if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            records = records.Where(t => t.StartDate >= request.StartDate && t.EndDate <= request.EndDate);
        }

        var mapped = records
            .Select(t => new
            {
                Row = t,
                Previous = _context.ProjectStatusReports.Where(x => x.ProjectId == t.ProjectId && x.StartDate < t.StartDate).OrderByDescending(x => x.StartDate).FirstOrDefault()
            })
            .Select(t => new GetProjectStatusReportsV1.Record()
            {
                Id = t.Row.Id,
                Report = t.Row.Report,
                SubmittedAt = t.Row.SubmittedAt,
                StartDate = t.Row.StartDate,
                EndDate = t.Row.EndDate,
                ChargeCode = t.Row.Project.ChargeCode != null ? t.Row.Project.ChargeCode.Code : null,
                ProjectName = t.Row.Project.Name,
                ProjectId = t.Row.Project.Id,
                ClientId = t.Row.Project.Client.Id,
                ClientName = t.Row.Project.Client.Name,
                ProjectManagerName = t.Row.Project.ProjectManager != null ? t.Row.Project.ProjectManager.Name : null,
                Status = t.Row.Status,
                IsLate = t.Row.SubmittedAt == null,

                ThisHours = t.Row.Project.ChargeCode!.Times.Where(x => x.Date >= t.Row.StartDate && x.Date <= t.Row.EndDate).Sum(x => x.Hours),
                ThisPendingHours = t.Row.Project.ChargeCode!.Times.Where(x => x.Status != TimeStatus.Accepted && x.Status != TimeStatus.Rejected && x.Date >= t.Row.StartDate && x.Date <= t.Row.EndDate).Sum(x => x.Hours),

                LastId = t.Previous != null ? t.Previous.Id : null,
                LastHours = t.Previous != null && t.Previous.Project.ChargeCode != null ? t.Previous.Project.ChargeCode.Times.Where(x => x.Date >= t.Previous.StartDate && x.Date <= t.Previous.EndDate).Sum(x => x.Hours) : null,

                BookingPeriod = t.Row.BookingPeriod,
                BookingStartDate = t.Row.Project.ChargeCode!.Times.Where(x => x.Date >= t.Row.BookingStartDate && x.Date <= t.Row.BookingEndDate && x.Date <= t.Row.EndDate).Min(x => x.Date),
                BookingEndDate = t.Row.Project.ChargeCode!.Times.Where(x => x.Date >= t.Row.BookingStartDate && x.Date <= t.Row.BookingEndDate && x.Date <= t.Row.EndDate).Max(x => x.Date),
                BookingHours = t.Row.Project.ChargeCode!.Times.Where(x => x.Date >= t.Row.BookingStartDate && x.Date <= t.Row.BookingEndDate && x.Date <= t.Row.EndDate).Sum(x => x.Hours),
                BookingAvailableHours = t.Row.Project.BookingHours - t.Row.Project.ChargeCode!.Times.Where(x => x.Date >= t.Row.BookingStartDate && x.Date <= t.Row.BookingEndDate && x.Date <= t.Row.EndDate).Sum(x => x.Hours),
                BookingPercentComplete = t.Row.Project.BookingHours == 0 ? 0 : t.Row.Project.ChargeCode!.Times.Where(x => x.Date >= t.Row.BookingStartDate && x.Date <= t.Row.BookingEndDate && x.Date <= t.Row.EndDate).Sum(x => x.Hours) / t.Row.Project.BookingHours,

                TotalHours = t.Row.Project.ChargeCode!.Times.Where(x => x.Date <= t.Row.EndDate).Sum(x => x.Hours),
                TotalAvailableHours = t.Row.Project.TotalHours != null ? t.Row.Project.TotalHours.Value - t.Row.Project.ChargeCode!.Times.Where(x => x.Date <= t.Row.EndDate).Sum(x => x.Hours) : null,
                TotalPercentComplete = !t.Row.Project.TotalHours.HasValue || t.Row.Project.TotalHours == 0 ? null : t.Row.Project.ChargeCode!.Times.Where(x => x.Date <= t.Row.EndDate).Sum(x => x.Hours) / t.Row.Project.TotalHours.Value,
                TotalPercentCompleteSort = !t.Row.Project.TotalHours.HasValue || t.Row.Project.TotalHours == 0 ? -1 : t.Row.Project.ChargeCode!.Times.Where(x => x.Date <= t.Row.EndDate).Sum(x => x.Hours) / t.Row.Project.TotalHours.Value,
                TotalStartDate = t.Row.Project.ChargeCode.Times.Where(x => x.Date <= t.Row.EndDate).Min(t => t.Date),
                TotalEndDate = t.Row.Project.ChargeCode.Times.Where(x => x.Date <= t.Row.EndDate).Max(t => t.Date),
            })
            .Select(t => new GetProjectStatusReportsV1.Record()
            {
                Id = t.Id,
                Report = t.Report,
                SubmittedAt = t.SubmittedAt,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                ChargeCode = t.ChargeCode,
                ProjectName = t.ProjectName,
                ProjectId = t.ProjectId,
                ClientId = t.ClientId,
                ClientName = t.ClientName,
                ProjectManagerName = t.ProjectManagerName,
                Status = t.Status,
                IsLate = t.IsLate,

                ThisHours = t.ThisHours,
                ThisPendingHours = t.ThisPendingHours,

                LastId = t.LastId,
                LastHours = t.LastHours,

                BookingPeriod = t.BookingPeriod,
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

                SummaryHoursTotal = t.Status == ProjectStatus.Ongoing ? t.BookingHours : t.TotalHours,
                SummaryHoursAvailable = t.Status == ProjectStatus.Ongoing ? t.BookingAvailableHours : t.TotalAvailableHours,
                SummaryPercentComplete = t.Status == ProjectStatus.Ongoing ? t.BookingPercentComplete : t.TotalPercentComplete,
                SummaryPercentCompleteSort = t.Status == ProjectStatus.Ongoing ? t.BookingPercentComplete : t.TotalPercentCompleteSort
            });

        if (request.IsSubmitted != null)
        {
            if (request.IsSubmitted == true)
            {
                mapped = mapped.Where(t => t.SubmittedAt != null && t.ThisPendingHours == 0);
            }
            else
            {
                mapped = mapped.Where(t => t.SubmittedAt == null || t.ThisPendingHours > 0);
            }
        }

        var totalHours = await mapped.SumAsync(t => t.TotalHours, ct);
        var total = await mapped.CountAsync(ct);

        var sortMap = new Dictionary<GetProjectStatusReportsV1.SortColumn, string>()
        {
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.StartDate, "StartDate" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.EndDate, "EndDate" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ChargeCode, "ChargeCode" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ProjectName, "ProjectName" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ClientName, "ClientName" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ProjectManagerName, "ProjectManagerName" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.Status, "Status" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.BookingPeriod, "BookingPeriod" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.BookingStartDate, "BookingStartDate" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.BookingEndDate, "BookingEndDate" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.TotalHours, "TotalHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.TotalAvailableHours, "TotalAvailableHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ThisHours, "ThisHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.ThisPendingHours, "ThisPendingHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.LastHours, "LastHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.BookingHours, "BookingHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.BookingAvailableHours, "BookingAvailableHours" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.TotalPercentComplete, "TotalPercentCompleteSort" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.BookingPercentComplete, "BookingPercentComplete" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.SummaryHoursTotal, "SummaryHoursTotal" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.SummaryHoursAvailable, "SummaryHoursAvailable" },
            { Abstractions.ProjectStatusReports.GetProjectStatusReportsV1.SortColumn.SummaryPercentComplete, "SummaryPercentCompleteSort" },
        };

        var sortProperty = sortMap[request.SortBy];

        var sorted = request.SortDirection == SortDirection.Asc ?
            mapped.OrderBy(t => EF.Property<object>(t, sortProperty)) :
            mapped.OrderByDescending(t => EF.Property<object>(t, sortProperty));

        sorted = sorted
            .ThenBy(t => t.StartDate)
            .ThenBy(t => t.ClientName)
            .ThenBy(t => t.ProjectName);

        mapped = sorted;

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
        var project = await _context.ProjectStatusReports
        .Where(t => t.Id == request.ProjectStatusReportId)
        .Select(psr => psr.Project)
        .FirstOrDefaultAsync();

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
        if (request.ProjectManagerId.HasValue)
        {
            records = records.Where(t => t.StaffId.Equals(request.ProjectManagerId));
        }
        if (request.ActivityId.HasValue)
        {
            records = records.Where(t => t.ActivityId.Equals(request.ActivityId));
        }


        var mapped = records
            .Select(t => new GetProjectStatusReportTimeV1.Record()
            {
                Id = t.Id,
                Status = t.Status,
                RejectionNotes = t.RejectionNotes,
                Task = t.Task,
                Hours = t.Hours,
                BillableHours = t.HoursApproved.HasValue ? t.HoursApproved.Value : t.Hours,
                ChargeCode = t.ChargeCode.Code,
                Date = t.Date,
                Description = t.Notes,
                StaffId = t.Staff.Id,
                StaffName = t.Staff.Name,
                ActivityId = t.ActivityId,
                ActivityName = t.Activity != null ? t.Activity.Name : null,
                CreatedAt = t.CreatedAt,
            });

        var total = await mapped.CountAsync(ct);
        var staff = mapped.GroupBy(t => new { t.StaffId, t.StaffName })
            .Select(t => new GetProjectStatusReportTimeV1.StaffRecord()
            {
                Id = t.Key.StaffId,
                Name = t.Key.StaffName,
                TotalHours = t.Sum(t => t.Hours)
            })
            .OrderBy(t => t.Name);


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

        var sorted = request.SortDirection == SortDirection.Asc ?
            mapped.OrderBy(t => EF.Property<object>(t, sortProperty)) :
            mapped.OrderByDescending(t => EF.Property<object>(t, sortProperty));

        sorted = sorted
            .ThenBy(t => t.Date)
            .ThenBy(t => t.StaffName)
            .ThenBy(t => t.CreatedAt);

        var response = new GetProjectStatusReportTimeV1.Response()
        {
            Records = await sorted.ToListAsync(ct),
            Staff = await staff.ToListAsync(ct),
            ProjectId = project != null ? project.Id : null,
            Total = total
        };

        return response;
    }

    public async Task<Result<ApproveProjectStatusReportTimeRequestV1.Response>> ApproveProjectStatusReportTimeRequestV1(ApproveProjectStatusReportTimeRequestV1.Request request, CancellationToken ct = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        var approvedCount = 0;

        var times = await _context.ProjectStatusReports
            .Where(t => t.Id == request.ProjectStatusReportId)
            .SelectMany(t => t.Project.ChargeCode!.Times.Where(x => x.Date >= t.StartDate && x.Date <= t.EndDate && request.TimeIds.Contains(x.Id)))
            .ToListAsync(ct);

        foreach (var time in times)
        {
            if (time.Status != TimeStatus.Pending && time.Status != TimeStatus.Resubmitted && time.Status != TimeStatus.Submitted)
            {
                continue;
            }

            time.Status = TimeStatus.Accepted;
            time.AcceptedAt = DateTime.UtcNow;
            time.AcceptedById = request.AcceptedById;

            // If the approved hours haven't been modified and we are approving, use the time hours
            if (!time.HoursApproved.HasValue)
            {
                time.HoursApproved = time.Hours;
            }

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
            .Where(t => t.Id == request.ProjectStatusReportId)
            .SelectMany(t => t.Project.ChargeCode!.Times.Where(x => x.Date >= t.StartDate && x.Date <= t.EndDate && request.TimeId == x.Id))
            .SingleOrDefaultAsync(ct);

        if (time == null)
        {
            return Result.Fail("Unable to find time entry.");
        }

        time.Status = TimeStatus.Rejected;
        time.RejectionNotes = request.Notes;
        time.RejectedAt = DateTime.UtcNow;
        time.RejectedById = request.RejectedById;

        await _context.SaveChangesAsync(ct);

        return new RejectProjectStatusReportTimeV1.Response();
    }

    public async Task<Result<UnapproveProjectStatusReportTimeV1.Response>> UnapproveProjectStatusReportTimeV1(UnapproveProjectStatusReportTimeV1.Request request, CancellationToken ct = default)
    {
        var time = await _context.ProjectStatusReports
            .Where(t => t.Id == request.ProjectStatusReportId)
            .SelectMany(t => t.Project.ChargeCode!.Times.Where(x => x.Date >= t.StartDate && x.Date <= t.EndDate && request.TimeId == x.Id))
            .SingleOrDefaultAsync(ct);

        if (time == null)
        {
            return Result.Fail("Unable to find time entry.");
        }
        // This is TEMPORARY for making rejected time change to Pending

        // if(time.Status != TimeStatus.Accepted)
        // {
        //     return Result.Fail("Time entry is not accepted.");
        // }

        time.Status = TimeStatus.Pending;

        await _context.SaveChangesAsync(ct);

        return new UnapproveProjectStatusReportTimeV1.Response();
    }

    public async Task<Result<UpdateProjectStatusReportTimeV1.Response>> UpdateProjectStatusReportTimeV1(UpdateProjectStatusReportTimeV1.Request request, CancellationToken ct = default)
    {
        var time = await _context.ProjectStatusReports
            .Where(t => t.Id == request.ProjectStatusReportId)
            .SelectMany(t => t.Project.ChargeCode!.Times.Where(x => x.Date >= t.StartDate && x.Date <= t.EndDate && request.TimeId == x.Id))
            .SingleOrDefaultAsync(ct);

        if (time == null)
        {
            return Result.Fail("Unable to find time entry.");
        }

        time.HoursApproved = request.BillableHours;
        time.Notes = request.Notes;
        time.Task = request.Task;
        time.ActivityId = request.ActivityId;
        time.ChargeCodeId = request.ChargeCodeId;

        await _context.SaveChangesAsync(ct);

        return new UpdateProjectStatusReportTimeV1.Response();
    }

    public async Task<Result<UpdateProjectStatusReportMarkdownV1.Response>> UpdateProjectStatusReportMarkdownV1(UpdateProjectStatusReportMarkdownV1.Request request, CancellationToken ct = default)
    {
        var psr = await _context.ProjectStatusReports.FindAsync(request.ProjectStatusReportId);
        if (psr == null)
        {
            return Result.Fail("Unable to find project status report.");
        }

        psr.Report = request.Report;

        await _context.SaveChangesAsync(ct);

        return new UpdateProjectStatusReportMarkdownV1.Response()
        {
            ProjectStatusReportId = psr.Id
        };
    }

    public async Task<Result<SubmitProjectStatusReportV1.Response>> SubmitProjectStatusReportV1(SubmitProjectStatusReportV1.Request request, CancellationToken ct = default)
    {
        var psr = await _context.ProjectStatusReports.FindAsync(request.ProjectStatusReportId);
        if (psr == null)
        {
            return Result.Fail("Unable to find project status report.");
        }

        if (psr.SubmittedAt.HasValue)
        {
            return Result.Fail("Project status report has already been submitted.");
        }

        psr.SubmittedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return new SubmitProjectStatusReportV1.Response()
        {
            ProjectStatusReportId = psr.Id,
            SubmittedAt = psr.SubmittedAt.Value
        };
    }
}