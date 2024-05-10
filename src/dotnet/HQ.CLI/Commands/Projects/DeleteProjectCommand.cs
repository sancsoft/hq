using HQ.Abstractions.Projects;
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

namespace HQ.CLI.Commands.Projects
{
    internal class DeleteProjectSettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }
    }

    internal class DeleteProjectCommand : AsyncCommand<DeleteProjectSettings>
    {
        private readonly HQServiceV1 _hqService;

        public DeleteProjectCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, DeleteProjectSettings settings)
        {
            var result = await _hqService.DeleteProjectV1(new()
            {
                Id = settings.Id
            });

            if (!result.IsSuccess || result.Value == null)
            {
                AnsiConsole.MarkupLine("[red]Error:[/]");
                ErrorHelper.Display(result);
                return 1;
            }

            AnsiConsole.MarkupLine("[green]Project deleted![/]");

            return 0;
        }
    }
}
