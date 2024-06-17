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
    internal class EditTimeEntrySettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }

        [CommandOption("--chargecode|-c")]
        public string? ChargeCode { get; set; }

        [CommandOption("--notes|-n")]
        public string? Notes { get; set; }

        [CommandOption("--task|-t")]
        public string? Task { get; set; }

        [CommandOption("--activity|-a")]
        public string? Activity { get; set; }

        [CommandOption("--hours|-h")]
        public decimal? Hours { get; set; }

        [CommandOption("--date")]
        public DateOnly? Date { get; set; }
    }

    internal class EditTimeEntryCommand : AsyncCommand<EditTimeEntrySettings>
    {
        private readonly HQServiceV1 _hqService;

        public EditTimeEntryCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, EditTimeEntrySettings settings)
        {
            var result = await _hqService.GetTimeEntriesV1(new()
            {
                Id = settings.Id,
            });

            if (!result.IsSuccess || result.Value == null)
            {
                ErrorHelper.Display(result);
                return 1;
            }
            var time = result.Value.Records.FirstOrDefault();
            if(time == null) {
                ErrorHelper.Display(result);
                return 1;
            }
            var timeEntryRequest = new UpsertTimeV1.Request()
            {
                ChargeCode = string.IsNullOrEmpty(settings.ChargeCode) ? time.ChargeCode : settings.ChargeCode ,
                ActivityName = string.IsNullOrEmpty(settings.Activity) ? time.ActivityName : settings.Activity,
                Notes = string.IsNullOrEmpty(settings.Notes) ? time.Description! : settings.Notes,
                Task = string.IsNullOrEmpty(settings.Task) ? time.Task : settings.Task,
                Date = settings.Date.HasValue ? settings.Date.Value : time.Date ,
                Hours = settings.Hours.HasValue ? settings.Hours.Value : time.Hours
            };

            var updateResult = await _hqService.UpsertTimeEntryV1(timeEntryRequest);

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
