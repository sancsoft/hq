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
    internal class ImportQuotePDFSettings : HQCommandSettings
    {
        [CommandOption("--file|-f")]
        public FileInfo? File { get; set; }

        [CommandOption("--dir|-d")]
        public DirectoryInfo? Directory { get; set; }
    }

    internal class ImportQuotePDF : AsyncCommand<ImportQuotePDFSettings>
    {
        private readonly HQServiceV1 _hqService;

        public ImportQuotePDF(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ImportQuotePDFSettings settings)
        {
            var files = new List<FileInfo>();

            if (settings.File != null)
            {
                files.Add(settings.File);
            }

            if (settings.Directory != null)
            {
                files.AddRange(settings.Directory.GetFiles());
            }

            var getQuotesResult = await _hqService.GetQuotesV1(new());
            if (!getQuotesResult.IsSuccess || getQuotesResult.Value == null)
            {
                ErrorHelper.Display(getQuotesResult);
                return 1;
            }

            var quotes = getQuotesResult.Value.Records.ToDictionary(t => "Q" + t.QuoteNumber, t => t.Id);

            var pdfFiles = files.Where(t => t.Extension.Contains("pdf", StringComparison.InvariantCultureIgnoreCase)).ToList();

            Console.WriteLine("Processing {0} files", pdfFiles.Count);

            await Parallel.ForEachAsync(pdfFiles, async (file, ct) =>
            {
                var filename = Path.GetFileNameWithoutExtension(file.Name).ToUpper();
                if (!quotes.ContainsKey(filename))
                {
                    Console.WriteLine("Unable to find quote for file {0}", file.Name);
                    return;
                }

                var request = new UploadQuotePDFV1.Request()
                {
                    Id = quotes[filename],
                    File = file.OpenRead(),
                    ContentType = "application/pdf"
                };

                await Task.Delay(10);

                var uploadPDFResponse = await _hqService.UploadQuotePDFV1(request);
                if (!uploadPDFResponse.IsSuccess)
                {
                    ErrorHelper.Display(uploadPDFResponse);
                }
            });

            return 0;
        }
    }
}