
using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Projects;
public class UpsertProjectActivityV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = null!;
        public int Sequence { get; set; }
       
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}