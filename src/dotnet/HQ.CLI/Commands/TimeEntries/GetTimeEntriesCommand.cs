
using HQ.SDK;
using System.ComponentModel;
using Spectre.Console;
using Spectre.Console.Cli;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Times;
using HQ.Abstractions;

using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Spectre.Console.Json;
using System;
using System.Collections.Generic;

namespace HQ.CLI.Commands.TimeEntries
{
    internal class GetTimeEntriesSettings : HQCommandSettings
    {
        [CommandArgument(0, "[id]")]
        public Guid? Id { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }

        [CommandOption("--chargecode|-c")]
        public string? chargecode { get; set; }

        [CommandOption("--client")]
        public Guid? ClientId { get; set; }

        [CommandOption("--staff")]
        public Guid? StaffId { get; set; }

        [CommandOption("--from|-f")]
        public DateOnly? From { get; set; }

        [CommandOption("--to|-t")]
        public DateOnly? To { get; set; }

        [CommandOption("--activity|-a")]
        public string? Activity { get; set; }

        [CommandOption("--task")]
        public string? Task { get; set; }

        [CommandOption("--date")]
        public DateOnly? Date { get; set; }

        [CommandOption("--period|-p")]
        public Period? Period { get; set; }

        [CommandOption("--sort-direction|-D")]
        [DefaultValue(SortDirection.Asc)]
        public SortDirection SortDirection { get; set; }

        [CommandOption("--sort-by|-S")]
        [DefaultValue(GetTimesV1.SortColumn.Date)]
        public GetTimesV1.SortColumn SortBy { get; set; }
    }

    internal class GetTimeEntriesCommand : AsyncCommand<GetTimeEntriesSettings>
    {
        private readonly HQServiceV1 _hqService;
        public GetTimeEntriesCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetTimeEntriesSettings settings)
        {
            DateOnly? startDate = null;
            DateOnly? endDate = null;

            if (settings.Period.HasValue)
            {
                startDate = new DateOnly().GetPeriodStartDate(settings.Period.Value);
                endDate = new DateOnly().GetPeriodEndDate(settings.Period.Value);

            }
            else
            {
                startDate = settings.From;
                endDate = settings.To;
            }

            var timeEntryRequest = new GetTimesV1.Request
            {
                Search = settings.Search,
                ChargeCode = settings.chargecode,
                Id = settings.Id,
                ClientId = settings.ClientId,
                StaffId = settings.StaffId,
                StartDate = startDate,
                EndDate = endDate,
                SortBy = settings.SortBy,
                SortDirection = settings.SortDirection,
                Task = settings.Task,
                Activity = settings.Activity
            };

            var result = await _hqService.GetTimeEntriesV1(timeEntryRequest);
            

            if (!result.IsSuccess || result.Value == null)
            {
                ErrorHelper.Display(result);
                return 1;
            }
            
        OutputHelper.Create(result.Value, result.Value.Records)
        .WithColumn("ID", t => t.Id.ToString())
        .WithColumn("DATE", t => t.Date.ToString())
        .WithColumn("CHARGE CODE", t => t.ChargeCode)
        .WithColumn("Billable Hours", t => t.BillableHours.ToString())
        .WithColumn("DESCRIPTION", t => t.Description.Length > 70 ? t.Description.Substring(0, 70) + "..." : t.Description)
        .WithColumn("ACTIVITY / TASK", t => t.ActivityName != null ? t.ActivityName : t.Task)
        .WithColumn("REJECTION NOTES", t => t.RejectionNotes)
        .Output(settings.Output);
            return 0;
        }
    }
    
}
