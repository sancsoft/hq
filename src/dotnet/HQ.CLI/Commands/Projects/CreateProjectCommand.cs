using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using FluentResults;

using HQ.Abstractions.Projects;
using HQ.SDK;

using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Json;

namespace HQ.CLI.Commands.Projects
{
    internal class CreateProjectSettings : HQCommandSettings
    {
    }

    internal class CreateProjectCommand : AsyncCommand<CreateProjectSettings>
    {
        private readonly HQServiceV1 _hqService;

        public CreateProjectCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, CreateProjectSettings settings)
        {
            var model = new UpsertProjectV1.Request();

            var editor = new JsonEditor<UpsertProjectV1.Request>(model, async (value) =>
            {
                return await _hqService.UpsertProjectV1(value);
            });

            var rc = await editor.Launch();
            return rc;
        }
    }
}