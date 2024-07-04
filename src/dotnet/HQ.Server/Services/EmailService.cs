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
    public class EmailService
    {
        private readonly EmailTemplateServiceV1 _emailTemplateService;
        private readonly IEmailService _emailService;
        public EmailService(EmailTemplateServiceV1 emailTemplateService, IEmailService emailService)
        {
            _emailTemplateService = emailTemplateService;
            _emailService = emailService;
        }

        public async Task<Result> SendEmail<T>(EmailMessage emailMessage, T model, string to, CancellationToken ct = default) where T : BaseEmail
        {
            var request = new GetEmailTemplateV1.Request<T>()
            {
                EmailMessage = emailMessage,
                Model = model
            };

            var result = await _emailTemplateService.GetEmailTemplateV1(request, ct);
            if (!result.IsSuccess)
            {
                return Result.Fail($"@{new HQResultEndpointProfile()}");
            }

            var response = result.Value;
            string subject;
            switch (emailMessage)
            {
                case EmailMessage.Notification:
                    subject = "Notification";
                    break;
                case EmailMessage.RejectTimeEntry:
                    subject = "Time Entry Rejected";
                    break;
                default:
                    subject = "Default Subject";
                    break;

            }
            await _emailService.SendAsync(subject, response.HTML, response.Text, [to]);

            return Result.Ok();
        }
    }
}