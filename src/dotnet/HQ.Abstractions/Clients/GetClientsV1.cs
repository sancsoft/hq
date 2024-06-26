﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

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
        CreatedAt = 1,
        Name = 2,
        HourlyRate = 3,
        BillingEmail = 4,
        OfficialName = 5,
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