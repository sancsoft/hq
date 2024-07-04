namespace HQ.Abstractions.Enumerations;
public enum EmailEvent
{
    TimeRejected,
    TimeResubmitted,
    UnsubmittedTimeReminder,
    TimeEntryReminder,
    TimeSubmissionReminder,
    TimeCapturedNotification,
    WeeklySummaryNotification,
    MonthlySummaryNotification,
    UpcomingHolidays,
    UnsubmittedPSRs
}