namespace HQ.Server.Data.Models
{
    public class ProjectActivity : Base
    {
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int Sequence { get; set; }
    }
}