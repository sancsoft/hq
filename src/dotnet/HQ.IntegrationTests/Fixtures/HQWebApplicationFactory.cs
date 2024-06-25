using HQ.Server.Commands;
using HQ.Server.Data;

using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;

namespace HQ.IntegrationTests.Fixtures;

public class HQWebApplicationFactory : WebApplicationFactory<APICommand>
{
    private readonly string _connectionString;

    public HQWebApplicationFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var configuration = new Dictionary<string, string?>()
        {
            { "ConnectionStrings__HQ", _connectionString }
        };

        builder.ConfigureAppConfiguration(builder => builder.AddInMemoryCollection(configuration));

        builder.UseEnvironment("Test");
    }

    public async Task MigrateAsync()
    {
        await using var scope = Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<HQDbContext>();
        await context.Database.MigrateAsync();
    }
}
