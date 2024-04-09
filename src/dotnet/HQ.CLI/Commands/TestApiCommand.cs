using HQ.SDK;
using Spectre.Console.Cli;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.CLI.Commands
{
    internal class TestApiCommand : AsyncCommand<HQCommandSettings>
    {
        private readonly TestApiService _testApiService;

        public TestApiCommand(TestApiService testApiService)
        {
            _testApiService = testApiService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, HQCommandSettings settings)
        {
            var response = await _testApiService.GetWeatherForecastAsync();
            Console.WriteLine(response);

            return 0;
        }
    }
}
