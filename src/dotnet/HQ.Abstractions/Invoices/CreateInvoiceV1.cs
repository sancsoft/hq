
using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Invoices
{
    public class CreateInvoiceV1
    {
        public class Request
        {
            public DateOnly? Date { get; set; }
            public Guid ClientId { get; set; }
            public required string InvoiceNumber { get; set; }
        }
        public class Response
        {
            public Guid Id { get; set; }
        }
    }
}