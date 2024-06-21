using System.Diagnostics;

using IdentityModel.Client;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using Spectre.Console;
using Spectre.Console.Cli;

using static IdentityModel.OidcConstants;

namespace HQ.CLI.Commands;

internal class LoginSettings : HQCommandSettings
{
}

internal class LoginCommand : AsyncCommand<LoginSettings>
{
    private readonly ILogger<LoginCommand> _logger;
    private readonly HQConfig _config;
    private readonly IDataProtectionProvider _dataProtectionProvider;
    private readonly HttpClient _httpClient;

    public LoginCommand(ILogger<LoginCommand> logger, HQConfig config, IDataProtectionProvider dataProtectionProvider, HttpClient httpClient)
    {
        _logger = logger;
        _config = config;
        _dataProtectionProvider = dataProtectionProvider;
        _httpClient = httpClient;
    }

    public override async Task<int> ExecuteAsync(CommandContext context, LoginSettings settings)
    {
        if (String.IsNullOrEmpty(_config.AuthUrl?.AbsoluteUri))
        {
            AnsiConsole.MarkupLine("[red]Invalid Auth URL[/]");
            return 1;
        }

        var request = new DiscoveryDocumentRequest();
        request.Address = _config.AuthUrl.AbsoluteUri;

        if (_config.Insecure)
        {
            request.Policy.RequireHttps = false;
            request.Policy.ValidateIssuerName = false;
            request.Policy.ValidateEndpoints = false;
        }

        var disco = await _httpClient.GetDiscoveryDocumentAsync(request);
        if (disco.IsError) throw new Exception(disco.Error);

        var authorizeResponse = await _httpClient.RequestDeviceAuthorizationAsync(new DeviceAuthorizationRequest
        {
            Address = disco.DeviceAuthorizationEndpoint,
            ClientId = "hq",
            Scope = "openid profile email offline_access"
        });
        if (authorizeResponse.IsError) throw new Exception(authorizeResponse.Error);

        AnsiConsole.MarkupLineInterpolated($@"Attempting to automatically open the login page in your default browser.
If the browser does not open or you wish to use a different device to authorize this request, open the following URL:

[link]{authorizeResponse.VerificationUri}[/]

Then enter the code:

{authorizeResponse.UserCode}");

        try
        {
            Process launchBrowserProcess = new Process();
            launchBrowserProcess.StartInfo.UseShellExecute = true;
            launchBrowserProcess.StartInfo.FileName = authorizeResponse.VerificationUriComplete;
            launchBrowserProcess.Start();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Unable to launch browser.");
        }

        var interval = TimeSpan.FromSeconds(authorizeResponse.Interval);
        var expiresIn = authorizeResponse.ExpiresIn;
        DateTime? expiresAt = null;
        if (expiresIn.HasValue)
        {
            expiresAt = DateTime.UtcNow.AddSeconds(expiresIn.Value);
        }

        IdentityModel.Client.TokenResponse? response = null;
        do
        {
            response = await _httpClient.RequestDeviceTokenAsync(new DeviceTokenRequest
            {
                Address = disco.TokenEndpoint,
                ClientId = "hq",
                DeviceCode = authorizeResponse.DeviceCode!
            });

            // Console.WriteLine(response.Raw);

            if (response.Error == "slow_down")
            {
                // Console.WriteLine("Got a slow down!");
                interval += TimeSpan.FromSeconds(5);
            }

            // Console.WriteLine("Waiting for response...");
            await Task.Delay(interval);
        }
        while (response.Error == "authorization_pending" || response.Error == "slow_down");
        if (response.IsError) throw new Exception(response.Error);

        var protector = _dataProtectionProvider.CreateProtector("HQ.CLI");

        _config.RefreshToken = !String.IsNullOrEmpty(response.RefreshToken) ? protector.Protect(response.RefreshToken) : null;
        _config.AccessToken = !String.IsNullOrEmpty(response.AccessToken) ? protector.Protect(response.AccessToken) : null; ;
        _config.AccessTokenExpiresAt = DateTime.UtcNow.AddSeconds(response.ExpiresIn);

        var userInfoResponse = await _httpClient.GetUserInfoAsync(new UserInfoRequest()
        {
            Address = disco.UserInfoEndpoint,
            Token = response.AccessToken
        });

        if (userInfoResponse.IsError) throw new Exception(userInfoResponse.Error);

        if (Guid.TryParse(userInfoResponse.Claims.SingleOrDefault(t => t.Type == "staff_id")?.Value, out Guid staffId))
        {
            _config.StaffId = staffId;
        }
        else
        {
            _config.StaffId = null;
        }

        AnsiConsole.MarkupLine("[green]Authentication successful![/]");

        return 0;
    }
}