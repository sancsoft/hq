using Microsoft.AspNetCore.Http;

namespace HQ.Server.Middleware;

public class MpcResourceMetadataMiddleware
{
    private readonly RequestDelegate _next;
    private const string PrmPath = "/.well-known/oauth-protected-resource";

    public MpcResourceMetadataMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        if (context.Response.StatusCode == 401)
        {
            var prmUrl = $"{context.Request.Scheme}://{context.Request.Host}{PrmPath}";
            context.Response.Headers.WWWAuthenticate = $"Bearer resource_metadata=\"{prmUrl}\"";
        }
    }
}
