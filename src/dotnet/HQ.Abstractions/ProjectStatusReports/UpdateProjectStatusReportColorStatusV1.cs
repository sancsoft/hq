using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.ProjectStatusReports;

public class UpdateProjectStatusReportColorStatusV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
        public ProjectColorStatus ProjectColorStatus { get; set; }
    }

    public class Response
    {
        public Guid ProjectStatusReportId { get; set; }
    }
}