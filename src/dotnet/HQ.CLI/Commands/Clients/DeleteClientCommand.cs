using HQ.Abstractions.Clients;
using HQ.SDK;
using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HQ.CLI.Commands.Clients
{
    internal class DeleteClientSettings : HQCommandSettings
    {
        [CommandArgument(0, "<clientIdOrName>")]
        public string? ClientIdOrName { get; set; }
    }

    internal class DeleteClientCommand : AsyncCommand<DeleteClientSettings>
    {
        private readonly HQServiceV1 _hqService;

        public DeleteClientCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, DeleteClientSettings settings)
        {
            var result = await _hqService.DeleteClientV1(new()
            {
                ClientIdOrName = settings.ClientIdOrName,
            });

            if (!result.IsSuccess || result.Value == null)
            {
                AnsiConsole.MarkupLine("[red]Error:[/]");
                ErrorHelper.Display(result);
                return 1;
            }

            AnsiConsole.MarkupLine("[green]Client deleted![/]");

            return 0;
        }
    }
}
