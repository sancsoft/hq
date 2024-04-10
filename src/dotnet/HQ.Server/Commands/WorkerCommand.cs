using Spectre.Console.Cli;

namespace HQ.Server.Commands;

public class WorkerCommand : AsyncCommand
{
    public override Task<int> ExecuteAsync(CommandContext context)
    {
        var args = context.Remaining.Raw.ToArray();
        var builder = Host.CreateApplicationBuilder(args);

        var host = builder.Build();
        host.Run();

        return Task.FromResult(0);
    }
}
