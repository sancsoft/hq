namespace HQ.Server.Data.Models;

public class Point : Base
{
    public DateOnly Date { get; set; }
    public Guid StaffId { get; set; }
    public Staff Staff { get; set; } = null!;
    public Guid ChargeCodeId { get; set; }
    public ChargeCode ChargeCode { get; set; } = null!;
    public int Sequence { get; set; }
    public bool Completed { get; set; }
}