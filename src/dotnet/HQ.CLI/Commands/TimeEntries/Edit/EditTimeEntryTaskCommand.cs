using HQ.Abstractions.Times;
using HQ.SDK;
using Spectre.Console;
using Spectre.Console.Cli;

namespace HQ.CLI.Commands.TimeEntries
{
    internal class EditTimeEntryTaskSettings : HQCommandSettings
    {
        [CommandArgument(0, "<id>")]
        public Guid Id { get; set; }

        [CommandArgument(1, "<task>")]
        public string? Task { get; set; }
    }

    internal class EditTimeEntryTaskCommand : AsyncCommand<EditTimeEntryTaskSettings>
    {
        private readonly HQServiceV1 _hqService;

        public EditTimeEntryTaskCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, EditTimeEntryTaskSettings settings)
        {
            var timeEntryRequest = new UpsertTimeTaskV1.Request()
            {
                Id = settings.Id,
                Task = settings.Task
            };

            var updateResult = await _hqService.UpsertTimeEntryTaskV1(timeEntryRequest);

            if (!updateResult.IsSuccess || updateResult.Value == null)
            {
                ErrorHelper.Display(updateResult);
                return 1;
            }

            if (updateResult.Value != null)
            {
                AnsiConsole.Write("Time updated successfully");
            }

            return 0;
        }
    }
}
