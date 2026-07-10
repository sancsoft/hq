using System.Collections.Frozen;
using System.Diagnostics;
using System.Net;
using System.Security.Claims;

using Duende.AccessTokenManagement.OpenIdConnect;

using Hangfire;

using HQ;
using HQ.Abstractions.Enumerations;
using HQ.Server;
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
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;

using Npgsql;

using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

using Swashbuckle.AspNetCore.Filters;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables("HQ_");

var serverOptions = builder.Configuration.GetSection(HQServerOptions.Server).Get<HQServerOptions>() ?? throw new Exception("Error parsing configuration section 'Server'.");

if (serverOptions.OpenTelemetry && serverOptions.OpenTelemetryEndpointUrl != null)
{
    var serviceName = "hq-server";
    var serviceVersion = VersionNumber.GetVersionNumber();

    builder.Logging.AddOpenTelemetry(logging =>
    {
        logging.IncludeFormattedMessage = true;
        logging.IncludeScopes = true;
    });

    builder.Services.AddOpenTelemetry()
        .ConfigureResource(resource => resource.AddService(serviceName: serviceName, serviceVersion: serviceVersion))
        .WithTracing(tracing => tracing
            .AddAspNetCoreInstrumentation()
            .AddNpgsql()
            .AddHttpClientInstrumentation()
            .AddHangfireInstrumentation()
            .AddOtlpExporter(o => o.Endpoint = serverOptions.OpenTelemetryEndpointUrl))
        .WithMetrics(metrics => metrics
            .AddAspNetCoreInstrumentation()
            .AddProcessInstrumentation()
            .AddHttpClientInstrumentation()
            .SetExemplarFilter(ExemplarFilterType.TraceBased)
            .AddOtlpExporter(o => o.Endpoint = serverOptions.OpenTelemetryEndpointUrl))
        .WithLogging(logging => logging
            .AddOtlpExporter(o => o.Endpoint = serverOptions.OpenTelemetryEndpointUrl));
}

// Add services to the container.
builder.Services.AddHealthChecks();
builder.Services.AddHQServices(builder.Configuration);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    var forwardedHeadersOptions = builder.Configuration.GetSection("ForwardedHeadersOptions");
    forwardedHeadersOptions.Bind(options);

    options.KnownProxies.Clear();
    foreach (var knownProxy in forwardedHeadersOptions.GetSection("KnownProxies").GetChildren())
    {
        options.KnownProxies.Add(IPAddress.Parse(knownProxy.Value!));
    }

    options.KnownIPNetworks.Clear();
    foreach (var knownNetwork in forwardedHeadersOptions.GetSection("KnownNetworks").GetChildren())
    {
        options.KnownIPNetworks.Add(new System.Net.IPNetwork(
            IPAddress.Parse(knownNetwork.GetValue<string>("Prefix")!),
            knownNetwork.GetValue<int>("PrefixLength")!));

        Console.WriteLine(String.Join(',', options.KnownIPNetworks.Select(t => t.BaseAddress + "/" + t.PrefixLength)));
    }
});

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
builder.Services.AddScoped<IAuthorizationHandler, PointsAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ProjectsAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, TimeEntryAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, PlanAuthorizationHandler>();


builder.Services.AddCors();

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

    if (builder.Environment.IsDevelopment())
    {
        options.RequireHttpsMetadata = false;
    }

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
app.UseForwardedHeaders();

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

var corsAllowOrigin = app.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
app.UseCors(policy => policy
    .WithOrigins(corsAllowOrigin)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .WithExposedHeaders("Content-Disposition"));

app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    var staffId = context.User.GetStaffId();
    var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
    var userRoles = String.Join(", ", context.User.FindAll(ClaimTypes.Role).Select(t => t.Value));

    var activity = Activity.Current;
    activity?.AddTag("user.id", userId);
    activity?.AddTag("user.roles", userRoles);
    activity?.AddTag("hq.staff_id", staffId);

    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    var logScope = new Dictionary<string, object?>()
    {
        { "user.id", userId },
        { "user.roles", userRoles },
        { "hq.staff_id", staffId },
    }.ToList();

    using (logger.BeginScope(logScope))
    {
        await next();
    }
});

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

