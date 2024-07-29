namespace HQ.Abstractions.Plan;

public class PreviousPlanV1
{
    public class Request
    {
        public Guid StaffId { get; set; }
        public DateOnly Date { get; set; }
    }

    public class Response
    {
        public Guid? PlanId { get; set; }
        public Guid StaffId { get; set; }
        public string? body { get; set; }
    }
}