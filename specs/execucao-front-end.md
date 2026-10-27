# Plano de execução do front-end

Este plano detalha [front-end.md](front-end.md) e foi alinhado pelos agentes analista e investigador com a [API existente](back-end.md). O objetivo é entregar as jornadas de cliente e administrador integradas ao back-end local.

## Decisões para o MVP

- Aplicação cliente em React, TypeScript e Vite, dentro de `front-end`.
- Rotas: `/` (catálogo), `/products/:id` (detalhe), `/cart` (carrinho), `/admin/products` (lista), `/admin/products/new` (cadastro) e `/admin/products/:id/edit` (edição). `/admin` pode redirecionar para a lista.
- A API responde com `id`, `nome`, `descricao`, `preco`, `imagemUrl` e `ativo`. `POST` e `PUT` enviam `nome`, `descricao`, `preco` e `imagemUrl`; `PATCH /api/admin/products/{id}/status` envia `{"ativo": boolean}`.
- Erros `400 ValidationProblemDetails` contêm `errors` por campo. Produto público inativo ou ausente retorna `404`; erro de rede ou `5xx` é falha temporária, não indisponibilidade definitiva.
- O navegador guarda somente pares `{produtoId, quantidade}` no `localStorage`, valida os dados recuperados e limita a quantidade a 1–99 por produto como regra de interface, sem representar estoque.
- Preço e disponibilidade são reconsultados na API ao exibir o carrinho. Item com `404` permanece removível e sai do total. Falha de rede ou `5xx` deixa o total em estado desconhecido e oferece nova tentativa.
- Valores são exibidos em reais (`pt-BR`) como suposição do MVP. Calcular subtotais e total em centavos inteiros com verificação de precisão; nunca exibir total potencialmente incorreto para valor fora da faixa segura.
- Mostrar imagem substituta quando `imagemUrl` estiver ausente ou a imagem falhar.
- Sem autenticação, `/admin` é apenas organização visual; o sistema permanece restrito ao ambiente local de estudo.

## Integração local

A API foi observada em `http://localhost:5147` e o PostgreSQL em `localhost:5432`. O preflight CORS vindo de `http://localhost:5173` recebeu `405` na instância atual. Configurar proxy de desenvolvimento do Vite para encaminhar `/api` à API local; a interface deve chamar caminhos relativos `/api/...`. Documentar a URL do alvo para que possa ser ajustada por ambiente. Se o back-end parar, mostrar erro e opção de tentar novamente.

O preço máximo atualmente aceito pela API excede a precisão exata de centavos em JavaScript. Para o MVP, sinalizar preços fora da faixa segura e não somá-los. Uma redução do limite de negócio no back-end para R$ 9.999.999,99 pode ser avaliada em mudança coordenada posterior; não alterar o contrato HTTP durante a implementação da interface sem alinhar os dois lados.

## Sequência de execução

| Passo | Responsável | Entrega verificável |
| --- | --- | --- |
| 1. Base técnica | Desenvolvedor | Projeto React/TS/Vite, navegação, cliente HTTP e proxy `/api` |
| 2. Catálogo e detalhe | Desenvolvedor | Produtos ativos, estados vazio/carregando/erro, detalhe e fallback de imagem |
| 3. Carrinho | Desenvolvedor | Adição, soma de quantidade, alteração, remoção, persistência local, atualização de preço/disponibilidade e total seguro |
| 4. Administração | Desenvolvedor | Lista, cadastro, edição, ativação/desativação e erros de campo da API |
| 5. Integração e documentação | Desenvolvedor | Fluxo real com API, instruções de execução e limitações conhecidas |
| 6. Revisão | Tester | Casos de regra de negócio, estados de erro, navegação, integração e falhas reproduzíveis |
| 7. Correção | Desenvolvedor e tester | Achados corrigidos e revalidados |

## Critérios de aceite

1. O catálogo mostra somente ativos; detalhe inexistente/inativo tem estado de indisponibilidade.
2. Adicionar o mesmo produto soma quantidades até 99; ajustar e remover itens atualiza subtotais e total; o carrinho sobrevive à atualização da página.
3. Produto desativado após entrar no carrinho aparece como indisponível e não entra no total. Falha de rede não é confundida com `404`.
4. O administrador cadastra, edita, ativa e desativa produtos; erros `400` aparecem junto aos campos sem apagar o formulário.
5. Imagem ausente/quebrada tem substituto visual; catálogo vazio e falhas da API apresentam mensagem e ação apropriadas.
6. Interface e API funcionam juntas localmente, com proxy de desenvolvimento e instruções reproduzíveis no README.

## Estratégia de verificação

- Compilação e testes de lógica do carrinho, armazenamento local e cálculos de preço.
- Verificação das jornadas de cliente e administrador no navegador, incluindo atualização da página e navegação direta às rotas.
- Integração com a API real quando ela estiver acessível; registrar qualquer caso não executado por indisponibilidade do serviço.
- Conferir respostas de validação por campo, `404`, rede indisponível, imagem quebrada e `localStorage` corrompido.

## Resultado da implementação e revisão

- A aplicação React/TypeScript/Vite, as telas de cliente e administrador, o carrinho local e o cliente HTTP foram implementados em `front-end`.
- `npm.cmd test` passou com 4 de 4 testes; `npm.cmd run build` passou.
- A API em `localhost:5147` e o proxy Vite em `localhost:5173` retornaram o mesmo catálogo por HTTP. As URLs diretas das páginas responderam pelo servidor de desenvolvimento.
- O tester encontrou estado obsoleto ao trocar entre URLs de produtos/formulários. O desenvolvedor corrigiu a remontagem por rota; o tester revisou a correção e repetiu testes e build.
- **Pendente:** inspeção visual e execução das interações no navegador. O controle do navegador foi encerrado porque não conseguiu identificar com segurança a URL atual do Brave no Windows. As jornadas visuais e o fluxo administrativo completo ainda não foram declarados validados; nenhum produto real foi alterado durante a revisão.