if (serverOptions.AutoMigrate)
{
    var dbContext = scope.ServiceProvider.GetRequiredService<HQDbContext>();
    await dbContext.Database.MigrateAsync();

    if(builder.Environment.IsDevelopment())
    {
        var sancsoft = await dbContext.Clients.SingleOrDefaultAsync(t => t.Name == "SANCSOFT");
        if(sancsoft == null)
        {
            sancsoft = new()
            {
                Name = "SANCSOFT",
                OfficialName = "Sanctuary Software Studio, Inc."
            };

            dbContext.Clients.Add(sancsoft);
        }

        var holidayProject = await dbContext.Projects.SingleOrDefaultAsync(t => t.Name == "HOLIDAY");
        if(holidayProject == null)
        {
            holidayProject = new()
            {
                Name = "HOLIDAY",
                ClientId = sancsoft.Id,
                TimeEntryMaxHours = 8,
                Status = ProjectStatus.Ongoing,
                BookingHours = 0,
                BookingPeriod = Period.Month,
            };

            dbContext.Projects.Add(holidayProject);
        }

        var holidayChargeCode = await dbContext.ChargeCodes.SingleOrDefaultAsync(t => t.ProjectId == holidayProject.Id);
        if(holidayChargeCode == null)
        {
            holidayChargeCode = new()
            {
                ProjectId = holidayProject.Id,
                Code = "S1022",
                Active = true,
                Activity = ChargeCodeActivity.General,
                Billable = false,
            };

            dbContext.ChargeCodes.Add(holidayChargeCode);
        }

        var vacationProject = await dbContext.Projects.SingleOrDefaultAsync(t => t.Name == "VACATION");
        if(vacationProject == null)
        {
            vacationProject = new()
            {
                Name = "VACATION",
                ClientId = sancsoft.Id,
                TimeEntryMaxHours = 8,
                Status = ProjectStatus.Ongoing,
                BookingHours = 0,
                BookingPeriod = Period.Month,
            };

            dbContext.Projects.Add(vacationProject);
        }

        var vacationChargeCode = await dbContext.ChargeCodes.SingleOrDefaultAsync(t => t.ProjectId == vacationProject.Id);
        if(vacationChargeCode == null)
        {
            vacationChargeCode = new()
            {
                ProjectId = vacationProject.Id,
                Code = "S1001",
                Active = true,
                Activity = ChargeCodeActivity.General,
                Billable = false,
            };

            dbContext.ChargeCodes.Add(vacationChargeCode);
        }

        var sickProject = await dbContext.Projects.SingleOrDefaultAsync(t => t.Name == "SICK");
        if(sickProject == null)
        {
            sickProject = new()
            {
                Name = "SICK",
                ClientId = sancsoft.Id,
                TimeEntryMaxHours = 8,
                Status = ProjectStatus.Ongoing,
                BookingHours = 0,
                BookingPeriod = Period.Month,
            };

            dbContext.Projects.Add(sickProject);
        }

        var sickChargeCode = await dbContext.ChargeCodes.SingleOrDefaultAsync(t => t.ProjectId == sickProject.Id);
        if(sickChargeCode == null)
        {
            sickChargeCode = new()
            {
                ProjectId = sickProject.Id,
                Code = "S1002",
                Active = true,
                Activity = ChargeCodeActivity.General,
                Billable = false,
            };

            dbContext.ChargeCodes.Add(sickChargeCode);
        }

        var adminStaff = await dbContext.Staff.SingleOrDefaultAsync(t => t.Email == "admin@localhost");
        if(adminStaff == null)
        {
            adminStaff = new()
            {
                Id = Guid.Parse("32bded97-1d95-48c3-966a-fea9756df4aa"),
                Email = "admin@localhost",
                FirstName = "Admin",
                LastName = "User",
                Name = "admin",
                StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                WorkHours = 40,
                VacationHours = 80,
                Jurisdiciton = Jurisdiciton.USA,
            };

            dbContext.Staff.Add(adminStaff);
        }

        var executiveStaff = await dbContext.Staff.SingleOrDefaultAsync(t => t.Email == "executive@localhost");
        if(executiveStaff == null)
        {
            executiveStaff = new()
            {
                Id = Guid.Parse("7a3f8c2e-5b1d-4f9a-8e6c-2d4b7a9f1c3e"),
                Email = "executive@localhost",
                FirstName = "Executive",
                LastName = "User",
                Name = "executive",
                StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                WorkHours = 40,
                VacationHours = 80,
                Jurisdiciton = Jurisdiciton.USA,
            };

            dbContext.Staff.Add(executiveStaff);
        }

        var managerStaff = await dbContext.Staff.SingleOrDefaultAsync(t => t.Email == "manager@localhost");
        if(managerStaff == null)
        {
            managerStaff = new()
            {
                Id = Guid.Parse("9c5e1f7a-3d8b-4a2e-b6f9-1c7d4e8a3b5f"),
                Email = "manager@localhost",
                FirstName = "Manager",
                LastName = "User",
                Name = "manager",
                StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                WorkHours = 40,
                VacationHours = 80,
                Jurisdiciton = Jurisdiciton.USA,
            };

            dbContext.Staff.Add(managerStaff);
        }

        var partnerStaff = await dbContext.Staff.SingleOrDefaultAsync(t => t.Email == "partner@localhost");
        if(partnerStaff == null)
        {
            partnerStaff = new()
            {
                Id = Guid.Parse("4e7b2d9f-6a1c-4e8b-9d3f-5c7a2e4b8d1f"),
                Email = "partner@localhost",
                FirstName = "Partner",
                LastName = "User",
                Name = "partner",
                StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                WorkHours = 40,
                VacationHours = 80,
                Jurisdiciton = Jurisdiciton.USA,
            };

            dbContext.Staff.Add(partnerStaff);
        }

        var staffStaff = await dbContext.Staff.SingleOrDefaultAsync(t => t.Email == "staff@localhost");
        if(staffStaff == null)
        {
            staffStaff = new()
            {
                Id = Guid.Parse("2b8d4f6a-9e3c-4a7b-8f1d-3e5c9a7b2d4f"),
                Email = "staff@localhost",
                FirstName = "Staff",
                LastName = "User",
                Name = "staff",
                StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                WorkHours = 40,
                VacationHours = 80,
                Jurisdiciton = Jurisdiciton.USA,
            };

            dbContext.Staff.Add(staffStaff);
        }

        await dbContext.SaveChangesAsync();
    }
}

