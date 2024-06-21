namespace HQ.Abstractions.ProjectStatusReports;

public class RejectProjectStatusReportTimeV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
        public Guid TimeId { get; set; }
        public string? Notes { get; set; }
        public Guid? RejectedById { get; set; }
    }

    public class Response
    {
    }
}