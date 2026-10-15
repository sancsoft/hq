using HQ.Abstractions.Common;

namespace HQ.Abstractions.ProjectStatusReports;

public class GetProjectStatusReportPointSummaryV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
    }

    public class Response
    {
        public List<PointSummaryStaffRecord> Staff { get; set; } = new();
    }

    public class PointSummaryStaffRecord
    {
        public Guid StaffId { get; set; }
        public string StaffName { get; set; } = null!;
        public int AllocatedPoints { get; set; }
        public decimal UtilizedPoints { get; set; }
    }
}