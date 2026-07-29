using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;

namespace HQ.Abstractions.Staff;

public class UpsertStaffTimeEntryCutOffDateV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public DateOnly? TimeEntryCutOffDate { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}