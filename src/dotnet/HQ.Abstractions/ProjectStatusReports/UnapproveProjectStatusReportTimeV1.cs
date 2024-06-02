namespace HQ.Abstractions.ProjectStatusReports;

public class UnapproveProjectStatusReportTimeV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
        public Guid TimeId { get; set; }
    }

    public class Response
    {
        public bool Unapproved { get; set; }
    }
}
