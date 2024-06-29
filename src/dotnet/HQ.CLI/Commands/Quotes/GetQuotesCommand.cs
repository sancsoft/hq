using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Quotes;
using HQ.Abstractions.Staff;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.Quotes
{
    internal class GetQuotesSettings : HQCommandSettings
    {
        [CommandArgument(0, "[id]")]
        public Guid? Id { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }

        [CommandOption("--sort-direction|-D")]
        [DefaultValue(SortDirection.Desc)]
        public SortDirection SortDirection { get; set; }

        [CommandOption("--sort-by|-S")]
        [DefaultValue(GetQuotesV1.SortColumn.ClientName)]
        public GetQuotesV1.SortColumn SortBy { get; set; }
    }

    internal class GetQuotesCommand : AsyncCommand<GetQuotesSettings>
    {
        private readonly HQServiceV1 _hqService;

        public GetQuotesCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetQuotesSettings settings)
        {
            var result = await _hqService.GetQuotesV1(new()
            {
                Search = settings.Search,
                Id = settings.Id,
                SortBy = settings.SortBy,
                SortDirection = settings.SortDirection
            });

            if (!result.IsSuccess || result.Value == null)
            {
                ErrorHelper.Display(result);
                return 1;
            }

            OutputHelper.Create(result.Value, result.Value.Records)
                .WithColumn("ID", t => t.Id.ToString())
                .WithColumn("DATE", t => t.Date.ToString())
                .WithColumn("QUOTE NUMBER", t => t.QuoteNumber.ToString())
                .WithColumn("CLIENT", t => t.ClientName)
                .WithColumn("STATUS", t => t.Status.ToString())
                .WithColumn("DESCRIPTION", t => t.Description?.ToString(), table: false, wide: true)
                .Output(settings.Output);

            return 0;
        }
    }
}