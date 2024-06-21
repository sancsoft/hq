using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.Times;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.TimeEntries
{
    internal class EditTimeEntryDescriptionSettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }

        [CommandArgument(1, "<notes>")]
        public string Notes { get; set; } = null!;
    }

    internal class EditTimeEntryDescriptionCommand : AsyncCommand<EditTimeEntryDescriptionSettings>
    {
        private readonly HQServiceV1 _hqService;

        public EditTimeEntryDescriptionCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, EditTimeEntryDescriptionSettings settings)
        {
            var timeEntryRequest = new UpsertTimeDescriptionV1.Request()
            {
                Id = settings.Id,
                Notes = settings.Notes
            };

            var updateResult = await _hqService.UpsertTimeEntryDescriptionV1(timeEntryRequest);

            if (!updateResult.IsSuccess || updateResult.Value == null)
            {
                ErrorHelper.Display(updateResult);
                return 1;
            }

            if (updateResult.Value != null)
            {
                AnsiConsole.Write("Time updated successfully");
            }

            return 0;
        }
    }
}