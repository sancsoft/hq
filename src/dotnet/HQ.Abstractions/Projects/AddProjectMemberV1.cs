namespace HQ.Abstractions.Projects;

public class AddProjectMemberV1
{
    public class Request
    {
        public Guid ProjectId { get; set; }
        public Guid StaffId { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}