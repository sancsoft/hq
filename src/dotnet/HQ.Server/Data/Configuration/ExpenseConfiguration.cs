using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using HQ.Server.Data.Models;

namespace HQ.Server.Data.Configuration;

public class ExpenseConfiguration : BaseConfiguration<Expense>
{
    public override void Configure(EntityTypeBuilder<Expense> builder)
    {
        base.Configure(builder);

        builder.ToTable("expenses");
    }
}