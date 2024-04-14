using HQ.Abstractions.Clients;
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

namespace HQ.CLI.Commands.Clients
{
    internal class GetClientsSettings : HQCommandSettings
    {
        [CommandArgument(0, "[clientIdOrName]")]
        public string? ClientIdOrName { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }
    }

    internal class GetClientsCommand : AsyncCommand<GetClientsSettings>
    {
        private readonly HQServiceV1 _hqService;

        public GetClientsCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetClientsSettings settings)
        {
            var result = await _hqService.GetClientsV1(new()
            {
                Search = settings.Search,
                ClientIdOrName = settings.ClientIdOrName,
            });

            if (!result.IsSuccess || result.Value == null)
            {
                return 1;
            }

            AnsiConsole.Write(OutputHelper.Create(result.Value, result.Value.Records)
                .WithColumn("ID", t => t.ClientId.ToString())
                .WithColumn("NAME", t => t.Name)
                .WithColumn("HOURLY RATE", t => t.HourlyRate?.ToString("C"))
                .WithColumn("OFFICIAL NAME", t => t.OfficialName, table: false, wide: true)
                .WithColumn("BILLING EMAIL", t => t.BillingEmail, table: false, wide: true)
                .WithColumn("CREATED", t => t.CreatedAt.ToString("O"), table: false, wide: true)
                .Output(settings.Output)
            );

            return 0;
        }
    }
}
