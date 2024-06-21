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
        public SortColumn SortBy { get; set; } = SortColumn.Date;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
    }

    public class Response
    {
        public Stream File { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
    }

    public enum SortColumn
    {
        Hours = 1,
        Date = 2,
        ChargeCode = 3,
        Activity = 4
    }
}