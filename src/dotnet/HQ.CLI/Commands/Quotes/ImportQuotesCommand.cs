using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.Quotes;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.Quotes
{
    internal class ImportQuoteSettings : HQCommandSettings
    {
        [CommandOption("--file|-f")]
        public FileInfo File { get; set; } = null!;
    }

    internal class ImportQuoteCommand : AsyncCommand<ImportQuoteSettings>
    {
        private readonly HQServiceV1 _hqService;

        public ImportQuoteCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ImportQuoteSettings settings)
        {
            using var stream = settings.File.Open(FileMode.Open, FileAccess.Read, FileShare.ReadWrite);

            var request = new ImportQuotesV1.Request()
            {
                File = stream
            };

            var response = await _hqService.ImportQuotesV1(request);
            if (!response.IsSuccess || response.Value == null)
            {
                ErrorHelper.Display(response);
                return 1;
            }

            var result = response.Value!;

            Console.WriteLine("{0} created, {1} updated", result.Created, result.Updated);

            return 0;
        }
    }
}