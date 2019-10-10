using System;
using System.Collections.Generic;
using System.Linq;

namespace HQ.Utility.Framework
{
    public class BaseCommand
    {
        public string Name { get; set; }
        public int Level { get; set; }
        public string HelpText { get; set; }
        protected BaseCommand parentCommand;
        protected List<BaseCommand> childCommands;
        protected string[] Parms = new string[] { };

        public BaseCommand()
        {
            Name = "";
            Level = 0;
            childCommands = new List<BaseCommand>();
        }

        protected void AddChildCommand(BaseCommand cmd)
        {
            cmd.parentCommand = this;
            cmd.Level = Level + 1;
            childCommands.Add(cmd);
        }

        public void RecalculateLevels()
        {
            foreach (BaseCommand child in childCommands)
            {
                child.Level = Level + 1;
                child.RecalculateLevels();
            }
        }

        public void Help(string[] args)
        {
            string prefix = "";
            for (int i = 0; i < Level; i++)
            {
                prefix += args[i].ToUpper() + " ";
            }
            foreach (BaseCommand cmd in childCommands)
            {
                Console.WriteLine("{0}{1}: {2}", prefix, cmd.Name.ToUpper(), cmd.HelpText);
            }
        }

        public static bool IsMatch(string cmd, string value)
        {
            return (String.Compare(cmd, value, true) == 0);
        }

        public static bool IsMatch(BaseCommand cmd, string value)
        {
            return IsMatch(cmd.Name, value);
        }

        public string[] Parameters(string[] args)
        {
            return (args.Length > (Level)) ? args.Skip(Level).ToArray() : new string[] { };
        }

        public virtual bool Dispatch(string[] args)
        {
            string targetCmd = (args.Length > Level) ? args[Level] : "";
            if (IsMatch("help", targetCmd) || IsMatch("?", targetCmd))
            {
                Help(args);
                return true;
            }
            foreach (BaseCommand cmd in childCommands)
            {
                if (IsMatch(cmd, targetCmd))
                {
                    return cmd.Dispatch(args);
                }
            }
            Parms = Parameters(args);
            return false;
        }
    }
}
