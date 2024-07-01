
using HQ.Abstractions;
using HQ.Abstractions.Enumerations;
using HQ.Server.Data;
using HQ.Server.Services;

using Microsoft.EntityFrameworkCore;

using Spectre.Console.Cli;

namespace HQ.Server.Commands;

public class WeeklyTimeProcessingCommand : AsyncCommand
{
    public override async Task<int> ExecuteAsync(CommandContext context)
    {
        var args = context.Remaining.Raw.ToArray();
        var builder = WebApplication.CreateBuilder(args);

        builder.Configuration.AddEnvironmentVariables("HQ_");

        // Add services to the container.
        builder.Services.AddHQServices(builder.Configuration);
        builder.Services.AddHQDbContext(builder.Configuration);

        // TODO: Configure client secret auth for server-to-server authentication, right now this won't actually work
        builder.Services.AddHttpClient<UserServiceV1>(client =>
        {
            client.BaseAddress = new Uri(builder.Configuration["AUTH_ADMIN_URL"] ?? throw new ArgumentNullException("Undefined AUTH_ADMIN_URL"));
        });

        var app = builder.Build();

        var serviceScopeFactory = app.Services.GetRequiredService<IServiceScopeFactory>();
        await using var scope = serviceScopeFactory.CreateAsyncScope();

        var timeService = scope.ServiceProvider.GetRequiredService<TimeEntryServiceV1>();
        var psrService = scope.ServiceProvider.GetRequiredService<ProjectStatusReportServiceV1>();
        var staffService = scope.ServiceProvider.GetRequiredService<StaffServiceV1>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<WeeklyTimeProcessingCommand>>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var currentWeekStart = today.GetPeriodStartDate(Period.Week);
        var lastWeekStar = today.GetPeriodStartDate(Period.LastWeek);
        var lastWeekEnd = today.GetPeriodEndDate(Period.LastWeek);

        logger.LogInformation("Capturing unsubmitted time through {To}.", lastWeekEnd);
        var captureResponse = await timeService.CaptureUnsubmittedTimeV1(new()
        {
            To = lastWeekEnd
        });
        logger.LogInformation("Captured {CaptureCount} unsubmitted time entries.", captureResponse.Value.Captured);

        logger.LogInformation("Bulk updating staff time entry cutoff date to {CutoffDate}.", currentWeekStart);
        var bulkUpdateResponse = await staffService.BulkSetTimeEntryCutoffV1(new()
        {
            TimeEntryCutoffDate = currentWeekStart
        });
        logger.LogInformation("Updated {UpdateCount} staff.", bulkUpdateResponse.Value.Updated);

        logger.LogInformation("Generating weekly project status reports for week of {WeekOf}.", lastWeekStar);
        var generatePsrResponse = await psrService.GenerateWeeklyProjectStatusReportsV1(new()
        {
            ForDate = lastWeekStar
        });
        logger.LogInformation("Created {CreateCount} PSRs, skipped {SkipCount}.", generatePsrResponse.Value.Created, generatePsrResponse.Value.Skipped);

        return 0;
    }
}