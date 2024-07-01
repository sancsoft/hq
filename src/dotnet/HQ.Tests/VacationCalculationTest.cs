using HQ.Abstractions;

namespace HQ.Tests;

public class VacationCalculationTest
{
    [Theory]
    [InlineData(0, 0)]
    [InlineData(80, 0)]
    [InlineData(120, 0)]
    public void Staff_GetsNoVacationDaysFirstMonth(decimal vacationHours, decimal expectedVacationHours)
    {
        var startDate = new DateOnly(2024, 6, 20);
        var date = new DateOnly(2024, 6, 25);

        var calculatedVacationHours = date.CalculateEarnedVacationHours(startDate, vacationHours);

        Assert.Equal(expectedVacationHours, calculatedVacationHours);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(80, 8)]
    [InlineData(120, 8)]
    public void Staff_GetsOneVacationAfterOneFullMonth(decimal vacationHours, decimal expectedVacationHours)
    {
        var startDate = new DateOnly(2024, 6, 20);
        var date = new DateOnly(2024, 8, 1);

        var calculatedVacationHours = date.CalculateEarnedVacationHours(startDate, vacationHours);

        Assert.Equal(expectedVacationHours, calculatedVacationHours);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(80, 16)]
    [InlineData(120, 16)]
    public void Staff_GetsTwoVacationDaysAfterTwoFullMonths(decimal vacationHours, decimal expectedVacationHours)
    {
        var startDate = new DateOnly(2024, 6, 20);
        var date = new DateOnly(2024, 9, 1);

        var calculatedVacationHours = date.CalculateEarnedVacationHours(startDate, vacationHours);

        Assert.Equal(expectedVacationHours, calculatedVacationHours);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(80, 80)]
    [InlineData(120, 120)]
    public void Staff_GetsFullVacationDaysAfterNewYear(decimal vacationHours, decimal expectedVacationHours)
    {
        var startDate = new DateOnly(2024, 6, 20);
        var date = new DateOnly(2025, 1, 1);

        var calculatedVacationHours = date.CalculateEarnedVacationHours(startDate, vacationHours);

        Assert.Equal(expectedVacationHours, calculatedVacationHours);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(80, 80)]
    [InlineData(120, 120)]
    public void Staff_GetsMaxVacationDays(decimal vacationHours, decimal expectedVacationHours)
    {
        var startDate = new DateOnly(2024, 6, 20);
        var date = new DateOnly(2026, 1, 1);

        var calculatedVacationHours = date.CalculateEarnedVacationHours(startDate, vacationHours);

        Assert.Equal(expectedVacationHours, calculatedVacationHours);
    }
}