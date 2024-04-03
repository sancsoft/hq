using HQ.Commands;
using Spectre.Console.Cli;

var app = new CommandApp();
app.Configure(config =>
{
    config.AddCommand<APICommand>("api")
        .WithDescription("Start API");

    config.AddCommand<WorkerCommand>("worker")
        .WithDescription("Start worker");
});

return await app.RunAsync(args);