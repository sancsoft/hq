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
using CsvHelper.Configuration;
using System.Text.Json.Serialization;

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
        private List<(string Name, Func<TRow, string?> Render, bool Table, bool CSV, bool Wide)> _columns = new();
        private Type? _csvClassMap;

        public OutputHelper(TJson json, IEnumerable<TRow> rows)
        {
            _json = json;
            _rows = rows;
        }

        public OutputHelper<TJson, TRow> WithColumn(string name, Func<TRow, string?> render, bool table = true, bool csv = true, bool wide = false)
        {
            _columns.Add((name, (t) => render(t), table, csv, wide));
            return this;
        }

        public OutputHelper<TJson, TRow> WithCSVClassMap<TMap>()
            where TMap : ClassMap<TRow>
        {
            _csvClassMap = typeof(TMap);
            return this;
        }

        public void Output(OutputFormat output)
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
                        table.AddRow(columns.Select(t => new Text(t.Render(row) ?? "<none>")));
                    }

                    table.Border(TableBorder.None);
                    AnsiConsole.Write(table);
                    break;
                case OutputFormat.CSV:
                    {
                        using var stream = new MemoryStream();
                        using var reader = new StreamReader(stream);
                        using var writer = new StreamWriter(stream);
                        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

                        if(_csvClassMap != null)
                        {
                            csv.Context.RegisterClassMap(_csvClassMap);
                        }

                        csv.WriteHeader<TRow>();

                        csv.NextRecord();
                        
                        if(_rows.Any())
                        {
                            csv.WriteRecords(_rows);
                        }

                        csv.Flush();
                        stream.Position = 0;

                        Console.WriteLine(reader.ReadToEnd());
                        break;
                    }
                case OutputFormat.Json:
                default:
                    var options = new JsonSerializerOptions()
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                        WriteIndented = true,
                        Converters =
                        {
                            new JsonStringEnumConverter()
                        }
                    };

                    Console.WriteLine(JsonSerializer.Serialize(_json, options));
                    break;
            }
        }
    }
}
