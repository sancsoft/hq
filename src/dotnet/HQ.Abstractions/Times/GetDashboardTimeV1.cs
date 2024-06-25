using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Times;

public class GetDashboardTimeV1
{
    public class Request
    {
        public Guid StaffId { get; set; }
        public DateOnly Date { get; set; }
        public Period Period { get; set; }
        public string? Search { get; set; }
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
        public List<ChargeCode> ChargeCodes { get; set; } = new();
        public List<Client> Clients { get; set; } = new();
    }

    public class ChargeCode
    {
        public Guid Id { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? ProjectId { get; set; }
        public string Code { get; set; } = null!;
    }

    public class Client
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public List<Project> Projects { get; set; } = null!;
    }

    public class Project
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public List<Activities> Activities { get; set; } = new();
        public Guid? ChargeCodeId { get; set; }
        public string? ChargeCode { get; set; }
    }

    public class Activities
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
    }

    public class TimeForDate
    {
        public DateOnly Date { get; set; }
        public List<TimeEntry> Times { get; set; } = new List<TimeEntry>();
    }

    public class TimeEntry
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateOnly Date { get; set; }
        public decimal Hours { get; set; }
        public string? Notes { get; set; }
        public string? Task { get; set; }
        public Guid? ChargeCodeId { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? ActivityId { get; set; }
        public TimeStatus TimeStatus { get; set; }
        public string ChargeCode { get; set; } = null!;
    }
}