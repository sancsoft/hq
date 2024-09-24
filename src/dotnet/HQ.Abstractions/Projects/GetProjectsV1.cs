using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Projects;

public class GetProjectsV1
{
    public class Request : PagedRequestV1
    {
        public string? Search { get; set; }
        public Guid? Id { get; set; }
        public Guid? clientId { get; set; }
        public Guid? ProjectManagerId { get; set; }
        public SortColumn SortBy { get; set; } = SortColumn.ProjectName;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
        public ProjectStatus? ProjectStatus { get; set; }
    }

    public enum SortColumn
    {
        ProjectName = 1,
        ProjectManagerName = 2,
        StartDate = 3,
        EndDate = 4,
        ChargeCode = 5,
        ClientName = 6,
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
        SummaryHoursTotal = 20,
        SummaryHoursAvailable = 21,
        SummaryPercentComplete = 22,
    }

    public class Response : PagedResponseV1<Record>;
    public class Record
    {
        public Guid Id { get; set; }
        public int? ProjectNumber { get; set; }
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = null!;
        public Guid? ProjectManagerId { get; set; }
        public string? ProjectManagerName { get; set; }
        public string Name { get; set; } = null!;
        public Guid? QuoteId { get; set; }
        public int? QuoteNumber { get; set; }
        public string? ChargeCode { get; set; }
        // Letter of engagement
        public decimal HourlyRate { get; set; }
        public decimal BookingHours { get; set; }
        public decimal TimeEntryMaxHours { get; set; }
        public Period BookingPeriod { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int Status { get; set; }
        public string? BillingEmail { get; set; }
        public string? OfficialName { get; set; }
        public ProjectStatus? ProjectStatus { get; set; }

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
        public DateOnly? BookingStartDate { get; set; }
        /// <summary>
        /// Booking available hours from project period.
        /// </summary>
        public decimal BookingAvailableHours { get; set; }
        public DateOnly? BookingEndDate { get; set; }
        public decimal? TotalPercentComplete { get; set; }
        [JsonIgnore]
        public decimal? TotalPercentCompleteSort { get; set; }
        public decimal BookingPercentComplete { get; set; }
        public DateOnly? TotalStartDate { get; set; }
        public DateOnly? TotalEndDate { get; set; }
        public decimal? SummaryHoursTotal { get; set; }
        public decimal? SummaryHoursAvailable { get; set; }
        public decimal? SummaryPercentComplete { get; set; }
        public decimal? SummaryPercentCompleteSort { get; set; }
        public ProjectType Type { get; set; }
        public bool Billable { get; set; }
        public decimal? ProjectBookingHours { get; set; }
        public decimal? ProjectTotalHours { get; set; }
    }
}