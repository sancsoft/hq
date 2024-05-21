using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Projects;
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

namespace HQ.CLI.Commands.Projects
{
    internal class GetProjectsSettings : HQCommandSettings
    {
        [CommandArgument(0, "[id]")]
        public Guid? Id { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }

        [CommandOption("--sort-direction|-D")]
        [DefaultValue(SortDirection.Asc)]
        public SortDirection SortDirection { get; set; }

        [CommandOption("--sort-by|-S")]
        [DefaultValue(GetProjectsV1.SortColumn.ProjectName)]
        public GetProjectsV1.SortColumn SortBy { get; set; }
    }

    internal class GetProjectsCommand : AsyncCommand<GetProjectsSettings>
    {
        private readonly HQServiceV1 _hqService;

        public GetProjectsCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetProjectsSettings settings)
        {
            var result = await _hqService.GetProjectsV1(new()
            {
                Search = settings.Search,
                Id = settings.Id,
                SortBy = settings.SortBy,
                SortDirection = settings.SortDirection,
            });

            if (!result.IsSuccess || result.Value == null)
            {
                return 1;
            }

            AnsiConsole.Write(OutputHelper.Create(result.Value, result.Value.Records)
                .WithColumn("ID", t => t.Id.ToString())
                .WithColumn("CHARGE CODE", t => t.ChargeCode)
                .WithColumn("PROJECT NUM", t => t.ProjectNumber?.ToString())
                .WithColumn("CLIENT NAME", t => t.ClientName)
                .WithColumn("PROJECT NAME", t => t.Name)
                .WithColumn("PM", t => t.ProjectManagerName)
                .WithColumn("START DATE", t => t.StartDate?.ToLongDateString(), table: false, wide: true)
                .WithColumn("END DATE", t => t.EndDate?.ToLongDateString(), table: false, wide: true)
                .WithColumn("STATUS", t => null, table: false, wide: true)
                .Output(settings.Output)
            );

            return 0;
        }
    }
}
