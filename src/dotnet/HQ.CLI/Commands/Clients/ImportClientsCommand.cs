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
    internal class ImportClientSettings : HQCommandSettings
    {
        [CommandOption("--file|-f")]
        public FileInfo File { get; set; } = null!;
    }

    internal class ImportClientCommand : AsyncCommand<ImportClientSettings>
    {
        private readonly HQServiceV1 _hqService;

        public ImportClientCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ImportClientSettings settings)
        {
            using var stream = settings.File.Open(FileMode.Open, FileAccess.Read, FileShare.ReadWrite);

            var request = new ImportClientsV1.Request()
            {
                File = stream
            };

            var response = await _hqService.ImportClientsV1(request);

            Console.WriteLine("{0} created, {1} updated", response.Value.Created, response.Value.Updated);

            return 0;
        }
    }
}
