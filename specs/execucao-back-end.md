# Plano de execução do back-end

Este plano detalha a execução de [back-end.md](back-end.md). Foi alinhado pelos agentes analista e investigador para orientar a implementação e a revisão do MVP.

## Contrato fechado para a primeira entrega

- `Produto`: `id` inteiro gerado pelo banco; `nome` obrigatório, aparado e com até 120 caracteres; `descricao` opcional com até 2.000 caracteres; `preco` decimal maior que zero e com no máximo duas casas, armazenado como `numeric(18,2)`; `imagemUrl` opcional, URL HTTP(S) absoluta com até 2.048 caracteres; `ativo` inicia como `true`.
- Nomes repetidos são permitidos. Produtos inativos permanecem no banco e nas consultas administrativas.
- `POST` cadastra produto ativo. `PUT` substitui dados editáveis e preserva `ativo`. `PATCH /api/admin/products/{id}/status` recebe `{"ativo": true}` ou `{"ativo": false}`.
- Consultas públicas retornam apenas ativos; detalhe público de produto inativo responde `404`. Listas são ordenadas por `id` crescente, sem paginação no MVP.
- JSON usa camelCase. Entrada inválida responde `400` com `ValidationProblemDetails`; ausência responde `404`; cadastro responde `201` com `Location`; edição e mudança de status respondem `200` com DTO.
- O carrinho fica no navegador nesta entrega. A API não terá endpoints de carrinho, pedido ou pagamento.
- As rotas administrativas não têm autenticação e devem ser usadas apenas localmente para estudo.

## Sequência de trabalho

| Passo | Responsável | Entrega verificável |
| --- | --- | --- |
| 1. Configuração | Desenvolvedor | Conexão PostgreSQL por configuração/ambiente, sem credenciais no repositório; erro claro se ausente; CORS para origem local configurada |
| 2. Persistência | Desenvolvedor | Entidade, `DbContext`, mapeamento e migração inicial; sem `EnsureCreated` |
| 3. Catálogo | Desenvolvedor | `GET /api/products` e `GET /api/products/{id}` com filtro de ativos e `404` |
| 4. Administração | Desenvolvedor | `GET`, `POST`, `PUT` e `PATCH` administrativos conforme o contrato acima |
| 5. Contratos e documentação | Desenvolvedor | DTOs, validação, erros consistentes, OpenAPI e instruções de execução; remoção de `/weatherforecast` |
| 6. Revisão | Tester | Verificação de regras, respostas HTTP, migração e riscos; achados reproduzíveis enviados ao desenvolvedor |
| 7. Correção e nova verificação | Desenvolvedor e tester | Falhas corrigidas e casos afetados verificados novamente |

## Critérios de aceite da revisão

1. Cadastro válido retorna `201` com `Location` e dados persistidos. Nome vazio, preço inválido ou URL inválida retornam `400` com campos identificados.
2. `PUT` persiste nome, descrição, preço e imagem sem mudar `ativo`; `PATCH` muda apenas `ativo`.
3. O catálogo e o detalhe públicos não expõem produtos inativos. A administração lista ativos e inativos.
4. IDs inexistentes retornam `404`. As listas têm ordem estável por `id`.
5. Endpoints e respostas aparecem no OpenAPI; `/weatherforecast` não existe mais.
6. A aplicação não versiona credenciais e documenta como iniciar API e banco.

## Validação disponível neste ambiente

O SDK .NET 10 está instalado. PostgreSQL, Docker, `psql` e `pg_ctl` não foram encontrados no PATH; `dotnet-ef` e os pacotes de design/teste necessários para ferramentas comuns também não estavam disponíveis no cache consultado. Assim, compilação e verificações de regras sem banco podem ocorrer agora. Aplicação da migração, persistência real e fluxos HTTP com PostgreSQL devem ser registrados como **pendentes** até haver um banco acessível. Se a migração for criada manualmente por falta de ferramenta, revisar também o snapshot e não declarar que ela foi aplicada ou validada no banco.

## Resultado da execução e revisão

- A API, a migração inicial e seu snapshot foram implementados. A migração foi escrita manualmente por indisponibilidade de `dotnet-ef` e do pacote EF Design.
- `dotnet build` passou com zero avisos e zero erros.
- A inspeção do OpenAPI confirmou as rotas de produtos e a ausência de `/weatherforecast`.
- O tester verificou respostas `400 ValidationProblemDetails` para corpo JSON malformado ou com tipos inválidos e para valores inválidos de nome, preço e imagem. Dois problemas encontrados na revisão — exposição de stack trace em JSON inválido e aceitação de origem CORS com caminho — foram corrigidos e revalidados.
- **Pendente:** aplicar a migração em PostgreSQL e testar cadastro válido, edição, consultas e persistência após reiniciar a API. Esses critérios de aceite ainda não foram comprovados em banco real.
