using System.Diagnostics;
using System.Reflection;

namespace HQ
{
    public static class VersionNumber
    {
        private static readonly FileVersionInfo _version = FileVersionInfo.GetVersionInfo(Assembly.GetExecutingAssembly().Location);

        public static string GetVersionNumber()
        {
            return $"v{_version.ProductVersion}";
        }
    }
}
