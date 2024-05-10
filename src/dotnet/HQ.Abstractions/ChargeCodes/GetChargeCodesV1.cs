﻿using HQ.Abstractions.Common;
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

            public SortColumn SortBy { get; set; } = SortColumn.Code;
            public SortDirection SortDirection { get; set; } = SortDirection.Asc;
            public bool? Billable { get; set; }
            public bool? Active { get; set; }
        }

        public enum SortColumn
        {
            Code,
            Billable,
            Active,
            ProjectName,
            QuoteName,
            ServiceAgreementName
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
            public string? Description { get; set; }
        }
    }
}