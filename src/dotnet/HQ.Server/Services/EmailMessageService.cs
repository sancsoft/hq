using System.Net.Mail;
using System.Text.RegularExpressions;

using FluentResults;
using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Emails;
using HQ.Abstractions.EmailTemplates;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Services;
using HQ.API;
using HQ.Server.Services;

using Microsoft.AspNetCore.Mvc;

namespace HQ.Server.Services
{
    public class EmailMessageService
    {
        private readonly EmailTemplateServiceV1 _emailTemplateService;
        private readonly IEmailService _emailService;
        public EmailMessageService(EmailTemplateServiceV1 emailTemplateService, IEmailService emailService)
        {
            _emailTemplateService = emailTemplateService;
            _emailService = emailService;
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
    }
}