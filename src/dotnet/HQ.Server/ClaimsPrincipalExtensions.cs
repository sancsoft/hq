using System.Security.Claims;

namespace HQ.Server;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetStaffId(this ClaimsPrincipal principal)
    {
        if (Guid.TryParse(principal.FindFirstValue("staff_id"), out Guid staffId))
        {
            return staffId;
        }

        return null;
    }
}