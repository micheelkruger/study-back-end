# Planejamento do front-end — e-commerce de estudos

## Objetivo e estado atual

Construir a interface de um e-commerce simples. O cliente poderá consultar produtos e montar um carrinho; o administrador poderá gerenciar produtos. A interface consumirá exclusivamente a API descrita no [planejamento do back-end](back-end.md).

`front-end` contém agora uma aplicação React, TypeScript e Vite com as telas do MVP, carrinho local e integração à API por proxy de desenvolvimento. Toda API e persistência de produtos ficam em `back-end`. O andamento e os limites da revisão estão em [execucao-front-end.md](execucao-front-end.md).

## Escopo do MVP

### Cliente

- Visualizar o catálogo de produtos ativos.
- Abrir os detalhes de um produto.
- Adicionar um produto ao carrinho.
- Aumentar ou diminuir a quantidade de cada item e remover itens.
- Ver subtotal por item e total estimado.
- Manter o carrinho após atualizar a página, usando armazenamento local do navegador.
- Receber aviso quando um produto do carrinho deixar de estar disponível.

### Administrador

- Visualizar produtos ativos e inativos.
- Cadastrar e editar produtos.
- Ativar e desativar produtos sem apagar seus dados.
- Receber mensagens claras para campos inválidos e falhas da API.

Ficam para etapas futuras: login, pedidos, pagamento, entrega, cupons, avaliações, upload de imagens e sincronização do carrinho entre dispositivos.

> **Limite de segurança:** a rota visual `/admin` não controla permissões. Sem autenticação, qualquer pessoa que alcance a API poderá alterar produtos. Esta versão deve ser usada apenas em ambiente local/de estudo.

## Telas e fluxos

| Área | Tela | Ações principais |
| --- | --- | --- |
| Cliente | Catálogo | Listar ativos, abrir detalhe, adicionar ao carrinho |
| Cliente | Detalhe | Ver informações e adicionar quantidade desejada |
| Cliente | Carrinho | Ajustar quantidade, remover, conferir total e indisponíveis |
| Administrador | Produtos | Listar, acessar cadastro/edição, ativar/desativar |
| Administrador | Formulário | Cadastrar ou editar e mostrar erros de validação |

Cada tela que consulta a API deve tratar carregamento, lista vazia, erro de rede e produto não encontrado.

## Regras do carrinho

1. Guardar localmente apenas `produtoId` e `quantidade`; não persistir nome ou preço como fonte de verdade.
2. Quantidade deve ser um inteiro positivo. Adicionar novamente o mesmo produto soma à quantidade existente.
3. Consultar a API para obter nome, preço e disponibilidade atuais dos produtos do carrinho.
4. Recalcular subtotais e total com os preços atuais. Formatar valores monetários na interface; o back-end os representa como `decimal`.
5. Mostrar produtos removidos ou desativados como indisponíveis, permitir removê-los e não incluí-los no total.
6. Persistir o carrinho após atualização da página no mesmo navegador. Não há checkout no MVP.

## Estrutura proposta

```text
front-end/
  src/
    pages/       # Catálogo, detalhe, carrinho e administração
    components/  # Componentes reutilizáveis
    services/    # Cliente HTTP da API
    cart/        # Estado e persistência local do carrinho
```

Configurar a URL da API por ambiente. A interface não deve conter servidor ou endpoints de API. Usar os contratos de produtos e erros definidos em [back-end.md](back-end.md): consultas públicas em `/api/products` e operações administrativas em `/api/admin/products`.

## Etapas

### 0 — Preparação

- [ ] Escolher a tecnologia do front-end e a ferramenta de build; registrar a decisão.
- [ ] Criar a aplicação em `front-end` e configurar o cliente HTTP.
- [ ] Documentar como iniciar a interface e apontá-la para a API local.

**Aceite:** outro desenvolvedor consegue iniciar a interface seguindo as instruções do repositório.

### 1 — Interface do cliente

- [ ] Implementar catálogo, detalhe e navegação para o carrinho.
- [ ] Implementar carrinho local e cálculo de totais.
- [ ] Consultar a API para atualizar preço e disponibilidade dos itens.
- [ ] Tratar carregamento, vazio, falhas e produto indisponível.

**Aceite:** o cliente seleciona produtos, altera quantidades e mantém o carrinho ao atualizar a página; itens indisponíveis são sinalizados e não compõem o total.

### 2 — Interface administrativa

- [ ] Implementar lista, cadastro e edição de produtos.
- [ ] Implementar ativação/desativação com confirmação visual do resultado.
- [ ] Exibir erros de validação da API junto aos campos correspondentes.

**Aceite:** o administrador gerencia produtos pela interface e as mudanças aparecem corretamente no catálogo do cliente.

### 3 — Integração

- [ ] Executar banco, API e interface juntos.
- [ ] Verificar o fluxo completo: cadastrar, editar, ativar, adicionar ao carrinho, alterar quantidade e desativar.
- [ ] Verificar erros de rede, dados inválidos e atualização da página.
- [ ] Atualizar README com instalação, execução e limitações.

**Aceite:** os fluxos principais funcionam em ambiente local seguindo apenas a documentação do repositório.

## Qualidade

- Testar soma de quantidades, remoção, persistência local, subtotal e total.
- Testar produto indisponível, falhas da API e erros de validação no formulário.
- Verificar manualmente as jornadas de cliente e administrador integradas à API.
- Registrar falhas com reprodução, resultado esperado e observado, e impacto.

## Decisões pendentes

| Decisão | Proposta para o MVP | Quando fechar |
| --- | --- | --- |
| Tecnologia | Aplicação cliente com TypeScript; escolher framework e ferramenta de build | Antes da etapa 0 |
| Imagens | Exibir URL cadastrada; sem upload | Antes da interface administrativa |
| Carrinho | Armazenamento local, sem API de carrinho | Antes da interface do cliente |
| Autenticação | Ausente apenas no ambiente de estudo | Antes de publicar ou compartilhar a interface |

Após o MVP, avaliar autenticação, carrinho persistido no servidor, pedidos e pagamento simulado. Essas funcionalidades exigirão novos contratos com o back-end.
