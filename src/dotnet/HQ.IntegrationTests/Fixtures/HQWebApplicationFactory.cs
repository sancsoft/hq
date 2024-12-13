using HQ.Abstractions.Enumerations;
using HQ.Server;
using HQ.Server.Data;
using HQ.Server.Data.Models;

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

            SeedDatabaseAsync().GetAwaiter().GetResult();
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
        private async Task SeedDatabaseAsync()
        {
            using var scope = Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<HQDbContext>();

            try
            {
                await context.Database.EnsureCreatedAsync();
                // Clients seeding
                await context.Clients.AddRangeAsync(
                    new Client
                    {
                        Id = Guid.NewGuid(),
                        Name = "Seeded Client 1",
                        OfficialName = "Seeded Official Client 1",
                        BillingEmail = "seededclient1@example.com",
                        HourlyRate = 50.0m,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Client
                    {
                        Id = Guid.NewGuid(),
                        Name = "Seeded Client 2",
                        OfficialName = "Seeded Official Client 2",
                        BillingEmail = "seededclient2@example.com",
                        HourlyRate = 75.0m,
                        CreatedAt = DateTime.UtcNow
                    }
                );

                await context.SaveChangesAsync();

                // Staff seeding
                await context.Staff.AddRangeAsync(
                new Staff
                {
                    Id = Guid.NewGuid(),
                    Name = "Seeded Staff 1",
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@example.com",
                    WorkHours = 40,
                    VacationHours = 10,
                    Jurisdiciton = Jurisdiciton.USA,
                    StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-6)),
                    EndDate = null,
                    CreatedAt = DateTime.UtcNow
                },
                new Staff
                {
                    Id = Guid.NewGuid(),
                    Name = "Seeded Staff 2",
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "jane.smith@example.com",
                    WorkHours = 35,
                    VacationHours = 8,
                    Jurisdiciton = Jurisdiciton.Colombia,
                    StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-6)),
                    EndDate = null,
                    CreatedAt = DateTime.UtcNow
                });

                await context.SaveChangesAsync();
                // Chargecode seeding

                await context.ChargeCodes.AddRangeAsync(
                    new ChargeCode
                    {
                        Activity = ChargeCodeActivity.Project,
                        Billable = true,
                        Code = "P0001",
                        Active = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ChargeCode
                    {
                        Activity = ChargeCodeActivity.Quote,
                        Billable = false,
                        Code = "Q0001",
                        Active = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new ChargeCode
                    {
                        Activity = ChargeCodeActivity.Service,
                        Billable = true,
                        Code = "S0001",
                        Active = false,
                        CreatedAt = DateTime.UtcNow
                    }
                );
                await context.SaveChangesAsync();

                // Project seeding
                await context.Projects.AddRangeAsync(
                    new Project
                    {
                        Name = "Seeded Project 1",
                        Client = await context.Clients.FirstAsync(),
                        ProjectManager = await context.Staff.FirstAsync(),
                        ChargeCode = await context.ChargeCodes.FirstOrDefaultAsync(),
                        StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-6)),
                        EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1)),
                        Status = ProjectStatus.InProduction,
                        CreatedAt = DateTime.UtcNow
                    }
                );
                await context.SaveChangesAsync();

                Console.WriteLine("Database seeded successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding the database: {ex.Message}");
            }
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
