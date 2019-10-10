using System;
using System.Collections.Generic;
using System.Text;
using HQ.Library.Extensions;

namespace HQ.Utility.Framework
{
    public class PropertyTable : TextTable
    {
        protected int _propertyWidth;
        protected int _valueWidth;

        public PropertyTable(int propertyWidth = 17, int valueWidth = 60)
        {
            _propertyWidth = propertyWidth;
            _valueWidth = valueWidth;
            AddColumn("Property", propertyWidth);
            AddColumn("Value", valueWidth);
        }

        public string PropertyValue(object obj)
        {
            return obj.ToString().Summarize(_valueWidth);
        }

        public string Fill(object obj, List<string> skipProperties = null)
        {
            StringBuilder sb = new StringBuilder();
            foreach (var prop in obj.GetType().GetProperties())
            {
                if (!skipProperties.Contains(prop.Name))
                {
                    sb.AppendLine(string.Format(TableRowFormat(), prop.Name, PropertyValue(prop.GetValue(obj))));
                }
            }
            return sb.ToString();
        }

        public string TableRow(string name, string value)
        {
            return String.Format(TableRowFormat(), name, value);
        }

        public static string Generate(object obj, List<string> skipProperties = null, int propertyWidth = 17, int valueWidth = 60)
        {
            skipProperties ??= new List<string>();
            StringBuilder sb = new StringBuilder();
            PropertyTable propertyTable = new PropertyTable(propertyWidth, valueWidth);
            sb.AppendLine(propertyTable.TableOpen());
            sb.Append(propertyTable.Fill(obj, skipProperties));
            sb.Append(propertyTable.TableClose());
            return sb.ToString();
        }
    }
}
