using Duende.AccessTokenManagement.OpenIdConnect;
using HQ.Server.API;
using HQ.Server.Authorization;
using HQ.Server.Data;
using HQ.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Npgsql;
using Spectre.Console.Cli;
using Swashbuckle.AspNetCore.Filters;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace HQ.Server.Commands;

public class APICommand : AsyncCommand
{
    public override async Task<int> ExecuteAsync(CommandContext context)
    {
        var args = context.Remaining.Raw.ToArray();
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddHealthChecks();
        builder.Services.AddHQServices();
        builder.Services.AddHQDbContext(builder.Configuration);

        builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
        builder.Services.AddSwaggerGen(c =>
        {
            // add a custom operation filter which sets default values
            c.OperationFilter<SwaggerDefaultValues>();

            c.CustomSchemaIds(x => x.FullName?.Replace('+', '.')?.Replace('.', '_').Replace("HQ_Server_", String.Empty).Replace("_", String.Empty));

            var fileName = typeof(Program).Assembly.GetName().Name + ".xml";
            var filePath = Path.Combine(AppContext.BaseDirectory, fileName);

            // integrate xml comments
            c.IncludeXmlComments(filePath);

            c.OperationFilter<SecurityRequirementsOperationFilter>();
            c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.OpenIdConnect,
                OpenIdConnectUrl = new Uri(new Uri(builder.Configuration["AUTH_ISSUER"] ?? throw new ArgumentNullException("Undefined AUTH_ISSUER")), ".well-known/openid-configuration")
            });
        });

        builder.Services.Configure<ApiBehaviorOptions>(options =>
        {
            options.SuppressMapClientErrors = true;
            options.SuppressModelStateInvalidFilter = true;
        });

        builder.Services.AddScoped<IAuthorizationHandler, ProjectStatusReportAuthorizationHandler>();
        builder.Services.AddScoped<IAuthorizationHandler, TimeEntryAuthorizationHandler>();


        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAny", policy => policy.AllowAnyHeader().AllowAnyOrigin()); // TODO: Replace with explicit allow URLs
        });

        builder.Services.AddControllers(options =>
        {
            options.Filters.Add<HQModelStateInvalidFilter>();
        });

        builder.Services.AddApiVersioning(options =>
        {
            options.ReportApiVersions = true;
        })
            .AddMvc()
            .AddApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });

        builder.Services.AddDistributedMemoryCache();

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            if(builder.Environment.IsDevelopment())
            {
                options.RequireHttpsMetadata = false;
            }

            options.Authority = builder.Configuration["AUTH_ISSUER"] ?? throw new ArgumentNullException("Undefined AUTH_ISSUER");
            options.Audience = builder.Configuration["AUTH_AUDIENCE"] ?? throw new ArgumentNullException("Undefined AUTH_AUDIENCE");
        });

        builder.Services.AddAuthorization(options => {
            options.AddPolicy(HQAuthorizationPolicies.Administrator, pb => pb
                .RequireAuthenticatedUser()
                .RequireRole("administrator"));

            options.AddPolicy(HQAuthorizationPolicies.Executive, pb => pb
                .RequireAuthenticatedUser()
                .RequireRole("executive", "administrator"));

            options.AddPolicy(HQAuthorizationPolicies.Partner, pb => pb
                .RequireAuthenticatedUser()
                .RequireRole("partner", "executive", "administrator"));

            options.AddPolicy(HQAuthorizationPolicies.Manager, pb => pb
                .RequireAuthenticatedUser()
                .RequireRole("manager", "partner", "executive", "administrator"));

            options.AddPolicy(HQAuthorizationPolicies.Staff, pb => pb
                .RequireAuthenticatedUser()
                .RequireRole("staff", "manager", "partner", "executive", "administrator"));
        });
    
        builder.Services.AddOpenIdConnectAccessTokenManagement();
        builder.Services.AddHttpClient<UserServiceV1>(client =>
            {
                client.BaseAddress = new Uri(builder.Configuration["AUTH_ADMIN_URL"] ?? throw new ArgumentNullException("Undefined AUTH_ADMIN_URL"));
            })
            .AddUserAccessTokenHandler();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        
        // Run all health checks
        app.MapHealthChecks("/health/startup");

        // Only run simple health check testing to see if server responds
        app.MapHealthChecks("/healthz", new HealthCheckOptions { Predicate = _ => false });

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.OAuthClientId("hq");
            c.OAuthScopes("openid", "profile", "email");
            c.OAuthUsePkce();

            var descriptions = app.DescribeApiVersions();

            // build a swagger endpoint for each discovered API version
            foreach (var description in descriptions)
            {
                var url = $"/swagger/{description.GroupName}/swagger.json";
                var name = description.GroupName.ToUpperInvariant();
                c.SwaggerEndpoint(url, name);
            }
        });

        app.UseHttpsRedirection();

        app.UseCors("AllowAny");

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapGet("/", () => $"HQ {VersionNumber.GetVersionNumber()}").ExcludeFromDescription();

        app.MapControllers();

        if(builder.Environment.IsDevelopment())
        {
            var serviceScopeFactory = app.Services.GetRequiredService<IServiceScopeFactory>();
            await using var scope = serviceScopeFactory.CreateAsyncScope();
            await using var dbContext = scope.ServiceProvider.GetRequiredService<HQDbContext>();

            await dbContext.Database.MigrateAsync();
        }

        app.Run();

        return 0;
    }
}
