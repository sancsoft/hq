using HQ.Server.Commands;

using Spectre.Console.Cli;

var app = new CommandApp<APICommand>();
app.Configure(config =>
{
    config.AddCommand<APICommand>("api")
        .WithDescription("Start API");

    config.AddCommand<MigrateCommand>("migrate")
        .WithDescription("Migrate database to latest version");
});

return await app.RunAsync(args);