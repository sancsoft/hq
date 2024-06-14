using HQ.SDK;
using System.ComponentModel;
using Spectre.Console;
using Spectre.Console.Cli;
using HQ.Abstractions.Times;



namespace HQ.CLI.Commands.TimeEntries
{
    internal class CreateTimeEntrySettings : HQCommandSettings
    {
        [CommandArgument(0, "<chargeCode>")]
        public required string ChargeCode { get; set; }

        [CommandArgument(1, "<hours>")]
        public decimal BillableHours { get; set; }

        [CommandArgument(2, "<notes>")]
        public required string Notes { get; set; }
        

        [CommandOption("--activity|-a")]
        public string? Activity { get; set; }

        [CommandOption("--task|-t")]
        public string? Task { get; set; }

        [CommandOption("--date|-d")]
        public DateOnly? Date { get; set; }
    }

    internal class CreateTimeEntryCommand : AsyncCommand<CreateTimeEntrySettings>
    {
        private readonly HQServiceV1 _hqService;

        public CreateTimeEntryCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, CreateTimeEntrySettings settings)
        {
            var timeEntryRequest = new UpsertTimeV1.Request() {
                ChargeCode = settings.ChargeCode,
                ActivityName = settings.Activity,
                Notes = settings.Notes,
                Task = settings.Task,
                Date = settings.Date ?? DateOnly.FromDateTime(DateTime.Now),
                BillableHours = settings.BillableHours

            };
            var result = await _hqService.UpsertTimeEntryV1(timeEntryRequest);

            if (!result.IsSuccess || result.Value == null)
            {
                return 1;
            }

            if (result.Value != null)
            {
                AnsiConsole.Write("Time recorded successfully");
            }

            return 0;




        }
    }
}
