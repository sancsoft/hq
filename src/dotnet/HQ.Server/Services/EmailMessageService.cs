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

namespace HQ.Server.Services
{
    public class EmailMessageService
    {
        private readonly EmailTemplateServiceV1 _emailTemplateService;
        private readonly IEmailService _emailService;
        private readonly HQDbContext _context;

        public EmailMessageService(EmailTemplateServiceV1 emailTemplateService, IEmailService emailService, HQDbContext context)
        {
            _emailTemplateService = emailTemplateService;
            _emailService = emailService;
            _context = context;
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
                Message = "Your time entry has been rejected. Please review and resubmit."
            };

            await SendEmail(EmailMessage.RejectTimeEntry, model, time.Staff.Email, "[HQ] Time Rejected", MailPriority.High, null, ct);
        }
    }
}