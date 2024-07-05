﻿using Hangfire;

using HQ.Server.API;
using HQ.Server.Authorization;
using HQ.Server.Data;
using HQ.Server.Services;

using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;

using Spectre.Console.Cli;

using Swashbuckle.AspNetCore.Filters;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace HQ.Server.Commands;

public class APICommand : AsyncCommand
{
    public override async Task<int> ExecuteAsync(CommandContext context)
    {
        try
        {
            var args = context.Remaining.Raw.ToArray();
            var builder = WebApplication.CreateBuilder(args);

            builder.Configuration.AddEnvironmentVariables("HQ_");

            // Add services to the container.
            builder.Services.AddHealthChecks();
            builder.Services.AddHQServices(builder.Configuration);

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
                options.AddPolicy("AllowAny", policy => policy.AllowAnyHeader().AllowAnyOrigin().WithExposedHeaders("Content-Disposition")); // TODO: Replace with explicit allow URLs
            });

            builder.Services.AddControllersWithViews(options =>
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
                if (builder.Environment.IsDevelopment())
                {
                    options.RequireHttpsMetadata = false;
                }

                options.Authority = builder.Configuration["AUTH_ISSUER"] ?? throw new ArgumentNullException("Undefined AUTH_ISSUER");
                options.Audience = builder.Configuration["AUTH_AUDIENCE"] ?? throw new ArgumentNullException("Undefined AUTH_AUDIENCE");
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
            {
                options.AccessDeniedPath = "/unauthorized";
            })
            .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
            {
                options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.SignOutScheme = CookieAuthenticationDefaults.AuthenticationScheme;

                options.Authority = builder.Configuration["AUTH_ISSUER"] ?? throw new ArgumentNullException("Undefined AUTH_ISSUER");
                options.SaveTokens = true;
                options.ClientId = "hq";
                options.ResponseType = "code";
                options.UsePkce = true;
                options.GetClaimsFromUserInfoEndpoint = true;

                options.Scope.Add("hq");
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");
                options.Scope.Add("offline_access");
            });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy(HQAuthorizationPolicies.Hangfire, pb => pb
                    .AddAuthenticationSchemes(OpenIdConnectDefaults.AuthenticationScheme)
                    .RequireAuthenticatedUser()
                    .RequireRole("administrator"));

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

            app.MapHangfireDashboard("/hangfire", new()
            {
                Authorization = [],
                AppPath = null
            })
            .RequireAuthorization(HQAuthorizationPolicies.Hangfire);

            app.MapGet("/", () => $"HQ {VersionNumber.GetVersionNumber()}").ExcludeFromDescription();
            app.MapGet("/unauthorized", () => "Unauthorized").ExcludeFromDescription();
            app.MapControllers();

            var serviceScopeFactory = app.Services.GetRequiredService<IServiceScopeFactory>();
            await using var scope = serviceScopeFactory.CreateAsyncScope();

            if (builder.Environment.IsDevelopment())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<HQDbContext>();
                await dbContext.Database.MigrateAsync();
            }

            // Setup recurring hangfire jobs
            var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
            var timezone = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
            var recurringJobOptions = new RecurringJobOptions()
            {
                TimeZone = timezone,
                MisfireHandling = MisfireHandlingMode.Ignorable
            };

            recurringJobManager.AddOrUpdate<TimeEntryServiceV1>(
                nameof(TimeEntryServiceV1.BackgroundCaptureUnsubmittedTimeV1),
                (t) => t.BackgroundCaptureUnsubmittedTimeV1(CancellationToken.None),
                Cron.Weekly(DayOfWeek.Monday, 12),
                recurringJobOptions);

            recurringJobManager.AddOrUpdate<StaffServiceV1>(
                nameof(StaffServiceV1.BackgroundBulkSetTimeEntryCutoffV1),
                (t) => t.BackgroundBulkSetTimeEntryCutoffV1(CancellationToken.None),
                Cron.Weekly(DayOfWeek.Monday, 12),
                recurringJobOptions);

            recurringJobManager.AddOrUpdate<ProjectStatusReportServiceV1>(
                nameof(ProjectStatusReportServiceV1.BackgroundGenerateWeeklyProjectStatusReportsV1),
                (t) => t.BackgroundGenerateWeeklyProjectStatusReportsV1(CancellationToken.None),
                Cron.Weekly(DayOfWeek.Monday, 12),
                recurringJobOptions);

            await app.RunAsync();

            return 0;
        }
        catch (Exception ex) when (ex is HostAbortedException && ex.Source == "Microsoft.EntityFrameworkCore.Design") // see https://github.com/dotnet/efcore/issues/29923
        {
            return 0;
        }
    }
}