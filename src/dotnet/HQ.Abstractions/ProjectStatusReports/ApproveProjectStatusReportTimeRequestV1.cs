namespace HQ.Abstractions.ProjectStatusReports;

public class ApproveProjectStatusReportTimeRequestV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
        public List<Guid> TimeIds { get; set; } = new List<Guid>();
    }

    public class Response
    {
        public int Approved { get; set; }
    }
}
