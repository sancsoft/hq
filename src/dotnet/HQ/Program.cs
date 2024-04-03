using HQ.Commands;
using Spectre.Console.Cli;

var app = new CommandApp();
app.Configure(config =>
{
    config.AddCommand<APICommand>("api")
        .WithDescription("Start HQ API");

});

return await app.RunAsync(args);