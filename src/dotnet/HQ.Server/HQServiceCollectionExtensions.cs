using Hangfire;
using Hangfire.PostgreSql;

using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Services;
using HQ.Email;
using HQ.Server.Data;
using HQ.Server.Data.Models;
using HQ.Server.Invoices;
using HQ.Server.Services;

using Microsoft.AspNetCore.DataProtection;
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
            services.AddScoped<EmailTemplateServiceV1>();
            services.AddScoped<IRazorViewToStringRendererService, RazorViewToStringRendererService>();
            services.AddScoped<EmailMessageService>();
            services.AddScoped<HolidayServiceV1>();

            var connectionString = configuration.BuildConnectionString();
            services.AddHQDbContext(connectionString);
            services.AddDataProtection()
                .SetApplicationName("HQ")
                .PersistKeysToDbContext<HQDbContext>();

            var serverOptions = configuration.GetSection(HQServerOptions.Server).Get<HQServerOptions>() ?? throw new Exception("Error parsing configuration section 'Server'.");
            services.AddOptions<HQServerOptions>()
                .Bind(configuration.GetSection(HQServerOptions.Server))
                .ValidateDataAnnotations()
                .ValidateOnStart();

            if (serverOptions.HangfireInMemory)
            {
                services.AddHangfire(config =>
                    config.UseInMemoryStorage());
            }
            else
            {
                services.AddHangfire(config =>
                    config.UsePostgreSqlStorage(c =>
                    c.UseNpgsqlConnection(connectionString)));
            }

            services.AddHangfireServer();

            services.AddDistributedMemoryCache();

            var emailServiceType = configuration.GetValue<EmailServiceType?>("EmailService") ?? EmailServiceType.Logger;
            switch (emailServiceType)
            {
                case EmailServiceType.Logger:
                    services.AddScoped<IEmailService, LoggerEmailService>();
                    services.AddOptions<LoggerEmailService.Options>()
                        .Bind(configuration.GetSection(LoggerEmailService.Options.LoggerEmail))
                        .ValidateDataAnnotations()
                        .ValidateOnStart();

                    break;
                case EmailServiceType.SMTP:
                    // var emailOptions= new SMTPEmailOptions();
                    // configuration.GetSection("SMTP").Bind(emailOptions);
                    services.AddScoped<IEmailService, SMTPEmailService>();
                    services.AddOptions<SMTPEmailService.Options>()
                        .Bind(configuration.GetSection("SMTP"))
                        .ValidateDataAnnotations()
                        .ValidateOnStart();
                    // TODO: Register scoped service and add configuration options
                    break;
                case EmailServiceType.Mailgun:
                    services.AddHttpClient<IEmailService, MailgunEmailService>();
                    services.AddOptions<MailgunEmailService.Options>()
                        .Bind(configuration.GetSection("Mailgun"))
                        .ValidateDataAnnotations()
                        .ValidateOnStart();

                    // TODO: Register scoped service and add configuration options
                    break;
            }

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

        public static IServiceCollection AddHQDbContext(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<HQDbContext>(options =>
                options.UseNpgsql(connectionString)
                    .UseSnakeCaseNamingConvention());

            return services;
        }
    }
}