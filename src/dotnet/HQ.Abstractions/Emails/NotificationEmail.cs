using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Emails;

public class NotificationEmail : BaseEmail
{
    public string? Heading { get; set; }
    public string? Message { get; set; }
    public string? ButtonLabel { get; set; }
    public Uri? ButtonUrl { get; set; }

    public static NotificationEmail Sample = new()
    {
        Heading = "Notification",
        Message = "This is a notification message.",
        ButtonLabel = "Open HQ",
        ButtonUrl = new Uri("http://hq.localhost:4200")
    };

    public static NotificationEmail FromEvent(EmailEvent emailEvent, Uri buttonUrl, string? customMessage = null)
    {
        var notificationEmail = new NotificationEmail();

        switch (emailEvent)
        {
            case EmailEvent.TimeRejected:
                notificationEmail.Heading = "Time Rejected";
                notificationEmail.Message = customMessage ?? "Your time entry has been rejected.";
                notificationEmail.ButtonLabel = "Review Entry";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.TimeResubmitted:
                notificationEmail.Heading = "Time Resubmitted";
                notificationEmail.Message = customMessage ?? "Time entry has been resubmitted.";
                notificationEmail.ButtonLabel = "Review Entry";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.UnsubmittedTimeReminder:
                notificationEmail.Heading = "Unsubmitted Time Reminder";
                notificationEmail.Message = customMessage ?? "Please submit your time entry.";
                notificationEmail.ButtonLabel = "Submit Time";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.TimeEntryReminder:
                notificationEmail.Heading = "Time Entry Reminder";
                notificationEmail.Message = customMessage ?? "Please enter your time for this week.";
                notificationEmail.ButtonLabel = "Enter Time";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.TimeSubmissionReminder:
                notificationEmail.Heading = "Time Submission Reminder";
                notificationEmail.Message = customMessage ?? "Please submit your time entry.";
                notificationEmail.ButtonLabel = "Submit Time";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.TimeCapturedNotification:
                notificationEmail.Heading = "Time Captured";
                notificationEmail.Message = customMessage ?? "Your time has been captured successfully.";
                notificationEmail.ButtonLabel = "View Details";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.WeeklySummaryNotification:
                notificationEmail.Heading = "Weekly Summary";
                notificationEmail.Message = customMessage ?? "Here is your weekly summary.";
                notificationEmail.ButtonLabel = "View Summary";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.MonthlySummaryNotification:
                notificationEmail.Heading = "Monthly Summary";
                notificationEmail.Message = customMessage ?? "Here is your monthly summary.";
                notificationEmail.ButtonLabel = "View Summary";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.UpcomingHolidays:
                notificationEmail.Heading = "Upcoming Holidays";
                notificationEmail.Message = customMessage ?? "Here are the upcoming holidays.";
                notificationEmail.ButtonLabel = "View Holidays";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            case EmailEvent.UnsubmittedPSRs:
                notificationEmail.Heading = "Unsubmitted PSRs";
                notificationEmail.Message = customMessage ?? "Please submit your PSRs.";
                notificationEmail.ButtonLabel = "Submit PSRs";
                notificationEmail.ButtonUrl = buttonUrl;
                break;

            default:
                notificationEmail.Heading = "Notification";
                notificationEmail.Message = customMessage ?? "This is a notification message.";
                notificationEmail.ButtonLabel = "Open HQ";
                notificationEmail.ButtonUrl = buttonUrl;
                break;
        }
        return notificationEmail;
    }
}