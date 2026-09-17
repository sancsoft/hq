using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using System.Text;

using HQ.Abstractions.Services;
using HQ.Server.Data.Models;

using Microsoft.Extensions.Options;

using MimeKit;

public class SMTP2GOEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IOptionsMonitor<Options> _options;
    private readonly ILogger<SMTP2GOEmailService> _logger;

    public SMTP2GOEmailService(HttpClient httpClient, IOptionsMonitor<Options> options, ILogger<SMTP2GOEmailService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options;

        _httpClient.DefaultRequestHeaders.TryAddWithoutValidation("X-Smtp2go-Api-Key", _options.CurrentValue.ApiKey);
    }

    public async Task SendAsync(string subject, string htmlBody, string textBody, List<string> recipients, IEnumerable<Attachment>? attachments = null, MailPriority mailPriority = MailPriority.Normal, CancellationToken ct = default)
    {
        var options = _options.CurrentValue;

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(options.FromDisplayName, options.From));
        message.To.AddRange(recipients.Select(t => new MailboxAddress(null, t)));
        message.Subject = subject;
        switch (mailPriority)
        {
            case MailPriority.Normal:
                message.Priority = MessagePriority.Normal;
                break;
            case MailPriority.High:
                message.Priority = MessagePriority.Urgent;
                break;
            case MailPriority.Low:
                message.Priority = MessagePriority.NonUrgent;
                break;
        }

        var builder = new BodyBuilder();
        builder.TextBody = textBody;
        builder.HtmlBody = htmlBody;

        if (attachments != null)
        {
            foreach (var attachment in attachments)
            {
                if (!String.IsNullOrEmpty(attachment.Name))
                {
                    builder.Attachments.Add(attachment.Name, attachment.ContentStream, ct);
                }
            }
        }

        message.Body = builder.ToMessageBody();

        if (options.IsDebug)
        {
            if (!options.DebugAddress.Any())
            {
                _logger.LogWarning("No DebugAddress emails found.");
                return;
            }

            MimeMessage debugMessage = new();
            debugMessage.From.Add(new MailboxAddress(options.FromDisplayName, options.From));
            debugMessage.To.AddRange(options.DebugAddress.Select(t => new MailboxAddress(Encoding.UTF8, null, t)));
            debugMessage.Subject = String.Format("[DEBUG MODE] - {0}", message.Subject);
            debugMessage.Priority = message.Priority;

            builder = new();

            byte[] rawMessage = Encoding.UTF8.GetBytes(message.ToString());

            builder.Attachments.Add(message.Subject + ".eml", rawMessage);
            builder.TextBody = "This is a debug message, the original email is attached.";

            debugMessage.Body = builder.ToMessageBody();

            message = debugMessage;
        }

        var payload = new
        {
            mime_email = Convert.ToBase64String(Encoding.UTF8.GetBytes(message.ToString())),
            fastaccept = options.FastAccept
        };

        var response = await _httpClient.PostAsJsonAsync($"{options.BaseUri}/email/mime", payload, ct);
        var responseText = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("SMTP2GO Response: {Response}", responseText);
        }

        response.EnsureSuccessStatusCode();
    }

    public class Options
    {
        [Required]
        public string ApiKey { get; set; } = null!;
        [Required]
        public string BaseUri { get; set; } = null!;
        [Required]
        public string From { get; set; } = null!;
        [Required]
        public string FromDisplayName { get; set; } = null!;

        public bool FastAccept { get; set; } = true;
        public bool IsDebug { get; set; }
        public List<string> DebugAddress { get; set; } = new();
    }
}