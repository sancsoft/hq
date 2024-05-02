using HQ.CLI;
using HQ.CLI.Commands;
using HQ.CLI.Commands.ChargeCodes;
using HQ.CLI.Commands.Clients;
using HQ.CLI.Commands.Projects;
using HQ.CLI.Commands.Staff;
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
var logLevel = LogLevel.None;
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

services.AddHttpClient<HQServiceV1>(client =>
{
    client.BaseAddress = config.ApiUrl;
}).AddHttpMessageHandler<HQApiMessageHandler>();

var registrar = new TypeRegistrar(services);
var app = new CommandApp(registrar);
app.Configure(config =>
{
    config.SetHelpProvider(new HQHelpProvider(config.Settings));

    config.AddCommand<ConfigureCommand>("configure");
    config.AddCommand<LoginCommand>("login");

    config.AddBranch("staff", branch => {
        branch.AddCommand<GetStaffCommand>("list").WithAlias("ls");
        branch.AddCommand<DeleteStaffCommand>("delete").WithAlias("rm");
        branch.AddCommand<EditStaffCommand>("edit");
        branch.AddCommand<CreateStaffCommand>("create");
        branch.AddCommand<ImportStaffCommand>("import");
    });

    config.AddBranch("client", branch => {
        branch.AddCommand<GetClientsCommand>("list").WithAlias("ls");
        branch.AddCommand<DeleteClientCommand>("delete").WithAlias("rm");
        branch.AddCommand<EditClientCommand>("edit");
        branch.AddCommand<CreateClientCommand>("create");
        branch.AddCommand<ImportClientCommand>("import");
    });

    config.AddBranch("project", branch => {
        branch.AddCommand<GetProjectsCommand>("list").WithAlias("ls");
        branch.AddCommand<DeleteProjectCommand>("delete").WithAlias("rm");
        branch.AddCommand<EditProjectCommand>("edit");
        branch.AddCommand<CreateProjectCommand>("create");
        branch.AddCommand<ImportProjectCommand>("import");
    });

    config.AddBranch("code", branch => {
        branch.AddCommand<GetChargeCodesCommand>("list").WithAlias("ls");
    });
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