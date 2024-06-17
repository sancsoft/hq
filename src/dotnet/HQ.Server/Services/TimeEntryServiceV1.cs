using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentResults;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Times;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HQ.Server.Services
{
    public class TimeEntryServiceV1
    {
        private readonly HQDbContext _context;
        public TimeEntryServiceV1(HQDbContext context)
        {
            this._context = context;
        }
        public async Task<Result<UpsertTimeV1.Response>> UpsertTimeV1(UpsertTimeV1.Request request, CancellationToken ct = default) {
            var validationResult = Result.Merge(
                Result.FailIf(string.IsNullOrEmpty(request.Notes), "Notes are required."),
                 Result.FailIf(request.StaffId == null, "Staff is required."),
                Result.FailIf(request.BillableHours <= 0, "Billable Hours must be greater than 0.")
            );

            if (validationResult.IsFailed) {
                return validationResult;
            }

            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id && t.StaffId == request.StaffId);

            if (timeEntry == null)
            {
                timeEntry = new Time();
                _context.Times.Add(timeEntry);
            }

            timeEntry.StaffId = request.StaffId.Value;
            timeEntry.ChargeCodeId = request.ChargeCodeId;
            timeEntry.Date = request.Date;
            timeEntry.Notes = request.Notes;
            timeEntry.Hours = request.BillableHours;
            timeEntry.ActivityId = request.ActivityId;
            timeEntry.Task = request.Task;
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeV1.Response() { Id = timeEntry.Id });            
        }

        public async Task<Result<GetTimesV1.Response>> GetTimesV1(GetTimesV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Times
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Notes.ToLower().Contains(request.Search.ToLower())
            );
        }

        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value && t.StaffId == request.StaffId);
        }
        if (request.StaffId.HasValue)
        {
            records = records.Where(t => t.StaffId == request.StaffId);
        }
        
        var mapped = records
            .Select(t => new GetTimesV1.Record()
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
                ActivityId = t.ActivityId,
                ActivityName = t.Activity != null ? t.Activity.Name : null,
                CreatedAt = t.CreatedAt,
            });

        var total = await mapped.CountAsync(ct);


        var sortMap = new Dictionary<GetTimesV1.SortColumn, string>()
        {
            { Abstractions.Times.GetTimesV1.SortColumn.BillableHours, "BillableHours" },
            { Abstractions.Times.GetTimesV1.SortColumn.Date, "Date" },
            { Abstractions.Times.GetTimesV1.SortColumn.ChargeCode, "ChargeCode" }

        };

        var sortProperty = sortMap[request.SortBy];

        var sorted = request.SortDirection == SortDirection.Asc ?
            mapped.OrderBy(t => EF.Property<object>(t, sortProperty)) :
            mapped.OrderByDescending(t => EF.Property<object>(t, sortProperty));

        sorted = sorted
            .ThenBy(t => t.Date)
            .ThenBy(t => t.CreatedAt);

        var response = new GetTimesV1.Response()
        {
            Records = await mapped.ToListAsync(ct),
            Total = total
        };

        return response;
    }

 public async Task<Result<DeleteTimeV1.Response>> DeleteTimeV1(DeleteTimeV1.Request request, CancellationToken ct = default)
{
    var time = await _context.Times
                             .Where(t => t.Id == request.Id)
                             .FirstOrDefaultAsync(ct);

    if (time == null)
    {
        return Result.Fail("No time entry exists for this Staff ID");
    }

    _context.Times.Remove(time);
    await _context.SaveChangesAsync(ct);

    return  Result.Ok();
    }
    }
}