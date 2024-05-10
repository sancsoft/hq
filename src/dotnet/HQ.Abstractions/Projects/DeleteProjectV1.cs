using HQ.Abstractions.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Projects;

public class DeleteProjectV1
{
    public class Request
    {
        public Guid Id { get; set; }
    }

    public class Response : NoContentResponseV1
    {
    }
}
