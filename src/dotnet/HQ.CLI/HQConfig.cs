using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HQ.CLI
{
    internal class HQConfig
    {
        public Uri? ApiUrl { get; set; }
        public Uri? AuthUrl { get; set; }
        public string? RefreshToken { get; set; }
        public string? AccessToken { get; set; }
        public DateTime? AccessTokenExpiresAt { get; set; }
        public bool Insecure { get; set; }
    }
}
