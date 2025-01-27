using System.Net.Mail;
using System.Text.RegularExpressions;

using FluentResults;
using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions;
using HQ.Abstractions.Emails;
using HQ.Abstractions.EmailTemplates;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Services;
using HQ.Abstractions.Times;
using HQ.API;
using HQ.Server.Data;
using HQ.Server.Services;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HQ.Server.Services
{
    public class EmailMessageService
    {
        private readonly EmailTemplateServiceV1 _emailTemplateService;
        private readonly IEmailService _emailService;
        private readonly HQDbContext _context;
        private readonly IOptionsMonitor<HQServerOptions> _options;

        public EmailMessageService(EmailTemplateServiceV1 emailTemplateService, IEmailService emailService, HQDbContext context, IOptionsMonitor<HQServerOptions> options)
        {
            _emailTemplateService = emailTemplateService;
            _emailService = emailService;
            _context = context;
            _options = options;
        }

        public async Task<Result> SendEmail<T>(EmailMessage emailMessage, T model, string to, string subject, MailPriority priority = MailPriority.Normal, IEnumerable<Attachment>? attachments = null, CancellationToken ct = default) where T : BaseEmail
        {
            model.WebUrl = _options.CurrentValue.WebUrl;

            var request = new GetEmailTemplateV1.Request<T>()
            {
                EmailMessage = emailMessage,
                Model = model
            };

            var result = await _emailTemplateService.GetEmailTemplateV1(request, ct);
            if (!result.IsSuccess)
            {
                return Result.Fail(result.Errors);
            }

            var response = result.Value;

            await _emailService.SendAsync(subject, response.HTML, response.Text, [to], attachments, priority, ct);

            return Result.Ok();
        }

        public async Task SendRejectTimeEntryEmail(Guid timeId, CancellationToken ct)
        {
            var time = await _context.Times
                .AsNoTracking()
                .Include(t => t.Staff)
                .Include(t => t.RejectedBy)
                .Include(t => t.Activity)
                .Include(t => t.ChargeCode)
                .ThenInclude(t => t.Project)
                .ThenInclude(t => t!.Client)
                .SingleAsync(t => t.Id == timeId, ct);

            if (String.IsNullOrEmpty(time.Staff.Email))
            {
                return;
            }

            var model = new RejectTimeEntryEmail()
            {
                Date = time.Date,
                Hours = time.Hours,
                Description = time.Notes,
                ActivityTask = time.Activity?.Name ?? time.Task,
                ChargeCode = time.ChargeCode.Code,
                Client = time.ChargeCode.Project?.Client?.Name ?? String.Empty,
                Project = time.ChargeCode.Project?.Name ?? String.Empty,
                ReasonForRejection = time.RejectionNotes,
                RejectedBy = time.RejectedBy?.Name,
                Heading = "Time Rejected",
                Message = "Your time entry has been rejected. Please review and resubmit.",
                ButtonLabel = "Open HQ",
                StaffName = time.Staff.Name,
                ButtonUrl = _options.CurrentValue.WebUrl
            };

            await SendEmail(EmailMessage.RejectTimeEntry, model, time.Staff.Email, "[HQ] Time Rejected", MailPriority.High, null, ct);
        }

        public async Task SendResubmitTimeEntryEmail(Guid timeId, CancellationToken ct)
        {
            var time = await _context.Times
                .AsNoTracking()
                .Include(t => t.Staff)
                .Include(t => t.RejectedBy)
                .Include(t => t.Activity)
                .Include(t => t.ChargeCode)
                .ThenInclude(t => t.Project)
                .ThenInclude(t => t!.Client)
                .SingleAsync(t => t.Id == timeId, ct);

            var psr = await _context.ProjectStatusReports
                .AsNoTracking()
                .Include(t => t.ProjectManager)
                .SingleOrDefaultAsync(t => t.ProjectId == time.ChargeCode.ProjectId && time.Date >= t.StartDate && time.Date <= t.EndDate, ct);

            if (psr == null || String.IsNullOrEmpty(psr.ProjectManager?.Email))
            {
                return;
            }

            var buttonUrl = new Uri(_options.CurrentValue.WebUrl, $"/psr/{psr.Id}/time");
            var model = new RejectTimeEntryEmail()
            {
                Date = time.Date,
                Hours = time.Hours,
                Description = time.Notes,
                ActivityTask = time.Activity?.Name ?? time.Task,
                ChargeCode = time.ChargeCode.Code,
                Client = time.ChargeCode.Project?.Client?.Name ?? String.Empty,
                Project = time.ChargeCode.Project?.Name ?? String.Empty,
                ReasonForRejection = time.RejectionNotes,
                RejectedBy = time.RejectedBy?.Name,
                Heading = "Time Resubmitted",
                StaffName = time.Staff.Name,
                Message = "A rejected time entry has been resubmitted.",
                ButtonLabel = "View PSR",

                ButtonUrl = buttonUrl
            };

            await SendEmail(EmailMessage.RejectTimeEntry, model, psr.ProjectManager.Email, "[HQ] Time Resubmitted", MailPriority.Normal, null, ct);
        }

        public async Task SendTimeEntryReminderEmail(Guid staffId, DateOnly from, DateOnly to, CancellationToken ct)
        {
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId, ct);

            if (staff == null || String.IsNullOrEmpty(staff.Email))
            {
                return;
            }

            var model = new NotificationEmail()
            {
                Heading = "Time Entry Reminder",
                Message = $"You have 0 hours entered in HQ from {from} to {to}. Please remember to enter time into HQ and submit for review by Monday at 12PM EST.",
                ButtonLabel = "Open HQ",
                ButtonUrl = _options.CurrentValue.WebUrl
            };

            await SendEmail(EmailMessage.Notification, model, staff.Email, "[HQ] Time Entry Reminder", MailPriority.Normal, null, ct);
        }

        public async Task SendTimeSubmissionReminderEmail(Guid staffId, DateOnly from, DateOnly to, CancellationToken ct)
        {
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId, ct);

            if (staff == null || String.IsNullOrEmpty(staff.Email))
            {
                return;
            }

            var model = new NotificationEmail()
            {
                Heading = "Time Submission Reminder",
                Message = $"You have unsubmitted time in HQ from {from} to {to}. Please remember to submit for review by 12PM EST.",
                ButtonLabel = "Open HQ",
                ButtonUrl = _options.CurrentValue.WebUrl
            };

            await SendEmail(EmailMessage.Notification, model, staff.Email, "[HQ] Time Submission Reminder", MailPriority.High, null, ct);
        }

        public async Task SendPlanSubmissionReminderEmail(Guid staffId, DateOnly date, CancellationToken ct)
        {
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId, ct);

            if (staff == null || String.IsNullOrEmpty(staff.Email))
            {
                return;
            }

            var model = new NotificationEmail()
            {
                Heading = "Plan Reminder",
                Message = $"Please remember to fill out your plan and update your status in HQ.",
                ButtonLabel = "Open HQ",
                ButtonUrl = _options.CurrentValue.WebUrl
            };

            await SendEmail(EmailMessage.Notification, model, staff.Email, "[HQ] Plan Submission Reminder", MailPriority.High, null, ct);
        }

        public async Task SendRejectedTimeSubmissionReminderEmail(Guid staffId, DateOnly from, DateOnly to, CancellationToken ct)
        {
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId, ct);

            if (staff == null || String.IsNullOrEmpty(staff.Email))
            {
                return;
            }

            var model = new NotificationEmail()
            {
                Heading = "Rejected Time Reminder",
                Message = "You have rejected time in HQ. Please correct and resubmit as soon as possible.",
                ButtonLabel = "Open HQ",
                ButtonUrl = _options.CurrentValue.WebUrl
            };

            await SendEmail(EmailMessage.Notification, model, staff.Email, "[HQ] Rejected Time Reminder", MailPriority.High, null, ct);
        }

        public async Task SendPointSubmissionReminderEmail(Guid staffId, DateOnly from, DateOnly to, CancellationToken ct)
        {
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId, ct);

            if (staff == null || String.IsNullOrEmpty(staff.Email))
            {
                return;
            }

            var model = new NotificationEmail()
            {
                Heading = "Points Reminder",
                Message = $"Please remember to fill out your planning points in HQ.",
                ButtonLabel = "Open HQ",
                ButtonUrl = _options.CurrentValue.WebUrl
            };

            await SendEmail(EmailMessage.Notification, model, staff.Email, "[HQ] Planning Point Submission Reminder", MailPriority.High, null, ct);
        }

        public async Task SendUpdatedPlanningPointsEmail(Guid staffId, Guid modifiedByStaffId, DateOnly date, CancellationToken ct)
        {
            //date in order to pull this weeks planning points 
            var today = date;
            var startDate = today.GetPeriodStartDate(Period.Week);

            // GetPiontsV1 request object
            var getPointsRequest = new GetPointsV1.Request
            {
                StaffId = staffId,
                Date = startDate
            };

            //get name of user who modified points
            var modifyingUser = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == modifiedByStaffId, ct);

            //get name of staff whose points were modified
            var staff = await _context.Staff
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.Id == staffId, ct);


            if (staff == null || String.IsNullOrEmpty(staff.Email))
            {
                return;
            }

            var records = _context.Points
                            .AsNoTracking()
                            .Include(t => t.ChargeCode)
                            .Include(t => t.ChargeCode.Project)
                            .OrderByDescending(t => t.CreatedAt)
                            .AsQueryable();

            var endDate = date.GetPeriodEndDate(Period.Week);


            records = records
                    .Where(p => p.StaffId == staffId && p.Date == startDate);
            var points = await records.ToListAsync(ct);
            var times = _context.Times.AsNoTracking().AsQueryable().Where(t => t.StaffId == staffId && t.Date >= startDate && t.Date <= endDate);
            var pointTime = 4m; // A point represents 4 hours of logged work
            var timesDictionary = await times
            .GroupBy(x => x.ChargeCodeId)
            .ToDictionaryAsync(g => g.Key, g => g.Sum(x => x.Hours));

            var _points = points.Select(t => new GetPointsV1.Point
            {
                ChargeCodeId = t.ChargeCodeId,
                Id = t.Id,
                Sequence = t.Sequence,
                ChargeCode = t.ChargeCode?.Code,
                ProjectName = t.ChargeCode?.Project?.Name,
                ProjectId = t.ChargeCode?.Project?.Id,
            }).OrderBy(t => t.Sequence).ToList();

            for (int i = 0; i < 10; i++)
            {
                var sequence = i + 1;
                var point = _points.Find(p => p.Sequence == sequence);


                if (point == null)
                {
                    var nullPoint = new GetPointsV1.Point
                    {
                        ChargeCodeId = null,
                        Id = null,
                        Sequence = sequence,
                        Completed = false,
                        ChargeCode = null,
                        ProjectName = null,
                        ProjectId = null
                    };
                    _points.Insert(i, nullPoint);
                }
                else
                {
                    if (!point.ChargeCodeId.HasValue) continue;
                    var hours = timesDictionary.GetValueOrDefault(point.ChargeCodeId.Value, 0);
                    if (hours < pointTime) continue;
                    point.Completed = true;
                    timesDictionary[point.ChargeCodeId.Value] -= pointTime;
                }


                var pointsFinal = _points;

                //set model data for the email which will be sent to user
                var model = new UpdatedPlanningPointsEmail()
                {
                    StaffName = staff.Name,
                    UpdatedBy = modifyingUser?.Name,
                    ButtonLabel = "Open HQ",
                    ButtonUrl = _options.CurrentValue.WebUrl,
                    Date = date,
                    Points = pointsFinal
                };
                //sends email 
                await SendEmail(EmailMessage.UpdatedPlanningPoints, model, staff.Email, "[HQ] Planning Points Updated", MailPriority.High, null, ct);
            }
        }
        public async Task SendEmployeeHoursEmail(CancellationToken ct)
        {
            var date = DateOnly.FromDateTime(DateTime.UtcNow);

            var staff = await _context.Staff
                .AsNoTracking()
                .Where(t => t.EndDate == null)
                .Select(t => new EmployeeHoursEmail.StaffHoursModel()
                {
                    HoursLastWeek = t.Times.Where(x => x.Date >= date.GetPeriodStartDate(Period.LastWeek) && x.Date <= date.GetPeriodEndDate(Period.LastWeek)).Sum(x => x.Hours),
                    HoursLastMonth = t.Times.Where(x => x.Date >= date.GetPeriodStartDate(Period.LastMonth) && x.Date <= date.GetPeriodEndDate(Period.LastMonth)).Sum(x => x.Hours),
                    HoursThisMonth = t.Times.Where(x => x.Date >= date.GetPeriodStartDate(Period.Month) && x.Date <= date.GetPeriodEndDate(Period.Month)).Sum(x => x.Hours),
                    StaffName = t.Name,
                    WorkHours = t.WorkHours,
                    StaffDashboardURL = _options.CurrentValue.WebUrl + $"staff/{t.Id}/timesheet",

                })
                .ToListAsync(ct);
            foreach (var employee in staff)
            {
                employee.MissingHours = employee.HoursLastWeek == 0;
                employee.LessThanExpectedHours = employee.HoursLastWeek < employee.WorkHours;
                employee.PercentageWorkedHours = employee.WorkHours == 0 ? 0 : Convert.ToInt32((employee.HoursLastWeek / employee.WorkHours) * 100);
            }
            staff = staff.OrderBy(s => s.PercentageWorkedHours).ThenBy(s => s.StaffName).ToList();

            var managersToNotify = await _context.Projects
                .AsNoTracking()
                .Where(t => t.EndDate == null && t.ProjectManager!.Email != null)
                .Select(t => t.ProjectManager!.Email)
                .Distinct()
                .ToListAsync(ct);

            var model = new EmployeeHoursEmail()
            {
                Date = date,
                PeriodBegin = date.GetPeriodStartDate(Period.LastWeek),
                PeriodEnd = date.GetPeriodEndDate(Period.LastWeek),
                Staff = staff
            };
            foreach (var manager in managersToNotify)
            {
                if (manager != null)
                {
                    await SendEmail(EmailMessage.EmployeeHours, model, manager, "[HQ] Staff Hours", MailPriority.High, null, ct);
                }
            }
        }
    }
}