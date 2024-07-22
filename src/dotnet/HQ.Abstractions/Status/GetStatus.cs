using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Status
{
    public class GetStatusV1
    {
        public class Request
        {
            public Guid? Id { get; set; }
            public Guid StaffId { get; set; }
        }

        public class Response
        {
            public Guid Id { get; set; }
            public Guid StaffId { get; set; }
            public DateOnly Date { get; set; }
            public string? Status { get; set; }
        }
    }
}