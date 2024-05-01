using HQ.Server.Data;
using HQ.Server.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HQ.Server
{
    public static class HQServiceCollectionExtensions
    {
        public static IServiceCollection AddHQServices(this IServiceCollection services)
        {
            services.AddScoped<ClientServiceV1>();
            services.AddScoped<StaffServiceV1>();
            services.AddScoped<ProjectServiceV1>();

            return services;
        }

        public static IServiceCollection AddHQDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionStringBuilder = new NpgsqlConnectionStringBuilder(configuration.GetConnectionString("HQ"));

            var dbName = configuration.GetValue<string>("DB_NAME");
            if (!String.IsNullOrEmpty(dbName))
            {
                connectionStringBuilder.Database = dbName;
            }

            var dbHost = configuration.GetValue<string>("DB_HOST");
            if (!String.IsNullOrEmpty(dbHost))
            {
                connectionStringBuilder.Host = dbHost;
            }

            var dbPort = configuration.GetValue<int?>("DB_PORT");
            if (dbPort.HasValue)
            {
                connectionStringBuilder.Port = dbPort.Value;
            }

            var dbUser = configuration.GetValue<string>("DB_USER");
            if (!String.IsNullOrEmpty(dbUser))
            {
                connectionStringBuilder.Username = dbUser;
            }

            var dbPassword = configuration.GetValue<string>("DB_PASSWORD");
            if (!String.IsNullOrEmpty(dbPassword))
            {
                connectionStringBuilder.Password = dbPassword;
            }

            var connectionString = connectionStringBuilder.ConnectionString;
            if (String.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'HQ' not found or constructed from configuration.");
            }

            services.AddDbContext<HQDbContext>(options =>
                options.UseNpgsql(connectionString)
                    .UseSnakeCaseNamingConvention());

            return services;
        }
    }
}
