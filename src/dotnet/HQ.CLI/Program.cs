using HQ.CLI;
using HQ.CLI.Commands;
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

    config.AddBranch("get", branch =>
    {
        branch.AddCommand<GetClientsCommand>("client")
            .WithAlias("clients")
            .WithAlias("cl");

        branch.AddCommand<GetStaffCommand>("staff")
            .WithAlias("st");

        branch.AddCommand<GetProjectsCommand>("project")
            .WithAlias("projects")
            .WithAlias("pr");
    });

    config.AddBranch("delete", branch =>
    {
        branch.AddCommand<DeleteClientCommand>("client")
            .WithAlias("clients")
            .WithAlias("cl");

        branch.AddCommand<DeleteStaffCommand>("staff")
            .WithAlias("st");

        branch.AddCommand<DeleteProjectCommand>("project")
            .WithAlias("projects")
            .WithAlias("pr");
    });

    config.AddBranch("edit", branch =>
    {
        branch.AddCommand<EditClientCommand>("client")
            .WithAlias("clients")
            .WithAlias("cl");

        branch.AddCommand<EditStaffCommand>("staff")
            .WithAlias("st");

        branch.AddCommand<EditProjectCommand>("project")
            .WithAlias("projects")
            .WithAlias("pr");
    });

    config.AddBranch("create", branch =>
    {
        branch.AddCommand<CreateClientCommand>("client")
            .WithAlias("clients")
            .WithAlias("cl");

        branch.AddCommand<CreateStaffCommand>("staff")
            .WithAlias("st");

        branch.AddCommand<CreateProjectCommand>("project")
            .WithAlias("projects")
            .WithAlias("pr");
    });

    config.AddBranch("import", branch =>
    {
        branch.AddCommand<ImportClientCommand>("client")
            .WithAlias("clients")
            .WithAlias("cl");

        branch.AddCommand<ImportStaffCommand>("staff")
            .WithAlias("st");

        branch.AddCommand<ImportProjectCommand>("project")
            .WithAlias("projects")
            .WithAlias("pr");
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