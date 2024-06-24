using System;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

using HQ;
using HQ.Abstractions;
using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

using Xunit;
namespace HQ.Tests
{

    public class TestPeriodGeneration
    {
        [Fact]
        public void TestYearBegin()
        {
            var testYearBegin1 = new DateOnly(2024, 1, 1);
            var testYearBegin2 = new DateOnly(2024, 12, 31);
            var testYearBegin3 = new DateOnly(2023, 5, 6);

            var transformYearStart1 = testYearBegin1.GetPeriodStartDate(Period.Year);
            var transformYearStart2 = testYearBegin2.GetPeriodStartDate(Period.Year);
            var transformYearStart3 = testYearBegin3.GetPeriodStartDate(Period.Year);

            var actualYearStart = new DateOnly(2024, 1, 1);
            var actualYearStart3 = new DateOnly(2023, 1, 1);

            Assert.Equal(actualYearStart, transformYearStart1);
            Assert.Equal(actualYearStart, transformYearStart2);
            Assert.Equal(actualYearStart3, transformYearStart3);
        }

        [Fact]
        public void TestYearEnd()
        {
            var testYearEnd1 = new DateOnly(2024, 1, 1);
            var testYearEnd2 = new DateOnly(2024, 12, 31);
            var testYearEnd3 = new DateOnly(2023, 5, 6);

            var transformYearEnd1 = testYearEnd1.GetPeriodEndDate(Period.Year);
            var transformYearEnd2 = testYearEnd2.GetPeriodEndDate(Period.Year);
            var transformYearEnd3 = testYearEnd3.GetPeriodEndDate(Period.Year);

            var actualYearEnd1 = new DateOnly(2024, 12, 31);
            var actualYearEnd2 = new DateOnly(2023, 12, 31);

            Assert.Equal(transformYearEnd1, actualYearEnd1);
            Assert.Equal(transformYearEnd2, actualYearEnd1);
            Assert.Equal(transformYearEnd3, actualYearEnd2);
        }

        [Fact]
        public void TestQuarterBegin()
        {
            var testQuarterBegin1 = new DateOnly(2024, 4, 8);
            var testQuarterBegin2 = new DateOnly(2024, 1, 1);
            var testQuarterBegin3 = new DateOnly(2023, 8, 1);
            var testQuarterBegin4 = new DateOnly(2024, 12, 31);

            var transformQuarterBegin1 = testQuarterBegin1.GetPeriodStartDate(Period.Quarter);
            var transformQuarterBegin2 = testQuarterBegin2.GetPeriodStartDate(Period.Quarter);
            var transformQuarterBegin3 = testQuarterBegin3.GetPeriodStartDate(Period.Quarter);
            var transformQuarterBegin4 = testQuarterBegin4.GetPeriodStartDate(Period.Quarter);

            var actualQuarterBegin1 = new DateOnly(2024, 4, 1);
            var actualQuarterBegin2 = new DateOnly(2024, 1, 1);
            var actualQuarterBegin3 = new DateOnly(2023, 7, 1);
            var actualQuarterBegin4 = new DateOnly(2024, 10, 1);

            Assert.Equal(transformQuarterBegin1, actualQuarterBegin1);
            Assert.Equal(transformQuarterBegin2, actualQuarterBegin2);
            Assert.Equal(transformQuarterBegin3, actualQuarterBegin3);
            Assert.Equal(transformQuarterBegin4, actualQuarterBegin4);
        }

