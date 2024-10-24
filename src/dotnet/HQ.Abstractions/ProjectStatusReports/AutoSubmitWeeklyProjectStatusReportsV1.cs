using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.ProjectStatusReports;

public class AutoSubmitWeeklyProjectStatusReportsV1
{
    public class Request
    {
        public DateOnly ForDate { get; set; }
    }

    public class Response
    {
        public int Submitted { get; set; }
    }
}