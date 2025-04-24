namespace HQ.Abstractions.Times
{
  public class AddTimeToInvoiceV1
  {
    public class Request
    {
      public Guid Id { get; set; }
      public Guid InvoiceId { get; set; }
      public decimal? HoursInvoiced { get; set; }
    }

    public class Response
    {
      public Guid Id { get; set; }
    }
  }

  public class AddTimesToInvoiceV1
  {
    public class Request
    {
      public required Guid InvoiceId { get; set; }
      public List<AddTimeToInvoiceV1.Request>? TimeEntries { get; set; }
    }
  }
}