using HQ.Utility.Framework;

namespace HQ.Utility
{
    public class RootCommand : BaseCommand
    {
        public RootCommand()
        {
            Name = "";
            Level = 0;

            // add the first level of commands to the root command to provide access to dispatching through the
            // command parser using BaseCommand functionality
            AddChildCommand(new CmdCommand());
            AddChildCommand(new ExitCommand());
            AddChildCommand(new PauseCommand());
            AddChildCommand(new QuitCommand());

            // we've built the command tree - configure the levels of the commands 
            // to support parsiing of parameters
            RecalculateLevels();
        }
    }
}
