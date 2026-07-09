# Arquitetura do LUNA Forge — MVP-01

## Princípio central

O Forge nunca acessa banco, memória ou providers diretamente. Toda comunicação com o organismo LUNA ocorre através de contratos HTTP já públicos e testados:

- **Gateway** (`GET /api/gateway/capabilities`, `POST /api/gateway/execute`) — Explorer, Editor e painel GitHub consomem exclusivamente as capabilities já registradas (`filesystem.*`, `github.*`). Nenhuma lógica de acesso a arquivo ou Git é reimplementada no Forge.
- **Cognitive Engine** (`POST /api/chat`) — o painel de Chat conversa só com esse endpoint. O Forge não sabe (e não deve saber) qual provider está atendendo a conversa — essa decisão pertence ao Provider Router, que só existe do lado do backend.
- **Context Hub / LUNA_CONTEXT** — o painel de Contexto lê `LUNA_CONTEXT.md` via a capability `filesystem.read` (quando o working directory é um checkout local de um repo LUNA) ou `github.read_file` (fallback remoto). Não existe hoje um endpoint HTTP dedicado do Context Hub — ver "Lacuna encontrada" abaixo.

## Duas exceções deliberadas, e por quê

### 1. Terminal não passa pelo Gateway

O Gateway não tem (e não deveria ter) uma capability de "executar comando arbitrário" — isso pertenceria a uma categoria de risco completamente diferente das capabilities de leitura/escrita de arquivo e Git que já existem, e criar essa capability só para o Forge usar seria "criar arquitetura para aproveitar", exatamente o que esta etapa proíbe.

O terminal do Forge é servido pelo **próprio backend local do Forge** (`apps/server`), que faz `spawn` de um shell no processo local (a máquina onde o desenvolvedor está rodando o Forge) e transmite stdin/stdout via WebSocket para o `xterm.js` no frontend. Isso não é "acessar diretamente" nenhum órgão do organismo — é uma capacidade própria do ambiente de desenvolvimento, no mesmo sentido em que o terminal do VSCode não passa por nenhuma "API do VSCode".

### 2. Branch local não vem do Gateway

`github.list_branches` retorna branches **remotas** (via API do GitHub), não a branch atualmente ativa no checkout local do desenvolvedor. Para o painel de Contexto mostrar a branch real de trabalho, o backend local do Forge executa `git rev-parse --abbrev-ref HEAD` no diretório de trabalho configurado — mesma categoria de exceção do Terminal: informação puramente local, não uma operação do organismo.

## Lacuna encontrada durante esta etapa

Não existe hoje um endpoint HTTP para o Context Hub (`assembleContext` é uma função interna, chamada só pelo Cognitive Engine). O painel de Contexto do Forge, portanto, não consome o Context Hub formalmente — ele lê `LUNA_CONTEXT.md` diretamente via capability de filesystem/GitHub, e monta a visão localmente. Registrado no roadmap (`ROADMAP.md`, MVP-02) como o gatilho para expor um endpoint real de Context Hub.

## Camadas

```
apps/web     — Vite + React + TypeScript. UI dos 6 painéis do MVP-01.
apps/server  — Express + TypeScript. Terminal (WebSocket + spawn local),
               leitura de branch local, proxy de configuração (URL base
               do Gateway/Chat). Nenhuma lógica de negócio do organismo
               vive aqui — é puramente infraestrutura local do Forge.
```

## Identidade visual

Os tokens de tema (`apps/web/src/theme/tokens.css`) ficam isolados da lógica dos componentes — qualquer refinamento visual futuro (Entregável "identidade desacoplada" do prompt) altera só esse arquivo, nunca os componentes. A paleta reaproveita as cores já usadas no protótipo `luna-frontend` (violeta/ciano sobre fundo escuro) como ponto de partida, não como decisão final.

## Componentes reutilizados (Descobrir → Integrar → Criar)

Copiados de `apps/frontend/artifacts/frontend/src/components/ui/` (biblioteca shadcn/radix órfã, identificada na auditoria do Prompt 1 como não utilizada por nenhuma rota real): `button.tsx`, `tabs.tsx`, `resizable.tsx`, `scroll-area.tsx`, `separator.tsx`. Nenhum componente foi recriado do zero onde já existia um equivalente testado.

## Python — arquitetura preparada, não implementada

Registrado para a MVP-05 (`ROADMAP.md`). Direção arquitetural: o suporte a Python (ambientes virtuais, execução de script, depuração, notebooks) seguiria o mesmo padrão do Terminal — capacidade local do backend do Forge (`apps/server`), não uma capability do Gateway, pelos mesmos motivos de categoria de risco. Um notebook (Jupyter-like) exigiria um contrato de mensagens próprio (kernel protocol), fora do escopo de qualquer decisão tomada nesta etapa.

## Constituição executável

`scripts/constitution-check.mjs` varre todo `apps/web/src` e `apps/server/src` e falha se encontrar:
- tokens `supabase`, `drizzle`, `@supabase/supabase-js`, `pg` (Forge nunca acessa banco diretamente)
- tokens `GroqAdapter`, `ChatGptAdapter`, `ClaudeAdapter`, `GrokAdapter`, `ManusAdapter`, ou chamadas a `api.groq.com`/`api.openai.com`/`api.anthropic.com` (Forge nunca chama provider diretamente)
- qualquer import relativo saindo de `forge/` na direção de `apps/frontend/artifacts/api-server/src/*` (Forge permanece desacoplado dos órgãos internos — toda comunicação é HTTP, nunca import de código)
