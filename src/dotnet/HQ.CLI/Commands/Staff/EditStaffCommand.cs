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
    internal class EditStaffettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }
    }

    internal class EditStaffCommand : AsyncCommand<EditStaffettings>
    {
        private readonly HQServiceV1 _hqService;

        public EditStaffCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, EditStaffettings settings)
        {
            var result = await _hqService.GetStaffV1(new()
            {
                Id = settings.Id,
            });

            if (!result.IsSuccess || result.Value == null)
            {
                ErrorHelper.Display(result);
                return 1;
            }

            var record = result.Value.Records.FirstOrDefault();
            if (record == null)
            {
                return 1;
            }

            var model = new UpsertStaffV1.Request();
            model.Id = record.Id;
            model.Name = record.Name;
            model.WorkHours = record.WorkHours;
            model.VacationHours = record.VacationHours;
            model.Jurisdiciton = record.Jurisdiciton;
            model.StartDate = record.StartDate;
            model.EndDate = record.EndDate;

            var editor = new JsonEditor<UpsertStaffV1.Request>(model, async (value) =>
            {
                value.Id = record.Id;
                return await _hqService.UpsertStaffV1(value);
            });

            var rc = await editor.Launch();
            return rc;
        }
    }
}
