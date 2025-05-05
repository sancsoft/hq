using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;


namespace HQ.Abstractions.Invoices;
public class CreateInvoiceV1
{
  public class Request
  {
    public Guid Id { get; set; }
    public Guid? ClientId { get; set; }
    public string? ClientName { get; set; }
    public DateOnly Date { get; set; }
    public required string InvoiceNumber { get; set; }
    public decimal Total { get; set; }
    public decimal TotalApprovedHours { get; set; }
    public DateOnly CreatedAt { get; set; }
  }

  public class Response
  {
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
  }
}