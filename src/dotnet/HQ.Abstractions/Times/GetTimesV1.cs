using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Times
{

    public class GetTimesV1
    {
        public class Request : PagedRequestV1
        {
            public Guid? Id { get; set; }
            public Guid? StaffId { get; set; }
            public string? Search { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
            public DateOnly? Date { get; set; }
            public Guid? InvoiceId { get; set; }
            public Guid? ClientId { get; set; }
            public Guid? ProjectId { get; set; }
            public string? ChargeCode { get; set; }
            public string? Activity { get; set; }
            public string? Task { get; set; }
            public Period? Period { get; set; }
            public bool? TimeAccepted { get; set; }
            public TimeStatus? TimeStatus { get; set; }
            public bool? Invoiced { get; set; }
            public bool? Billable { get; set; }
            public SortColumn SortBy { get; set; } = SortColumn.Date;
            public SortDirection SortDirection { get; set; } = SortDirection.Asc;
        }

        public enum SortColumn
        {
            Hours = 1,
            Date = 2,
            ChargeCode = 3,
            StaffName = 4,
            ClientName = 5,
            ProjectName = 6,
            Billable = 7,
        }

        public class Response : PagedResponseV1<Record>
        {
            public decimal TotalHours { get; set; }
            public decimal BillableHours { get; set; }
            public decimal AcceptedHours { get; set; }
            public decimal AcceptedBillableHours { get; set; }
        }




        public class Record
        {
            public Guid Id { get; set; }
            public TimeStatus Status { get; set; }
            public decimal? BillableHours { get; set; }
            public decimal Hours { get; set; }
            public string? HoursApprovedBy { get; set; }
            public Guid? InvoiceId { get; set; }
            public string? RejectionNotes { get; set; } = null!;
            public DateOnly Date { get; set; }
            public string ChargeCode { get; set; } = null!;
            public string? Task { get; set; }
            public Guid? ActivityId { get; set; }
            public string? ProjectName { get; set; }
            public Guid? ProjectId { get; set; }
            public string? ClientName { get; set; }
            public Guid? ClientId { get; set; }
            public string? StaffName { get; set; }
            public Guid? StaffId { get; set; }
            public string? ActivityName { get; set; }
            public string? Description { get; set; } = null!;
            public DateTime CreatedAt { get; set; }
            public bool Billable { get; set; }
        }
    }
}