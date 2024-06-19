using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace HQ.Abstractions.Clients;

public class GetClientInvoiceSummaryV1
{
    public class Request
    {
        public Guid Id { get; set; }
    }

    public class Response
    {
        public decimal? MonthToDate { get; set; }
        public decimal? LastMonthToDate { get; set; }
        public decimal? YearToDate { get; set; }
        public decimal? AllTimeToDate { get; set; }
    }
}