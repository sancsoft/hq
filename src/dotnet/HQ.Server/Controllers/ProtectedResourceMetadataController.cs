using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HQ.Server.Controllers;

[Route("/.well-known/oauth-protected-resource")]
public class ProtectedResourceMetadataController : ControllerBase
{
    private static readonly string[] ScopesSupported = ["openid", "profile", "email", "offline_access"];

    [HttpGet]
    public IActionResult Get([FromServices] IConfiguration configuration)
    {
        var resourceUrl = GetResourceUrl();
        var issuer = configuration["AUTH_ISSUER"];

        if (string.IsNullOrEmpty(issuer))
        {
            return StatusCode(500, new { error = "AUTH_ISSUER is not configured." });
        }

        var issuerBase = issuer.TrimEnd('/');

        var prm = new
        {
            resource = resourceUrl,
            authorization_servers = new[] { issuerBase },
            scopes_supported = ScopesSupported,
            resource_name = "HQ MCP Server",
            resource_documentation = "HQ MCP Server - Model Context Protocol API",
            jwks_uri = $"{issuerBase}/protocol/openid-connect/certs",
        };

        Response.ContentType = "application/json";
        return Ok(prm);
    }

    private string GetResourceUrl()
    {
        var scheme = HttpContext.Request.Scheme;
        var host = HttpContext.Request.Host;
        var pathBase = HttpContext.Request.PathBase;
        return $"{scheme}://{host}{pathBase}";
    }
}
