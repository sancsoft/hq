using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class Staff : Base
{
    public string Name { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public int WorkHours { get; set; }
    public int VacationHours { get; set; }
    public Jurisdiciton Jurisdiciton { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}
