using Asp.Versioning;

using FluentResults;
using FluentResults.Extensions.AspNetCore;

using HQ.Abstractions.Common;
using HQ.Abstractions.Emails;
using HQ.Abstractions.EmailTemplates;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Invoices;
using HQ.Abstractions.Services;
using HQ.API;
using HQ.Server.Authorization;
using HQ.Server.Invoices;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

#if DEBUG
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
        private readonly EmailMessageService _emailService;


        public EmailTemplateTestControllerV1(EmailTemplateServiceV1 emailTemplateService, EmailMessageService emailService)
        {
            _emailTemplateService = emailTemplateService;
            _emailService = emailService;
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

        [HttpPost(nameof(NotificationSendEmail))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> NotificationSendEmail([FromForm] string to, CancellationToken ct = default) =>
            _emailService.SendEmail(EmailMessage.Notification, NotificationEmail.Sample, to, "Notification Test", System.Net.Mail.MailPriority.Low, null, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [HttpGet(nameof(RejectTimeEntryText))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/plain")]
        public Task<ActionResult> RejectTimeEntryText(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.Text, EmailMessage.RejectTimeEntry, RejectTimeEntryEmail.Sample, ct);

        [HttpGet(nameof(RejectTimeEntryMJML))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/plain")]
        public Task<ActionResult> RejectTimeEntryMJML(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.MJML, EmailMessage.RejectTimeEntry, RejectTimeEntryEmail.Sample, ct);

        [HttpGet(nameof(RejectTimeEntryHTML))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/html")]
        public Task<ActionResult> RejectTimeEntryHTML(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.HTML, EmailMessage.RejectTimeEntry, RejectTimeEntryEmail.Sample, ct);

        [HttpPost(nameof(RejectTimeEntrySendEmail))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> RejectTimeEntrySendEmail([FromForm] string to, CancellationToken ct = default) =>
            _emailService.SendEmail(EmailMessage.RejectTimeEntry, RejectTimeEntryEmail.Sample, to, "Reject Time Entry Test", System.Net.Mail.MailPriority.Low, null, ct)
            .ToActionResult(new HQResultEndpointProfile());




        [HttpGet(nameof(UpdatedPlanningPointsText))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/plain")]
        public Task<ActionResult> UpdatedPlanningPointsText(CancellationToken ct = default) =>
                    GetEmailTemplate(EmailMessageOutput.Text, EmailMessage.UpdatedPlanningPoints, UpdatedPlanningPointsEmail.Sample, ct);

        [HttpGet(nameof(UpdatedPlanningPointsMJML))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/plain")]
        public Task<ActionResult> UpdatedPlanningPointsMJML(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.MJML, EmailMessage.UpdatedPlanningPoints, UpdatedPlanningPointsEmail.Sample, ct);

        [HttpGet(nameof(UpdatedPlanningPointsHTML))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/html")]
        public Task<ActionResult> UpdatedPlanningPointsHTML(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.HTML, EmailMessage.UpdatedPlanningPoints, UpdatedPlanningPointsEmail.Sample, ct);

        [HttpPost(nameof(UpdatedPlanningPointsSendEmail))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> UpdatedPlanningPointsSendEmail([FromForm] string to, CancellationToken ct = default) =>
            _emailService.SendEmail(EmailMessage.UpdatedPlanningPoints, UpdatedPlanningPointsEmail.Sample, to, "Updated Points Test", System.Net.Mail.MailPriority.Low, null, ct)
            .ToActionResult(new HQResultEndpointProfile());

        [HttpGet(nameof(StaffHoursText))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/plain")]
        public Task<ActionResult> StaffHoursText(CancellationToken ct = default) =>
                    GetEmailTemplate(EmailMessageOutput.Text, EmailMessage.EmployeeHours, EmployeeHoursEmail.Sample, ct);

        [HttpGet(nameof(StaffHoursMJML))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/plain")]
        public Task<ActionResult> StaffHoursMJML(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.MJML, EmailMessage.EmployeeHours, EmployeeHoursEmail.Sample, ct);

        [HttpGet(nameof(StaffHoursHTML))]
        [ProducesResponseType<ContentResult>(StatusCodes.Status200OK, "text/html")]
        public Task<ActionResult> StaffHoursHTML(CancellationToken ct = default) =>
            GetEmailTemplate(EmailMessageOutput.HTML, EmailMessage.EmployeeHours, EmployeeHoursEmail.Sample, ct);

        [HttpPost(nameof(StaffHoursSendEmail))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public Task<ActionResult> StaffHoursSendEmail([FromForm] string to, CancellationToken ct = default) =>
            _emailService.SendEmail(EmailMessage.EmployeeHours, EmployeeHoursEmail.Sample, to, "Staff Hours Test", System.Net.Mail.MailPriority.Low, null, ct)
            .ToActionResult(new HQResultEndpointProfile());
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
#endif