using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class Project : Base
{
    public int ProjectNumber { get; set; }
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public Guid? ProjectManagerId { get; set; }
    public Staff? ProjectManager { get; set; }
    public string Name { get; set; } = null!;
    public Guid? QuoteId { get; set; }
    public Quote? Quote { get; set; }
    // Letter of engagement
    public decimal HourlyRate { get; set; }
    public decimal BookingHours { get; set; }
    public Period BookingPeriod { get; set; }
    public DateOnly? StartDate { get; set; }
 
    public DateOnly? EndDate { get; set; }
    public ChargeCode? ChargeCode { get; set; }
}
