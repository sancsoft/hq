using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class Quote : Base
{
    public int QuoteNumber { get; set; }
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public decimal Value { get; set; }
    public ProjectStatus Status { get; set; }
    // PDF link
    public ChargeCode? ChargeCode { get; set; }
    public bool HasPDF { get; set; }
}