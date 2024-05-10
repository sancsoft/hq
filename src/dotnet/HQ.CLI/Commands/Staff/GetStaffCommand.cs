using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Staff;
using HQ.SDK;
using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HQ.CLI.Commands.Staff
{
    internal class GetStaffSettings : HQCommandSettings
    {
        [CommandArgument(0, "[id]")]
        public Guid? Id { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }

        [CommandOption("--jurisdiciton|-j")]
        public Jurisdiciton? Jurisdiciton { get; set; }

        [CommandOption("--sort-direction|-D")]
        [DefaultValue(SortDirection.Asc)]
        public SortDirection SortDirection { get; set; }

        [CommandOption("--sort-by|-S")]
        [DefaultValue(GetStaffV1.SortColumn.Name)]
        public GetStaffV1.SortColumn SortBy { get; set; }
    }

    internal class GetStaffCommand : AsyncCommand<GetStaffSettings>
    {
        private readonly HQServiceV1 _hqService;

        public GetStaffCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetStaffSettings settings)
        {
            var result = await _hqService.GetStaffV1(new()
            {
                Search = settings.Search,
                Id = settings.Id,
                SortBy = settings.SortBy,
                SortDirection = settings.SortDirection,
                Jurisdiciton = settings.Jurisdiciton
            });

            if (!result.IsSuccess || result.Value == null)
            {
                return 1;
            }

            AnsiConsole.Write(OutputHelper.Create(result.Value, result.Value.Records)
                .WithColumn("ID", t => t.Id.ToString())
                .WithColumn("NAME", t => t.Name)
                .WithColumn("WORK HOURS", t => t.WorkHours.ToString())
                .WithColumn("VACATION HOURS", t => t.VacationHours.ToString())
                .WithColumn("JURISDICITON", t => t.Jurisdiciton.ToString(), table: false, wide: true)
                .WithColumn("START DATE", t => t.StartDate?.ToLongDateString(), table: false, wide: true)
                .WithColumn("END DATE", t => t.EndDate?.ToLongDateString(), table: false, wide: true)
                .Output(settings.Output)
            );

            return 0;
        }
    }
}
