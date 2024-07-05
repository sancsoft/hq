using System.Net.Mail;

namespace HQ.Abstractions.Services;

public interface IEmailService
{
    Task SendAsync(string subject, string htmlBody, string textBody, List<string> recipients, IEnumerable<Attachment>? attachments = null, MailPriority mailPriority = MailPriority.Normal, CancellationToken ct = default);
}