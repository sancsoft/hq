using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.ProjectStatusReports;

public class GetProjectStatusReportTimeV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
        public string? Search { get; set; }
        public Guid? ProjectManagerId { get; set; }
        public Guid? ActivityId { get; set; }
        public SortColumn SortBy { get; set; } = SortColumn.StaffName;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
    }

    public enum SortColumn
    {
        BillableHours = 1,
        Hours = 2,
        Date = 3,
        ChargeCode = 4,
        StaffName = 5,
        Activity = 6
    }

    public class Response : PagedResponseV1<Record>
    {
        public List<StaffRecord> Staff { get; set; } = new();
        public Guid ProjectId { get; set;} = new();
    }

    public class StaffRecord
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal TotalHours { get; set; }
    }

    public class Record
    {
        public Guid Id { get; set; }
        public TimeStatus Status { get; set; }
        public decimal BillableHours { get; set; }
        public decimal Hours { get; set; }
        public string? RejectionNotes { get; set; } = null!;
        public DateOnly Date { get; set; }
        public string ChargeCode { get; set; } = null!;
        public Guid StaffId { get; set; }
        public string StaffName { get; set; } = null!;
        public string? Task { get; set; }
        public Guid? ActivityId { get; set; }
        public string? ActivityName { get; set; }
        public string? Description { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
