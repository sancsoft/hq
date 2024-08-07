namespace HQ.Abstractions.Projects;

public class RemoveProjectMemberV1
{
    public class Request
    {
        public Guid ProjectId { get; set; }
        public Guid StaffId { get; set; }
    }

    public class Response
    {
    }
}