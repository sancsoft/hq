namespace HQ.Abstractions.Times;

public class GetDashboardTimeV1
{
    public class Request
    {
        public Guid StaffId { get; set; }
        public DateOnly FromDate { get; set; }
        public DateOnly ToDate { get; set; }
    }

    public class Response
    {
        public List<TimeForDate> Dates { get;set; } = new();
        public List<ChargeCode> ChargeCodes { get; set;} = new();
        public List<Client> Clients { get; set;} = new();
        public List<Project> Projects { get; set;} = new();
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
    }

    public class Project
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string Name { get; set; } = null!;
    }

    public class Activities
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = null!;
    }

    public class TimeForDate
    {
        public DateOnly Date { get; set;}
        public List<TimeEntry> Times { get; set; } = new List<TimeEntry>();
    }

    public class TimeEntry
    {
        public DateOnly Date { get; set;}
        public decimal Hours { get; set; }
        public string? Notes { get; set; }
        public string? Task { get; set; }
        public Guid? ChargeCodeId { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? ActivityId { get; set; }
    }
}
