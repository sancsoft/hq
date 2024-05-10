namespace HQ.Server.Data.Models;

public class Expense : Base
{
    public DateOnly Date { get; set; }
    public Guid? StaffId { get; set; }
    public Staff? Staff { get; set; } = null!;
    public Guid ChargeCodeId { get; set; }
    public ChargeCode ChargeCode { get; set; } = null!;
    public decimal Total { get; set; }
    // Receipt
    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }
}
