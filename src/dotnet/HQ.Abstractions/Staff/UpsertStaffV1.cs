﻿using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions.Staff;

public class UpsertStaffV1
{
    public class Request
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = null!;
        public int WorkHours { get; set; }
        public int VacationHours { get; set; }
        public Jurisdiciton Jurisdiciton { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
    }

    public class Response
    {
        public Guid Id { get; set; }
    }
}
