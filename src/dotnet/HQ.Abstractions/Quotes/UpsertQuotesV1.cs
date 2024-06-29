using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Quotes;

public class UpsertQuotestV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public Guid ClientId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Value { get; set; }
        public ProjectStatus Status { get; set; }
        public DateOnly Date { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}