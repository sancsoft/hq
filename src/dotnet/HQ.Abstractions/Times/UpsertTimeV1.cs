using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HQ.Abstractions.Times
{
    public class UpsertTimeV1
    {
        public class Request {
            public Guid Id { get; set; }
            public DateOnly Date { get; set; }
            public decimal BillableHours { get; set; }
            public string? Task { get; set; }
            public Guid? ActivityId { get; set; }
            public Guid ChargeCodeId { get; set; }
            public string Notes { get; set; } = "";
            public Guid? StaffId { get; set; }
        }

        public class Response {
            public Guid Id { get; set; }
        }
    }
}