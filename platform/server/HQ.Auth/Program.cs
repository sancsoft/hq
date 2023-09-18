using Microsoft.EntityFrameworkCore;
using HQ.Data;
using HQ.Data.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("HQ") ?? throw new InvalidOperationException("Connection string 'HQ' not found.");
builder.Services.AddDbContext<HQDbContext>(options =>
    options.UseNpgsql(connectionString)
        .UseSnakeCaseNamingConvention());

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<User>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddRoles<Role>()
    .AddEntityFrameworkStores<HQDbContext>();

builder.Services.AddAuthentication()
       .AddMicrosoftIdentityWebApp(options =>
       {
           builder.Configuration.Bind("AzureAd", options);
           //options.GetClaimsFromUserInfoEndpoint = true;

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

app.Run();
