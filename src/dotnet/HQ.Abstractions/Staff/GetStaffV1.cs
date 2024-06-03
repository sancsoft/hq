using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Staff;

public class GetStaffV1
{
    public class Request : PagedRequestV1
    {
        public string? Search { get; set; }
        public Guid? Id { get; set; }
        public Jurisdiciton? Jurisdiciton { get; set; }
        public bool? IsAssignedProjectManager  { get; set; }
        public SortColumn SortBy { get; set; } = SortColumn.FirstName;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
    }

    public enum SortColumn
    {
        StartDate = 1,
        EndDate = 2,
        FirstName = 3,
        Name = 4,
        LastName = 5,
        WorkHours = 6,
        VacationHours = 7
    }

    public class Response : PagedResponseV1<Record>;
    public class Record
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int WorkHours { get; set; }
        public int VacationHours { get; set; }
        public Jurisdiciton Jurisdiciton { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
}
