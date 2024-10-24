﻿using HQ.Abstractions.Enumerations;
using HQ.Abstractions.Services;
using HQ.Server.Data;
using HQ.Server.Invoices;
using HQ.Server.Services;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace HQ.Server
{
    public static class HQConfigurationExtensions
    {
        public static string BuildConnectionString(this IConfiguration configuration)
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

            return connectionString;
        }
    }
}