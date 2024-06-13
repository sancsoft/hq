
using HQ.SDK;
using System.ComponentModel;
using Spectre.Console;
using Spectre.Console.Cli;
using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Times;

namespace HQ.CLI.Commands.TimeEntries
{
    internal class GetTimeEntriesSettings : HQCommandSettings
    {
        [CommandArgument(0, "[id]")]
        public Guid? Id { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }

        [CommandOption("--chargecode|-c")]
        public string? chargecode { get; set; }

        [CommandOption("--client")]
        public Guid? ClientId { get; set; }

        [CommandOption("--staff")]
        public Guid? StaffId { get; set; }

        [CommandOption("--from|-f")]
        public DateOnly? From { get; set; }

        [CommandOption("--to|-t")]
        public DateOnly? To { get; set; }

        [CommandOption("--activity|-a")]
        public string? Activity { get; set; }

        [CommandOption("--task")]
        public string? Task { get; set; }
        [CommandOption("--date")]
        public DateOnly? Date { get; set; }

        [CommandOption("--sort-direction|-D")]
        [DefaultValue(SortDirection.Asc)]
        public SortDirection SortDirection { get; set; }

        [CommandOption("--sort-by|-S")]
        [DefaultValue(GetTimesV1.SortColumn.Date)]
        public GetTimesV1.SortColumn SortBy { get; set; }
    }

    internal class GetTimeEntriesCommand : AsyncCommand<GetTimeEntriesSettings>
    {
        private readonly HQServiceV1 _hqService;
        public GetTimeEntriesCommand(HQServiceV1 hqService)
        {
            _hqService = hqService;
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetTimeEntriesSettings settings)
        {
            var timeEntryRequest = new GetTimesV1.Request() {
                Search = settings.Search,
                ChargeCode = settings.chargecode,
                Id = settings.Id,
                ClientId = settings.ClientId,
                StaffId = settings.StaffId,
                StartDate = settings.From ?? settings.Date,
                EndDate = settings.To,
                SortBy = settings.SortBy,
                SortDirection = settings.SortDirection,
                Task = settings.Task,
                Activity = settings.Activity
            };
            // this part is commented out for testing purposes
            
            // if(settings.Date == null) {
            //     timeEntryRequest.StartDate = DateOnly.FromDateTime(DateTime.Now);
            // }

            var result = await _hqService.GetTimeEntriesV1(timeEntryRequest);
            

            if (!result.IsSuccess || result.Value == null)
            {
                return 1;
            }
            
//             foreach(PropertyDescriptor descriptor in TypeDescriptor.GetProperties(timeEntryRequest))
// {
//     string name = descriptor.Name;
//     object value = descriptor.GetValue(timeEntryRequest);
//     Console.WriteLine("{0}={1}", name, value);
// }
        AnsiConsole.Write(
        OutputHelper.Create(result.Value, result.Value.Records)
        .WithColumn("ID", t => t.Id.ToString())
        .WithColumn("DATE", t => t.Date.ToString())
        .WithColumn("CHARGE CODE", t => t.ChargeCode)
        .WithColumn("Billable Hours", t => t.BillableHours.ToString())
        .WithColumn("DESCRIPTION", t => t.Description.Length > 70 ? t.Description.Substring(0, 70) + "..." : t.Description)
        .WithColumn("ACTIVITY / TASK", t => t.ActivityName != null ? t.ActivityName : t.Task)
        .WithColumn("REJECTION NOTES", t => t.RejectionNotes)
        .Output(settings.Output)
        );

            return 0;
        }
    }
}
