# LUNA Forge (superseded — ver `raugustorubens-design/luna-frontend`)

> **Este código foi consolidado no repositório `luna-frontend` como o modo "Forge / Dev Mode" (`/forge`), branch `claude/forge-dev-mode`.** A pasta `forge/` continua aqui como histórico/referência do MVP-01 standalone, mas não é mais o ambiente ativo — não desenvolva aqui. Ver `luna_context/LUNA_CONTEXT.md` §13 para o registro completo da consolidação e a decisão de por que o destino final não foi um repositório `luna-forge` próprio (como esta pasta previa), e sim o `luna-frontend`.

> O LUNA Forge é o primeiro produto da plataforma LUNA construído utilizando a própria arquitetura da LUNA. Toda decisão de implementação demonstra, na prática, que a arquitetura é capaz de sustentar o desenvolvimento dos demais sistemas do ecossistema.

O Forge é o ambiente oficial de engenharia onde a LUNA evolui — o substituto do Cursor para o desenvolvimento do Ecossistema LUNA. Não é um editor de código genérico: é construído com identidade própria, consumindo apenas os contratos públicos que o resto do organismo já expõe (Gateway, Chat/Cognitive Engine).

## ⚠️ Exceção arquitetural temporária — leia antes de mexer

Por decisão consolidada em `ECOSYSTEM_ARCHITECTURE.md` (repositório `Luna-context.md`), **o Forge deveria nascer como repositório próprio, não como pasta do monorepo**. Ele está aqui, dentro de `luna/forge/`, apenas porque a integração deste ambiente com o GitHub não tem permissão para criar repositórios novos no momento em que este MVP-01 foi construído.

Isso é uma exceção registrada, não uma reversão da decisão arquitetural:

- `forge/` tem `package.json` e `pnpm-workspace.yaml` **totalmente independentes** do resto do monorepo — zero import, zero dependência compartilhada de tooling com `apps/frontend` ou qualquer outro workspace.
- Todo o código consome apenas contratos HTTP públicos (Gateway, `/api/chat`) — nunca importa código de `apps/frontend/artifacts/api-server/src/*` diretamente.
- Assim que a criação de repositório estiver disponível, `forge/` deve ser movido para `raugustorubens-design/luna-forge` como um `git filter-repo`/cópia direta — a estrutura já foi desenhada para isso ser mecânico, não uma refatoração.

## Escopo do MVP-01

- **Explorer** — árvore de arquivos, seleção, navegação (via `filesystem.list`/`filesystem.read` do Gateway)
- **Editor** — Monaco Editor, múltiplas abas, destaque de sintaxe, salvar (via `filesystem.write` do Gateway)
- **Chat** — uma janela, conversa só com a LUNA via `POST /api/chat` (nunca com providers diretamente)
- **GitHub** — branches, arquivos, commits, diffs, PRs (via capabilities `github.*` do Gateway); commit e criação de PR reais; merge e review ficam registrados no roadmap (capability ainda não existe no Gateway)
- **Terminal** — execução de comandos local, sem automações, sem agentes
- **Contexto** — painel lendo `LUNA_CONTEXT.md` (sistema atual, órgão atual, MVP atual, branch, último checkpoint, missão atual)

Ver `ROADMAP.md` para tudo que foi deliberadamente **não** implementado nesta etapa, e `ARCHITECTURE.md` para as decisões técnicas (incluindo por que Terminal e leitura de branch local não passam pelo Gateway).

## Rodando localmente

Requer uma instância do backend soberano da LUNA rodando (`apps/frontend/artifacts/api-server`, `pnpm dev`, porta padrão 3001).

```bash
cd forge
pnpm install
pnpm dev:server   # backend local do Forge (terminal + config), porta 4100
pnpm dev:web      # frontend do Forge, porta 5173
```
