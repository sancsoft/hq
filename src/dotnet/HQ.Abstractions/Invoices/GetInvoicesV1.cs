

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;


namespace HQ.Abstractions.Invoices
{
    public class GetInvoicesV1
    {
        public class Request : PagedRequestV1
        {
            public string? Search { get; set; }
            public Guid? Id { get; set; }
            public Guid? clientId { get; set; }
            public SortColumn SortBy { get; set; } = SortColumn.ClientName;
            public SortDirection SortDirection { get; set; } = SortDirection.Asc;
        }
        public enum SortColumn
        {
            ClientName = 1,
            InvoiceNumber = 2,
            Total = 3,
            TotalApprovedHours = 4,
            Date = 5,
        }

        public class Response : PagedResponseV1<Record>;
        public class Record
        {
            public Guid Id { get; set; }
            public Guid ClientId { get; set; }
            public required string ClientName { get; set; }
            public DateOnly Date { get; set; }
            public string? InvoiceNumber { get; set; }
            public decimal Total { get; set; }
            public decimal TotalApprovedHours { get; set; }
            public DateOnly CreatedAt { get; set; }
        }
    }
}