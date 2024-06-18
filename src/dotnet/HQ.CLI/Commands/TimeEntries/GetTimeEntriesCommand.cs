
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
using System.Security.Claims;

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
        [DefaultValue(HQ.Abstractions.Enumerations.Period.Today)]
        public Period? Period { get; set; }

        [CommandOption("--sort-direction|-D")]
        [DefaultValue(SortDirection.Desc)]
        public SortDirection SortDirection { get; set; }

        [CommandOption("--sort-by|-S")]
        [DefaultValue(GetTimesV1.SortColumn.Date)]
        public GetTimesV1.SortColumn SortBy { get; set; }
    }

    internal class GetTimeEntriesCommand : AsyncCommand<GetTimeEntriesSettings>
    {
        private readonly HQServiceV1 _hqService;
        private readonly HQConfig _hqConfig;

        public GetTimeEntriesCommand(HQServiceV1 hqService, HQConfig hQConfig)
        {
            _hqService = hqService;
            _hqConfig = hQConfig;
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
            settings.StaffId = _hqConfig.StaffId;

            var timeEntryRequest = new GetTimesV1.Request
            {
                Search = settings.Search,
                ChargeCode = settings.chargecode,
                Id = settings.Id,
                ClientId = settings.ClientId,
                StartDate = startDate,
                EndDate = endDate,
                Date = settings.Date,
                SortBy = settings.SortBy,
                SortDirection = settings.SortDirection,
                Task = settings.Task,
                Activity = settings.Activity,
                StaffId = settings.StaffId
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
            .WithColumn("HOURS", t => t.Hours.ToString("0.00"))
            .WithColumn("DESCRIPTION", t => t.Description?.Length > 70 ? t.Description?.Substring(0, 70) + "..." : t.Description)
            .WithColumn("ACTIVITY / TASK", t => t.ActivityName != null ? t.ActivityName : t.Task)
            .Output(settings.Output);
            return 0;
        }
    }

}
