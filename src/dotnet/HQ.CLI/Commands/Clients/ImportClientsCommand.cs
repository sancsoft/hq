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
        [CommandArgument(0, "<file>")]
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
            Console.WriteLine("{0}: {1}", settings.File.FullName, settings.File.Exists);

            return 0;
            var model = new UpsertClientV1.Request();

            //var Createor = new YAMLEditor<UpsertClientV1.Request>(model, async (value) =>
            //{
            //    return await _hqService.UpsertClientV1(value);
            //});

            // var rc = await Createor.Launch();
            // return rc;
        }
    }
}
