using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.Staff;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.Staff
{
    internal class CreateStaffSettings : HQCommandSettings
    {
    }

    internal class CreateStaffCommand : AsyncCommand<CreateStaffSettings>
    {
        private readonly HQServiceV1 _hqService;

        public CreateStaffCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        protected override async Task<int> ExecuteAsync(CommandContext context, CreateStaffSettings settings, CancellationToken cancellationToken = default)
        {
            var model = new UpsertStaffV1.Request();

            var editor = new JsonEditor<UpsertStaffV1.Request>(model, async (value) =>
            {
                return await _hqService.UpsertStaffV1(value);
            });

            var rc = await editor.Launch();
            return rc;
        }
    }
}