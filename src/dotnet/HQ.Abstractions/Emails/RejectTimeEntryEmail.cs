namespace HQ.Abstractions.Emails
{
    public class RejectTimeEntryEmail : NotificationEmail
    {
        public string? StaffName { get; set; }
        public DateOnly Date { get; set; }
        public decimal Hours { get; set; }
        public string ChargeCode { get; set; } = null!;
        public string Client { get; set; } = null!;
        public string Project { get; set; } = null!;
        public string? ActivityTask { get; set; }
        public string? Description { get; set; }
        public string? ReasonForRejection { get; set; }
        public string? RejectedBy { get; set; }
        public static new RejectTimeEntryEmail Sample = new()
        {
            Heading = "Time Rejected",
            Message = "Your time entry has been rejected. Please review and resubmit.",
            Hours = 0,
            ButtonLabel = "Open HQ",
            ButtonUrl = new Uri("http://hq.localhost:4200/dashboard"),
            Date = new DateOnly(2024, 7, 3),
            ChargeCode = "P1041",
            Client = "SANCSOFT",
            Project = "HQ",
            StaffName = "amahdy",
            ActivityTask = "#123",
            Description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            ReasonForRejection = "The hours entered (0) are not valid. Please ensure that the hours reflect actual time worked.",
            RejectedBy = "Joe Fabitz"
        };
    }

}