using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Status;

public class UpsertStatusV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public Guid StaffId { get; set; }
        public string? Status { get; set; }

    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}