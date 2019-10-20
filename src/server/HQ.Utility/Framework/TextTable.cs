using System;
using System.Collections.Generic;
using System.Text;

namespace HQ.Utility.Framework
{
    public class TextTable
    {
        public enum TextJustify { Left, Right };

        protected List<TextColumn> _columns;
        protected string _tableHeader;
        protected string _tableRule;
        protected string _tableRowFormat;

        protected class TextColumn
        {
            public string Name { get; set; }
            public int Width { get; set; }
            public string Format { get; set; }
            public TextJustify Justify { get; set; }
            public string CellFormat(int index)
            {
                string cellFormat = String.Format("{{{0},{1}", index, (Justify == TextJustify.Left) ? -Width : Width);
                if (!String.IsNullOrEmpty(Format))
                {
                    cellFormat += ":" + Format;
                }
                cellFormat += "}";
                return cellFormat;
            }
            public string CellRule()
            {
                return new string('-', Width);
            }
            public string CellHeader()
            {
                string headerFormat = "{0," + (-Width).ToString() + "}";
                return String.Format(headerFormat, Name);
            }
        }

        public TextTable()
        {
            _columns = new List<TextColumn>();
            _tableHeader = _tableRule = _tableRowFormat = "";
        }

        public TextTable AddColumn(string name, int width = 15, TextJustify justify = TextJustify.Left, string format = "")
        {
            _columns.Add(new TextColumn() { Name = name, Width = width, Justify = justify, Format = format });
            _tableHeader = _tableRule = _tableRowFormat = "";
            return this;
        }

        public string TableRule()
        {
            if (_tableRule.Length == 0)
            {
                StringBuilder sb = new StringBuilder();
                foreach (TextColumn column in _columns)
                {
                    sb.Append('+');
                    sb.Append(column.CellRule());
                }
                sb.Append('+');
                _tableRule = sb.ToString();
            }
            return _tableRule;
        }

        public string TableHeader()
        {
            if (_tableHeader.Length == 0)
            {
                StringBuilder sb = new StringBuilder();
                foreach (TextColumn column in _columns)
                {
                    sb.Append('|');
                    sb.Append(column.CellHeader());
                }
                sb.Append('|');
                _tableHeader = sb.ToString();
            }
            return _tableHeader;
        }

        public string TableRowFormat()
        {
            if (_tableRowFormat.Length == 0)
            {
                int i = 0;
                foreach (TextColumn column in _columns)
                {
                    _tableRowFormat += "|";
                    _tableRowFormat += column.CellFormat(i);
                    i += 1;
                }
                _tableRowFormat += "|";
            }
            return _tableRowFormat;
        }
        public string TableOpen()
        {
            return TableRule() + "\n" + TableHeader() + "\n" + TableRule();
        }
        public string TableClose()
        {
            return TableRule();
        }
    }
}
