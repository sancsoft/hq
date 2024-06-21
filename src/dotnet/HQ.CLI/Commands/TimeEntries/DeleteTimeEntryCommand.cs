using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using HQ.Abstractions.Times;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.TimeEntries
{
    internal class DeleteTimeEntrySettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }
    }

    internal class DeleteTimeEntryCommand : AsyncCommand<DeleteTimeEntrySettings>
    {
        private readonly HQServiceV1 _hqService;

        public DeleteTimeEntryCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, DeleteTimeEntrySettings settings)
        {
            var result = await _hqService.DeleteTimeEntryV1(new()
            {
                Id = settings.Id
            });

            if (!result.IsSuccess || result.Value == null)
            {
                AnsiConsole.MarkupLine("[red]Error:[/]");
                ErrorHelper.Display(result);
                return 1;
            }

            AnsiConsole.MarkupLine("[green]TimeEntry deleted![/]");

            return 0;
        }
    }
}