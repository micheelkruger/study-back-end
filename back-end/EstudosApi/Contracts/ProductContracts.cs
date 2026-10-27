using EstudosApi.Domain;
using System.Text.Json.Serialization;

namespace EstudosApi.Contracts;

public sealed record ProductInput(
    [property: JsonPropertyName("nome")] string? Name,
    [property: JsonPropertyName("descricao")] string? Description,
    [property: JsonPropertyName("preco")] decimal? Price,
    [property: JsonPropertyName("imagemUrl")] string? ImageUrl);

public sealed record ProductStatusInput([property: JsonPropertyName("ativo")] bool? Active);

public sealed record ProductResponse(
    int Id,
    [property: JsonPropertyName("nome")] string Name,
    [property: JsonPropertyName("descricao")] string? Description,
    [property: JsonPropertyName("preco")] decimal Price,
    [property: JsonPropertyName("imagemUrl")] string? ImageUrl,
    [property: JsonPropertyName("ativo")] bool Active)
{
    public static ProductResponse FromProduct(Product product) =>
        new(product.Id, product.Name, product.Description, product.Price, product.ImageUrl, product.Active);
}
