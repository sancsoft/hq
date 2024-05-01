using HQ.Server.Data.Enumerations;

namespace HQ.Server.Data.Models;

public class ServiceAgreement : Base
{
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int ServiceNumber { get; set; }
    public string? Description { get; set; }
    public Guid? QuoteId { get; set; }
    public Quote? Quote { get; set; }
    public decimal CostValue { get; set; }
    public Period CostPeriod { get; set; }
    public decimal PriceValue { get; set; }
    public Period PricePeriod { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