        [Fact]
        public void TestQuarterEnd()
        {
            var testQuarterEnd1 = new DateOnly(2024, 3, 31);
            var testQuarterEnd2 = new DateOnly(2023, 5, 1); ;
            var testQuarterEnd3 = new DateOnly(2024, 8, 1);
            var testQuarterEnd4 = new DateOnly(2024, 12, 31);

            var transformQuarterEnd1 = testQuarterEnd1.GetPeriodEndDate(Period.Quarter);
            var transformQuarterEnd2 = testQuarterEnd2.GetPeriodEndDate(Period.Quarter);
            var transformQuarterEnd3 = testQuarterEnd3.GetPeriodEndDate(Period.Quarter);
            var transformQuarterEnd4 = testQuarterEnd4.GetPeriodEndDate(Period.Quarter);

            var actualQuarterEnd1 = new DateOnly(2024, 3, 31);
            var actualQuarterEnd2 = new DateOnly(2023, 6, 30);
            var actualQuarterEnd3 = new DateOnly(2024, 9, 30);
            var actualQuarterEnd4 = new DateOnly(2024, 12, 31);

            Assert.Equal(transformQuarterEnd1, actualQuarterEnd1);
            Assert.Equal(transformQuarterEnd2, actualQuarterEnd2);
            Assert.Equal(transformQuarterEnd3, actualQuarterEnd3);
            Assert.Equal(transformQuarterEnd4, actualQuarterEnd4);
        }
        [Fact]
        public void TestMonthBegin()
        {
            var testMonthBegin1 = new DateOnly(2024, 9, 1);
            var testMonthBegin2 = new DateOnly(2020, 1, 31);
            var testMonthBegin3 = new DateOnly(2013, 2, 18);
            var testMonthBegin4 = new DateOnly(2005, 4, 6);

            var transformMonthBegin1 = testMonthBegin1.GetPeriodStartDate(Period.Month);
            var transformMonthBegin2 = testMonthBegin2.GetPeriodStartDate(Period.Month);
            var transformMonthBegin3 = testMonthBegin3.GetPeriodStartDate(Period.Month);
            var transformMonthBegin4 = testMonthBegin4.GetPeriodStartDate(Period.Month);

            var actualMonthBegin1 = new DateOnly(2024, 9, 1);
            var actualMonthBegin2 = new DateOnly(2020, 1, 1);
            var actualMonthBegin3 = new DateOnly(2013, 2, 1);
            var actualMonthBegin4 = new DateOnly(2005, 4, 1);

            Assert.Equal(transformMonthBegin1, actualMonthBegin1);
            Assert.Equal(transformMonthBegin2, actualMonthBegin2);
            Assert.Equal(transformMonthBegin3, actualMonthBegin3);
            Assert.Equal(transformMonthBegin4, actualMonthBegin4);
        }

        [Fact]
        public void TestMonthEnd()
        {
            var testMonthEnd1 = new DateOnly(2024, 9, 1);
            var testMonthEnd2 = new DateOnly(2020, 1, 31);
            var testMonthEnd3 = new DateOnly(2013, 2, 18);
            var testMonthEnd4 = new DateOnly(2005, 4, 6);

            var transformMonthEnd1 = testMonthEnd1.GetPeriodEndDate(Period.Month);
            var transformMonthEnd2 = testMonthEnd2.GetPeriodEndDate(Period.Month);
            var transformMonthEnd3 = testMonthEnd3.GetPeriodEndDate(Period.Month);
            var transformMonthEnd4 = testMonthEnd4.GetPeriodEndDate(Period.Month);

            var actualMonthEnd1 = new DateOnly(2024, 9, 30);
            var actualMonthEnd2 = new DateOnly(2020, 1, 31);
            var actualMonthEnd3 = new DateOnly(2013, 2, 28);
            var actualMonthEnd4 = new DateOnly(2005, 4, 30);

            Assert.Equal(transformMonthEnd1, actualMonthEnd1);
            Assert.Equal(transformMonthEnd2, actualMonthEnd2);
            Assert.Equal(transformMonthEnd3, actualMonthEnd3);
            Assert.Equal(transformMonthEnd4, actualMonthEnd4);
        }
        [Fact]
        public void TestWeekBegin()
        {
            var testWeekBegin1 = new DateOnly(2024, 6, 14);
            var testWeekBegin2 = new DateOnly(2024, 1, 1);
            var testWeekBegin3 = new DateOnly(2023, 12, 31);
            var testWeekBegin4 = new DateOnly(2023, 4, 6);
            var testWeekBegin5 = new DateOnly(2023, 3, 17);

            var transformWeekBegin1 = testWeekBegin1.GetPeriodStartDate(Period.Week);
            var transformWeekBegin2 = testWeekBegin2.GetPeriodStartDate(Period.Week);
            var transformWeekBegin3 = testWeekBegin3.GetPeriodStartDate(Period.Week);
            var transformWeekBegin4 = testWeekBegin4.GetPeriodStartDate(Period.Week);
            var transformWeekBegin5 = testWeekBegin5.GetPeriodStartDate(Period.Week);


            var actualWeekBegin1 = new DateOnly(2024, 6, 8);
            var actualWeekBegin2 = new DateOnly(2023, 12, 30);
            var actualWeekBegin3 = new DateOnly(2023, 12, 30);
            var actualWeekBegin4 = new DateOnly(2023, 4, 1);
            var actualWeekBegin5 = new DateOnly(2023, 3, 11);

            Assert.Equal(transformWeekBegin1, actualWeekBegin1);
            Assert.Equal(transformWeekBegin2, actualWeekBegin2);
            Assert.Equal(transformWeekBegin3, actualWeekBegin3);
            Assert.Equal(transformWeekBegin4, actualWeekBegin4);
            Assert.Equal(transformWeekBegin5, actualWeekBegin5);
        }
        [Fact]
        public void TestWeekEnd()
        {
            var testWeekEnd1 = new DateOnly(2024, 8, 8);
            var testWeekEnd2 = new DateOnly(2024, 12, 30);
            var testWeekEnd3 = new DateOnly(2024, 1, 1);
            var testWeekEnd4 = new DateOnly(2024, 4, 7);
            var testWeekEnd5 = new DateOnly(2023, 8, 7);

            var transformWeekEnd1 = testWeekEnd1.GetPeriodEndDate(Period.Week);
            var transformWeekEnd2 = testWeekEnd2.GetPeriodEndDate(Period.Week);
            var transformWeekEnd3 = testWeekEnd3.GetPeriodEndDate(Period.Week);
            var transformWeekEnd4 = testWeekEnd4.GetPeriodEndDate(Period.Week);
            var transformWeekEnd5 = testWeekEnd5.GetPeriodEndDate(Period.Week);

            var actualWeekEnd1 = new DateOnly(2024, 8, 9);
            var actualWeekEnd2 = new DateOnly(2025, 1, 3);
            var actualWeekEnd3 = new DateOnly(2024, 1, 5);
            var actualWeekEnd4 = new DateOnly(2024, 4, 12);
            var actualWeekEnd5 = new DateOnly(2023, 8, 11);

            Assert.Equal(transformWeekEnd1, actualWeekEnd1);
            Assert.Equal(transformWeekEnd2, actualWeekEnd2);
            Assert.Equal(transformWeekEnd3, actualWeekEnd3);
            Assert.Equal(transformWeekEnd4, actualWeekEnd4);
            Assert.Equal(transformWeekEnd5, actualWeekEnd5);
        }

