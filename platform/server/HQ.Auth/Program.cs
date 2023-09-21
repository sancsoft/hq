using Microsoft.EntityFrameworkCore;
using HQ.Data;
using HQ.Data.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Identity.Web;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("HQ") ?? throw new InvalidOperationException("Connection string 'HQ' not found.");
builder.Services.AddDbContext<HQDbContext>(options =>
{
    options.UseNpgsql(connectionString)
        .UseSnakeCaseNamingConvention();

    options.UseOpenIddict<OpenIddictApplication, OpenIddictAuthorization, OpenIddictScope, OpenIddictToken, Guid>();
});

builder.Services.AddOpenIddict()
    // Register the OpenIddict core components.
    .AddCore(options =>
    {
        // Configure OpenIddict to use the Entity Framework Core stores and models.
        // Note: call ReplaceDefaultEntities() to replace the default entities.
        options.UseEntityFrameworkCore()
            .UseDbContext<HQDbContext>()
            .ReplaceDefaultEntities<OpenIddictApplication, OpenIddictAuthorization, OpenIddictScope, OpenIddictToken, Guid>();
    })

    // Register the OpenIddict server components.
    .AddServer(options =>
    {
        // Enable the token endpoint.
        options.SetAuthorizationEndpointUris("connect/authorize")
               .SetTokenEndpointUris("connect/token");

        // Enable the client credentials flow.
        options.AllowClientCredentialsFlow();
        options.AllowAuthorizationCodeFlow();

        options.DisableAccessTokenEncryption();

        // Register the signing and encryption credentials.
        options.AddDevelopmentEncryptionCertificate()
            .AddDevelopmentSigningCertificate();

        // Register the ASP.NET Core host and configure the ASP.NET Core options.
        options.UseAspNetCore()
            .EnableTokenEndpointPassthrough()
            .EnableAuthorizationEndpointPassthrough();
    })

    // Register the OpenIddict validation components.
    .AddValidation(options =>
    {
        // Import the configuration from the local OpenIddict server instance.
        options.UseLocalServer();

        // Register the ASP.NET Core host.
        options.UseAspNetCore();
    });

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<User>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddRoles<Role>()
    .AddEntityFrameworkStores<HQDbContext>();

builder.Services.AddAuthentication()
       .AddMicrosoftIdentityWebApp(options =>
       {
           builder.Configuration.Bind("AzureAd", options);
           options.GetClaimsFromUserInfoEndpoint = true;

           //options.ResponseType = "code";

           //options.SignInScheme = IdentityConstants.ExternalScheme;

           options.Scope.Add("email");
       }, cookieScheme: null, displayName: "Azure AD");


builder.Services.AddDataProtection()
    .PersistKeysToDbContext<HQDbContext>()
    .SetApplicationName("HQ");

builder.Services.Configure<RouteOptions>(option =>
{
    option.LowercaseUrls = true;
});

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

using var scope = app.Services.CreateScope();
var manager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();

if (await manager.FindByClientIdAsync("console") is null)
{
    await manager.CreateAsync(new OpenIddictApplicationDescriptor
    {
        ClientId = "console",
        ClientSecret = "388D45FA-B36B-4988-BA59-B187D329C207",
        DisplayName = "My client application",
        Permissions =
        {
            Permissions.Endpoints.Token,
            Permissions.GrantTypes.ClientCredentials,
            Permissions.GrantTypes.RefreshToken,
            Permissions.ResponseTypes.IdTokenToken
        }
    });
}

app.Run();
