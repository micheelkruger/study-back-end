using EstudosApi.Data;
using EstudosApi.Endpoints;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var connectionString = builder.Configuration.GetConnectionString("EstudosDb");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Configure ConnectionStrings:EstudosDb (ou ConnectionStrings__EstudosDb) com a conexão PostgreSQL antes de iniciar a API.");
}

builder.Services.AddDbContext<EstudosDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
foreach (var origin in allowedOrigins)
{
    if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri) ||
        (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
        !uri.IsLoopback ||
        !string.Equals(origin, uri.GetLeftPart(UriPartial.Authority), StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException(
            $"CORS aceita apenas origens HTTP(S) locais no formato esquema://host[:porta], sem caminho. Origem inválida: {origin}");
    }
}

if (allowedOrigins.Length > 0)
{
    builder.Services.AddCors(options => options.AddPolicy("LocalFrontend", policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));
}

var app = builder.Build();

if (args.Contains("--migrate", StringComparer.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<EstudosDbContext>().Database.MigrateAsync();
    Console.WriteLine("Migrações aplicadas.");
    return;
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (BadHttpRequestException exception) when (exception.StatusCode == StatusCodes.Status400BadRequest)
    {
        if (context.Response.HasStarted)
            throw;

        context.Response.Clear();
        await Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["body"] = ["O corpo da requisição contém JSON inválido ou tipos de dados incompatíveis."]
        }).ExecuteAsync(context);
    }
});

app.UseHttpsRedirection();
if (allowedOrigins.Length > 0)
{
    app.UseCors("LocalFrontend");
}

app.MapProductEndpoints();
app.Run();
