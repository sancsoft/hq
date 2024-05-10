using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class Book : Base
{
    public Guid ChargeCodeId { get; set; }
    public ChargeCode ChargeCode { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal Hours { get; set; }
}
