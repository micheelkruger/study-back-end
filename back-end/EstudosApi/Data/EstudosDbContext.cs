using EstudosApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace EstudosApi.Data;

public sealed class EstudosDbContext(DbContextOptions<EstudosDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(product => product.Id);
            entity.Property(product => product.Id).HasColumnName("id").ValueGeneratedOnAdd();
            entity.Property(product => product.Name).HasColumnName("name").HasMaxLength(120).IsRequired();
            entity.Property(product => product.Description).HasColumnName("description").HasMaxLength(2000);
            entity.Property(product => product.Price).HasColumnName("price").HasPrecision(18, 2);
            entity.Property(product => product.ImageUrl).HasColumnName("image_url").HasMaxLength(2048);
            entity.Property(product => product.Active).HasColumnName("active").HasDefaultValue(true);
        });
    }
}
