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
    internal class EditProjectSettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }
    }

    internal class EditProjectCommand : AsyncCommand<EditProjectSettings>
    {
        private readonly HQServiceV1 _hqService;

        public EditProjectCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, EditProjectSettings settings)
        {
            var result = await _hqService.GetProjectsV1(new()
            {
                Id = settings.Id,
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

            var model = new UpsertProjectV1.Request();
            model.Id = record.Id;
            model.ClientId = record.ClientId;
            model.ProjectManagerId = record.ProjectManagerId;
            model.Name = record.Name;
            model.QuoteId = record.QuoteId;
            model.HourlyRate = record.HourlyRate;
            model.BookingHours = record.BookingHours;
            model.BookingPeriod = record.BookingPeriod;
            model.StartDate = record.StartDate;
            model.EndDate = record.EndDate;

            var editor = new YAMLEditor<UpsertProjectV1.Request>(model, async (value) =>
            {
                value.Id = record.Id;
                return await _hqService.UpsertProjectV1(value);
            });

            var rc = await editor.Launch();
            return rc;
        }
    }
}
