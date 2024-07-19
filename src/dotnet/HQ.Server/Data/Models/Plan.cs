namespace HQ.Server.Data.Models;

public class Plan : Base
{
    public DateOnly Date { get; set; }
    public Guid StaffId { get; set; }
    public Staff Staff { get; set; } = null!;
    public string? Body { get; set; }
    public string? Status {get; set;}
}