namespace HQ.Abstractions.Users;

public class UpsertUserV1
{
    public class Request
    {
        public Guid? Id { get; set; }
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

    public class Response
    {
        public Guid Id { get; set; }
    }
}