using System.Drawing;

namespace HQ.Abstractions.Emails
{
    public class UpdatedPlanningPointsEmail : NotificationEmail
    {
        public string? StaffName { get; set; }
        public List<GetPointsV1.Point> Points { get; set; } = null!;
        public string? UpdatedBy { get; set; }
        public DateOnly Date { get; set; }

        public static new UpdatedPlanningPointsEmail Sample = new()
        {
            Heading = "Planning Points Updated",
            Message = "Your planing points have been updated. Please review them.",
            ButtonLabel = "Open HQ",
            ButtonUrl = new Uri("http://hq.localhost:4200/dashboard"),
            Date = new DateOnly(2024, 7, 3),
            Points = new List<GetPointsV1.Point> { new GetPointsV1.Point{
                ChargeCode = "p10101",
                ProjectName = "HQ"
            } },
            StaffName = "pshah",
            UpdatedBy = "Joe Fabitz"
        };
    }
}