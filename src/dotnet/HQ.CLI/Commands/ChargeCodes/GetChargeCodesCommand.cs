using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using HQ.Abstractions.ChargeCodes;
using HQ.Abstractions.Enumerations;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.ChargeCodes
{
    internal class GetChargeCodesSettings : HQCommandSettings
    {
        [CommandArgument(0, "[id]")]
        public Guid? Id { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }

        [CommandOption("--sort-direction|-D")]
        [DefaultValue(SortDirection.Asc)]
        public SortDirection SortDirection { get; set; }

        [CommandOption("--sort-by|-S")]
        [DefaultValue(GetChargeCodesV1.SortColumn.Code)]
        public GetChargeCodesV1.SortColumn SortBy { get; set; }

        [CommandOption("--active|-a")]
        [DefaultValue(null)]
        public bool? Active { get; set; }

        [CommandOption("--billable|-b")]
        [DefaultValue(null)]
        public bool? Billable { get; set; }
    }

    internal class GetChargeCodesCommand : AsyncCommand<GetChargeCodesSettings>
    {
        private readonly HQServiceV1 _hqService;

        public GetChargeCodesCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetChargeCodesSettings settings)
        {
            var result = await _hqService.GetChargeCodesV1(new()
            {
                Search = settings.Search,
                Id = settings.Id,
                SortBy = settings.SortBy,
                SortDirection = settings.SortDirection,
                Active = settings.Active,
                Billable = settings.Billable,
            });

            if (!result.IsSuccess || result.Value == null)
            {
                ErrorHelper.Display(result);
                return 1;
            }

            OutputHelper.Create(result.Value, result.Value.Records)
                .WithColumn("ID", t => t.Id.ToString())
                .WithColumn("ACTIVITY", t => t.Activity.ToString())
                .WithColumn("CODE", t => t.Code)
                .WithColumn("BILLABLE", t => t.Billable ? "Yes" : "No")
                .WithColumn("ACTIVE", t => t.Active ? "Yes" : "No")
                .WithColumn("PROJECT NAME", t => t.ProjectName)
                .WithColumn("QUOTE NAME", t => t.QuoteName)
                .WithColumn("SERVICE AGREEMENT NAME", t => t.ServiceAgreementName)
                .WithColumn("DESCRIPTION", t => t.Description, table: false, wide: true)
                .Output(settings.Output);

            return 0;
        }
    }
}