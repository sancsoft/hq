using System.Globalization;

using CsvHelper;
using CsvHelper.Configuration;

using FluentResults;

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

        public TimeEntryServiceV1(HQDbContext context, ILogger<TimeEntryServiceV1> logger)
        {
            this._context = context;
            _logger = logger;
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


            var chargeCode = await _context.ChargeCodes.Where(t => t.Code == request.ChargeCode || t.Id == request.ChargeCodeId).FirstOrDefaultAsync();


            // These conditions are for the case where the request doesn't have a chargeCodeId but has ChargeCode for example P1041
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


            if (request.ActivityId.HasValue)
            {
                timeEntry.ActivityId = request.ActivityId.Value;
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
            foreach (var time in timeEntries)
            {
                if (time.Status == TimeStatus.Unsubmitted)
                {
                    time.Status = TimeStatus.Submitted;
                }

                if (time.Status == TimeStatus.Rejected)
                {
                    time.Status = TimeStatus.Resubmitted;
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


            if (request.TimeAccepted.HasValue)
            {
                var isAcceptedTimeRequired = request.TimeAccepted.Value;
                records = records.Where(t => isAcceptedTimeRequired ? t.Status == TimeStatus.Accepted : t.Status != TimeStatus.Accepted);
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
                ChargeCode = t.ChargeCode.Code,
                ProjectName = t.ChargeCode.Project != null ? t.ChargeCode.Project.Name : null,
                ProjectId = t.ChargeCode.Project != null ? t.ChargeCode.Project.Id : null,
                ClientName = t.ChargeCode.Project != null ? t.ChargeCode.Project.Client.Name : null,
                ClientId = t.ChargeCode.Project != null ? t.ChargeCode.Project.Client.Id : null,
                StaffName = t.Staff.Name,
                StaffId = t.Staff.Id,
                InvoiceId = t.InvoiceId,
                HoursApprovedBy = null,
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
                { Abstractions.Times.GetTimesV1.SortColumn.StaffName, "StaffName" }
            };


            var sortProperty = sortMap[request.SortBy];


            var sorted = request.SortDirection == SortDirection.Asc ?
               mapped.OrderBy(t => EF.Property<object>(t, sortProperty)) :
               mapped.OrderByDescending(t => EF.Property<object>(t, sortProperty));

            sorted = sorted
                .ThenBy(t => t.Date)
                .ThenBy(t => t.StaffName)
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
            var totalVacationHours = !staff.StartDate.HasValue ? 0 : DateOnly.FromDateTime(DateTime.Today).CalculateEarnedVacationHours(staff.StartDate.Value, staff.VacationHours);

            var usedVacationHours = await _context.Times.Where(t => t.StaffId == request.StaffId && t.Date >= currentYearStart && t.ChargeCode.Project!.Name.ToLower().Contains("vacation")).SumAsync(t => t.Hours);
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

            var times = await timesQuery
                .Select(t => new GetDashboardTimeV1.TimeEntry()
                {
                    Id = t.Id,
                    CreatedAt = t.CreatedAt,
                    Date = t.Date,
                    ChargeCodeId = t.ChargeCodeId,
                    ChargeCode = t.ChargeCode.Code,
                    ActivityId = t.ActivityId,
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
                })
                .GroupBy(t => t.Date)
                .ToDictionaryAsync(t => t.Key, t => t.OrderByDescending(x => x.CreatedAt).ToList());

            var chargeCodes = await _context.ChargeCodes
                .Where(t => t.Active == true)
                .AsNoTracking()
                .OrderBy(t => t.Code)
                .Select(t => new GetDashboardTimeV1.ChargeCode()
                {
                    Id = t.Id,
                    Code = t.Code,
                    ClientId = t.Project != null ? t.Project.ClientId : null,
                    ProjectId = t.ProjectId
                })
                .ToListAsync(ct);

            var clients = await _context.Clients
                .AsNoTracking()
                .Where(t => !t.Projects.All(x => x.ChargeCode!.Active == false))
                .OrderBy(t => t.Name)
                .Include(t => t.Projects)
                .ThenInclude(t => t.Activities)
                .Select(t => new GetDashboardTimeV1.Client()
                {
                    Id = t.Id,
                    Name = t.Name,
                    Projects = t.Projects.Where(x => x.ChargeCode!.Active == true).OrderBy(x => x.Name).Select(x => new Abstractions.Times.GetDashboardTimeV1.Project()
                    {
                        Id = x.Id,
                        ChargeCodeId = x.ChargeCode != null ? x.ChargeCode.Id : null,
                        ChargeCode = x.ChargeCode != null ? x.ChargeCode.Code : null,
                        Name = x.Name,
                        Activities = x.Activities.Select(y => new Abstractions.Times.GetDashboardTimeV1.Activities()
                        {
                            Id = y.Id,
                            Name = y.Name
                        }).ToList()
                    }).ToList()
                })
                .ToListAsync(ct);

            var response = new GetDashboardTimeV1.Response();
            response.ChargeCodes = chargeCodes;
            response.Clients = clients;
            response.StartDate = startDate;
            response.EndDate = endDate;
            response.TotalHours = await timesQuery.SumAsync(t => t.Hours, ct);
            response.BillableHours = await timesQuery.Where(t => t.ChargeCode.Billable).SumAsync(t => t.Hours, ct);
            response.HoursThisWeek = await hrsThisWeekQuery.SumAsync(t => t.Hours, ct);
            response.HoursLastWeek = await hrsLastWeekQuery.SumAsync(t => t.Hours, ct);
            response.HoursThisMonth = await hrsThisMonthQuery.SumAsync(t => t.Hours, ct);
            response.Vacation = vacationHours;
            response.NextDate = nextDate;
            response.PreviousDate = previousDate;
            response.StaffName = staff.Name;
            response.RejectedCount = await _context.Times.Where(t => t.StaffId == request.StaffId && t.Status == TimeStatus.Rejected).CountAsync(ct);

            if (request.Status.HasValue)
            {
                foreach (var date in times)
                {
                    var timeForDate = new GetDashboardTimeV1.TimeForDate();
                    timeForDate.Date = date.Key;
                    timeForDate.Times = date.Value;
                    timeForDate.TotalHours = timeForDate.Times.Sum(t => t.Hours);
                    response.Dates.Add(timeForDate);
                }
            }
            else
            {
                DateOnly date = endDate;
                do
                {
                    var timeForDate = new GetDashboardTimeV1.TimeForDate();
                    timeForDate.Date = date;
                    if (times.ContainsKey(date))
                    {
                        timeForDate.Times = times[date];
                        timeForDate.TotalHours = timeForDate.Times.Sum(t => t.Hours);
                    }

                    timeForDate.CanCreateTime = !staff.TimeEntryCutoffDate.HasValue || timeForDate.Date >= staff.TimeEntryCutoffDate.Value;

                    response.Dates.Add(timeForDate);
                    date = date.AddDays(-1);
                }
                while (date >= startDate);
            }

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
                SortBy = (GetTimesV1.SortColumn)exportRequest.SortBy,
                SortDirection = exportRequest.SortDirection
            };
        }


        public async Task<Result<ExportTimesV1.Response>> ExportTimesV1(ExportTimesV1.Request request, CancellationToken ct)
        {
            var stream = new MemoryStream();
            var streamWriter = new StreamWriter(stream);
            var csvWriter = new CsvWriter(streamWriter, new CsvConfiguration(CultureInfo.InvariantCulture));


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