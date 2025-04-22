using System.Data;
using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

using Hangfire;

using HQ.Abstractions;
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
        private readonly ILogger<TimeEntryServiceV1> _logger;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public TimeEntryServiceV1(HQDbContext context, ILogger<TimeEntryServiceV1> logger, IBackgroundJobClient backgroundJobClient)
        {
            this._context = context;
            _logger = logger;
            _backgroundJobClient = backgroundJobClient;
        }

        public async Task<Result<UpsertTimeV1.Response>> UpsertTimeV1(UpsertTimeV1.Request request, CancellationToken ct = default)
        {
            var validationResult = Result.Merge(
                Result.FailIf(!request.Id.HasValue && request.StaffId == null, "Staff is required."),
                Result.FailIf(request.Hours <= 0, "Hours must be greater than 0.")
            );


            if (validationResult.IsFailed)
            {
                return validationResult;
            }


            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);


            if (timeEntry == null)
            {
                timeEntry = new Time();
                timeEntry.StaffId = request.StaffId!.Value;
                _context.Times.Add(timeEntry);
            }


            var chargeCode = await _context.ChargeCodes.Where(t => t.Code == request.ChargeCode || t.Id == request.ChargeCodeId).Include(t => t.Project).FirstOrDefaultAsync(ct);
            var maximumTimeEntryHours = chargeCode?.Project?.TimeEntryMaxHours;
            if (request.Hours > maximumTimeEntryHours)
            {
                return Result.Fail($"Time entry hours ({request.Hours}) exceed the maximum allowed hours ({maximumTimeEntryHours})");

            }

            if ((!string.IsNullOrEmpty(request.ChargeCode) && !request.ChargeCodeId.HasValue) || chargeCode == null)
            {
                if (chargeCode != null)
                {
                    timeEntry.ChargeCode = chargeCode;
                }
                else
                {
                    return Result.Fail($"The Charge code: {request.ChargeCode} not found");
                }
            }


            if (request.ChargeCodeId.HasValue)
            {
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
            else
            {
                timeEntry.ActivityId = request.ActivityId;
            }

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
            if (request.Hours <= 0)
            {
                return Result.Fail("Hours must be greater than zero");
            }
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);


            if (timeEntry == null)
            {
                return Result.Fail("Time Id is required.");
            }


            timeEntry.Hours = request.Hours;
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeHoursV1.Response() { Id = timeEntry.Id });
        }

        public async Task<Result<UpsertTimeHoursInvoicedV1.Response>> UpsertTimeHoursInvoicedV1(UpsertTimeHoursInvoicedV1.Request request, CancellationToken ct = default)
        {
            if (request.HoursInvoiced < 0)
            {
                return Result.Fail("Hours invoiced must be at least zero");
            }
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);


            if (timeEntry == null)
            {
                return Result.Fail("Time Id is required.");
            }

            timeEntry.HoursInvoiced = request.HoursInvoiced;
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new UpsertTimeHoursInvoicedV1.Response() { Id = timeEntry.Id, HoursInvoiced = request.HoursInvoiced });
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
        public async Task<Result<SubmitTimesV1.Response>> SubmitTimesV1(SubmitTimesV1.Request request, CancellationToken ct = default)
        {
            var timeEntries = _context.Times.Where(t => request.Ids.Contains(t.Id));
            if (timeEntries == null)
            {
                return Result.Fail("Time Id is required.");
            }

            var chargeCodesWithActivities = await _context.ChargeCodes
                .Where(t => t.Project!.Activities.Any())
                .Select(t => t.Id)
                .ToListAsync(ct);

            foreach (var time in timeEntries)
            {
                if (time.Hours == 0 || String.IsNullOrEmpty(time.Notes))
                {
                    continue;
                }

                if (chargeCodesWithActivities.Contains(time.ChargeCodeId) && !time.ActivityId.HasValue)
                {
                    continue;
                }

                if (time.Status == TimeStatus.Unsubmitted)
                {
                    time.Status = TimeStatus.Submitted;
                }

                if (time.Status == TimeStatus.Rejected)
                {
                    time.Status = TimeStatus.Resubmitted;
                    _backgroundJobClient.Enqueue<EmailMessageService>(t => t.SendResubmitTimeEntryEmail(time.Id, CancellationToken.None));
                }
            }

            await _context.SaveChangesAsync(ct);

            return Result.Ok(new SubmitTimesV1.Response() { });
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

        public async Task<Result<AddTimeToInvoiceV1.Response>> AddTimeToInvoiceV1(AddTimeToInvoiceV1.Request request, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(request.InvoiceId.ToString()))
            {
                return Result.Fail("Invoice Id can't be null or empty");
            }
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);

            if (timeEntry == null)
            {
                return Result.Fail("Time Id is required.");
            }
            var invoice = await _context.Invoices.Where(t => t.Id == request.InvoiceId).FirstOrDefaultAsync();

            if (!string.IsNullOrEmpty(request.InvoiceId.ToString()))
            {
                if (invoice != null)
                {
                    timeEntry.Invoice = invoice;
                    timeEntry.InvoiceId = request.InvoiceId;
                    timeEntry.HoursInvoiced = request.HoursInvoiced != null ? request.HoursInvoiced : timeEntry.Hours;
                }
                else
                {
                    return Result.Fail($"The Invoice: {request.InvoiceId} not found");
                }

            }
            await _context.SaveChangesAsync(ct);
            return Result.Ok(new AddTimeToInvoiceV1.Response() { Id = timeEntry.Id });
        }

        public async Task<Result> RemoveTimeFromInvoiceV1(RemoveTimeFromInvoiceV1.Request request, CancellationToken ct = default)
        {
            if (request.Id == Guid.Empty)
            {
                return Result.Fail("Time entry Id can't be null or empty");
            }
            var timeEntry = _context.Times.FirstOrDefault(t => t.Id == request.Id);


            if (timeEntry == null)
            {
                return Result.Fail("Time entry could not be found.");
            }
            Console.WriteLine($"Found time {timeEntry.Id}");
            var invoice = await _context.Invoices.Where(t => t.Id == timeEntry.InvoiceId).FirstOrDefaultAsync();

            if (invoice != null)
            {
                Console.WriteLine($"Found invoice {invoice.Id}");
                timeEntry.InvoiceId = null;
                timeEntry.HoursInvoiced = null;
            }
            else
            {
                return Result.Fail("This time entry was not invoiced.");
            }

            await _context.SaveChangesAsync(ct);
            return Result.Ok();
        }

        public async Task<Result<GetTimesV1.Response>> GetTimesV1(GetTimesV1.Request request, CancellationToken ct = default)
        {
            if (request.Period.HasValue && request.Period == Period.Custom)
            {
                if (request.StartDate.HasValue && request.EndDate.HasValue && request.StartDate.Value > request.EndDate.Value)
                {
                    return Result.Fail("Invalid date range.");
                }
            }
            else if (request.Period.HasValue)
            {
                request.StartDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodStartDate(request.Period.Value);
                request.EndDate = DateOnly.FromDateTime(DateTime.Today).GetPeriodEndDate(request.Period.Value);
            }

            var records = _context.Times
                .Include(t => t.ChargeCode).ThenInclude(t => t.Project).ThenInclude(t => t!.Client)
                .AsNoTracking()
                .OrderByDescending(t => t.CreatedAt)
                .AsQueryable();



            if (!string.IsNullOrEmpty(request.Search))
            {
                records = records.Where(t =>

                    t.Staff.Name.ToLower().Contains(request.Search.ToLower()) ||
                    t.ChargeCode.Project!.Client.Name.ToLower().Contains(request.Search.ToLower()) ||
                    t.ChargeCode.Project!.Name.ToLower().Contains(request.Search.ToLower()) ||
                    t.Notes!.ToLower().Contains(request.Search.ToLower()) ||
                    t.ChargeCode.Code.ToLower().Contains(request.Search.ToLower()) ||
                    t.Activity!.Name.ToLower().Contains(request.Search.ToLower()) ||
                    t.Task!.ToLower().Contains(request.Search.ToLower())
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

            if (request.Date.HasValue && request.Period.HasValue)
            {
                request.StartDate = request.Date.Value.GetPeriodStartDate(request.Period.Value);
                request.EndDate = request.Date.Value.GetPeriodEndDate(request.Period.Value);
            }
            else if (request.Date.HasValue)
            {
                records = records.Where(t => t.Date == request.Date);
            }

            if (request.Invoiced.HasValue)
            {
                var isInvoiceRequired = request.Invoiced.Value;
                records = records.Where(t => isInvoiceRequired ? t.InvoiceId != null : t.InvoiceId == null);
            }

            if (request.Billable.HasValue)
            {
                var isBillable = request.Billable.Value;
                records = records.Where(t => t.ChargeCode.Billable == isBillable);
            }

            if (request.TimeAccepted.HasValue)
            {
                var isAcceptedTimeRequired = request.TimeAccepted.Value;
                records = records.Where(t => isAcceptedTimeRequired ? t.Status == TimeStatus.Accepted : t.Status != TimeStatus.Accepted);
            }
            if (request.TimeStatus.HasValue)
            {
                var timeStatus = request.TimeStatus.Value;
                records = records.Where(t => t.Status == timeStatus);
            }


            if (request.StartDate.HasValue)
            {
                records = records.Where(t => t.Date >= request.StartDate);
            }

            if (request.EndDate.HasValue)
            {
                records = records.Where(t => t.Date <= request.EndDate);
            }

            if (request.Id.HasValue)
            {
                records = records.Where(t => t.Id == request.Id.Value);
            }
            if (request.StaffId.HasValue)
            {
                records = records.Where(t => t.StaffId == request.StaffId);
            }
            if (request.InvoiceId.HasValue)
            {
                records = records.Where(t => t.InvoiceId == request.InvoiceId);
            }
            if (request.ProjectId.HasValue)
            {
                records = records.Where(t => t.ChargeCode.ProjectId.Equals(request.ProjectId.Value));
            }


            if (!string.IsNullOrEmpty(request.Task))
            {
                records = records.Where(t => t.Task == request.Task);
            }
            if (!string.IsNullOrEmpty(request.Activity))
            {
                records = records.Where(t => t.Activity!.Name == request.Activity);
            }

            // Timing Hours Queries
            var total = await records.CountAsync(ct);

            var totalHours = await records.SumAsync(t => t.Hours, ct);
            var billableHours = await records.Where(t => t.ChargeCode.Billable).SumAsync(t => t.Hours, ct);
            var acceptedHours = await records.Where(t => t.Status == TimeStatus.Accepted).SumAsync(t => t.HoursApproved, ct);
            var acceptedBillableHours = await records.Where(t => t.Status == TimeStatus.Accepted && t.ChargeCode.Billable).SumAsync(t => t.HoursApproved, ct);

            var mapped = records
            .Select(t => new GetTimesV1.Record()
            {
                Id = t.Id,
                Status = t.Status,
                RejectionNotes = t.RejectionNotes,
                Task = t.Task,
                Hours = t.Hours,
                BillableHours = t.HoursApproved,
                HoursInvoiced = t.HoursInvoiced,
                HoursApproved = t.HoursApproved,
                ChargeCode = t.ChargeCode.Code,
                ProjectName = t.ChargeCode.Project != null ? t.ChargeCode.Project.Name : null,
                ProjectId = t.ChargeCode.Project != null ? t.ChargeCode.Project.Id : null,
                ClientName = t.ChargeCode.Project != null ? t.ChargeCode.Project.Client.Name : null,
                ClientId = t.ChargeCode.Project != null ? t.ChargeCode.Project.Client.Id : null,
                StaffName = t.Staff.Name,
                StaffId = t.Staff.Id,
                InvoiceId = t.InvoiceId,
                InvoiceNumber = t.Invoice != null ? t.Invoice.InvoiceNumber : null,
                HoursApprovedBy = t.AcceptedBy != null ? t.AcceptedBy.Name : null,
                Billable = t.ChargeCode.Billable,
                Date = t.Date,
                Description = t.Notes,
                ActivityId = t.ActivityId,
                ActivityName = t.Activity != null ? t.Activity.Name : null,
                CreatedAt = t.CreatedAt,
            });

            var sortMap = new Dictionary<GetTimesV1.SortColumn, string>()
            {
                { Abstractions.Times.GetTimesV1.SortColumn.Hours, "Hours" },
                { Abstractions.Times.GetTimesV1.SortColumn.Date, "Date" },
                { Abstractions.Times.GetTimesV1.SortColumn.ChargeCode, "ChargeCode" },
                { Abstractions.Times.GetTimesV1.SortColumn.Billable, "Billable" },
                { Abstractions.Times.GetTimesV1.SortColumn.ClientName, "Client" },
                { Abstractions.Times.GetTimesV1.SortColumn.ProjectName, "ProjectName" },
                { Abstractions.Times.GetTimesV1.SortColumn.StaffName, "StaffName" },
                { Abstractions.Times.GetTimesV1.SortColumn.HoursApproved, "HoursApproved" }
            };


            var sortProperty = sortMap[request.SortBy];

            // HoursApproved has to sort differently since the Hours column displayed on invoice time list pages technically use
            // a records HoursApproved value only if the record has been approved, and otherwise uses the records Hours value
            // Sorting this way should prevent null values throwing off the time orders like with the standard OrderBy column name approach
            if (sortProperty == "HoursApproved")
            {
                var tempMapped = mapped.Select(t => new { Record = t, FunctionalHours = t.HoursApproved ?? t.Hours });

                var sorted = request.SortDirection == SortDirection.Asc ?
                    tempMapped.OrderBy(t => EF.Property<object>(t, "FunctionalHours")) :
                    tempMapped.OrderByDescending(t => EF.Property<object>(t, "FunctionalHours"));

                sorted = sorted
                    .ThenBy(t => t.Record.Date)
                    .ThenBy(t => t.Record.StaffName)
                    .ThenBy(t => t.Record.ClientName)
                    .ThenBy(t => t.Record.ProjectName);

                mapped = sorted.Select(t => t.Record);
            }
            else
            {
                var sorted = request.SortDirection == SortDirection.Asc ?
                    mapped.OrderBy(t => EF.Property<object>(t, sortProperty)) :
                    mapped.OrderByDescending(t => EF.Property<object>(t, sortProperty));

                sorted = sorted
                    .ThenBy(t => t.Date)
                    .ThenBy(t => t.StaffName)
                    .ThenBy(t => t.ClientName)
                    .ThenBy(t => t.ProjectName);

                mapped = sorted;
            }

            if (request.Skip.HasValue)
            {
                mapped = mapped.Skip(request.Skip.Value);
            }


            if (request.Take.HasValue)
            {
                mapped = mapped.Take(request.Take.Value);
            }



            var response = new GetTimesV1.Response()
            {
                Records = await mapped.ToListAsync(ct),
                TotalHours = totalHours,
                BillableHours = billableHours,
                AcceptedHours = acceptedHours ?? 0,
                AcceptedBillableHours = acceptedBillableHours ?? 0,
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


        public async Task<Result<GetDashboardTimeV1.Response>> GetDashboardTimeV1(GetDashboardTimeV1.Request request, CancellationToken ct = default)
        {
            var startDate = request.Date.GetPeriodStartDate(request.Period);
            var endDate = request.Date.GetPeriodEndDate(request.Period);
            var previousDate = startDate.AddPeriod(request.Period, -1);
            var nextDate = startDate.AddPeriod(request.Period, 1);

            var timesQuery = _context.Times
                .AsNoTracking()
                .Where(t => t.StaffId == request.StaffId && (request.Status == null ? (t.Date >= startDate && t.Date <= endDate) : (t.Status == request.Status)))
                .AsQueryable();



            var hrsThisWeekQuery = _context.Times
                .AsNoTracking()
                .Where(t => t.StaffId == request.StaffId && t.Date >= request.Date.GetPeriodStartDate(Period.Week) && t.Date <= request.Date.GetPeriodEndDate(Period.Week))
                .AsQueryable();
            var hrsLastWeekQuery = _context.Times
                .AsNoTracking()
                .Where(t => t.StaffId == request.StaffId && t.Date >= request.Date.GetPeriodStartDate(Period.LastWeek) && t.Date <= request.Date.GetPeriodEndDate(Period.LastWeek))
                .AsQueryable();
            var hrsThisMonthQuery = _context.Times
                .AsNoTracking()
                .Where(t => t.StaffId == request.StaffId && t.Date >= request.Date.GetPeriodStartDate(Period.Month) && t.Date <= request.Date.GetPeriodEndDate(Period.Month))
                .AsQueryable();

            var staff = await _context.Staff.FindAsync(request.StaffId);
            if (staff == null)
            {
                return Result.Fail("Unable to find staff.");
            }

            var currentYearStart = DateOnly.FromDateTime(DateTime.Today).GetPeriodStartDate(Period.Year);
            var currentYearEnd = DateOnly.FromDateTime(DateTime.Today).GetPeriodEndDate(Period.Year);
            var totalVacationHours = !staff.StartDate.HasValue ? 0 : DateOnly.FromDateTime(DateTime.Today).CalculateEarnedVacationHours(staff.StartDate.Value, staff.VacationHours);

            var usedVacationHours = await _context.Times.Where(t => t.StaffId == request.StaffId && t.Date >= currentYearStart && t.Date <= currentYearEnd && t.ChargeCode.Project!.Name.ToLower().Contains("vacation")).SumAsync(t => t.Hours);
            var vacationHours = totalVacationHours - usedVacationHours;

            if (!String.IsNullOrEmpty(request.Search))
            {
                timesQuery = timesQuery.Where(t =>
                    t.ChargeCode.Code.ToLower().Contains(request.Search.ToLower()) ||
                    t.ChargeCode.Project!.Client.Name.ToLower().Contains(request.Search.ToLower()) ||
                    t.ChargeCode.Project!.Name.ToLower().Contains(request.Search.ToLower()) ||
                    t.Activity!.Name.ToLower().Contains(request.Search.ToLower()) ||
                    t.Task!.ToLower().Contains(request.Search.ToLower()) ||
                    t.Notes!.ToLower().Contains(request.Search.ToLower())
                );
            }

            var times = timesQuery
                .Select(t => new GetDashboardTimeV1.TimeEntry()
                {
                    Id = t.Id,
                    CreatedAt = t.CreatedAt,
                    Date = t.Date,
                    ChargeCodeId = t.ChargeCodeId,
                    ChargeCode = t.ChargeCode.Code,
                    ActivityId = t.ActivityId,
                    MaximumTimeEntryHours = t.ChargeCode.Project != null ? t.ChargeCode.Project.TimeEntryMaxHours : 0,
                    Hours = t.Hours,
                    Notes = t.Notes,
                    Task = t.Task,
                    ActivityName = t.Activity != null ? t.Activity.Name : null,
                    ProjectName = t.ChargeCode.Project != null ? t.ChargeCode.Project.Name : null,
                    ClientName = t.ChargeCode.Project != null ? t.ChargeCode.Project.Client.Name : null,
                    TimeStatus = t.Status,
                    RejectionNotes = t.RejectionNotes,
                    ProjectId = t.ChargeCode.ProjectId,
                    ClientId = t.ChargeCode.Project != null ? t.ChargeCode.Project.ClientId : null
                });


            var sortMap = new Dictionary<Abstractions.Times.GetTimesV1.SortColumn, string>()
            {
                { Abstractions.Times.GetTimesV1.SortColumn.Hours, "Hours" },
                { Abstractions.Times.GetTimesV1.SortColumn.Date, "Date" },
                { Abstractions.Times.GetTimesV1.SortColumn.ChargeCode, "ChargeCode" },
                { Abstractions.Times.GetTimesV1.SortColumn.ClientName, "ClientName" },
                { Abstractions.Times.GetTimesV1.SortColumn.ProjectName, "ProjectName" },
            };

            if (request.SortBy == Abstractions.Times.GetTimesV1.SortColumn.Date)
            {
                if (request.SortDirection == SortDirection.Desc)
                {
                    times = times
                        .OrderByDescending(t => t.Date)
                        .ThenByDescending(t => t.CreatedAt);
                }
                else
                {
                    times = times
                        .OrderBy(t => t.Date)
                        .ThenBy(t => t.CreatedAt);
                }
            }
            else if (sortMap.ContainsKey(request.SortBy))
            {
                var sortProperty = sortMap[request.SortBy];

                times = request.SortDirection == SortDirection.Asc
                    ? times.OrderBy(t => EF.Property<object>(t, sortProperty))
                    : times.OrderByDescending(t => EF.Property<object>(t, sortProperty));
            }

            var timeEntriesList = await times.ToListAsync(ct);

            var groupedTimes = request.Period switch
            {
                Period.Today => timeEntriesList.GroupBy(t => t.Date).ToDictionary(g => g.Key, g => g.ToList()),
                Period.Week => timeEntriesList.GroupBy(t => t.Date).ToDictionary(g => g.Key, g => g.ToList()),
                Period.Month => timeEntriesList.GroupBy(t => t.Date.GetPeriodStartDate(Period.Month)).ToDictionary(g => g.Key, g => g.ToList()),
                _ => new Dictionary<DateOnly, List<GetDashboardTimeV1.TimeEntry>>()
            };


            var response = new GetDashboardTimeV1.Response
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalHours = await timesQuery.SumAsync(t => t.Hours, ct),
                BillableHours = await timesQuery.Where(t => t.ChargeCode.Billable).SumAsync(t => t.Hours, ct),
                HoursThisWeek = await hrsThisWeekQuery.SumAsync(t => t.Hours, ct),
                HoursLastWeek = await hrsLastWeekQuery.SumAsync(t => t.Hours, ct),
                HoursThisMonth = await hrsThisMonthQuery.SumAsync(t => t.Hours, ct),
                Vacation = vacationHours,
                NextDate = nextDate,
                PreviousDate = previousDate,
                StaffName = staff.Name,
                RejectedCount = await _context.Times.Where(t => t.StaffId == request.StaffId && t.Status == TimeStatus.Rejected).CountAsync(ct),
                TimeEntryCutoffDate = staff.TimeEntryCutoffDate
            };
            if (request.Status == TimeStatus.Rejected)
            {
                var rejectedTimes = new GetDashboardTimeV1.TimeForDate
                {
                    Date = startDate,
                    StartDate = startDate,
                    EndDate = endDate,
                    Times = groupedTimes.Values.SelectMany(v => v).ToList(),
                    TotalHours = timeEntriesList.Sum(t => t.Hours),
                    CanCreateTime = !staff.TimeEntryCutoffDate.HasValue || endDate >= staff.TimeEntryCutoffDate.Value
                };

                response.Dates.Add(rejectedTimes);
            }
            else if (request.Period == Period.Today || request.Period == Period.Week)
            {
                DateOnly date = endDate;
                do
                {
                    var timeForDate = new GetDashboardTimeV1.TimeForDate
                    {
                        Date = date,
                        StartDate = startDate,
                        EndDate = endDate
                    };

                    if (groupedTimes.ContainsKey(date))
                    {
                        timeForDate.Times = groupedTimes[date];
                        timeForDate.TotalHours = timeForDate.Times.Sum(t => t.Hours);
                    }

                    timeForDate.CanCreateTime = !staff.TimeEntryCutoffDate.HasValue || timeForDate.Date >= staff.TimeEntryCutoffDate.Value;

                    response.Dates.Add(timeForDate);
                    date = date.AddDays(-1);
                }
                while (date >= startDate);
            }
            else if (request.Period == Period.Month)
            {
                var timeForMonth = new GetDashboardTimeV1.TimeForDate
                {
                    Date = startDate,
                    StartDate = startDate,
                    EndDate = endDate,
                    Times = groupedTimes.Values.SelectMany(v => v).ToList(),
                    TotalHours = timeEntriesList.Sum(t => t.Hours),
                    CanCreateTime = !staff.TimeEntryCutoffDate.HasValue || endDate >= staff.TimeEntryCutoffDate.Value
                };

                response.Dates.Add(timeForMonth);
            }
            response.CanSubmit = groupedTimes.Count > 0 && !groupedTimes.Any(t => t.Value.Any(x => x.Hours == 0 || String.IsNullOrEmpty(x.Notes))) && groupedTimes.Any(t => t.Value.Any(x => x.TimeStatus == TimeStatus.Unsubmitted || x.TimeStatus == TimeStatus.Rejected));


            return response;
        }

        public GetTimesV1.Request MapToGetTimesV1Request(ExportTimesV1.Request exportRequest)
        {
            return new GetTimesV1.Request
            {
                StaffId = exportRequest.StaffId,
                Search = exportRequest.Search,
                StartDate = exportRequest.StartDate,
                EndDate = exportRequest.EndDate,
                Date = exportRequest.Date,
                ClientId = exportRequest.ClientId,
                ProjectId = exportRequest.ProjectId,
                ChargeCode = exportRequest.ChargeCode,
                Activity = exportRequest.Activity,
                Task = exportRequest.Task,
                Period = exportRequest.Period,
                TimeAccepted = exportRequest.TimeAccepted,
                Invoiced = exportRequest.Invoiced,
                Billable = exportRequest.Billable,
                SortBy = (GetTimesV1.SortColumn)exportRequest.SortBy,
                SortDirection = exportRequest.SortDirection,
                TimeStatus = exportRequest.TimeStatus
            };
        }


        public async Task<Result<ExportTimesV1.Response>> ExportTimesV1(ExportTimesV1.Request request, CancellationToken ct)
        {
            var stream = new MemoryStream();
            var streamWriter = new StreamWriter(stream);
            var csvWriter = new CsvWriter(streamWriter, new CsvConfiguration(CultureInfo.InvariantCulture));

            csvWriter.Context.RegisterClassMap<ExportTimeClassMap>();

            var mappedRequest = MapToGetTimesV1Request(request);
            var records = await this.GetTimesV1(mappedRequest);
            if (!records.IsSuccess)
            {
                return Result.Fail(records.Errors);
            }

            csvWriter.WriteRecords(records.Value.Records);
            await streamWriter.FlushAsync(ct);

            stream.Seek(0, SeekOrigin.Begin);

            return new ExportTimesV1.Response()
            {
                File = stream,
                FileName = $"HQTimeExport_{DateTime.Now:yyyyMMddHHmm}.csv",
                ContentType = "text/csv",
            };
        }

        private class ExportTimeClassMap : ClassMap<GetTimesV1.Record>
        {
            public ExportTimeClassMap()
            {
                Map(t => t.Date).Name("Date");
                Map(t => t.StaffName).Name("Staff");
                Map(t => t.ClientName).Name("Client");
                Map(t => t.ProjectName).Name("Project");
                Map(t => t.ChargeCode).Name("ChargeCode");
                Map(t => t.Billable).Name("Billable").Convert(t => t.Value.Billable ? "Y" : "N");
                Map(t => t.ActivityName).Name("Activity");
                Map(t => t.Task).Name("Task");
                Map(t => t.Hours).Name("Hours");
                Map(t => t.BillableHours).Name("AcceptedHours");
                Map(t => t.HoursInvoiced).Name("HoursInvoiced");
                Map(t => t.HoursApprovedBy).Name("AcceptedBy");
                Map(t => t.Description).Name("Description");
                Map(t => t.Status).Name("Status");
            }
        }

        public async Task BackgroundSendTimeEntryReminderEmail(Period period, CancellationToken ct)
        {
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow).GetPeriodStartDate(period);
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow).GetPeriodEndDate(period);
            var times = _context.Times.Where(t => t.Date >= startDate && t.Date <= endDate);

            var staffToNotify = await _context.Staff
                .AsNoTracking()
                .Where(t => t.EndDate == null && times.Where(x => x.StaffId == t.Id).Count() == 0)
                .ToListAsync(ct);

            foreach (var staff in staffToNotify)
            {
                _backgroundJobClient.Enqueue<EmailMessageService>(t => t.SendTimeEntryReminderEmail(staff.Id, startDate, endDate, CancellationToken.None));
            }
        }

        public async Task BackgroundSendTimeSubmissionReminderEmail(Period period, CancellationToken ct)
        {
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow).GetPeriodStartDate(period);
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow).GetPeriodEndDate(period);
            var times = _context.Times.Where(t => t.Date >= startDate && t.Date <= endDate);
            var unsubmittedTimes = times.Where(t => t.Status != TimeStatus.Submitted && t.Status != TimeStatus.Resubmitted && t.Status != TimeStatus.Accepted);

            var staffToNotify = await _context.Staff
                .AsNoTracking()
                .Where(t => t.EndDate == null && times.Where(x => x.StaffId == t.Id).Count() == 0 || unsubmittedTimes.Where(x => x.StaffId == t.Id).Count() > 0)
                .ToListAsync(ct);

            foreach (var staff in staffToNotify)
            {
                _backgroundJobClient.Enqueue<EmailMessageService>(t => t.SendTimeSubmissionReminderEmail(staff.Id, startDate, endDate, CancellationToken.None));
            }
        }

        public async Task BackgroundSendRejectedTimeSubmissionReminderEmail(Period period, CancellationToken ct)
        {
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow).GetPeriodStartDate(period);
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow).GetPeriodEndDate(period);
            var times = _context.Times.Where(t => t.Date >= startDate && t.Date <= endDate);
            var rejectedTimes = times.Where(t => t.Status == TimeStatus.Rejected);

            var staffToNotify = await _context.Staff
                .AsNoTracking()
                .Where(t => t.EndDate == null && rejectedTimes.Where(x => x.StaffId == t.Id).Count() > 0)
                .ToListAsync(ct);

            foreach (var staff in staffToNotify)
            {
                _backgroundJobClient.Enqueue<EmailMessageService>(t => t.SendRejectedTimeSubmissionReminderEmail(staff.Id, startDate, endDate, CancellationToken.None));
            }
        }

        public async Task BackgroundCaptureUnsubmittedTimeV1(CancellationToken ct)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var lastWeekEnd = today.GetPeriodEndDate(Period.LastWeek);

            _logger.LogInformation("Capturing unsubmitted time through {To}.", lastWeekEnd);
            var captureResponse = await CaptureUnsubmittedTimeV1(new()
            {
                To = lastWeekEnd
            }, ct);
            _logger.LogInformation("Captured {CaptureCount} unsubmitted time entries.", captureResponse.Value.Captured);
        }

        public async Task<Result<CaptureUnsubmittedTimeV1.Response>> CaptureUnsubmittedTimeV1(CaptureUnsubmittedTimeV1.Request request, CancellationToken ct = default)
        {
            var times = _context.Times
                .Where(t => t.Status == TimeStatus.Unsubmitted)
                .AsQueryable();

            if (request.From.HasValue)
            {
                times = times.Where(t => t.Date >= request.From.Value);
            }

            if (request.To.HasValue)
            {
                times = times.Where(t => t.Date <= request.To.Value);
            }

            var capturedAt = DateTime.UtcNow;
            var capturedCount = await times.ExecuteUpdateAsync(t => t
                .SetProperty(x => x.CapturedAt, x => capturedAt)
                .SetProperty(x => x.Status, x => TimeStatus.Submitted)
            , ct);

            return new CaptureUnsubmittedTimeV1.Response()
            {
                Captured = capturedCount
            };
        }
    }
}