// Setup recurring hangfire jobs
var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
var timezone = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
var recurringJobOptions = new RecurringJobOptions()
{
    TimeZone = timezone,
    MisfireHandling = MisfireHandlingMode.Ignorable
};

// Every morning
recurringJobManager.AddOrUpdate<TimeEntryServiceV1>(
    nameof(TimeEntryServiceV1.BackgroundSendRejectedTimeSubmissionReminderEmail),
    (t) => t.BackgroundSendRejectedTimeSubmissionReminderEmail(Period.LastWeek, CancellationToken.None),
    Cron.Daily(8),
    recurringJobOptions);


recurringJobManager.AddOrUpdate<PlanServiceV1>(
    nameof(PlanServiceV1.BackgroundSendPlanSubmissionReminderEmail),
    (t) => t.BackgroundSendPlanSubmissionReminderEmail(Period.Today, CancellationToken.None),
    Cron.Daily(10),
    recurringJobOptions);

// Monday morning
recurringJobManager.AddOrUpdate<TimeEntryServiceV1>(
    nameof(TimeEntryServiceV1.BackgroundSendTimeSubmissionReminderEmail),
    (t) => t.BackgroundSendTimeSubmissionReminderEmail(Period.LastWeek, CancellationToken.None),
    Cron.Weekly(DayOfWeek.Monday, 8),
    recurringJobOptions);

// Monday afternoon
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

recurringJobManager.AddOrUpdate<ProjectStatusReportServiceV1>(
    nameof(ProjectStatusReportServiceV1.BackgroundAutoSubmitWeeklyProjectStatusReportsV1),
    (t) => t.BackgroundAutoSubmitWeeklyProjectStatusReportsV1(CancellationToken.None),
    Cron.Weekly(DayOfWeek.Monday, 12),
    recurringJobOptions);

recurringJobManager.AddOrUpdate<PointServiceV1>(
    nameof(PointServiceV1.BackgroundSendPointSubmissionReminderEmail),
    (t) => t.BackgroundSendPointSubmissionReminderEmail(Period.Week, CancellationToken.None),
    Cron.Weekly(DayOfWeek.Monday, 12),
    recurringJobOptions);

recurringJobManager.AddOrUpdate<EmailMessageService>(
    nameof(EmailMessageService.SendEmployeeHoursEmail),
    (t) => t.SendEmployeeHoursEmail(CancellationToken.None),
    "15 12 * * 1",
    recurringJobOptions);

// Friday morning
recurringJobManager.AddOrUpdate<HolidayServiceV1>(
    nameof(HolidayServiceV1.BackgroundAutoGenerateHolidayTimeEntryV1),
    (t) => t.BackgroundAutoGenerateHolidayTimeEntryV1(CancellationToken.None),
    Cron.Weekly(DayOfWeek.Friday, 8),
    recurringJobOptions);

recurringJobManager.AddOrUpdate<PointServiceV1>(
    nameof(PointServiceV1.BackgroundAutoGenerateHolidayPlanningPointsV1),
    (t) => t.BackgroundAutoGenerateHolidayPlanningPointsV1(CancellationToken.None),
    Cron.Weekly(DayOfWeek.Friday, 8),
    recurringJobOptions);

recurringJobManager.AddOrUpdate<PointServiceV1>(
    nameof(PointServiceV1.BackgroundAutoGenerateVacationPlanningPointsV1),
    (t) => t.BackgroundAutoGenerateVacationPlanningPointsV1(CancellationToken.None),
    Cron.Weekly(DayOfWeek.Friday, 8),
    recurringJobOptions);

recurringJobManager.AddOrUpdate<TimeEntryServiceV1>(
    nameof(TimeEntryServiceV1.BackgroundSendTimeEntryReminderEmail),
    (t) => t.BackgroundSendTimeEntryReminderEmail(Period.Week, CancellationToken.None),
    Cron.Weekly(DayOfWeek.Friday, 8),
    recurringJobOptions);

await app.RunAsync();