

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;


namespace HQ.Abstractions.Quotes
{
    public class GetQuotesV1
    {
        public class Request : PagedRequestV1
        {
            public string? Search { get; set; }
            public Guid? Id { get; set; }
            public Guid? clientId { get; set; }
            public SortColumn SortBy { get; set; } = SortColumn.Name;
            public SortDirection SortDirection { get; set; } = SortDirection.Asc;
        }
        public enum SortColumn
        {
            ChargeCode,
            ClientName,
            Name
        }

        public class Response : PagedResponseV1<Record>;
        public class Record
        {
            public Guid Id { get; set; }
            public int QuoteNumber { get; set; }
            public string? ChargeCode { get; set; }
            public Guid ClientId { get; set; }
            public string ClientName { get; set; }
            public string Name { get; set; } = null!;
            public DateOnly Date { get; set; }
            public decimal Value { get; set; }
            public QuoteStatus Status { get; set; }
        }
    }
}