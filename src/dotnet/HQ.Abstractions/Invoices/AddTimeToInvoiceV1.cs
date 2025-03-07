namespace HQ.Abstractions.Invoices
{
    public class AddTimeToInvoiceV1
    {
        public class Request
        {
            public Guid InvoiceId { get; set; }
            public List<Guid> TimeEntryIds { get; set; } = new List<Guid>();
        }

        public class Response
        {
            public Guid InvoiceId { get; set; }
            public int TimeEntriesAdded { get; set; }
        }
    }
}