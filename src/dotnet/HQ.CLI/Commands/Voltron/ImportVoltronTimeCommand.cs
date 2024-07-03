﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.ChargeCodes;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Voltron;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.ChargeCode
{
    internal class ImportVoltronTimeSettings : HQCommandSettings
    {
        [CommandOption("--file|-f")]
        public FileInfo? File { get; set; }

        [CommandOption("--dir|-d")]
        public DirectoryInfo? Directory { get; set; }

        [CommandOption("--from")]
        public DateOnly From { get; set; }

        [CommandOption("--to")]
        public DateOnly To { get; set; }

        [CommandOption("--replace|-r")]
        [DefaultValue(false)]
        public bool Replace { get; set; }

        [CommandOption("--status|-s")]
        [DefaultValue(TimeStatus.Unsubmitted)]
        public TimeStatus Stauts { get; set; }
    }

    internal class ImportVoltronTimeCommand : AsyncCommand<ImportVoltronTimeSettings>
    {
        private readonly HQServiceV1 _hqService;

        public ImportVoltronTimeCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ImportVoltronTimeSettings settings)
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

            Console.WriteLine("Processing {0} files", files.Count);

            var request = new ImportVoltronTimeSheetsV1.Request()
            {
                From = settings.From,
                To = settings.To,
                Replace = settings.Replace,
                Status = settings.Stauts,
                Files = files.Select(t => (t.Name, (Stream)t.OpenRead())).ToList()
            };

            var response = await _hqService.ImportVoltronTimeSheetsV1(request);
            if (!response.IsSuccess || response.Value == null)
            {
                ErrorHelper.Display(response);
                return 1;
            }

            Console.WriteLine("{0} Skipped (Unknown Staff - {1})", response.Value?.SkippedMissingStaff, String.Join(',', response.Value?.UnknownStaff ?? new()));
            Console.WriteLine("{0} Skipped (Unknown Charge Code - {1})", response.Value?.SkippedMissingChargeCode, String.Join(',', response.Value?.UnknownChargeCodes ?? new()));
            Console.WriteLine("{0} Created", response.Value?.TimeCreated);
            Console.WriteLine("{0} Deleted", response.Value?.TimeDeleted);

            return 0;
        }
    }
}