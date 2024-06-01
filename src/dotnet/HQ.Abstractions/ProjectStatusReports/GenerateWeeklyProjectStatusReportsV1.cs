using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.ProjectStatusReports;

public class GenerateWeeklyProjectStatusReportsV1
{
    public class Request
    {
        public DateOnly? ForWeek { get; set; }
    }

    public class Response
    {
        public int Created { get; set; }
        public int Skipped { get; set; }
    }
}
