using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Points
{
    public class UpsertPointsV1
    {
        public class Request
        {
            public Guid? Id { get; set; }
            public Guid? StaffId { get; set; }
            public DateOnly Date { get; set; }
            public List<GetPointsV1.Point>? Points { get; set; } = new List<GetPointsV1.Point>();
        }

        public class Response
        {
            public Guid[] PointIds { get; set; } = null!;
        }
    }
}