using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class ChargeCode : Base
{
    public ChargeCodeActivity Activity { get; set; }
    public string Code { get; set; } = null!;
    public bool Billable { get; set; }
    public bool Active { get; set; }
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    public Guid? QuoteId { get; set; }
    public Quote? Quote { get; set; }
    public Guid? ServiceAgreementId { get; set; }
    public ServiceAgreement? ServiceAgreement { get; set; }
    public string? Description { get; set; }
    public ICollection<Time> Times { get; set; } = new List<Time>();
}