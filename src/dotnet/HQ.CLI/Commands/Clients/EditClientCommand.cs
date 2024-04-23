using FluentResults;
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
    internal class EditClientSettings : HQCommandSettings
    {
        [CommandArgument(0, "<clientIdOrName>")]
        public string? ClientIdOrName { get; set; }
    }

    internal class EditClientCommand : AsyncCommand<EditClientSettings>
    {
        private readonly HQServiceV1 _hqService;

        public EditClientCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, EditClientSettings settings)
        {
            var result = await _hqService.GetClientsV1(new()
            {
                ClientIdOrName = settings.ClientIdOrName,
            });

            if (!result.IsSuccess || result.Value == null)
            {
                return 1;
            }

            var record = result.Value.Records.FirstOrDefault();
            if(record == null)
            {
                return 1;
            }

            var model = new UpsertClientV1.Request();
            model.ClientId = record.ClientId;
            model.Name = record.Name;
            model.OfficialName = record.OfficialName;
            model.BillingEmail = record.BillingEmail;
            model.HourlyRate = record.HourlyRate;

            var editor = new YAMLEditor<UpsertClientV1.Request>(model, async (value) =>
            {
                value.ClientId = record.ClientId;
                return await _hqService.UpsertClientV1(value);
            });

            var rc = await editor.Launch();
            return rc;
        }
    }
}
