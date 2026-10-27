# Front-end do e-commerce de estudos

Aplicação React, TypeScript e Vite. As telas de cliente usam o catálogo público da API; a área administrativa usa as rotas de produtos em `back-end/EstudosApi`.

## Pré-requisitos

- Node.js e npm compatíveis com as versões registradas em `package-lock.json`.
- API local em execução com PostgreSQL configurado. Consulte o [README da raiz](../README.md).

## Executar

Na raiz do projeto:

```powershell
.\run.cmd frontend
```

O comando instala dependências na primeira execução, se necessário. Abra `http://localhost:5173`. O Vite encaminha chamadas `/api` para `http://localhost:5147`, dispensando CORS no navegador durante o desenvolvimento. Para outro endereço da API, defina `VITE_API_PROXY_TARGET` no `.env.local` da raiz ou no terminal antes de iniciar o Vite:

```powershell
$env:VITE_API_PROXY_TARGET = 'http://localhost:5147'
.\run.cmd frontend
```

O alvo do proxy deve apontar para uma API de desenvolvimento confiável. Sem a API, as telas mostram erro e opção de tentar novamente. Para produção, será necessário servir o front-end e a API sob a mesma origem ou configurar um proxy equivalente.

## Rotas

| Rota | Função |
| --- | --- |
| `/` | Catálogo público |
| `/products/:id` | Detalhe do produto |
| `/cart` | Carrinho local |
| `/admin/products` | Lista administrativa |
| `/admin/products/new` | Cadastro |
| `/admin/products/:id/edit` | Edição |

O carrinho guarda apenas ID e quantidade no `localStorage`, com limite de 1 a 99 unidades por produto. Ao abri-lo, a interface reconsulta preço e disponibilidade na API. Produto com `404` fica indisponível e sai do total; falha de rede deixa o total não confirmado. Preços acima de R$ 9.999.999,99 não são somados, evitando erro de precisão em JavaScript. Não há checkout nesta versão.

## Verificar

```powershell
npm.cmd --prefix front-end test
npm.cmd --prefix front-end run build
```

O build final fica em `dist/`, que não é versionado. A rota `/admin` não implementa autenticação: execute esta versão apenas em ambiente local de estudo.
