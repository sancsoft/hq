using System;

namespace HQ.Utility.Framework
{
    public class PauseCommand : BaseCommand
    {
        public PauseCommand()
        {
            Name = "pause";
            HelpText = "Wait for a space keypress";
        }

        public override bool Dispatch(string[] args)
        {
            if (base.Dispatch(args)) return true;
            try
            {
                // check to see if a key is available to trip an exception if input is redirected
                bool keyAvailable = Console.KeyAvailable;
                Console.Write("Press any key to continue . . . ");
                Console.ReadKey();
                Console.WriteLine();
            }
            catch
            {
                // handle our pause for redirected input with a shelled out process 
                // kind of a hack, but works until there is a better solution
                var process = System.Diagnostics.Process.Start("cmd.exe", "/C pause");
                process.WaitForExit();
                Console.WriteLine();
            }
            return true;
        }
    }
}
