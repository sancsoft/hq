using Spectre.Console.Cli;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.CLI;

internal class HQCommandInterceptor : ICommandInterceptor
{
    public void Intercept(CommandContext context, CommandSettings settings)
    {
        if (settings is HQCommandSettings hqSettings)
        {
        }
    }
}
