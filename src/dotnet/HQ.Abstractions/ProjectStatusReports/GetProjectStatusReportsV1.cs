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
        StartDate = 1,
        EndDate = 2,
        ChargeCode = 3,
        ProjectName = 4,
        ClientName = 5,
        ProjectManagerName = 6,
        Status = 7,
        BookingPeriod = 8,
        BookingStartDate = 9,
        BookingEndDate = 10,
        TotalHours = 11,
        TotalAvailableHours = 12,
        ThisHours = 13,
        ThisPendingHours = 14,
        LastHours = 15,
        BookingHours = 16,
        BookingAvailableHours = 17,
        TotalPercentComplete = 18,
        BookingPercentComplete = 19,
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
        /// <summary>
        /// Total hours across all time.
        /// </summary>
        public decimal TotalHours { get; set; }
        /// <summary>
        /// Total hours available across all time.
        /// </summary>
        public decimal? TotalAvailableHours { get; set; }
        /// <summary>
        /// Total hours from last week.
        /// </summary>
        public decimal ThisHours { get; set; }
        /// <summary>
        /// Hours not accepted during this period.
        /// </summary>
        public decimal ThisPendingHours { get; set; }
        /// <summary>
        /// Booking hours from project period.
        /// </summary>
        public decimal BookingHours { get; set;}
        /// <summary>
        /// Booking available hours from project period.
        /// </summary>
        public decimal BookingAvailableHours { get; set; }
        public ProjectStatus Status { get; set; }
        public decimal TotalPercentComplete { get; set; }
        public decimal BookingPercentComplete { get; set; }
        public DateOnly? TotalStartDate { get; set; }
        public DateOnly? TotalEndDate { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public DateOnly BookingStartDate { get; set; }
        public DateOnly BookingEndDate { get; set; }
        public Period BookingPeriod { get; set; }
        public Guid? LastId { get; set; }
        public decimal? LastHours { get; set; }
    }
}
