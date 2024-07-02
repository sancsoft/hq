using HQ.Server.API;
using HQ.Server.Data;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;

using Npgsql;

using Spectre.Console.Cli;

using Swashbuckle.AspNetCore.Filters;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace HQ.Server.Commands;

public class MigrateCommand : AsyncCommand
{
    public override async Task<int> ExecuteAsync(CommandContext context)
    {
        try
        {
            var args = context.Remaining.Raw.ToArray();
            var builder = WebApplication.CreateBuilder(args);

            builder.Configuration.AddEnvironmentVariables("HQ_");

            // Add services to the container.
            builder.Services.AddHQDbContext(builder.Configuration);

            var app = builder.Build();

            var serviceScopeFactory = app.Services.GetRequiredService<IServiceScopeFactory>();
            await using var scope = serviceScopeFactory.CreateAsyncScope();
            await using var dbContext = scope.ServiceProvider.GetRequiredService<HQDbContext>();

            await dbContext.Database.MigrateAsync();

            return 0;
        }
        catch (Exception ex) when (ex is HostAbortedException && ex.Source == "Microsoft.EntityFrameworkCore.Design") // see https://github.com/dotnet/efcore/issues/29923
        {
            return 0;
        }
    }
}