namespace HQ.Abstractions.ProjectStatusReports;

public class UpdateProjectStatusReportTimeV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
        public Guid TimeId { get; set; }
        public decimal? BillableHours { get; set; }
        public string? Task { get; set; }
        public Guid? ActivityId { get; set; }
        public string? Notes { get; set; }
        public Guid ChargeCodeId { get; set; }

    }

    public class Response
    {
    }
}
