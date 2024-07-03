using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Services;
using HQ.Server.Data;
using HQ.Server.Invoices;
using HQ.Server.Services;

using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace HQ.Server
{
    public static class HQServiceCollectionExtensions
    {
        public static IServiceCollection AddHQServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<ClientServiceV1>();
            services.AddScoped<StaffServiceV1>();
            services.AddScoped<ProjectServiceV1>();
            services.AddScoped<QuoteServiceV1>();
            services.AddScoped<ChargeCodeServiceV1>();
            services.AddScoped<VoltronServiceV1>();
            services.AddScoped<ProjectStatusReportServiceV1>();
            services.AddScoped<InvoicesServiceV1>();
            services.AddScoped<ServicesAgreementServiceV1>();
            services.AddScoped<TimeEntryServiceV1>();
            services.AddScoped<UserServiceV1>();
            services.AddScoped<HolidayServiceV1>();

            var storageServiceType = configuration.GetValue<StorageService?>("StorageService") ?? StorageService.Database;
            switch (storageServiceType)
            {
                case StorageService.Filesystem:
                    services.AddScoped<IStorageService, FilesystemStorageService>();
                    services.AddOptions<FilesystemStorageService.Options>()
                        .Bind(configuration.GetSection(FilesystemStorageService.Options.FilesystemStorage))
                        .ValidateDataAnnotations()
                        .ValidateOnStart();

                    break;
                default:
                case StorageService.Database:
                    services.AddScoped<IStorageService, DatabaseStorageService>();
                    break;
            }

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

            var sslMode = configuration.GetValue<SslMode?>("DB_SSL_Mode");
            if (sslMode.HasValue)
            {
                connectionStringBuilder.SslMode = sslMode.Value;
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

#if DEBUG
            connectionStringBuilder.IncludeErrorDetail = true;
#endif

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