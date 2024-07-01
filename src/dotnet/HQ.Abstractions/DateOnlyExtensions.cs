using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions
{
    public static class DateOnlyExtension
    {
        public static DateOnly AddPeriod(this DateOnly forDate, Period period, int value)
        {
            switch (period)
            {
                case Period.Year:
                    return forDate.AddYears(value);
                case Period.Quarter:
                    return forDate.AddMonths(value * 3);
                case Period.Month:
                    return forDate.AddMonths(value);
                case Period.Today:
                    return forDate.AddDays(value);
                case Period.LastWeek:
                    return forDate.AddDays(-7 + value * 7);
                case Period.LastMonth:
                    return forDate.AddMonths(-1 + value);
                case Period.Week:
                default:
                    return forDate.AddDays(value * 7);
            }
        }

        public static DateOnly GetPeriodStartDate(this DateOnly forDate, Period period)
        {
            switch (period)
            {
                case Period.Year:
                    return new DateOnly(forDate.Year, 1, 1);
                case Period.Quarter:
                    var quarter = (forDate.Month + 2) / 3;
                    return new DateOnly(forDate.Year, (quarter - 1) * 3 + 1, 1);
                case Period.Month:
                    return new DateOnly(forDate.Year, forDate.Month, 1);
                case Period.Today:
                    return forDate;
                case Period.LastWeek:
                    return forDate.GetPeriodStartDate(Period.Week).AddDays(-7);
                case Period.LastMonth:
                    return forDate.GetPeriodStartDate(Period.Month).AddMonths(-1);
                case Period.Week:
                default:
                    return forDate.AddDays(-((int)forDate.DayOfWeek + 1) % 7);
            }
        }

        public static DateOnly GetPeriodEndDate(this DateOnly forDate, Period period)
        {
            switch (period)
            {
                case Period.Year:
                    return new DateOnly(forDate.Year, 1, 1).AddYears(1).AddDays(-1);
                case Period.Quarter:
                    var quarter = (forDate.Month + 2) / 3;
                    var startDate = new DateOnly(forDate.Year, (quarter - 1) * 3 + 1, 1);
                    return startDate.AddMonths(3).AddDays(-1);
                case Period.Month:
                    return new DateOnly(forDate.Year, forDate.Month, 1).AddMonths(1).AddDays(-1);
                case Period.Today:
                    return forDate;
                case Period.LastWeek:
                    return forDate.GetPeriodStartDate(Period.Week).AddDays(-1);
                case Period.LastMonth:
                    return forDate.GetPeriodStartDate(Period.Month).AddDays(-1);
                case Period.Week:
                default:
                    return forDate.AddDays(-((int)forDate.DayOfWeek + 1) % 7).AddDays(6);
            }
        }

        public static decimal CalculateEarnedVacationHours(this DateOnly forDate, DateOnly startDate, decimal maxVacationHours)
        {
            var totalMonths = ((forDate.Year - startDate.Year) * 12) + forDate.Month - startDate.Month;
            return Math.Min(totalMonths * 8, maxVacationHours);
        }
    }

}