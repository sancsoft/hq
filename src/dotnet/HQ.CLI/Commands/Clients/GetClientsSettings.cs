using Spectre.Console.Cli;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.CLI.Commands.Clients
{
    internal class GetClientsSettings : HQCommandSettings
    {
        [CommandArgument(0, "[clientId]")]
        public Guid? ClientId { get; set; }

        [CommandOption("--search|-s")]
        public string? Search { get; set; }
    }
}
