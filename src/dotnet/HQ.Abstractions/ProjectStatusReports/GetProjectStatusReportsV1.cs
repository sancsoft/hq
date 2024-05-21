using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.ProjectStatusReports;

public class GetProjectStatusReportsV1
{
    public class Request : PagedRequestV1
    {
        public string? Search { get; set; }
        public Guid? Id { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? ProjectManagerId { get; set; }

        public SortColumn SortBy { get; set; } = SortColumn.ChargeCode;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
    }

    public enum SortColumn
    {
        ChargeCode = 1,
        ClientName = 2,
        ProjectName = 3,
        ProjectManagerName = 4,
        TotalHours = 5,
        HoursAvailable = 6,
        Status = 7,
        PercentComplete = 8
    }

    public class Response : PagedResponseV1<Record>
    {
        public decimal TotalHours { get; set; }
    }

    public class Record
    {
        public Guid Id { get; set; }
        public string? ChargeCode { get; set; }
        public string ClientName { get; set; } = null!;
        public string ProjectName { get; set; } = null!;
        public string? ProjectManagerName { get; set; }
        public decimal TotalHours { get; set; }
        public decimal HoursAvailable { get; set; }
        public ProjectStatus Status { get; set; }
        public decimal PercentComplete { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public Guid? LastId { get; set; }
        public decimal? LastHours { get; set; }
    }
}
