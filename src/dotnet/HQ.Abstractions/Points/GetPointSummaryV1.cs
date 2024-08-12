using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Points;

public class GetPointSummaryV1
{
    public class Request
    {
        public DateOnly Date { get; set; }
        public string? Search { get; set; }
        public bool? IsCompleted { get; set; }

    }

    public class StaffSummary
    {
        public Guid StaffId { get; set; }
        public string StaffName { get; set; } = null!;
        public List<PlanningPoint> Points { get; set; } = new(10);
        public bool Completed { get; set; }

        public class PlanningPoint
        {
            public Guid Id { get; set; }
            public int Sequence { get; set; }
            public Guid? ChargeCodeId { get; set; }
            public string? ChargeCode { get; set; }
            public Guid? ClientId { get; set; }
            public string? ClientName { get; set; }
            public Guid? ProjectId { get; set; }
            public string? ProjectName { get; set; }
            public bool Completed { get; set; }
        }
    }

    public class Response
    {
        public int TotalPoints { get; set; }
        public int EmptyPoints { get; set; }
        public DateOnly Date { get; set; }
        public List<StaffSummary> Staff { get; set; } = new();
        public DateOnly DisplayDate { get; set; }
        public DateOnly PreviousDate { get; set; }
        public DateOnly NextDate { get; set; }
    }
}