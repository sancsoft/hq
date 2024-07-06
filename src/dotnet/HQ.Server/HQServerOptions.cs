using System.Diagnostics;
using System.Reflection;

namespace HQ.Server;

public class HQServerOptions
{
    public const string Server = nameof(Server);
    public bool HangfireInMemory { get; set; }
    public bool AutoMigrate { get; set; }
}