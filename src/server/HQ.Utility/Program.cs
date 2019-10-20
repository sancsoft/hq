using System;
using HQ.Utility.Framework;

namespace HQ.Utility
{
    class Program
    {
        static void Interactive()
        {
            RootCommand rootCommand = new RootCommand();

            Console.WriteLine("HQ.Utility Command Line:");
            while (true)
            {
                try
                {
                    Console.Write("HQ:> ");
                    string command = Console.ReadLine();
                    if (command == null)
                    {
                        Environment.Exit(0);
                    }
                    string[] commandArgs = CommandParser.Arguments(command);
                    if (commandArgs.Length > 0)
                    {
                        if (!rootCommand.Dispatch(commandArgs))
                        {
                            Console.WriteLine("? Unknown command");
                        }
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine("Exception: " + e.Message);
                }
            }

        }

        static void CommandLine(string[] commandArgs)
        {
            RootCommand rootCommand = new RootCommand();
            if (!rootCommand.Dispatch(commandArgs))
            {
                Console.WriteLine("? Unknown command");
            }
        }

        static void Main(string[] args)
        {
            // process the single command on the command line or use the interactive prompt
            if (args.Length > 0)
            {
                CommandLine(args);
            }
            else
            {
                Interactive();
            }
        }
    }
}
