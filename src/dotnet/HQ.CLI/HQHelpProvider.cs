using Spectre.Console;
using Spectre.Console.Cli;
using Spectre.Console.Cli.Help;
using Spectre.Console.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HQ.CLI
{
    internal class HQHelpProvider : HelpProvider
    {
        public HQHelpProvider(ICommandAppSettings settings)
            : base(settings)
        {
        }

        public override IEnumerable<IRenderable> GetHeader(ICommandModel model, ICommandInfo? command)
        {
            return new List<IRenderable>
            {
                new FigletText("HQ")
                    .Color(Color.Yellow),
                Text.NewLine,
            };

            // return base.GetHeader(model, command);
        }
    }
}
