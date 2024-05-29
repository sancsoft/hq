using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class Time : Base
{
    public DateOnly Date { get; set; }
    public Guid StaffId { get; set; }
    public Staff Staff { get; set; } = null!;
    public Guid ChargeCodeId { get; set; }
    public ChargeCode ChargeCode { get; set; } = null!;
    public decimal Hours { get; set; }
    public string? Notes { get; set; }
    public decimal? HoursApproved { get; set; }
    // Staff approving hours
    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }
    public TimeStatus Status { get; set; }
    public string? Task { get; set; }
    public Guid? ActivityId { get; set; }
    public ProjectActivity? Activity { get; set; }
    public string? RejectionNotes { get; set; }
}
