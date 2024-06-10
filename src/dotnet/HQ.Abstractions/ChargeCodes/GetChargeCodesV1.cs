using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.ChargeCodes
{
    public class GetChargeCodesV1
    {
        public class Request : PagedRequestV1
        {
            public string? Search { get; set; }
            public Guid? Id { get; set; }
            public Guid? ProjectId { get; set; }
            public Guid? ClientId { get; set; }

            public SortColumn SortBy { get; set; } = SortColumn.Code;
            public SortDirection SortDirection { get; set; } = SortDirection.Asc;
            public bool? Billable { get; set; }
            public bool? Active { get; set; }
        }

        public enum SortColumn
        {
            Code = 1,
            Billable = 2,
            Active = 3,
            ProjectName = 4,
            QuoteName = 5,
            ServiceAgreementName = 6
        }

        public class Response : PagedResponseV1<Record>;
        public class Record
        {
            public Guid Id { get; set; }
            public string Code { get; set; } = null!;
            public ChargeCodeActivity Activity { get; set; }
            public bool Billable { get; set; }
            public bool Active { get; set; }
            public string? ProjectName { get; set; }
            public string? QuoteName { get; set; }
            public string? ServiceAgreementName { get; set; }
            public Guid? ProjectId { get; set; }
            public Guid? QuoteId { get; set; }
            public Guid? ServiceAgreementId { get; set; }
            public string? Description { get; set; }
        }
    }
}
