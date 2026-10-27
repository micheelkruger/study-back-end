# Planejamento do back-end — e-commerce de estudos

## Objetivo e estado atual

Construir a API de produtos para um e-commerce simples, com operações de consulta para clientes e gerenciamento para administradores. O carrinho da primeira entrega será mantido no navegador, conforme o [planejamento do front-end](front-end.md).

O projeto `back-end/EstudosApi` é uma API ASP.NET Core em .NET 10. A implementação do MVP já contém produto, `DbContext`, migração inicial, endpoints públicos e administrativos, validação e OpenAPI. O endpoint de exemplo `/weatherforecast` foi removido. A migração ainda não foi aplicada nem verificada em PostgreSQL neste ambiente. Toda API deve permanecer em `back-end`.

O andamento e os critérios de revisão estão em [execucao-back-end.md](execucao-back-end.md).

## Escopo do MVP

- Persistir produtos em PostgreSQL.
- Expor catálogo e detalhes de produtos ativos para o cliente.
- Expor listagem, cadastro, edição e ativação/desativação para o administrador.
- Validar entradas e responder erros de forma consistente.
- Documentar os contratos HTTP no OpenAPI.

Ficam para etapas futuras: autenticação, autorização, pedidos, pagamento, entrega, estoque, upload de imagens e carrinho persistido no servidor.

> **Limite de segurança:** sem autenticação, qualquer pessoa com acesso à API poderá chamar os endpoints administrativos. Esta versão deve ser usada apenas em ambiente local/de estudo. Proteger esses endpoints antes de publicar ou compartilhar a API.

## Modelo e regras de negócio

`Produto`:

| Campo | Regra |
| --- | --- |
| `id` | Identificador único gerado pelo servidor |
| `nome` | Obrigatório; definir limite de tamanho na implementação |
| `descricao` | Texto; definir limite de tamanho na implementação |
| `preco` | `decimal`, maior que zero; coluna com precisão explícita |
| `imagemUrl` | Opcional; validar URL quando preenchida |
| `ativo` | Define a visibilidade no catálogo |

Produtos inativos não aparecem nas consultas públicas, mas continuam visíveis ao administrador. Desativar preserva o registro. O front-end recebe preço e disponibilidade atuais da API para exibir o carrinho; o total mostrado na interface não é valor de pedido, pois não há finalização de compra no MVP.

## Estrutura proposta

```text
back-end/
  EstudosApi/
    Program.cs
    Domain/       # Entidades e regras simples
    Data/         # DbContext e migrações
    Contracts/    # DTOs de entrada e saída
    Endpoints/    # Rotas públicas e administrativas
```

Manter uma única API e um único banco nesta etapa. Usar DTOs próprios para entrada e saída; não expor diretamente a entidade do banco. Configurar conexão por ambiente sem versionar segredos. Habilitar CORS apenas para a origem local da interface durante o desenvolvimento.

## Contrato inicial da API

| Método e rota | Uso | Resultado esperado |
| --- | --- | --- |
| `GET /api/products` | Catálogo do cliente | Lista apenas produtos ativos |
| `GET /api/products/{id}` | Detalhe do cliente | Produto ativo ou `404` |
| `GET /api/admin/products` | Lista administrativa | Inclui ativos e inativos |
| `GET /api/admin/products/{id}` | Edição administrativa | Produto encontrado ou `404` |
| `POST /api/admin/products` | Cadastro | Produto criado ou erro de validação |
| `PUT /api/admin/products/{id}` | Edição | Produto atualizado, `404` ou erro de validação |
| `PATCH /api/admin/products/{id}/status` | Ativar/desativar | Estado atualizado ou `404` |

As respostas de erro devem indicar os campos inválidos em formato consistente. Registrar os esquemas e exemplos no OpenAPI. O front-end consumirá esses endpoints conforme [seu planejamento](front-end.md).

## Etapas

### 0 — Preparação

- [ ] Definir a configuração local do PostgreSQL sem versionar segredos.
- [ ] Documentar como iniciar banco e API.
- [ ] Alinhar origem de CORS e URL da API com o front-end.

**Aceite:** outro desenvolvedor consegue iniciar banco e API seguindo as instruções do repositório.

### 1 — Dados e catálogo

- [ ] Criar `Produto`, `DbContext` e primeira migração.
- [ ] Configurar a conexão e dados de exemplo para desenvolvimento.
- [ ] Implementar `GET /api/products` e `GET /api/products/{id}`.
- [ ] Remover `/weatherforecast` do template.
- [ ] Verificar filtro de ativos e respostas `404`.

**Aceite:** produtos persistem no banco; consultas públicas retornam apenas ativos e permitem ver seus detalhes.

### 2 — Administração

- [ ] Implementar listagem, consulta, cadastro, edição e alteração de status.
- [ ] Validar entradas e devolver erros consistentes.
- [ ] Registrar contratos HTTP e conferir o OpenAPI.
- [ ] Testar persistência, validação e comportamento de produtos inativos.

**Aceite:** as operações administrativas funcionam pela API e as alterações persistem após reiniciar a aplicação.

### 3 — Integração

- [ ] Executar banco, API e interface juntos.
- [ ] Verificar cadastro, edição e desativação refletidos no catálogo e no carrinho.
- [ ] Atualizar README com execução, configurações e limitações.

**Aceite:** os fluxos completos funcionam localmente seguindo a documentação do repositório.

## Qualidade

- Testar validação, filtro de ativos, `404` e persistência das operações administrativas.
- Verificar erros de rede e respostas inválidas com a interface.
- Registrar falhas com reprodução, resultado esperado e observado, e impacto.

## Decisões pendentes

| Decisão | Proposta para o MVP | Quando fechar |
| --- | --- | --- |
| Imagens | URL informada no cadastro, sem upload | Antes da etapa 2 |
| Estoque | Não controlar nesta entrega | Antes de implementar pedidos |
| Autenticação | Ausente apenas no ambiente de estudo | Antes de publicar ou compartilhar a API |

Após o MVP, avaliar autenticação e autorização, carrinho no servidor, pedidos, estoque e pagamento simulado. Cada evolução precisa de regras e critérios de aceite próprios.
