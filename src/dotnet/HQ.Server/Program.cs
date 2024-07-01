using HQ.Server.Commands;

using Spectre.Console.Cli;

var app = new CommandApp<APICommand>();
app.Configure(config =>
{
    config.AddCommand<APICommand>("api")
        .WithDescription("Start API");

    config.AddCommand<WorkerCommand>("worker")
        .WithDescription("Start worker");

    config.AddCommand<MigrateCommand>("migrate")
        .WithDescription("Migrate database to latest version");

    config.AddCommand<WeeklyTimeProcessingCommand>("weekly-time-processing")
        .WithDescription("Perform weekly time processing (capture unsubmitted time, update time entry cutoff date for staff, generate project status reports)");
});

return await app.RunAsync(args);