        [Fact]
        public void TestLastWeekBegin()
        {
            var testLastWeekBegin1 = new DateOnly(2024, 6, 14);
            var testLastWeekBegin2 = new DateOnly(2024, 1, 1);
            var testLastWeekBegin3 = new DateOnly(2023, 12, 31);
            var testLastWeekBegin4 = new DateOnly(2023, 4, 6);
            var testLastWeekBegin5 = new DateOnly(2023, 3, 17);

            var transformLastWeekBegin1 = testLastWeekBegin1.GetPeriodStartDate(Period.LastWeek);
            var transformLastWeekBegin2 = testLastWeekBegin2.GetPeriodStartDate(Period.LastWeek);
            var transformLastWeekBegin3 = testLastWeekBegin3.GetPeriodStartDate(Period.LastWeek);
            var transformLastWeekBegin4 = testLastWeekBegin4.GetPeriodStartDate(Period.LastWeek);
            var transformLastWeekBegin5 = testLastWeekBegin5.GetPeriodStartDate(Period.LastWeek);


            var actualLastWeekBegin1 = new DateOnly(2024, 6, 1);
            var actualLastWeekBegin2 = new DateOnly(2023, 12, 23);
            var actualLastWeekBegin3 = new DateOnly(2023, 12, 23);
            var actualLastWeekBegin4 = new DateOnly(2023, 3, 25);
            var actualLastWeekBegin5 = new DateOnly(2023, 3, 4);

            Assert.Equal(transformLastWeekBegin1, actualLastWeekBegin1);
            Assert.Equal(transformLastWeekBegin2, actualLastWeekBegin2);
            Assert.Equal(transformLastWeekBegin3, actualLastWeekBegin3);
            Assert.Equal(transformLastWeekBegin4, actualLastWeekBegin4);
            Assert.Equal(transformLastWeekBegin5, actualLastWeekBegin5);
        }
        [Fact]
        public void TestLastWeekEnd()
        {
            var testLastWeekEnd1 = new DateOnly(2024, 6, 14);
            var testLastWeekEnd2 = new DateOnly(2024, 1, 1);
            var testLastWeekEnd3 = new DateOnly(2023, 12, 31);
            var testLastWeekEnd4 = new DateOnly(2023, 4, 6);
            var testLastWeekEnd5 = new DateOnly(2023, 3, 17);

            var transformLastWeekEnd1 = testLastWeekEnd1.GetPeriodEndDate(Period.LastWeek);
            var transformLastWeekEnd2 = testLastWeekEnd2.GetPeriodEndDate(Period.LastWeek);
            var transformLastWeekEnd3 = testLastWeekEnd3.GetPeriodEndDate(Period.LastWeek);
            var transformLastWeekEnd4 = testLastWeekEnd4.GetPeriodEndDate(Period.LastWeek);
            var transformLastWeekEnd5 = testLastWeekEnd5.GetPeriodEndDate(Period.LastWeek);


            var actualLastWeekEnd1 = new DateOnly(2024, 6, 7);
            var actualLastWeekEnd2 = new DateOnly(2023, 12, 29);
            var actualLastWeekEnd3 = new DateOnly(2023, 12, 29);
            var actualLastWeekEnd4 = new DateOnly(2023, 3, 31);
            var actualLastWeekEnd5 = new DateOnly(2023, 3, 10);

            Assert.Equal(transformLastWeekEnd1, actualLastWeekEnd1);
            Assert.Equal(transformLastWeekEnd2, actualLastWeekEnd2);
            Assert.Equal(transformLastWeekEnd3, actualLastWeekEnd3);
            Assert.Equal(transformLastWeekEnd4, actualLastWeekEnd4);
            Assert.Equal(transformLastWeekEnd5, actualLastWeekEnd5);
        }


