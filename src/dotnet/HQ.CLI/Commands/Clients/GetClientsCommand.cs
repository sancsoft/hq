﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using HQ.Abstractions.Clients;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Projects;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.Clients
{
    internal class GetClientsSettings : HQCommandSettings
    {
        [CommandArgument(0, "[id]")]
        public Guid? Id { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }

        [CommandOption("--sort-direction|-D")]
        [DefaultValue(SortDirection.Asc)]
        public SortDirection SortDirection { get; set; }

        [CommandOption("--sort-by|-S")]
        [DefaultValue(GetClientsV1.SortColumn.Name)]
        public GetClientsV1.SortColumn SortBy { get; set; }
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
                Id = settings.Id,
                SortBy = settings.SortBy,
                SortDirection = settings.SortDirection,
            });

            if (!result.IsSuccess || result.Value == null)
            {
                ErrorHelper.Display(result);
                return 1;
            }

            OutputHelper.Create(result.Value, result.Value.Records)
                .WithColumn("ID", t => t.Id.ToString())
                .WithColumn("NAME", t => t.Name)
                .WithColumn("HOURLY RATE", t => t.HourlyRate?.ToString("C"))
                .WithColumn("OFFICIAL NAME", t => t.OfficialName, table: false, wide: true)
                .WithColumn("BILLING EMAIL", t => t.BillingEmail, table: false, wide: true)
                .Output(settings.Output);

            return 0;
        }
    }
}