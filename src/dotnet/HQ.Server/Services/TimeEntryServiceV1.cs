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

            var chargeCode = await _context.ChargeCodes.Where(t => t.Code == request.ChargeCode || t.Id == request.ChargeCodeId).FirstOrDefaultAsync();

            // These conditions are for the case where the request doesn't have a chargeCodeId but has ChargeCode for example P1041
            if ((!string.IsNullOrEmpty(request.ChargeCode) && !request.ChargeCodeId.HasValue) || chargeCode == null)
            {
                if (chargeCode != null) {
                    timeEntry.ChargeCode = chargeCode;
                } else {
                    return Result.Fail($"The Charge code: {request.ChargeCode} not found");
                }
            }

            if(request.ChargeCodeId.HasValue) {
                timeEntry.ChargeCodeId = request.ChargeCodeId.Value;
            }

            if (!string.IsNullOrEmpty(request.ActivityName) && !request.ActivityId.HasValue)
            {
                var activity = await _context.ProjectActivities
                .Where(t => t.ProjectId.Equals(chargeCode.ProjectId) && t.Name.ToLower() == request.ActivityName.ToLower())
                .FirstOrDefaultAsync();

                if (activity != null)
                {
                    timeEntry.ActivityId = activity.Id;
                }
                else
                {
                    return Result.Fail($"The Activity Name: {request.ActivityName} not found");
                }
            }

            if (request.ActivityId.HasValue)
            {
                timeEntry.ActivityId = request.ActivityId.Value;
            }

            timeEntry.StaffId = request.StaffId.HasValue ? request.StaffId.Value : Guid.Empty;
            timeEntry.Date = request.Date;
            timeEntry.Notes = request.Notes;
            timeEntry.Hours = request.Hours ?? 0;
            timeEntry.Task = request.Task;
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeV1.Response() { Id = timeEntry.Id });            
        }

        public async Task<Result<UpsertTimeDescriptionV1.Response>> UpsertTimeDescriptionV1(UpsertTimeDescriptionV1.Request request, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(request.Notes))
            {
                return Result.Fail("Time Description can not be null or empty");
            }
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);

            if (timeEntry == null)
            {
                return Result.Fail("Time Id is required.");
            }

            timeEntry.Notes = request.Notes;
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeDescriptionV1.Response() { Id = timeEntry.Id });
        }

        public async Task<Result<UpsertTimeHoursV1.Response>> UpsertTimeHoursV1(UpsertTimeHoursV1.Request request, CancellationToken ct = default)
        {
            if(request.Hours <= 0) {
                return Result.Fail("Hours must be greater than zero");
            }
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);
            
            if(timeEntry == null) {
                return Result.Fail("Time Id is required.");
            }

            timeEntry.Hours = request.Hours;
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeHoursV1.Response() { Id = timeEntry.Id });
        }

        public async Task<Result<UpsertTimeDateV1.Response>> UpsertTimeDateV1(UpsertTimeDateV1.Request request, CancellationToken ct = default)
        {
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);

            if (timeEntry == null)
            {
                return Result.Fail("Time Id is required.");
            }

            timeEntry.Date = request.Date;
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeDateV1.Response() { Id = timeEntry.Id });
        }

        public async Task<Result<UpsertTimeTaskV1.Response>> UpsertTimeTaskV1(UpsertTimeTaskV1.Request request, CancellationToken ct = default)
        {
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);

            if (timeEntry == null)
            {
                return Result.Fail("Time Id is required.");
            }

            timeEntry.Task = request.Task;
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeTaskV1.Response() { Id = timeEntry.Id });
        }
        public async Task<Result<UpsertTimeActivityV1.Response>> UpsertTimeActivityV1(UpsertTimeActivityV1.Request request, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(request.ActivityName))
            {
                return Result.Fail("Activity Name can't be null or empty");
            }
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);

            if (timeEntry == null)
            {
                return Result.Fail("Time Id is required.");
            }

            if (!string.IsNullOrEmpty(request.ActivityName))
            {
                var activity = await _context.ProjectActivities
                .Where(t => t.ProjectId.Equals(timeEntry.ChargeCode.ProjectId) && t.Name.ToLower() == request.ActivityName.ToLower())
                .FirstOrDefaultAsync();

                if (activity != null)
                {
                    timeEntry.ActivityId = activity.Id;
                }
                else
                {
                    return Result.Fail($"The Activity Name: {request.ActivityName} not found");
                }
            }
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeActivityV1.Response() { Id = timeEntry.Id });
        }

        public async Task<Result<UpsertTimeChargeCodeV1.Response>> UpsertTimeChargecodeV1(UpsertTimeChargeCodeV1.Request request, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(request.Chargecode))
            {
                return Result.Fail("Charge code can't be null or empty");
            }
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);

            if (timeEntry == null)
            {
                return Result.Fail("Time Id is required.");
            }
            var chargeCode = await _context.ChargeCodes.Where(t => t.Code == request.Chargecode).FirstOrDefaultAsync();

            if (!string.IsNullOrEmpty(request.Chargecode))
            {
                if (chargeCode != null)
                {
                    timeEntry.ChargeCode = chargeCode;
                }
                else
                {
                    return Result.Fail($"The Charge code: {request.Chargecode} not found");
                }
            }
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeChargeCodeV1.Response() { Id = timeEntry.Id });
        }

        public async Task<Result<GetTimesV1.Response>> GetTimesV1(GetTimesV1.Request request, CancellationToken ct = default)
    {
        var records = _context.Times
            .Include(t => t.ChargeCode).ThenInclude(t => t.Project).ThenInclude(t => t!.Client)
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.Search))
        {
            records = records.Where(t =>
                t.Notes!.ToLower().Contains(request.Search.ToLower()) ||
                t.ChargeCode != null && t.ChargeCode.Code.ToLower().Contains(request.Search.ToLower()) ||
                t.Activity != null && t.Activity.Name.ToLower().Contains(request.Search.ToLower()) ||
                t.Task != null && t.Task.ToLower().Contains(request.Search.ToLower()) ||
                 t.ChargeCode!.Project!.Name != null && t.ChargeCode.Project.Name.ToLower().Contains(request.Search.ToLower()) ||
                 t.ChargeCode.Project.Client.Name != null && t.ChargeCode.Project.Client.Name.ToLower().Contains(request.Search.ToLower())
            );
        }

        if (!string.IsNullOrEmpty(request.ChargeCode))
        {
            records = records.Where(t => t.ChargeCode.Code == request.ChargeCode);
        }
        if (request.ClientId.HasValue)
        {
            records = records.Where(t => t.ChargeCode.Project!.ClientId.Equals(request.ClientId));
        }

        if (request.StartDate.HasValue && !request.EndDate.HasValue)
        {
            records = records.Where(t => t.Date >= request.StartDate);
        }

        if (request.EndDate.HasValue && !request.StartDate.HasValue)
        {
            records = records.Where(t => t.Date <= request.EndDate);
        }

        if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            records = records.Where(t => t.Date >= request.StartDate && t.Date <= request.EndDate);
        }
        
        if (request.Id.HasValue)
        {
            records = records.Where(t => t.Id == request.Id.Value && t.StaffId == request.StaffId);
        }
        if (request.StaffId.HasValue)
        {
            records = records.Where(t => t.StaffId == request.StaffId);
        }
        if (!string.IsNullOrEmpty(request.Task))
        {
            records = records.Where(t => t.Task == request.Task);
        }
        if (!string.IsNullOrEmpty(request.Activity))
        {
            records = records.Where(t => t.Activity!.Name == request.Activity);
        }
        if (request.Date.HasValue)
        {
            records = records.Where(t => t.Date == request.Date);
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
                ProjectName = t.ChargeCode.Project != null ? t.ChargeCode.Project.Name : null,
                ClientName = t.ChargeCode.Project != null ? t.ChargeCode.Project.Client.Name : null,
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

 public async Task<Result<DeleteTimeV1.Response?>> DeleteTimeV1(DeleteTimeV1.Request request, CancellationToken ct = default)
{
    var time = await _context.Times
                             .Where(t => t.Id == request.Id)
                             .FirstOrDefaultAsync(ct);

    if (time == null)
    {
        return Result.Ok<DeleteTimeV1.Response?>(null);
    }

    _context.Times.Remove(time);
    await _context.SaveChangesAsync(ct);

     return new DeleteTimeV1.Response();
    }
    }
}