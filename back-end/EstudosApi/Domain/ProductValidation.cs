using EstudosApi.Contracts;

namespace EstudosApi.Domain;

public static class ProductValidation
{
    private const decimal MaxPrice = 9999999999999999.99m;

    public static Dictionary<string, string[]> Validate(ProductInput? input)
    {
        var errors = new Dictionary<string, string[]>();
        if (input is null)
        {
            errors["body"] = ["O corpo da requisição é obrigatório."];
            return errors;
        }

        var name = input.Name?.Trim();
        if (string.IsNullOrEmpty(name) || name.Length > 120)
            errors["nome"] = ["Informe um nome de 1 a 120 caracteres."];

        if (input.Description?.Trim().Length > 2000)
            errors["descricao"] = ["A descrição deve ter no máximo 2000 caracteres."];

        if (input.Price is null || input.Price <= 0 || input.Price > MaxPrice ||
            decimal.Round(input.Price.Value, 2) != input.Price.Value)
            errors["preco"] = ["Informe um preço maior que zero, com até 2 casas decimais."];

        var imageUrl = input.ImageUrl?.Trim();
        if (!string.IsNullOrEmpty(imageUrl) &&
            (imageUrl.Length > 2048 ||
             !Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) ||
             (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)))
            errors["imagemUrl"] = ["Informe uma URL HTTP(S) absoluta de até 2048 caracteres."];

        return errors;
    }

    public static void Apply(ProductInput input, Product product)
    {
        product.Name = input.Name!.Trim();
        product.Description = string.IsNullOrWhiteSpace(input.Description) ? null : input.Description.Trim();
        product.Price = input.Price!.Value;
        product.ImageUrl = string.IsNullOrWhiteSpace(input.ImageUrl) ? null : input.ImageUrl.Trim();
    }
}
