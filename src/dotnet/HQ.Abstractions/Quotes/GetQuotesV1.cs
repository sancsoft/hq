

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
            public SortColumn SortBy { get; set; } = SortColumn.QuoteName;
            public SortDirection SortDirection { get; set; } = SortDirection.Asc;
            public ProjectStatus? QuoteStatus { get; set; }
        }
        public enum SortColumn
        {
            QuoteName = 1,
            QuoteNumber = 2,
            ClientName = 3,
            ChargeCode = 4,
            Value = 5,
            Status = 6,
            Date = 7,
        }

        public class Response : PagedResponseV1<Record>;
        public class Record
        {
            public Guid Id { get; set; }
            public int QuoteNumber { get; set; }
            public string? ChargeCode { get; set; }
            public Guid ClientId { get; set; }
            public string ClientName { get; set; } = null!;
            public string Name { get; set; } = null!;
            public string? Description { get; set; }
            public DateOnly Date { get; set; }
            public decimal Value { get; set; }
            public ProjectStatus Status { get; set; }
        }
    }
}