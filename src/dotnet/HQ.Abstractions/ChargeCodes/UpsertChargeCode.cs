using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Staff;

public class UpsertChargeCodeV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public ChargeCodeActivity Activity { get; set; }
        public bool Billable { get; set; }
        public bool Active { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? QuoteId { get; set; }
        public Guid? ServiceAgreementId { get; set; }
        public string? Description { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}