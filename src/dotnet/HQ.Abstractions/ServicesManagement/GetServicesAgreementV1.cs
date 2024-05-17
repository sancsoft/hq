using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.ServicesAgreement
{
    public class GetServicesAgreementV1
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
            public Guid ClientId { get; set; }
            public string Name { get; set; } = null!;
            public int ServiceNumber { get; set; }
            public string? Description { get; set; }
            public Guid? QuoteId { get; set; }
            public decimal CostValue { get; set; }
            public Period CostPeriod { get; set; }
            public decimal PriceValue { get; set; }
            public Period PricePeriod { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
            public string? ChargeCode { get; set; }
            public string? ChargeCodeDescription { get; set; }
            public int? QuoteStatus { get; set; }
        }
    }
}