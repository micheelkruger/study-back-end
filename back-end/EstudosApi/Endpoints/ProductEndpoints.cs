using EstudosApi.Contracts;
using EstudosApi.Data;
using EstudosApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace EstudosApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var publicProducts = app.MapGroup("/api/products").WithTags("Products");

        publicProducts.MapGet("", async (EstudosDbContext db, CancellationToken cancellationToken) =>
        {
            var products = await db.Products.AsNoTracking().Where(product => product.Active)
                .OrderBy(product => product.Id).ToListAsync(cancellationToken);
            return Results.Ok(products.Select(ProductResponse.FromProduct));
        }).Produces<IEnumerable<ProductResponse>>();

        publicProducts.MapGet("/{id:int}", async (int id, EstudosDbContext db, CancellationToken cancellationToken) =>
        {
            var product = await db.Products.AsNoTracking()
                .FirstOrDefaultAsync(product => product.Id == id && product.Active, cancellationToken);
            return product is null ? Results.NotFound() : Results.Ok(ProductResponse.FromProduct(product));
        }).Produces<ProductResponse>().Produces(404);

        var adminProducts = app.MapGroup("/api/admin/products").WithTags("Admin products");

        adminProducts.MapGet("", async (EstudosDbContext db, CancellationToken cancellationToken) =>
        {
            var products = await db.Products.AsNoTracking().OrderBy(product => product.Id)
                .ToListAsync(cancellationToken);
            return Results.Ok(products.Select(ProductResponse.FromProduct));
        }).Produces<IEnumerable<ProductResponse>>();

        adminProducts.MapGet("/{id:int}", async (int id, EstudosDbContext db, CancellationToken cancellationToken) =>
        {
            var product = await db.Products.AsNoTracking()
                .FirstOrDefaultAsync(product => product.Id == id, cancellationToken);
            return product is null ? Results.NotFound() : Results.Ok(ProductResponse.FromProduct(product));
        }).Produces<ProductResponse>().Produces(404);

        adminProducts.MapPost("", async (ProductInput? input, EstudosDbContext db, CancellationToken cancellationToken) =>
        {
            var errors = ProductValidation.Validate(input);
            if (errors.Count > 0) return Results.ValidationProblem(errors);

            var product = new Product();
            ProductValidation.Apply(input!, product);
            db.Products.Add(product);
            await db.SaveChangesAsync(cancellationToken);
            return Results.Created($"/api/admin/products/{product.Id}", ProductResponse.FromProduct(product));
        }).Produces<ProductResponse>(201).ProducesValidationProblem();

        adminProducts.MapPut("/{id:int}", async (int id, ProductInput? input, EstudosDbContext db, CancellationToken cancellationToken) =>
        {
            var errors = ProductValidation.Validate(input);
            if (errors.Count > 0) return Results.ValidationProblem(errors);

            var product = await db.Products.FindAsync([id], cancellationToken);
            if (product is null) return Results.NotFound();

            ProductValidation.Apply(input!, product);
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(ProductResponse.FromProduct(product));
        }).Produces<ProductResponse>().ProducesValidationProblem().Produces(404);

        adminProducts.MapPatch("/{id:int}/status", async (int id, ProductStatusInput? input, EstudosDbContext db, CancellationToken cancellationToken) =>
        {
            if (input?.Active is null)
                return Results.ValidationProblem(new Dictionary<string, string[]> { ["ativo"] = ["Informe true ou false."] });

            var product = await db.Products.FindAsync([id], cancellationToken);
            if (product is null) return Results.NotFound();

            product.Active = input.Active.Value;
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(ProductResponse.FromProduct(product));
        }).Produces<ProductResponse>().ProducesValidationProblem().Produces(404);
    }
}
