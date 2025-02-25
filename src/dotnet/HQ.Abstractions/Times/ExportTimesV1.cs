using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Times;

public class ExportTimesV1
{
    public class Request
    {
        public Guid? StaffId { get; set; }
        public string? Search { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public DateOnly? Date { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? ProjectId { get; set; }
        public string? ChargeCode { get; set; }
        public string? Activity { get; set; }
        public string? Task { get; set; }
        public Period? Period { get; set; }
        public bool? TimeAccepted { get; set; }
        public bool? Invoiced { get; set; }
        public bool? Billable { get; set; }
        public TimeStatus? TimeStatus { get; set; }
        public SortColumn SortBy { get; set; } = SortColumn.Date;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
    }

    public class Response
    {
        public Stream File { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
    }
    public class ExportTimeModel
    {
        public string? ChargeCode { get; set; }
        public string? StaffName { get; set; }
        public string? Notes { get; set; }
        public string? ProjectName { get; set; }
        public string? ClientName { get; set; }
        public DateOnly? Date { get; set; }
        public string? Activity { get; set; }
        public string? Task { get; set; }
        public bool? TimeAccepted { get; set; }
        public bool? Invoiced { get; set; }
    }

    public enum SortColumn
    {
        Hours = 1,
        Date = 2,
        ChargeCode = 3,
        StaffName = 4,
        ClientName = 5,
        ProjectName = 6,
        Billable = 7,
    }
}