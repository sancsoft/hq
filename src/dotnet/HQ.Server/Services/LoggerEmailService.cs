
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text.Json;

using HQ.Abstractions;
using HQ.Abstractions.Services;

using Microsoft.Extensions.Options;

namespace HQ.Server.Services;

public class LoggerEmailService : IEmailService
{
    private readonly IOptionsMonitor<Options> _options;
    private readonly ILogger<LoggerEmailService> _logger;

    public LoggerEmailService(IOptionsMonitor<Options> options, ILogger<LoggerEmailService> logger)
    {
        _options = options;
        _logger = logger;
    }

    public Task SendAsync(string subject, string htmlBody, string textBody, List<string> recipients, IEnumerable<Attachment>? attachments = null, MailPriority mailPriority = MailPriority.Normal)
    {
        _logger.LogInformation(@"Sending Email
Subject: {Subject},
Recipients: {Recipients},
Priority: {Priority}
Attachments: {Attachments}

Text:
{Text}

HTML:
{HTML}", subject, String.Join(", ", recipients), mailPriority, String.Join(", ", attachments?.Select(t => t.Name) ?? []), textBody, htmlBody);

        return Task.CompletedTask;
    }

    public class Options
    {
        public const string LoggerEmail = nameof(LoggerEmail);
    }

}