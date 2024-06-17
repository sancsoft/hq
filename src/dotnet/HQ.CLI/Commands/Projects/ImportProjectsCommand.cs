using FluentResults;
using HQ.Abstractions.Projects;
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

namespace HQ.CLI.Commands.Projects
{
    internal class ImportProjectSettings : HQCommandSettings
    {
        [CommandOption("--file|-f")]
        public FileInfo File { get; set; } = null!;
    }

    internal class ImportProjectCommand : AsyncCommand<ImportProjectSettings>
    {
        private readonly HQServiceV1 _hqService;

        public ImportProjectCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ImportProjectSettings settings)
        {
            using var stream = settings.File.Open(FileMode.Open, FileAccess.Read, FileShare.ReadWrite);

            var request = new ImportProjectsV1.Request()
            {
                File = stream
            };

            var response = await _hqService.ImportProjectsV1(request);
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
