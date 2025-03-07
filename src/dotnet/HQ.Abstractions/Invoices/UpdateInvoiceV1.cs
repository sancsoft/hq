namespace HQ.Abstractions.Invoices
{
    public class UpdateInvoiceV1
    {
        public class Request
        {
            public Guid Id { get; set; }
            public Guid? ClientId { get; set; }
            public DateOnly? Date { get; set; }
            public string? InvoiceNumber { get; set; }
        }

        public class Response
        {
            public Guid Id { get; set; }
            public Guid ClientId { get; set; }
            public string ClientName { get; set; } = null!;
            public DateOnly Date { get; set; }
            public string InvoiceNumber { get; set; } = null!;
            public decimal Total { get; set; }
            public decimal TotalApprovedHours { get; set; }
            public int TimeEntriesCount { get; set; }
        }
    }
}