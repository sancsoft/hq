using System.ComponentModel;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using ModelContextProtocol.Server;

namespace HQ.Server.McpTools;

[McpServerToolType]
public class UserClaimsTool
{
    private readonly IHttpContextAccessor _httpContextAccessor;


    public UserClaimsTool(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;

    }

    [McpServerTool, Description("Returns the claims of the currently authenticated user.")]
    public string GetMyClaims()
    {
        var claims = _httpContextAccessor.HttpContext!.User.Claims
            .Select(c => new { Type = c.Type, Value = c.Value })
            .ToArray();

        return JsonSerializer.Serialize(claims, new JsonSerializerOptions { WriteIndented = true });
    }
}
