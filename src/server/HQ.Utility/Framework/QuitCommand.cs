using System;

namespace HQ.Utility.Framework
{
    public class QuitCommand : BaseCommand
    {
        public QuitCommand()
        {
            Name = "quit";
            HelpText = "Exit the program";
        }

        public override bool Dispatch(string[] args)
        {
            Environment.Exit(0);
            return true;
        }
    }
}
