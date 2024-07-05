using System;
using System.Collections.Generic;
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
    private readonly IOptionsMonitor<SMTPEmailOptions> _options;
    private readonly ILogger<SMTPEmailService> _logger;

    public SMTPEmailService(IOptionsMonitor<SMTPEmailOptions> options, ILogger<SMTPEmailService> logger)
    {
        _options = options;
        _logger = logger;
    }

    public async Task SendAsync(string subject, string htmlBody, string textBody, List<string> recipients, IEnumerable<Attachment>? attachments = null, MailPriority mailPriority = MailPriority.Normal)
    {
        var joinedRecipients = String.Join(";", recipients);
        using (var objMail = CreateMessage(subject, htmlBody, textBody, joinedRecipients, true, attachments, mailPriority))
        {
            // Send the e-mail message to the recipient list
            await SendAsync(objMail, joinedRecipients, null, null);
        }
    }

    /// <summary>
    /// Creates a mime message object.
    /// </summary>
    /// <param name="subject">Subject text for the message</param>
    /// <param name="body">Body text for the message</param>
    /// <param name="altBody">Alternate body text for the message</param>
    /// <param name="replyTo">List of custom reply-to recipients</param>
    /// <param name="isHtml">Sets the mode of email message to html or plain text</param>
    /// <param name="attachments">List of attachments.</param>
    /// <param name="mailPriority">Sets the email priority.</param>
    public MailMessage CreateMessage(string subject, string body, string altBody, string replyTo, bool isHtml, IEnumerable<Attachment>? attachments = null, MailPriority mailPriority = MailPriority.Normal)
    {
        _logger.LogInformation("SMTPEmailService constructing MailMessage...");
        _logger.LogInformation("...Instantiating MailMessage model...");

        // Create the email message
        MailMessage objMail = new();

        objMail.Priority = mailPriority;

        _logger.LogInformation("...Adding attachments...");
        // Add attachments
        if (attachments != null)
        {
            foreach (Attachment attachment in attachments)
            {
                objMail.Attachments.Add(attachment);
            }
        }

        _logger.LogInformation("...Creating mail addresses...");
        // Define the email message
        objMail.Sender = new MailAddress(_options.CurrentValue.Sender);
        objMail.From = new MailAddress(_options.CurrentValue.From, _options.CurrentValue.FromDisplayName);

        // Check the custom reply to value
        if (!String.IsNullOrWhiteSpace(replyTo))
        {
            objMail.ReplyToList.Add(new MailAddress(replyTo));
        }
        else
        {
            objMail.ReplyToList.Add(new MailAddress(_options.CurrentValue.ReplyTo, _options.CurrentValue.FromDisplayName));
        }

        objMail.IsBodyHtml = isHtml;

        // Set the subject
        objMail.Subject = subject;

        // Setup the mail message in either plain text or html
        if (!isHtml)
        {
            _logger.LogInformation("...Applying plaintext body...");
            // Plain text message
            objMail.Body = body;
        }
        else
        {
            _logger.LogInformation("...Applying HTML body...");
            // HTML message -- set the alternate views for HTML and plain text
            if (!String.IsNullOrWhiteSpace(altBody))
            {
                ContentType cttp = new("text/plain");
                AlternateView altBodyView = AlternateView.CreateAlternateViewFromString(altBody, cttp);

                // Plain text alternate view MUST be added before the HTML alternate view in order
                // for the message to appear correctly in all client e-mail applications
                objMail.AlternateViews.Add(altBodyView);
            }

            AlternateView htmBodyView = AlternateView.CreateAlternateViewFromString(body, System.Text.Encoding.UTF8, MediaTypeNames.Text.Html);
            objMail.AlternateViews.Add(htmBodyView);
        }

        _logger.LogInformation("...MailMessage model constructed.");

        return objMail;
    }

    /// <summary>
    /// Set up the SMTP client and send out an email message
    /// </summary>
    /// <param name="message">Formatted message to be sent</param>
    /// <param name="recipients">Recipient list for the message separated by a semi-colon (;)</param>
    /// <param name="ccRecipients">cc Recipient list for the message separated by a semi-colon (;)</param>
    /// <param name="bccRecipients"> bcc Recipient list for the message separated by a semi-colon (;)</param>
    public async Task SendAsync(MailMessage message, string recipients, string? ccRecipients = null, string? bccRecipients = null)
    {
        _logger.LogInformation("SMTPEmailService sending message...");
        _logger.LogInformation("...Instantiating SMTP client...");
        using var client = new MailKit.Net.Smtp.SmtpClient();

        _logger.LogInformation("...Client connecting...");
        await client.ConnectAsync(_options.CurrentValue.Server, _options.CurrentValue.Port);
        _logger.LogInformation("...Client authenticating...");
        await client.AuthenticateAsync(_options.CurrentValue.Account, _options.CurrentValue.Password);

        _logger.LogInformation("...Setting date and TO addressses...");
        MimeMessage mimeMessage = (MimeMessage)message;
        mimeMessage.Date = DateTime.UtcNow;
        mimeMessage.To.AddRange(recipients.Split(new char[] { ';' }).Select(t => new MailboxAddress(Encoding.UTF8, null, t)));

        if (!String.IsNullOrWhiteSpace(ccRecipients))
        {
            mimeMessage.Cc.AddRange(ccRecipients.Split(new char[] { ';' }).Select(t => new MailboxAddress(Encoding.UTF8, null, t)));
        }

        if (!String.IsNullOrWhiteSpace(bccRecipients))
        {
            mimeMessage.Bcc.AddRange(bccRecipients.Split(new char[] { ';' }).Select(t => new MailboxAddress(Encoding.UTF8, null, t)));
        }

        if (_options.CurrentValue.IsDebug)
        {
            _logger.LogInformation("...Creating new MimeMessage for debug email...");

            MimeMessage debugMessage = new();
            debugMessage.Sender = new MailboxAddress(Encoding.UTF8, null, _options.CurrentValue.Sender);
            debugMessage.From.Add(new MailboxAddress(_options.CurrentValue.FromDisplayName, _options.CurrentValue.From));
            debugMessage.Subject = String.Format("[DEBUG MODE] - {0}", mimeMessage.Subject);
            if (!String.IsNullOrEmpty(_options.CurrentValue.DebugAddress))
            {
                debugMessage.To.AddRange(_options.CurrentValue.DebugAddress.Split(new char[] { ';' }).Select(t => new MailboxAddress(Encoding.UTF8, null, t)));
            }
            debugMessage.Priority = mimeMessage.Priority;

            _logger.LogInformation("...Building debug email body...");
            BodyBuilder builder = new();

            byte[] rawMessage = System.Text.Encoding.UTF8.GetBytes(mimeMessage.ToString());

            builder.Attachments.Add(mimeMessage.Subject + ".eml", rawMessage);
            builder.TextBody = "This is a debug message, the original email is attached.";

            debugMessage.Body = builder.ToMessageBody();

            mimeMessage = debugMessage;
        }

        // Send the email message
        try
        {
            _logger.LogInformation("...Sending message...");
            var response = await client.SendAsync(mimeMessage);
            _logger.LogInformation("   SendAsync response: {response}", response);
        }
        catch (MailKit.Net.Smtp.SmtpCommandException ex)
        {
            if (ex.Message.ToUpperInvariant().StartsWith("TEMPORARY LOCAL PROBLEM"))
            {
                // We get temporary local problem exceptions on rare occasion
                // These possibly are caused by exceeding the number of connections we can have to the mail server
                // The impact of the issue is low enough that we haven't been able to justify spending much time investigating
                // We will wait some time and then try again, once
                int rand = DateTime.UtcNow.Millisecond % 10;        // get some number from 0 to 9
                Thread.Sleep(10000 + (rand * 1000));                // wait between 10 and 19 seconds
                var response = await client.SendAsync(mimeMessage); // try sending again
                _logger.LogInformation("   SendAsync response: {response}", response);
            }
            else
            {
                throw;
            }
        }
        _logger.LogInformation("...Disconnecting client...");
        await client.DisconnectAsync(true);
        _logger.LogInformation("...Message sent.");
    }



}