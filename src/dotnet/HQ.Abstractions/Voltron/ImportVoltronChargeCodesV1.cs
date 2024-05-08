using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Voltron;

public class ImportVoltronChargeCodesV1
{
    public class Request
    {
        public Stream File { get; set; } = null!;
    }

    public class Response
    {
        public int ClientsCreated { get; set; }
        public int ClientsUpdated { get; set; }
        public int ChargeCodesCreated { get; set; }
        public int ChargeCodesUpdated { get; set; }
        public int ProjectsCreated { get; set; }
        public int ProjectsUpdated { get; set; }
        public int QuotesCreated { get; set; }
        public int QuotesUpdated { get; set; }
    }
}
