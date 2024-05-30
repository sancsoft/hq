namespace HQ.Abstractions.ProjectStatusReports;

public class SubmitProjectStatusReportV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
    }

    public class Response
    {
        public Guid ProjectStatusReportId { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
