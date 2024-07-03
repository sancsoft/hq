using Asp.Versioning;

using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Emails;
using HQ.Abstractions.EmailTemplates;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Invoices;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Invoices;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HQ.Server.Controllers
{
    [ApiController]
    [ApiVersion(1.0)]
    [Tags("EmailTemplateTest")]
    [Route("v{version:apiVersion}/EmailTemplateTest")]
    [ProducesResponseType<List<ErrorSummaryV1>>(StatusCodes.Status400BadRequest)]
    public class EmailTemplateTestControllerV1 : ControllerBase
    {
        private readonly EmailTemplateServiceV1 _emailTemplateService;

        public EmailTemplateTestControllerV1(EmailTemplateServiceV1 emailTemplateService)
        {
            _emailTemplateService = emailTemplateService;
        }

        [HttpGet(nameof(NotificationText))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/plain")]
        public Task<ActionResult> NotificationText(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.Text, EmailMessage.Notification, NotificationEmail.Sample, ct);

        [HttpGet(nameof(NotificationMJML))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/plain")]
        public Task<ActionResult> NotificationMJML(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.MJML, EmailMessage.Notification, NotificationEmail.Sample, ct);

        [HttpGet(nameof(NotificationHTML))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/html")]
        public Task<ActionResult> NotificationHTML(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.HTML, EmailMessage.Notification, NotificationEmail.Sample, ct);

        [Authorize(HQAuthorizationPolicies.Staff)]
        [HttpPost(nameof(NotificationSendEmail))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/html")]
        public async Task<ActionResult> NotificationSendEmail(CancellationToken ct = default)
        {
            await Task.Delay(0);
            return Ok();
        }

        private async Task<ActionResult> GetEmailTemplate<T>(EmailMessageOutput output, EmailMessage emailMessage, T model, CancellationToken ct = default) where T : BaseEmail
        {
            var request = new GetEmailTemplateV1.Request<T>()
            {
                EmailMessage = emailMessage,
                Model = model
            };

            var result = await _emailTemplateService.GetEmailTemplateV1(request, ct);
            if (!result.IsSuccess)
            {
                return result.ToActionResult(new HQResultEndpointProfile());
            }

            var response = result.Value;

            switch (output)
            {
                case EmailMessageOutput.Text:
                    return Content(response.Text, "text/plain", System.Text.Encoding.UTF8);
                case EmailMessageOutput.MJML:
                    return Content(response.MJML, "text/plain", System.Text.Encoding.UTF8);
                default:
                case EmailMessageOutput.HTML:
                    return Content(response.HTML, "text/html", System.Text.Encoding.UTF8);
            }
        }
    }
}