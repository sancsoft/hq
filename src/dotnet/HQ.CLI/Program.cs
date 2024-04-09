using HQ.CLI;
using HQ.CLI.Commands;
using HQ.SDK;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Spectre.Console;
using Spectre.Console.Cli;
using System.Text.Json;

// Setup data directory
var userProfilePath = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile, Environment.SpecialFolderOption.DoNotVerify);
var dataPath = Environment.GetEnvironmentVariable("HQ_DATA_PATH") ?? Path.Join(userProfilePath, ".sancsoft", "hq");
Directory.CreateDirectory(dataPath);

// Setup services
var services = new ServiceCollection();

// Setup logging
var logLevel = LogLevel.Information;
if(Enum.TryParse<LogLevel>(Environment.GetEnvironmentVariable("HQ_LOG_LEVEL"), true, out LogLevel envLogLevel))
{
    logLevel = envLogLevel;
}

services.AddLogging(c => c.AddConsole().SetMinimumLevel(logLevel));

// Setup configuration
var configJsonPath = Path.Join(dataPath, "config.json");
var config = File.Exists(configJsonPath) ? JsonSerializer.Deserialize<HQConfig>(File.ReadAllText(configJsonPath)) ?? new() : new();
services.AddSingleton(config);

services.AddSingleton<ICommandInterceptor, HQCommandInterceptor>();

var dataProtectionBuilder = services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Join(dataPath, "keys")))
    .SetApplicationName("HQ.CLI");

if (OperatingSystem.IsWindows())
{
    dataProtectionBuilder.ProtectKeysWithDpapi();
}

services.AddSingleton<HQApiMessageHandler>();

services.AddHttpClient<TestApiService>(client =>
{
    client.BaseAddress = config.ApiUrl;
}).AddHttpMessageHandler<HQApiMessageHandler>();

var registrar = new TypeRegistrar(services);
var app = new CommandApp(registrar);
app.Configure(config =>
{
    config.AddCommand<ConfigureCommand>("configure")
        .WithDescription("Configure HQ CLI");

    config.AddCommand<LoginCommand>("login")
        .WithDescription("Login to HQ CLI");

    config.AddCommand<TestApiCommand>("test-api")
        .WithDescription("Test API");
});

var rc = await app.RunAsync(args);

if(rc == 0)
{
    var options = new JsonSerializerOptions()
    {
        WriteIndented = true
    };

    await File.WriteAllTextAsync(configJsonPath, JsonSerializer.Serialize(config, options));
}

return rc;