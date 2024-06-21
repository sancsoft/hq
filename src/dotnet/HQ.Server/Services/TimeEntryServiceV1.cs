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
        public TimeEntryServiceV1(HQDbContext context)
        {
            this._context = context;
        }
        public async Task<Result<UpsertTimeV1.Response>> UpsertTimeV1(UpsertTimeV1.Request request, CancellationToken ct = default)
        {
            var validationResult = Result.Merge(
                Result.FailIf(string.IsNullOrEmpty(request.Notes), "Notes are required."),
                Result.FailIf(!request.Id.HasValue && request.StaffId == null, "Staff is required."),
                Result.FailIf(request.BillableHours <= 0, "Billable Hours must be greater than 0.")
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
                    t.Notes!.ToLower().Contains(request.Search.ToLower()) ||
                    t.ChargeCode != null && t.ChargeCode.Code.ToLower().Contains(request.Search.ToLower()) ||
                    t.Activity != null && t.Activity.Name.ToLower().Contains(request.Search.ToLower()) ||
                    t.Task != null && t.Task.ToLower().Contains(request.Search.ToLower()) ||
                    t.ChargeCode!.Project!.Name.ToLower().Contains(request.Search.ToLower()) ||
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

            var total = await records.CountAsync(ct);

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
                .Where(t => t.StaffId == request.StaffId && t.Date >= startDate && t.Date <= endDate)
                .AsQueryable();

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

            var times = await timesQuery.OrderByDescending(t => t.CreatedAt)
                .Select(t => new GetDashboardTimeV1.TimeEntry()
                {
                    Id = t.Id,
                    Date = t.Date,
                    ChargeCodeId = t.ChargeCodeId,
                    ActivityId = t.ActivityId,
                    Hours = t.Hours,
                    Notes = t.Notes,
                    Task = t.Task,
                    ProjectId = t.ChargeCode.ProjectId,
                    ClientId = t.ChargeCode.Project != null ? t.ChargeCode.Project.ClientId : null
                })
                .GroupBy(t => t.Date)
                .ToDictionaryAsync(t => t.Key, t => t.ToList());

            var chargeCodes = await _context.ChargeCodes
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
                .OrderBy(t => t.Name)
                .Select(t => new GetDashboardTimeV1.Client()
                {
                    Id = t.Id,
                    Name = t.Name
                })
                .ToListAsync(ct);


            var projects = await _context.Projects
                .AsNoTracking()
                .OrderBy(t => t.Name)
                .Include(t => t.Activities)
                .Select(t => new GetDashboardTimeV1.Project()
                {
                    Id = t.Id,
                    Name = t.Name,
                    ClientId = t.ClientId,
                    Activities = t.Activities.Select(x => new Abstractions.Times.GetDashboardTimeV1.Activities()
                    {
                        Id = x.Id,
                        Name = x.Name
                    }).ToList()
                })
                .ToListAsync(ct);


            var response = new GetDashboardTimeV1.Response();
            response.ChargeCodes = chargeCodes;
            response.Clients = clients;
            response.Projects = projects;
            response.StartDate = startDate;
            response.EndDate = endDate;
            response.TotalHours = await timesQuery.SumAsync(t => t.Hours);
            response.BillableHours = await timesQuery.Where(t => t.ChargeCode.Billable).SumAsync(t => t.Hours);
            response.NextDate = nextDate;
            response.PreviousDate = previousDate;

            DateOnly date = endDate;
            do
            {
                var timeForDate = new GetDashboardTimeV1.TimeForDate();
                timeForDate.Date = date;
                if (times.ContainsKey(date))
                {
                    timeForDate.Times = times[date];
                }

                response.Dates.Add(timeForDate);
                date = date.AddDays(-1);
            }
            while (date >= startDate);

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
    }
}