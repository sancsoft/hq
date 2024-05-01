using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Projects;

public class ImportProjectsV1
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
