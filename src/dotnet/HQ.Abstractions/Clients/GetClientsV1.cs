using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Clients;

public class GetClientsV1
{
    public class Request : PagedRequestV1
    {
        public string? Search { get; set; }
        public Guid? Id { get; set; }

        public SortColumn SortBy { get; set; } = SortColumn.Name;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
    }

    public enum SortColumn
    {
        CreatedAt,
        Name,
        HourlyRate
    }

    public class Response : PagedResponseV1<Record>;
    public class Record
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? OfficialName { get; set; }
        public string? BillingEmail { get; set; }
        public decimal? HourlyRate { get; set; }
    }
}
