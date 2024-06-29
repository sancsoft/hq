using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Quotes;

public class ImportQuotesV1
{
    public class Request
    {
        public Stream File { get; set; } = null!;
    }

    public class Record : UpsertQuotestV1.Request
    {
        public int? QuoteNumber { get; set; }
        public string? ClientName { get; set; }
    }

    public class Response
    {
        public int Created { get; set; }
        public int Updated { get; set; }
        public int Skipped { get; set; }
    }
}