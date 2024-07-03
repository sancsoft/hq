namespace HQ.Abstractions.ProjectStatusReports;

public class PreviousProjectStatusReportV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
    }

    public class Response
    {
        public Guid? ProjectStatusReportId { get; set; }
        public string? Report { get; set; }
    }
}