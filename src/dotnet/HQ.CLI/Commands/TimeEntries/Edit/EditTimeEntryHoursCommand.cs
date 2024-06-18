using FluentResults;
using HQ.Abstractions.Times;
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

namespace HQ.CLI.Commands.TimeEntries
{
    internal class EditTimeEntryHoursSettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }

        [CommandArgument(1, "<hours>")]
        public decimal Hours { get; set; }
    }

    internal class EditTimeEntryHoursCommand : AsyncCommand<EditTimeEntryHoursSettings>
    {
        private readonly HQServiceV1 _hqService;

        public EditTimeEntryHoursCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, EditTimeEntryHoursSettings settings)
        {
            var timeEntryRequest = new UpsertTimeHoursV1.Request()
            {
                Id = settings.Id,
                Hours = settings.Hours
            };

            var updateResult = await _hqService.UpsertTimeEntryHoursV1(timeEntryRequest);

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
