using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;

using HQ.Server.Commands;
using HQ.Server.Data;

using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;

using Testcontainers.PostgreSql;

namespace HQ.IntegrationTests.Fixtures;

public class HQFixture : IAsyncLifetime
{
    private HQWebApplicationFactory? _factory = null;
    private PostgreSqlContainer? _hqPostgresql = null;
    private PostgreSqlContainer? _keycloakPostgresql = null;
    private IContainer? _keycloak = null;

    public HttpClient CreateClient() => _factory!.CreateClient();

    public async Task InitializeAsync()
    {
        _hqPostgresql = new PostgreSqlBuilder()
            .WithUsername("hq")
            .WithDatabase("hq")
            .WithPassword("hq")
            .Build();

        _keycloakPostgresql = new PostgreSqlBuilder()
            .WithUsername("keycloak")
            .WithDatabase("keycloak")
            .WithPassword("keycloak")
            .Build();

        await Task.WhenAll(_hqPostgresql.StartAsync(), _keycloakPostgresql.StartAsync());

        _keycloak = new ContainerBuilder()
            .WithImage("quay.io/keycloak/keycloak:24.0.4")
            .WithCommand("start-dev", "--import-realm")
            .WithVolumeMount("", "")
            .WithEnvironment("KC_DB", "postgres")
            .WithEnvironment("KC_DB_URL_HOST", _keycloakPostgresql.IpAddress)
            .WithEnvironment("KC_DB_URL_PORT", _keycloakPostgresql.GetMappedPublicPort(5432).ToString())
            .WithEnvironment("KC_DB_URL_DATABASE", "keycloak")
            .WithEnvironment("KC_DB_USERNAME", "keycloak")
            .WithEnvironment("KC_DB_PASSWORD", "keycloak")
            .Build();

        await _keycloak.StartAsync();

        var connectionString = _hqPostgresql.GetConnectionString();
        Console.WriteLine("Connection String: {0}", connectionString);

        _factory = new HQWebApplicationFactory(connectionString);

        await _factory.MigrateAsync();

        // TestContainer = new ContainerBuilder()
        //   .WithImage("testcontainers/helloworld:1.1.0")
        //   .WithPortBinding(8080, true)
        //   .WithWaitStrategy(Wait
        //     .ForUnixContainer()
        //     .UntilHttpRequestIsSucceeded(r => r.ForPort(8080))
        // )
        // .Build();

        // await TestContainer.StartAsync();

        // await using var scope = Services.CreateAsyncScope();
        // var context = scope.ServiceProvider.GetRequiredService<HQDbContext>();
        // await context.Database.MigrateAsync();
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        if (_factory != null)
        {
            await _factory.DisposeAsync();
        }

        if (_keycloak != null)
        {
            await _keycloak.DisposeAsync();
        }

        if (_hqPostgresql != null)
        {
            await _hqPostgresql.DisposeAsync();
        }

        if (_keycloakPostgresql != null)
        {
            await _keycloakPostgresql.DisposeAsync();
        }
    }

}