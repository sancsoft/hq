namespace HQ.Server.Data.Models;

public class Client : Base
{
    public string Name { get; set; } = null!;
    public string? OfficialName { get; set; }
    public string? BillingEmail { get; set; }
    public decimal? HourlyRate { get; set; }
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Quote> Quotes { get; set; } = new List<Quote>();
    public ICollection<ServiceAgreement> ServiceAgreements { get; set; } = new List<ServiceAgreement>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}