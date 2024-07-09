using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Services;
using HQ.Server.Data.Models;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using MimeKit;
// using static Org.BouncyCastle.Math.EC.ECCurve;
using ContentType = System.Net.Mime.ContentType;

public class SMTPEmailService : IEmailService
{
    private readonly IOptionsMonitor<Options> _options;
    private readonly ILogger<SMTPEmailService> _logger;

    public SMTPEmailService(IOptionsMonitor<Options> options, ILogger<SMTPEmailService> logger)
    {
        _options = options;
        _logger = logger;
    }

    public async Task SendAsync(string subject, string htmlBody, string textBody, List<string> recipients, IEnumerable<Attachment>? attachments = null, MailPriority mailPriority = MailPriority.Normal, CancellationToken ct = default)
    {
        var message = new MimeMessage();
        message.Sender = new MailboxAddress(Encoding.UTF8, null, _options.CurrentValue.Sender);
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

        using var client = new MailKit.Net.Smtp.SmtpClient();

        await client.ConnectAsync(_options.CurrentValue.Server, _options.CurrentValue.Port, false, ct);
        await client.AuthenticateAsync(_options.CurrentValue.Account, _options.CurrentValue.Password, ct);

        if (_options.CurrentValue.IsDebug)
        {
            if (!_options.CurrentValue.DebugAddress.Any())
            {
                _logger.LogWarning("No DebugAddress emails found.");
                await client.DisconnectAsync(true, ct);
                return;
            }

            MimeMessage debugMessage = new();
            debugMessage.Sender = new MailboxAddress(Encoding.UTF8, null, _options.CurrentValue.Sender);
            debugMessage.From.Add(new MailboxAddress(_options.CurrentValue.FromDisplayName, _options.CurrentValue.From));
            debugMessage.To.AddRange(_options.CurrentValue.DebugAddress.Select(t => new MailboxAddress(Encoding.UTF8, null, t)));
            debugMessage.Subject = String.Format("[DEBUG MODE] - {0}", message.Subject);
            debugMessage.Priority = message.Priority;

            builder = new();

            byte[] rawMessage = System.Text.Encoding.UTF8.GetBytes(message.ToString());

            builder.Attachments.Add(message.Subject + ".eml", rawMessage);
            builder.TextBody = "This is a debug message, the original email is attached.";

            debugMessage.Body = builder.ToMessageBody();

            message.Dispose();
            message = debugMessage;
        }

        var response = await client.SendAsync(message, ct);
        message.Dispose();
        await client.DisconnectAsync(true, ct);
    }

    public class Options
    {
        public const string Email = nameof(Email);

        [Required]
        public string Server { get; set; } = null!;

        [Required]
        public int Port { get; set; }

        [Required]
        public string Account { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        [Required]
        public string Sender { get; set; } = null!;

        [Required]
        public string From { get; set; } = null!;

        [Required]
        public string FromDisplayName { get; set; } = null!;

        [Required]
        public string ReplyTo { get; set; } = null!;

        public bool IsDebug { get; set; }
        public List<string> DebugAddress { get; set; } = new();
    }
}