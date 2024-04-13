using FluentResults;
using Spectre.Console;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.CLI
{
    internal static class ErrorHelper
    {
        internal static void Display(Result result)
        {
            foreach (var error in result.Errors)
            {
                AnsiConsole.MarkupLine($"[red]- {error.Message}[/]");
            }
        }

        internal static void Display<T>(Result<T> result)
        {
            foreach (var error in result.Errors)
            {
                AnsiConsole.MarkupLine($"[red]- {error.Message}[/]");
            }
        }
    }
}
