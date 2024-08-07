using HQ.Abstractions.Enumerations;

namespace HQ.Server.Data.Models;

public class ProjectMember : Base
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid StaffId { get; set; }
    public Staff Staff { get; set; } = null!;
}