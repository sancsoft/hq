using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions.Holiday;

public class UpsertHolidayV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = null!;
        public Jurisdiciton Jurisdiciton { get; set; }
        public DateOnly Date { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}