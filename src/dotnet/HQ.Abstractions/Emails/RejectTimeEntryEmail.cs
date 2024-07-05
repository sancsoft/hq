namespace HQ.Abstractions.Emails
{
    public class RejectTimeEntryEmail : NotificationEmail
    {
        public string? Date { get; set; }
        public string? ChargeCode { get; set; }
        public string? Client { get; set; }
        public string? Project { get; set; }
        public string? ActivityTask { get; set; }
        public string? Description { get; set; }
        public string? ReasonForRejection { get; set; }
        public static new RejectTimeEntryEmail Sample = new()
        {
            Heading = "Time Rejected",
            Message = "Your time entry has been rejected. Please review and resubmit.",
            ButtonLabel = "Open HQ",
            ButtonUrl = new Uri("http://hq.localhost:4200/dashboard"),
            Date = "07/03/2024",
            ChargeCode = "P1041",
            Client = "SANCSOFT",
            Project = "HQ",
            ActivityTask = "qqq",
            Description = "AQAA",
            ReasonForRejection = "The hours entered (0) are not valid. Please ensure that the hours reflect actual time worked."
        };
    }

}