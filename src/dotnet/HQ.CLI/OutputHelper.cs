using CsvHelper;
using FluentResults;
using Spectre.Console;
using Spectre.Console.Json;
using Spectre.Console.Rendering;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HQ.CLI
{
    public static class OutputHelper
    {
        public static OutputHelper<TJson, TRow> Create<TJson, TRow>(TJson json, IEnumerable<TRow> rows)
            => new OutputHelper<TJson, TRow>(json, rows);
    }

    public class OutputHelper<TJson, TRow>
    {
        private readonly TJson _json;
        private readonly IEnumerable<TRow> _rows;
        private List<(string Name, Func<TRow, string> Render, bool Table, bool CSV, bool Wide)> _columns = new();

        public OutputHelper(TJson json, IEnumerable<TRow> rows)
        {
            _json = json;
            _rows = rows;
        }

        public OutputHelper<TJson, TRow> WithColumn(string name, Func<TRow, string?> render, bool table = true, bool csv = true, bool wide = false)
        {
            _columns.Add((name, (t) => render(t) ?? "<none>", table, csv, wide));
            return this;
        }

        public IRenderable Output(OutputFormat output)
        {
            switch(output)
            {
                case OutputFormat.Table:
                case OutputFormat.Wide:
                    var table = new Table();
                    var columns = _columns.Where(t => (output == OutputFormat.Table && t.Table) || (output == OutputFormat.Wide && (t.Wide || t.Table)));

                    foreach (var column in columns)
                    {
                        table.AddColumn(column.Name, c => c.NoWrap().Padding(3, 0));
                    }

                    foreach (var row in _rows)
                    {
                        table.AddRow(columns.Select(t => new Text(t.Render(row))));
                    }

                    table.Border(TableBorder.None);

                    return table;
                case OutputFormat.CSV:
                    {
                        using var stream = new MemoryStream();
                        using var reader = new StreamReader(stream);
                        using var writer = new StreamWriter(stream);
                        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

                        foreach(var column in _columns.Where(t => t.CSV))
                        {
                            csv.WriteField(column.Name);
                        }

                        csv.NextRecordAsync();

                        foreach (var row in _rows)
                        {
                            foreach (var column in _columns.Where(t => t.CSV))
                            {
                                csv.WriteField(column.Render(row));
                            }
                            
                            csv.NextRecordAsync();
                        }

                        writer.Flush();
                        stream.Position = 0;

                        return new Text(reader.ReadToEnd());
                    }
                case OutputFormat.Json:
                default:
                    var options = new JsonSerializerOptions()
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                        WriteIndented = true
                    };

                    return new JsonText(JsonSerializer.Serialize(_json, options));
            }
        }
    }
}
