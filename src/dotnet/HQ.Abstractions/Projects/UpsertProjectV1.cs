using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Projects;

public class UpsertProjectV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid? ProjectManagerId { get; set; }
        public string Name { get; set; } = null!;
        public Guid? QuoteId { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal BookingHours { get; set; }
        public Period BookingPeriod { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }
        public string ChargeCode { get; set; } = null!;
    }
}