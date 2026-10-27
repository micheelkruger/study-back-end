using EstudosApi.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace EstudosApi.Data.Migrations;

[DbContext(typeof(EstudosDbContext))]
public sealed class EstudosDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
        modelBuilder.HasAnnotation("ProductVersion", "10.0.3")
            .HasAnnotation("Relational:MaxIdentifierLength", 63);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(product => product.Id);
            entity.Property(product => product.Id).HasColumnName("id").ValueGeneratedOnAdd()
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);
            entity.Property(product => product.Name).HasColumnName("name").HasMaxLength(120).IsRequired();
            entity.Property(product => product.Description).HasColumnName("description").HasMaxLength(2000);
            entity.Property(product => product.Price).HasColumnName("price").HasPrecision(18, 2);
            entity.Property(product => product.ImageUrl).HasColumnName("image_url").HasMaxLength(2048);
            entity.Property(product => product.Active).HasColumnName("active").HasDefaultValue(true);
        });
    }
}
