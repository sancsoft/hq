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
    internal class EditTimeEntryChargecodeSettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }

        [CommandArgument(1, "<chargecode>")]
        public required string Chargecode { get; set; }
    }

    internal class EditTimeEntryChargecodeCommand : AsyncCommand<EditTimeEntryChargecodeSettings>
    {
        private readonly HQServiceV1 _hqService;

        public EditTimeEntryChargecodeCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, EditTimeEntryChargecodeSettings settings)
        {
            var timeEntryRequest = new UpsertTimeChargeCodeV1.Request()
            {
                Id = settings.Id,
                Chargecode = settings.Chargecode
            };

            var updateResult = await _hqService.UpsertTimeEntryChargecodeV1(timeEntryRequest);

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
