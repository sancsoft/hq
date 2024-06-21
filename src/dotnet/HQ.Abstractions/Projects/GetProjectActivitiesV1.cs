using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Projects;

public class GetProjectActivitiesV1
{
    public class Request
    {
        public Guid ProjectId { get; set; }
    }

    public class Response
    {
        public List<Record> Records { get; set; } = new();
    }

    public class Record
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Sequence { get; set; }
    }
}