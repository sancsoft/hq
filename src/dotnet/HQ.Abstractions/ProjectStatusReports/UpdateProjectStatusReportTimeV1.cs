namespace HQ.Abstractions.ProjectStatusReports;

public class UpdateProjectStatusReportTimeV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
        public Guid TimeId { get; set; }
        public decimal? BillableHours { get; set; }
        public string? Activity { get; set; }
        public string? Notes { get; set; }
        public string? ChargeCodeId { get; set; }

    }

    public class Response
    {
    }
}
