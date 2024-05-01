using HQ.Server.Data.Enumerations;

namespace HQ.Server.Data.Models;

public class User : Base
{
    public string EmailAddress { get; set; } = null!;
    public Guid? StaffId { get; set; }
    public Staff? Staff { get; set; }
    public Guid? ClientId { get; set; }
    public Client? Client { get; set; }
    public SystemRole SystemRole { get; set; }
    // Favorite projects
}
