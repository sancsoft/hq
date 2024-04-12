using Spectre.Console.Cli;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.CLI
{
    public class HQCommandSettings : CommandSettings
    {
        [DefaultValue(OutputFormat.Table)]
        [CommandOption("-o|--output <OUTPUT>")]
        public OutputFormat Output { get; set; }
    }
}
