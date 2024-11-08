using HQ.Server;
using HQ.Server.Data;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;

using Testcontainers.PostgreSql;

namespace HQ.IntegrationTests.Fixtures
{
    public class HQWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly PostgreSqlContainer _postgresContainer;

        public HQWebApplicationFactory()
        {
            _postgresContainer = new PostgreSqlBuilder()
                .WithDatabase("test")
                .WithUsername("test")
                .WithPassword("password")
                .Build();

            _postgresContainer.StartAsync().GetAwaiter().GetResult();
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

                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<HQDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<HQDbContext>(options =>
                    options.UseNpgsql(_postgresContainer.GetConnectionString()).UseSnakeCaseNamingConvention());
                services.AddDataProtection().PersistKeysToDbContext<HQDbContext>();
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

        public override async ValueTask DisposeAsync()
        {
            // Dispose of the container when tests are done
            await _postgresContainer.DisposeAsync();
            await base.DisposeAsync();
        }
    }
}
