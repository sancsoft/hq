using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Holiday;

public class GetHolidayV1
{
    public class Request : PagedRequestV1
    {
        public string? Search { get; set; }
        public Guid? Id { get; set; }
        public Jurisdiciton? Jurisdiciton { get; set; }
        public DateOnly? Date { get; set; }
        public bool? UpcomingOnly { get; set; }
        public SortColumn SortBy { get; set; } = SortColumn.Date;
        public SortDirection SortDirection { get; set; } = SortDirection.Asc;
    }

    public enum SortColumn
    {
        Name = 1,
        Date = 2,
        Jurisdiciton = 3
    }

    public class Response : PagedResponseV1<Record>;
    public class Record
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public Jurisdiciton Jurisdiciton { get; set; }
        public DateOnly Date { get; set; }
    }
}