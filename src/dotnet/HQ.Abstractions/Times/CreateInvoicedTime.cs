using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HQ.Abstractions.Times
{
  public class CreateInvoicedTimeV1
  {
    public class Request
    {
      public Guid? Id { get; set; }
      public Guid? InvoiceId { get; set; }
      public Guid StaffId { get; set; }
      public DateOnly Date { get; set; }
      public Guid? ChargeCodeId { get; set; }
      public string? ChargeCode { get; set; }
      public Guid? ActivityId { get; set; }
      public string? ActivityName { get; set; }
      public string? Task { get; set; }
      public decimal? Hours { get; set; }
      public decimal? HoursInvoiced { get; set; }
      public string? Notes { get; set; }
    }

    public class Response
    {
      public Guid Id { get; set; }
    }
  }
}