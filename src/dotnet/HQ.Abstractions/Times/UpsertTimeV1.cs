using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HQ.Abstractions.Times
{
    public class UpsertTimeV1
    {
        public class Request
        {
            public Guid? Id { get; set; }
            public DateOnly Date { get; set; }
            public decimal? Hours { get; set; }
            public string? Task { get; set; }
            public Guid? ActivityId { get; set; }
            public Guid? ChargeCodeId { get; set; }
            public string? Notes { get; set; }
            public Guid? StaffId { get; set; }
            public string? ChargeCode { get; set; }
            public string? ActivityName { get; set; }
        }

        public class Response
        {
            public Guid Id { get; set; }
        }
    }

    public class UpsertTimeDescriptionV1
    {
        public class Request
        {
            public Guid Id { get; set; }
            public Guid? StaffId { get; set; }
            public string Notes { get; set; } = "";
        }

        public class Response
        {
            public Guid Id { get; set; }
        }
    }

    public class UpsertTimeHoursV1
    {
        public class Request
        {
            public Guid Id { get; set; }
            public Guid? StaffId { get; set; }

            public decimal Hours { get; set; }
        }

        public class Response
        {
            public Guid Id { get; set; }
        }
    }

    public class UpsertTimeDateV1
    {
        public class Request
        {
            public Guid Id { get; set; }
            public Guid? StaffId { get; set; }

            public DateOnly Date { get; set; }
        }

        public class Response
        {
            public Guid Id { get; set; }
        }
    }

    public class UpsertTimeChargeCodeV1
    {
        public class Request
        {
            public Guid Id { get; set; }
            public Guid? StaffId { get; set; }

            public string Chargecode { get; set; } = "";
        }

        public class Response
        {
            public Guid Id { get; set; }
        }
    }

    public class UpsertTimeActivityV1
    {
        public class Request
        {
            public Guid Id { get; set; }
            public Guid? StaffId { get; set; }
            public string ActivityName { get; set; } = "";
        }

        public class Response
        {
            public Guid Id { get; set; }
        }
    }

    public class UpsertTimeTaskV1
    {
        public class Request
        {
            public Guid Id { get; set; }
            public Guid? StaffId { get; set; }
            public string Task { get; set; } = "";
        }

        public class Response
        {
            public Guid Id { get; set; }
        }
    }



}