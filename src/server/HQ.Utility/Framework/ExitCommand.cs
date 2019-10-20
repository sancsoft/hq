namespace HQ.Utility.Framework
{
    public class ExitCommand : QuitCommand
    {
        public ExitCommand()
        {
            Name = "exit";
            HelpText = "Exit the program";
        }
    }
}
