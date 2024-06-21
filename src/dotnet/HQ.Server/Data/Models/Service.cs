namespace HQ.Server.Data.Models;

public class Service : Base
{
    public Guid ServiceAgreementId { get; set; }
    public ServiceAgreement ServiceAgreement { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }
}