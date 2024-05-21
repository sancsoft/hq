﻿using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.ProjectStatusReports;

public class GetProjectStatusReportTimeV1
{
    public class Request
    {
        public Guid ProjectStatusReportId { get; set; }
        public string? Search { get; set; }

        public SortColumn SortBy { get; set; } = SortColumn.StaffName;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
    }

    public enum SortColumn
    {
        BillableHours = 1,
        Hours = 2,
        Date = 3,
        ChargeCode = 4,
        StaffName = 5,
        Activity = 6
    }

    public class Response : PagedResponseV1<Record>;
    public class Record
    {
        public Guid Id { get; set; }
        public decimal BillableHours { get; set; }
        public decimal Hours { get; set; }
        public DateOnly Date { get; set; }
        public string ChargeCode { get; set; } = null!;
        public string StaffName { get; set; } = null!;
        public string Activity { get; set; } = null!;
        public string? Description { get; set; } = null!;
    }
}
