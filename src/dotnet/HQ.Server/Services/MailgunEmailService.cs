using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using System.Text;

using HQ.Abstractions.Services;
using HQ.Server.Data.Models;

using Microsoft.Extensions.Options;

using MimeKit;

public class MailgunEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IOptionsMonitor<Options> _options;
    private readonly ILogger<MailgunEmailService> _logger;

    public MailgunEmailService(HttpClient httpClient, IOptionsMonitor<Options> options, ILogger<MailgunEmailService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options;

        var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"api:{_options.CurrentValue.ApiKey}"));
        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authToken);
    }

    public async Task SendAsync(string subject, string htmlBody, string textBody, List<string> recipients, IEnumerable<Attachment>? attachments = null, MailPriority mailPriority = MailPriority.Normal, CancellationToken ct = default)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.CurrentValue.FromDisplayName, _options.CurrentValue.From));
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
                builder.Attachments.Add(attachment.Name, attachment.ContentStream, ct);
            }
        }

        message.Body = builder.ToMessageBody();

        if (_options.CurrentValue.IsDebug)
        {
            if (!_options.CurrentValue.DebugAddress.Any())
            {
                _logger.LogWarning("No DebugAddress emails found.");
                return;
            }

            MimeMessage debugMessage = new();
            debugMessage.From.Add(new MailboxAddress(_options.CurrentValue.FromDisplayName, _options.CurrentValue.From));
            debugMessage.To.AddRange(_options.CurrentValue.DebugAddress.Select(t => new MailboxAddress(Encoding.UTF8, null, t)));
            debugMessage.Subject = String.Format("[DEBUG MODE] - {0}", message.Subject);
            debugMessage.Priority = message.Priority;

            builder = new();

            byte[] rawMessage = Encoding.UTF8.GetBytes(message.ToString());

            builder.Attachments.Add(message.Subject + ".eml", rawMessage);
            builder.TextBody = "This is a debug message, the original email is attached.";

            debugMessage.Body = builder.ToMessageBody();

            message = debugMessage;
        }

        using var messageStream = new MemoryStream(Encoding.UTF8.GetBytes(message.ToString()));
        var to = String.Join(",", message.To);

        MultipartFormDataContent postData = new MultipartFormDataContent();
        postData.Add(new StringContent(to), "to");
        postData.Add(new StreamContent(messageStream), "message", "message.eml");

        var response = await _httpClient.PostAsync($"{_options.CurrentValue.BaseUri}/{_options.CurrentValue.Domain}/messages.mime", postData, ct);
        var responseText = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Mailgun Response: {Response}", responseText);
        }

        response.EnsureSuccessStatusCode();
    }

    public class Options
    {
        [Required]
        public string ApiKey { get; set; } = null!;
        [Required]
        public string Domain { get; set; } = null!;
        [Required]
        public string BaseUri { get; set; } = null!;
        [Required]
        public string From { get; set; } = null!;
        [Required]
        public string FromDisplayName { get; set; } = null!;

        public bool IsDebug { get; set; }
        public List<string> DebugAddress { get; set; } = new();
    }
}