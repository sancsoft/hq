using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Spectre.Console;
using Spectre.Console.Cli;

namespace HQ.CLI.Commands;

internal class ConfigureCommand : AsyncCommand<HQCommandSettings>
{
    private readonly HQConfig _config;

    public ConfigureCommand(HQConfig config)
    {
        _config = config;
    }

    public override Task<int> ExecuteAsync(CommandContext context, HQCommandSettings settings)
    {
        _config.ApiUrl = AnsiConsole.Prompt(
            new TextPrompt<Uri>("Enter API URL:")
                .ValidationErrorMessage("[red]That's not a valid API URL[/]")
                .Validate(uri => uri.IsAbsoluteUri));

        _config.AuthUrl = AnsiConsole.Prompt(new TextPrompt<Uri>("Enter Auth URL:")
                .ValidationErrorMessage("[red]That's not a valid Auth URL[/]")
                .Validate(uri => uri.IsAbsoluteUri));

        _config.Insecure = AnsiConsole.Confirm("Insecure mode?", false);

        return Task.FromResult(0);
    }
}