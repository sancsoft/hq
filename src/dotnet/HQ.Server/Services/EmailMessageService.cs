using System.Net.Mail;
using System.Text.RegularExpressions;

using FluentResults;
using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Emails;
using HQ.Abstractions.EmailTemplates;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Services;
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
    }
}