using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Invoices
{
      public class GetInvoiceDetailsV1
      {
        public class Request
        {
           public Guid Id { get; set; }
        }
        public enum SortColumn
        {
            ClientName = 1,
            InvoiceNumber = 2,
            Total = 3,
            TotalApprovedHours = 4,
            Date = 5,

        }

        public class Response
        {
            public Guid Id { get; set; }
            public Guid ClientId { get; set; }
            public required string ClientName { get; set; }
            public DateOnly Date { get; set; }
            public string? InvoiceNumber { get; set; }
            public decimal Total { get; set; }
            public decimal TotalApprovedHours { get; set; }
            public DateOnly CreatedAt { get; set; }

            public decimal TotalHours { get; set; }
            public decimal BillableHours { get; set; }
            public decimal AcceptedHours { get; set; }
            public decimal AcceptedBillableHours { get; set; }
            public List<ChargeCode> ChargeCodes { get; set; }
        }

        public class ChargeCode
        {
            public Guid Id { get; set; }
            public string Code { get; set; } = null!;
            // public ChargeCodeActivity Activity { get; set; }
            public bool Billable { get; set; }
            public bool Active { get; set; }
            public string? ProjectName { get; set; }
            public string? QuoteName { get; set; }
            // public decimal MaximumTimeEntryHours { get; set; }
            // public string? ServiceAgreementName { get; set; }
            public Guid? ProjectId { get; set; }
            public Guid? QuoteId { get; set; }
            // public Guid? ServiceAgreementId { get; set; }
            // public string? ClientName { get; set; }
            // public Guid? ClientId { get; set; }
            // public List<Activity>? Activities { get; set; }

            // public string? Description { get; set; }
            // public bool? IsProjectMember { get; set; }
            // public int IsProjectMemberSort { get; set; }
        }
    }
}