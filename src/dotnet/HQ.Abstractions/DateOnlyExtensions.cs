using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.Abstractions
{
    public static class DateOnlyExtension
{
    public static DateOnly GetPeriodStartDate(this DateOnly forDate, Period period)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.Today);

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
                return today;
            case Period.ThisWeek:
                return today.AddDays(-(int)today.DayOfWeek);
            case Period.LastWeek:
                var lastWeekEndDate = today.AddDays(-(int)today.DayOfWeek - 1);
                return lastWeekEndDate.AddDays(-6);
            case Period.ThisMonth:
                return new DateOnly(today.Year, today.Month, 1);
            case Period.LastMonth:
                return new DateOnly(today.Year, today.Month, 1).AddMonths(-1);
            case Period.Week:
            default:
                return forDate.AddDays(-((int)forDate.DayOfWeek + 1) % 7);
        }
    }

    public static DateOnly GetPeriodEndDate(this DateOnly forDate, Period period)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.Today);

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
                return today;
            case Period.ThisWeek:
                return today.AddDays(6 - (int)today.DayOfWeek);
            case Period.LastWeek:
                return today.AddDays(-(int)today.DayOfWeek - 1);
            case Period.ThisMonth:
                startDate = new DateOnly(today.Year, today.Month, 1);
                return startDate.AddMonths(1).AddDays(-1);
            case Period.LastMonth:
                startDate = new DateOnly(today.Year, today.Month, 1).AddMonths(-1);
                return startDate.AddMonths(1).AddDays(-1);
            case Period.Week:
            default:
                return forDate.AddDays(-((int)forDate.DayOfWeek + 1) % 7).AddDays(6);
        }
    }
}

}
