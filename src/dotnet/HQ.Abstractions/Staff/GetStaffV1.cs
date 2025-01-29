using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Staff;

public class GetStaffV1
{
    public class Request : PagedRequestV1
    {
        public string? Search { get; set; }
        public Guid? Id { get; set; }
        public string? Status { get; set; }
        public Jurisdiciton? Jurisdiciton { get; set; }
        public bool? IsAssignedProjectManager { get; set; }
        public SortColumn SortBy { get; set; } = SortColumn.Name;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
        public bool? CurrentOnly { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? ExcludeProjectId { get; set; }
    }

    public enum SortColumn
    {
        Name = 1,
        FirstName = 2,
        LastName = 3,
        StartDate = 4,
        EndDate = 5,
        WorkHours = 6,
        VacationHours = 7,
        Hrs = 8,
        BillableHrs = 9,
        Status = 10,
        Jurisdiciton = 11
    }

    public class Response : PagedResponseV1<Record>;
    public class Record
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int WorkHours { get; set; }
        public int VacationHours { get; set; }
        public Decimal Hrs { get; set; }
        public Decimal BillableHrs { get; set; }
        public Decimal HrsThisMonth { get; set; }

        public string? Status { get; set; }
        public string? Role { get; set; }
        public Jurisdiciton Jurisdiciton { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
    }
}