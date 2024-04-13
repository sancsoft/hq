using CsvHelper;
using FluentResults;
using Microsoft.Extensions.FileProviders;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HQ.CLI
{
    internal class JsonEditor<T>
    {
        private T _source;
        private string _sourceJson;
        private bool _preserveTempFile = false;
        private readonly string _tempFilePath;
        private readonly JsonSerializerOptions _serializerOptions;
        private readonly string _defaultEditor;
        private readonly Func<T, Task<Result>> _validator;

        public JsonEditor(T source, Func<T, Task<Result>> validator)
        {
            _source = source;
            _sourceJson = JsonSerializer.Serialize(source);

            _validator = validator;

            _tempFilePath = Path.Join(Path.GetTempPath(), $"hq-edit-{DateTime.Now.ToString("yyyyMMddTHHmmss")}.jsonc");
            _serializerOptions = new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                ReadCommentHandling = JsonCommentHandling.Skip,
                WriteIndented = true,
                AllowTrailingCommas = true
            };
            
            _defaultEditor = "vi";
            if (OperatingSystem.IsWindows())
            {
                _defaultEditor = "notepad";
            }
        }

        private async Task WriteTempFile(Result? result = null)
        {
            var json = JsonSerializer.Serialize(_source, _serializerOptions);
            var file = new StringBuilder();

            file.AppendLine("// Make changes below. Comments are ignored.");
            file.AppendLine("// If an error occurs when saving, this file will be reopened.");
            
            if(result != null && result.IsFailed)
            {
                file.AppendLine("// Errors:");
                foreach(var error in result.Errors)
                {
                    file.AppendLine("// - " + error.Message);
                }
            }

            file.AppendLine("//");
            file.AppendLine(json);

            await File.WriteAllTextAsync(_tempFilePath, file.ToString());
        }

        public async Task<int> Launch()
        {
            try
            {
                var valid = false;
                var parsed = _source;
                var json = JsonSerializer.Serialize(parsed);
                await WriteTempFile();

                do
                {
                    try
                    {
                        var process = new Process();
                        process.StartInfo.FileName = _defaultEditor;
                        process.StartInfo.UseShellExecute = true;
                        process.StartInfo.Arguments = _tempFilePath;
                        process.Start();
                        process.WaitForExit();

                        var contents = await File.ReadAllTextAsync(_tempFilePath);
                        var source = JsonSerializer.Deserialize<T>(contents, _serializerOptions);
                        if(source == null)
                        {
                            Console.WriteLine("Unable to deserialize.");
                            return 1;
                        }

                        var sourceJson = JsonSerializer.Serialize(source);
                        if (_sourceJson.Equals(sourceJson))
                        {
                            Console.WriteLine("No changed found, exiting.");
                            return 0;
                        }

                        _source = source;
                        _sourceJson = sourceJson;

                        var result = await _validator(_source);
                        valid = result.IsSuccess;

                        if(!valid)
                        {
                            await WriteTempFile(result);
                        }
                    }
                    catch (JsonException ex)
                    {
                        Console.WriteLine(ex.Message);
                        Console.WriteLine();
                        Console.WriteLine("Error parsing file, temporary file is available at {0}", _tempFilePath);
                        _preserveTempFile = true;
                        break;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.ToString());
                    }
                } while (!valid);
            }
            finally
            {
                if(!_preserveTempFile)
                {
                    File.Delete(_tempFilePath);
                }
            }

            return 0;
        }
    }
}
