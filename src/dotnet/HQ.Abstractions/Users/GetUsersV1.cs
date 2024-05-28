using HQ.Abstractions.Common;

namespace HQ.Abstractions.Users;

public class GetUsersV1
{
    public class Request : PagedRequestV1
    {
        public string? Search { get; set; }
    }

    public class Response : PagedResponseV1<Record>;
    public class Record
    {
        public Guid Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
        public Guid? StaffId { get; set; }
        public bool Enabled { get; set; }
        public bool IsStaff { get; set; }
        public bool IsManager { get; set; }
        public bool IsPartner { get; set; }
        public bool IsExecutive { get; set; }
        public bool IsAdministrator { get; set; }
    }
}
