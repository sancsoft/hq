using System;
using System.Text;

namespace HQ.Utility.Framework
{
    public class CommandParser
    {
        public static string[] Arguments(string command)
        {
            StringBuilder builder = new StringBuilder();
            char[] parmChars = command.ToCharArray();

            // TODO: refactor to better handle "" for empty parameters, the current solution
            // is a hack but seems to work for our cases

            bool inDoubleQuotes = false;                    // track double quote pairs
            bool handleEmptyQuotes = false;                 // special case "" for empty parameters
            bool inEscape = false;                          // escape the next character
            for (int i = 0; i < parmChars.Length; i++)
            {
                // if we are in an escape sequence, always accept the next character into the arg
                if (inEscape)
                {
                    builder.Append(parmChars[i]);
                    inEscape = false;
                    handleEmptyQuotes = false;
                }
                else
                {
                    switch (parmChars[i])
                    {
                        case '\\':
                            inEscape = true;
                            break;
                        case '"':
                            if (!inDoubleQuotes)
                            {
                                handleEmptyQuotes = true;
                            }
                            else if (handleEmptyQuotes)
                            {
                                builder.Append('\r');
                                handleEmptyQuotes = false;
                            }
                            inDoubleQuotes = !inDoubleQuotes;
                            break;
                        case ' ':
                            if (!inDoubleQuotes)
                            {
                                builder.Append('\n');
                            }
                            else
                            {
                                builder.Append(' ');
                            }
                            handleEmptyQuotes = false;
                            break;
                        default:
                            builder.Append(parmChars[i]);
                            handleEmptyQuotes = false;
                            break;
                    }
                }
            }
            // convert this to a string array by splitting on our newlines, remove empty entries
            string[] args = new string(builder.ToString().ToCharArray()).Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < args.Length; i++)
            {
                if (args[i].Contains("\r"))
                {
                    args[i] = "";
                }
            }
            return args;
        }
    }
}
