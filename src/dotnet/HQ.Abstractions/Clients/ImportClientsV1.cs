using HQ.Abstractions.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HQ.Abstractions.Clients;

public class ImportClientsV1
{
    public class Request
    {
        public Stream File { get; set; } = null!;
    }

    public class Response
    {
        public int Created { get; set; }
        public int Updated { get; set; }
    }
}
