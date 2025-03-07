using System;
using System.Collections.Generic;

namespace HQ.Abstractions.Invoices
{
    public class RemoveTimeFromInvoiceV1
    {
        public class Request
        {
            public Guid InvoiceId { get; set; }
            public List<Guid> TimeEntryIds { get; set; } = new List<Guid>();
        }

        public class Response
        {
            public Guid InvoiceId { get; set; }
        }
    }
}