using HQ.Abstractions.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Clients;

public class CreateClientV1
{
    public class Request
    {
        public string Name { get; set; } = null!;
        public string? OfficialName { get; set; }
        public string? BillingEmail { get; set; }
        public decimal? HourlyRate { get; set; }
    }

    public class Response
    {
        public Guid ClientId { get; set; }
    }
}
