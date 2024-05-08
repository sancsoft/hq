using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Voltron;

public class ImportVoltronTimeSheetsV1
{
    public class Request
    {
        public DateOnly From { get; set; }
        public DateOnly To { get; set; }
        public List<(string FileName, Stream Stream)> Files { get; set; } = new();
        public bool Replace { get; set; }
    }

    public class Response
    {
        public int TimeCreated { get; set; }
        public int TimeDeleted { get; set; }
    }
}