        [Fact]
        public void TestLastMonthBegin()
        {
            var testLastMonthBegin1 = new DateOnly(2024, 6, 14);
            var testLastMonthBegin2 = new DateOnly(2024, 1, 1);
            var testLastMonthBegin3 = new DateOnly(2023, 12, 31);
            var testLastMonthBegin4 = new DateOnly(2023, 4, 6);
            var testLastMonthBegin5 = new DateOnly(2023, 3, 17);

            var transformLastMonthBegin1 = testLastMonthBegin1.GetPeriodStartDate(Period.LastMonth);
            var transformLastMonthBegin2 = testLastMonthBegin2.GetPeriodStartDate(Period.LastMonth);
            var transformLastMonthBegin3 = testLastMonthBegin3.GetPeriodStartDate(Period.LastMonth);
            var transformLastMonthBegin4 = testLastMonthBegin4.GetPeriodStartDate(Period.LastMonth);
            var transformLastMonthBegin5 = testLastMonthBegin5.GetPeriodStartDate(Period.LastMonth);


            var actualLastMonthBegin1 = new DateOnly(2024, 5, 1);
            var actualLastMonthBegin2 = new DateOnly(2023, 12, 1);
            var actualLastMonthBegin3 = new DateOnly(2023, 11, 1);
            var actualLastMonthBegin4 = new DateOnly(2023, 3, 1);
            var actualLastMonthBegin5 = new DateOnly(2023, 2, 1);

            Assert.Equal(transformLastMonthBegin1, actualLastMonthBegin1);
            Assert.Equal(transformLastMonthBegin2, actualLastMonthBegin2);
            Assert.Equal(transformLastMonthBegin3, actualLastMonthBegin3);
            Assert.Equal(transformLastMonthBegin4, actualLastMonthBegin4);
            Assert.Equal(transformLastMonthBegin5, actualLastMonthBegin5);
        }

