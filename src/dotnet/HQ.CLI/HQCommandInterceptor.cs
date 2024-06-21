using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Spectre.Console.Cli;

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