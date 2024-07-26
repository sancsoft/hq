using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Plan;

public class UpsertPlanV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public DateOnly Date { get; set; }
        public Guid StaffId { get; set; }
        public string Body { get; set; } = null!;
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}