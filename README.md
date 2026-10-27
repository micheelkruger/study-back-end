# Aplicativo de estudos

## Estrutura

```text
back-end/
  EstudosApi/   API ASP.NET Core (.NET 10)
front-end/      Aplicação React, TypeScript e Vite
specs/          Planejamento de back-end e front-end
.codex/agents/  Agentes especializados do projeto
```

O código e as configurações da API ficam em `back-end/EstudosApi`. Novas APIs devem ser criadas dentro de `back-end`. A pasta `front-end` é reservada à interface e não deve conter servidores ou endpoints de API.

## Executar pela raiz

É necessário um PostgreSQL acessível. Copie o modelo local e substitua `SUA_SENHA` em `.env.local` pela senha do seu PostgreSQL:

```powershell
Copy-Item .env.example .env.local
```

Depois, em um terminal PowerShell aberto na raiz, aplique a migração na primeira execução de cada banco e inicie a API:

```powershell
.\run.cmd migrate
.\run.cmd backend
```

Em outro terminal PowerShell, também na raiz:

```powershell
.\run.cmd frontend
```

Abra `http://localhost:5173`. O script instala as dependências do front-end com `npm.cmd ci` somente quando `node_modules` ainda não existe. Para parar cada servidor, pressione `Ctrl+C` no terminal correspondente. Nenhum comando exige entrar em `back-end` ou `front-end`.

`.env.local` é ignorado pelo Git e lido pelo `run.cmd` sem ser executado como script. Variáveis de ambiente já definidas no terminal têm prioridade; você também pode configurar `ConnectionStrings__EstudosDb` diretamente no PowerShell. Sem conexão configurada, `run.cmd backend` e `run.cmd migrate` mostram uma instrução. Nunca coloque senhas em `.env.example` ou nos arquivos versionados de `appsettings`. A migração inicial foi escrita manualmente porque `dotnet-ef` e o pacote EF Design não estavam disponíveis na implementação.

## Integração e API

O front-end usa um proxy local do Vite para `/api`, sem exigir CORS. Para uma interface local em outra origem sem proxy, configure também `Cors__AllowedOrigins__0`, por exemplo `http://localhost:5173`. A API aceita apenas origens HTTP(S) locais para CORS. O OpenAPI de desenvolvimento fica em `/openapi/v1.json`.

Os endpoints e regras estão em [specs/back-end.md](specs/back-end.md). O arquivo `back-end/EstudosApi/EstudosApi.http` contém exemplos de chamadas.

As telas de cliente, carrinho e administração estão descritas no [README do front-end](front-end/README.md). Para verificar o código sem trocar de pasta, execute `npm.cmd --prefix front-end test` e `npm.cmd --prefix front-end run build` na raiz.

A administração não possui autenticação, e o projeto ainda não finaliza pedidos ou pagamentos. Use esta versão apenas localmente para estudo.
