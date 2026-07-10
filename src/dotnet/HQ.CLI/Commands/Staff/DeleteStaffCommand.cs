using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using HQ.Abstractions.Staff;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.Staff
{
    internal class DeleteStaffSettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }
    }

    internal class DeleteStaffCommand : AsyncCommand<DeleteStaffSettings>
    {
        private readonly HQServiceV1 _hqService;

        public DeleteStaffCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        protected override async Task<int> ExecuteAsync(CommandContext context, DeleteStaffSettings settings, CancellationToken cancellationToken = default)
        {
            var result = await _hqService.DeleteStaffV1(new()
            {
                Id = settings.Id
            });

            if (!result.IsSuccess || result.Value == null)
            {
                AnsiConsole.MarkupLine("[red]Error:[/]");
                ErrorHelper.Display(result);
                return 1;
            }

            AnsiConsole.MarkupLine("[green]Staff deleted![/]");

            return 0;
        }
    }
}