        [Fact]
        public void TestLastMonthEnd()
        {
            var testLastMonthEnd1 = new DateOnly(2024, 6, 14);
            var testLastMonthEnd2 = new DateOnly(2024, 1, 1);
            var testLastMonthEnd3 = new DateOnly(2023, 12, 31);
            var testLastMonthEnd4 = new DateOnly(2024, 3, 1);
            var testLastMonthEnd5 = new DateOnly(2023, 3, 17);

            var transformLastMonthEnd1 = testLastMonthEnd1.GetPeriodEndDate(Period.LastMonth);
            var transformLastMonthEnd2 = testLastMonthEnd2.GetPeriodEndDate(Period.LastMonth);
            var transformLastMonthEnd3 = testLastMonthEnd3.GetPeriodEndDate(Period.LastMonth);
            var transformLastMonthEnd4 = testLastMonthEnd4.GetPeriodEndDate(Period.LastMonth);
            var transformLastMonthEnd5 = testLastMonthEnd5.GetPeriodEndDate(Period.LastMonth);


            var actualLastMonthEnd1 = new DateOnly(2024, 5, 31);
            var actualLastMonthEnd2 = new DateOnly(2023, 12, 31);
            var actualLastMonthEnd3 = new DateOnly(2023, 11, 30);
            var actualLastMonthEnd4 = new DateOnly(2024, 2, 29);
            var actualLastMonthEnd5 = new DateOnly(2023, 2, 28);

            Assert.Equal(transformLastMonthEnd1, actualLastMonthEnd1);
            Assert.Equal(transformLastMonthEnd2, actualLastMonthEnd2);
            Assert.Equal(transformLastMonthEnd3, actualLastMonthEnd3);
            Assert.Equal(transformLastMonthEnd4, actualLastMonthEnd4);
            Assert.Equal(transformLastMonthEnd5, actualLastMonthEnd5);
        }

        [Fact]
        public void GetPeriodStartDate_Today_ReturnsToday()
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            DateOnly result = today.GetPeriodStartDate(Period.Today);
            Assert.Equal(today, result);
        }

        [Fact]
        public void GetPeriodStartDate_ThisWeek_ReturnsStartOfWeek()
        {
            DateOnly today = new DateOnly(2024, 6, 20);
            DateOnly startOfWeek = new DateOnly(2024, 6, 15);
            DateOnly result = today.GetPeriodStartDate(Period.Week);
            Assert.Equal(startOfWeek, result);
        }

        [Fact]
        public void GetPeriodStartDate_ThisMonth_ReturnsStartOfMonth()
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            DateOnly startOfMonth = new DateOnly(today.Year, today.Month, 1);
            DateOnly result = today.GetPeriodStartDate(Period.Month);
            Assert.Equal(startOfMonth, result);
        }

        [Fact]
        public void GetPeriodStartDate_LastWeek_ReturnsStartOfLastWeek()
        {
            DateOnly today = new DateOnly(2024, 6, 20);
            DateOnly startOfLastWeek = new DateOnly(2024, 6, 08);
            DateOnly result = today.GetPeriodStartDate(Period.LastWeek);
            Assert.Equal(startOfLastWeek, result);
        }

        [Fact]
        public void GetPeriodStartDate_LastMonth_ReturnsStartOfLastMonth()
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            DateOnly startOfLastMonth = new DateOnly(today.Year, today.Month, 1).AddMonths(-1);
            DateOnly result = today.GetPeriodStartDate(Period.LastMonth);
            Assert.Equal(startOfLastMonth, result);
        }

        [Fact]
        public void GetPeriodEndDate_Today_ReturnsToday()
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            DateOnly result = today.GetPeriodEndDate(Period.Today);
            Assert.Equal(today, result);
        }

        [Fact]
        public void GetPeriodEndDate_ThisWeek_ReturnsEndOfWeek()
        {
            DateOnly today = new DateOnly(2024, 6, 20);
            DateOnly endOfWeek = new DateOnly(2024, 6, 21);
            DateOnly result = today.GetPeriodEndDate(Period.Week);
            Assert.Equal(endOfWeek, result);
        }

        [Fact]
        public void GetPeriodEndDate_LastWeek_ReturnsEndOfLastWeek()
        {
            DateOnly today = new DateOnly(2024, 6, 20);
            DateOnly endOfLastWeek = new DateOnly(2024, 6, 14);
            DateOnly result = today.GetPeriodEndDate(Period.LastWeek);
            Assert.Equal(endOfLastWeek, result);
        }

        [Fact]
        public void GetPeriodEndDate_ThisMonth_ReturnsEndOfMonth()
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            DateOnly startOfMonth = new DateOnly(today.Year, today.Month, 1);
            DateOnly endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
            DateOnly result = today.GetPeriodEndDate(Period.Month);
            Assert.Equal(endOfMonth, result);
        }

        [Fact]
        public void GetPeriodEndDate_LastMonth_ReturnsEndOfLastMonth()
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            DateOnly startOfLastMonth = new DateOnly(today.Year, today.Month, 1).AddMonths(-1);
            DateOnly endOfLastMonth = startOfLastMonth.AddMonths(1).AddDays(-1);
            DateOnly result = today.GetPeriodEndDate(Period.LastMonth);
            Assert.Equal(endOfLastMonth, result);
        }
    }
}