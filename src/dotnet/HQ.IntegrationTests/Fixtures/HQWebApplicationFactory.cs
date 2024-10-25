using HQ.Server;
using HQ.Server.Data;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;

namespace HQ.IntegrationTests.Fixtures;

public class HQWebApplicationFactory : WebApplicationFactory<Program>
{

    public HQWebApplicationFactory()
    {
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "TestScheme";
                options.DefaultChallengeScheme = "TestScheme";
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("TestScheme", options => { });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("TestPolicy", policy =>
                    policy.RequireAuthenticatedUser());
            });
        });

        builder.UseEnvironment("Test");
    }
    public HttpClient CreateClientWithBaseUrl()
    {
        return this.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("http://api.hq.localhost:5186")
        });
    }
    public async Task MigrateAsync()
    {
        await using var scope = Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<HQDbContext>();
        await context.Database.MigrateAsync();
    }
}