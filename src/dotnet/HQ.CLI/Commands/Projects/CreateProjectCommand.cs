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

            var Createor = new YAMLEditor<UpsertProjectV1.Request>(model, async (value) =>
            {
                return await _hqService.UpsertProjectV1(value);
            });

            var rc = await Createor.Launch();
            return rc;
        }
    }
}
