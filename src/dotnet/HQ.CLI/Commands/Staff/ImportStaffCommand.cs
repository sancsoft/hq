using FluentResults;
using HQ.Abstractions.Staff;
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

namespace HQ.CLI.Commands.Staff
{
    internal class ImportStaffettings : HQCommandSettings
    {
        [CommandOption("--file|-f")]
        public FileInfo File { get; set; } = null!;
    }

    internal class ImportStaffCommand : AsyncCommand<ImportStaffettings>
    {
        private readonly HQServiceV1 _hqService;

        public ImportStaffCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ImportStaffettings settings)
        {
            using var stream = settings.File.Open(FileMode.Open, FileAccess.Read, FileShare.ReadWrite);

            var request = new ImportStaffV1.Request()
            {
                File = stream
            };

            var response = await _hqService.ImportStaffV1(request);
            if(response.IsFailed)
            {
                throw new Exception($"Error importing Staff:\n{String.Join(Environment.NewLine, response.Errors.Select(t => t.Message))}");
            }

            var result = response.Value!;

            Console.WriteLine("{0} created, {1} updated", result.Created, result.Updated);

            return 0;
        }
    }
}
