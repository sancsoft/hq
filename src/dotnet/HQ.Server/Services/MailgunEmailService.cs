using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using System.Text;

using HQ.Abstractions.Services;
using HQ.Server.Data.Models;

using Microsoft.Extensions.Options;

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
        var recipientsJoinedWithCommas = String.Join(",", recipients);
        var formContent = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("from", $"{_options.CurrentValue.FromDisplayName} <{_options.CurrentValue.From}>"),
            new KeyValuePair<string, string>("to", recipientsJoinedWithCommas),
            new KeyValuePair<string, string>("subject", subject),
            new KeyValuePair<string, string>("html", htmlBody)
        });

        var response = await _httpClient.PostAsync($"{_options.CurrentValue.BaseUri}/{_options.CurrentValue.Domain}/messages", formContent, ct);

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
    }
}