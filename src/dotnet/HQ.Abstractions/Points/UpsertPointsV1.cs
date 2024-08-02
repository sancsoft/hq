using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Points
{
    public class Point
    {
        public Guid? Id { get; set; }
        public Guid? ChargeCodeId { get; set; }
        public String? ChargeCode { get; set; }
        public String? ProjectName { get; set; }
        public Guid? ProjectId { get; set; }
        public int Sequence { get; set; }
        public bool Completed { get; set; }
    }

    public class UpsertPointsV1
    {
        public class Request
        {
            public Guid? Id { get; set; }
            public Guid? StaffId { get; set; }
            public DateOnly Date { get; set; }
            public Point[]? Points { get; set; } = null!;
        }

        public class Response
        {
            public Guid[] PointIds { get; set; } = null!;
        }
    }
}