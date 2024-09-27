using System.Diagnostics;

using HQ.Abstractions.Enumerations;

using static HQ.Abstractions.Times.GetTimesV1;

namespace HQ.Abstractions.Times;

public class GetDashboardTimeV1
{
    public class Request
    {
        public Guid StaffId { get; set; }
        public DateOnly Date { get; set; }
        public Period Period { get; set; }
        public SortColumn SortBy { get; set; } = SortColumn.Date;
        public SortDirection SortDirection { get; set; } = SortDirection.Desc;

        public string? Search { get; set; }
        public TimeStatus? Status { get; set; }
    }

    public class Response
    {
        public decimal TotalHours { get; set; }
        public decimal BillableHours { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public DateOnly PreviousDate { get; set; }
        public DateOnly NextDate { get; set; }
        public List<TimeForDate> Dates { get; set; } = new();
        public decimal HoursThisWeek { get; set; }
        public decimal HoursThisMonth { get; set; }
        public decimal HoursLastWeek { get; set; }
        public string? StaffName { get; set; }
        public decimal Vacation { get; set; }
        public int RejectedCount { get; set; }
        public bool CanSubmit { get; set; }

        public DateOnly? TimeEntryCutoffDate { get; set; }
    }

    public class TimeForDate
    {
        public bool CanCreateTime { get; set; }
        public DateOnly Date { get; set; }
        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public List<TimeEntry> Times { get; set; } = new List<TimeEntry>();
        public decimal TotalHours { get; set; }
    }

    public class TimeEntry
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateOnly Date { get; set; }
        public decimal Hours { get; set; }
        public decimal MaximumTimeEntryHours { get; set; }
        public string? Notes { get; set; }
        public string? Task { get; set; }
        public Guid? ChargeCodeId { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? ActivityId { get; set; }
        public string? ActivityName { get; set; }
        public string? ProjectName { get; set; }
        public string? ClientName { get; set; }
        public TimeStatus TimeStatus { get; set; }
        public string ChargeCode { get; set; } = null!;
        public string? RejectionNotes { get; set; }
    }
}