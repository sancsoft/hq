using HQ.Abstractions.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Clients;

public class UpsertClientV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = null!;
        public string? OfficialName { get; set; }
        public string? BillingEmail { get; set; }
        public decimal? HourlyRate { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}
