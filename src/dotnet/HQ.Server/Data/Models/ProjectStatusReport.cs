using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class ProjectStatusReport : Base
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public Guid? ProjectManagerId { get; set; }
    public Staff? ProjectManager { get; set; }
    public string? Report { get; set; }
    public decimal? BookedTime { get; set; }
    public decimal? BilledTime { get; set; }
    public decimal? PercentComplete { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime? SubmittedAt { get; set; }
}
