# Diagnóstico Arquitetural — LUNA Gateway

Data: 2026-07-07
Fase: 1 — Diagnóstico + proposta incremental de Fase 2, sem implementação de runtime

## 1. Escopo e método

Este diagnóstico responde à pergunta: **qual é o melhor local dentro do monorepo `luna` para implementar o LUNA Gateway?**

A análise preserva os princípios soberanos vigentes:

- não criar runtime paralelo;
- validar o runtime real antes de refatorar;
- consolidar antes de expandir;
- integrar antes de criar;
- providers não são cognição;
- memória não é histórico bruto.

### 1.1 Evidências consultadas

- `AGENTS.md`, que declara o backend soberano em `apps/frontend/artifacts/api-server`, o frontend soberano em `apps/frontend/artifacts/frontend`, o núcleo cognitivo em `apps/frontend/artifacts/api-server/src/luna` e o contrato oficial em `apps/frontend/lib/api-spec/openapi.yaml`.
- `luna_context/CURRENT_LONGITUDINAL_RUNTIME_AUDIT.md`, usado como diagnóstico Reporter/audit existente do ecossistema.
- `apps/frontend/artifacts/api-server/src/app.ts`, `src/routes/*`, `src/luna/*` e `src/lib/supabase.ts`, que materializam o runtime TS soberano.
- `apps/frontend/lib/api-spec/openapi.yaml`, `apps/frontend/lib/api-zod` e `apps/frontend/lib/db`, que materializam a arquitetura contract-driven.
- `apps/api/*` e `apps/core/*`, considerados apenas para classificação e risco de duplicação, pois não são o runtime CORE.

### 1.2 Execução do Luna Reporter

Não foi encontrado um comando executável, script de package ou capability formal chamado `Luna Reporter` no monorepo. A evidência mais próxima é o relatório longitudinal existente em `luna_context/CURRENT_LONGITUDINAL_RUNTIME_AUDIT.md`, que declara ter auditado o runtime soberano e o frontend soberano.

Lacuna documentada: o Reporter existe conceitualmente como órgão de observabilidade, mas não há, no estado atual do repositório, uma interface executável padronizada para produzir snapshots sob demanda. A evolução correta é criar/explicitar uma capability de observabilidade, por exemplo `reporter.snapshot` e `reporter.audit`, consumida pelo Gateway, sem mover observabilidade para dentro do Gateway.

## 2. Mapa arquitetural atualizado

```text
luna/
├── AGENTS.md                                      # Constituição operacional do runtime soberano
├── luna_context/                                  # Memória arquitetural e auditoria longitudinal
├── docs/                                          # Documentação e checkpoints
├── apps/frontend/
│   ├── lib/api-spec/openapi.yaml                  # Source of truth contratual
│   ├── lib/api-zod/                               # Schemas gerados/validação
│   ├── lib/api-client-react/                      # Cliente gerado
│   ├── lib/db/                                    # Drizzle schema e acesso Postgres/Supabase
│   └── artifacts/
│       ├── api-server/                            # Backend soberano CORE
│       │   ├── src/app.ts                         # Express app, middleware e montagem de /api
│       │   ├── src/routes/                        # Rotas HTTP atuais
│       │   ├── src/luna/                          # Núcleo cognitivo: pipeline/memory/context/provider
│       │   └── src/lib/                           # Logger e Supabase client
│       └── frontend/                              # Frontend soberano
├── apps/api/                                      # Adapter/legacy, não CORE
└── apps/core/                                     # Experimental, não CORE
```

## 3. Responsabilidades atuais

| Componente | Responsabilidade observada | Classificação arquitetural |
| --- | --- | --- |
| `apps/frontend/artifacts/api-server` | Runtime HTTP TS, chat, pipeline LUNA, Supabase, provider Groq | CORE / backend soberano |
| `apps/frontend/artifacts/api-server/src/luna` | Recuperar memória, construir contexto, rotear provider, persistir interação | Núcleo cognitivo atual |
| `apps/frontend/artifacts/api-server/src/routes` | Adaptar HTTP para capacidades já existentes do runtime | Camada de entrada atual |
| `apps/frontend/lib/api-spec/openapi.yaml` | Contrato oficial OpenAPI 3.1 | Source of truth |
| `apps/frontend/lib/api-zod` | Validação derivada do contrato | Camada compartilhada de contrato |
| `apps/frontend/lib/db` | Drizzle schema/acesso relacional | Componente compartilhado de persistência |
| `apps/frontend/artifacts/frontend` | UX soberana DEV/MEET | Frontend soberano |
| `luna_context/CURRENT_LONGITUDINAL_RUNTIME_AUDIT.md` | Observabilidade longitudinal/documental | Reporter/audit existente, não executável |
| `apps/api/main.py` | Runtime Python adapter | ADAPTER |
| `apps/api/server.js` | Runtime Node legado | LEGACY |
| `apps/core/main.py` | Runtime experimental | EXPERIMENTAL |

## 4. Dependências e integrações atuais

### 4.1 Dependências do backend soberano

O backend soberano usa:

- Express 5 para HTTP;
- `pino`/`pino-http` para logs básicos;
- `@supabase/supabase-js` para memória `memoria_luna`;
- Drizzle e `@workspace/db` para conversas/mensagens;
- `@workspace/api-zod` para validação de payloads;
- Groq via `fetch` em `ProviderRouter`.

### 4.2 Integrações externas observadas

- **Supabase**: usado em `src/lib/supabase.ts` e `src/luna/memory.ts`; é a memória oficial, mas a recuperação atual ainda é rasa e ordenada por data.
- **Groq**: usado como provider de geração no runtime soberano; deve permanecer fora do Gateway, pois providers não são cognição e o Gateway não contém IA.
- **Railway**: aparece como dependência operacional/deploy e como endpoint externo de dashboard no audit; isso é risco de acoplamento e deve ser consolidado no backend soberano.
- **GitHub e n8n**: fazem parte do ecossistema declarado, mas não há capability layer formal no runtime CORE.
- **Reporter**: existe como evidência documental/audit, mas não como órgão executável com contrato estável.

## 5. Diagnóstico do problema arquitetural

A decisão “GPT Actions foi abandonado” muda o eixo de propriedade das capacidades: capacidades não pertencem ao modelo de IA, pertencem à LUNA. Logo, o Gateway deve ser uma fronteira orgânica entre IAs autorizadas e capacidades do organismo.

Isso impõe cinco restrições:

1. O Gateway deve estar no runtime soberano, porque qualquer runtime paralelo fragmentaria autenticação, auditoria e contexto.
2. O Gateway não deve residir dentro de `src/luna` como cognição, porque ele executa acesso e capacidades, não raciocínio.
3. O Gateway deve usar o contrato oficial OpenAPI/Zod, porque a arquitetura já é contract-driven.
4. O Gateway deve integrar o Reporter, mas não absorver observabilidade; Reporter observa, Gateway executa.
5. O Gateway deve persistir auditoria/contexto na memória oficial, sem transformar memória em histórico bruto.

## 6. Melhor local para o LUNA Gateway

**Recomendação baseada em evidências:** implementar o LUNA Gateway dentro de `apps/frontend/artifacts/api-server`, como um órgão de runtime ao lado de `src/luna`, preferencialmente em:

```text
apps/frontend/artifacts/api-server/src/gateway/
```

com montagem HTTP em:

```text
apps/frontend/artifacts/api-server/src/routes/gateway.ts
```

ou, se a equipe preferir nomenclatura orgânica explícita:

```text
apps/frontend/artifacts/api-server/src/organs/gateway/
```

A recomendação primária é `src/gateway/` por ser direta, curta e compatível com a estrutura atual (`src/luna`, `src/routes`, `src/lib`).

### 6.1 Por que não criar `apps/gateway`?

Criar `apps/gateway` produziria um runtime paralelo. Isso violaria a regra soberana “nunca criar runtime paralelo” e aumentaria duplicação de autenticação, Supabase, logger, OpenAPI, deployment e auditoria.

### 6.2 Por que não usar `apps/api`?

`apps/api` está classificado como adapter/legacy. Implementar o Gateway ali moveria uma capacidade soberana para fora do CORE e reforçaria uma superfície que a própria arquitetura não considera fonte principal.

### 6.3 Por que não usar `apps/core`?

`apps/core` está classificado como experimental. O Gateway será fronteira oficial de execução do organismo, portanto não deve nascer em uma área experimental.

### 6.4 Por que não colocar dentro de `src/luna`?

`src/luna` contém o núcleo cognitivo atual: memória, contexto, pipeline e provider. O Gateway não decide, não planeja e não contém IA; ele autentica, autoriza, descobre capacidades, roteia execução e audita. Colocá-lo dentro de `src/luna` criaria sobreposição entre cognição e execução.

### 6.5 Por que `api-server/src/gateway` é o ponto certo?

- Está dentro do backend soberano CORE.
- Reutiliza Express, logger, Supabase client, Zod, Drizzle e deployment existentes.
- Permite expor rotas em `/api/gateway/*` sem criar novo runtime.
- Mantém separação orgânica: `src/luna` pensa/contextualiza; `src/gateway` executa capacidades; Reporter observa; Supabase memoriza.
- Permite evoluir o contrato em `apps/frontend/lib/api-spec/openapi.yaml` antes da implementação.

## 7. Impactos da implementação

### 7.1 Impactos positivos

- Centraliza o acesso das IAs à infraestrutura em uma única superfície auditável.
- Remove dependência conceitual de GPT Actions.
- Permite trocar modelos de IA sem reimplementar integrações.
- Cria base para autorização por capability e escopo.
- Fortalece Reporter e Supabase como órgãos oficiais, em vez de contorná-los.

### 7.2 Riscos

- Misturar Gateway com cognição se colocado dentro de `src/luna`.
- Duplicar clientes GitHub/Supabase/Railway/n8n se cada capability criar acesso próprio sem adapters compartilhados.
- Transformar auditoria em histórico bruto se não houver taxonomia de evidências.
- Expandir capabilities antes de definir contrato, envelope de resposta e modelo de erro.

### 7.3 Mitigações

- Definir um `CapabilityRegistry` único.
- Exigir envelope estruturado para toda execução.
- Exigir `dryRun` quando aplicável.
- Exigir emissão de evidências para Reporter.
- Exigir persistência mínima de checkpoint/context sync em Supabase.
- Evoluir OpenAPI antes do código.

## 8. Plano de Implementação — Fase 2 proposta

A implementação deve ser incremental e só deve começar após aprovação arquitetural.

### 8.1 Estrutura de diretórios proposta

```text
apps/frontend/artifacts/api-server/src/gateway/
├── index.ts
├── types.ts
├── registry.ts
├── auth/
│   ├── authenticate.ts
│   └── authorize.ts
├── audit/
│   └── evidence.ts
├── context/
│   └── sync.ts
├── capabilities/
│   ├── github/
│   ├── filesystem/
│   ├── reporter/
│   ├── supabase/
│   ├── railway/
│   └── n8n/
└── adapters/
    ├── github.ts
    ├── railway.ts
    ├── n8n.ts
    └── reporter.ts
```

Rotas:

```text
apps/frontend/artifacts/api-server/src/routes/gateway.ts
```

Contrato:

```text
apps/frontend/lib/api-spec/openapi.yaml
```

Schemas gerados:

```text
apps/frontend/lib/api-zod
apps/frontend/lib/api-client-react
```

### 8.2 Interfaces mínimas

```ts
type CapabilityName =
  | "github.read_file"
  | "github.write_file"
  | "github.create_branch"
  | "github.commit"
  | "github.create_repository"
  | "filesystem.read"
  | "filesystem.write"
  | "reporter.audit"
  | "reporter.snapshot"
  | "supabase.query"
  | "supabase.execute"
  | "railway.logs"
  | "railway.deploy"
  | "n8n.execute_workflow";

interface CapabilityRequest<TInput = unknown> {
  capability: CapabilityName;
  input: TInput;
  dryRun?: boolean;
  contextRef?: string;
  actor: {
    type: "human" | "ai" | "system";
    id: string;
    model?: string;
  };
}

interface CapabilityResult<TOutput = unknown> {
  ok: boolean;
  capability: CapabilityName;
  dryRun: boolean;
  output?: TOutput;
  evidence: Evidence[];
  auditId?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### 8.3 Contratos HTTP iniciais

- `GET /api/gateway/capabilities` — descoberta de capabilities disponíveis.
- `POST /api/gateway/execute` — execução de uma capability autorizada.
- `GET /api/gateway/audit/:id` — consulta de evidências/auditoria.
- `POST /api/gateway/context/sync` — sincronização inicial de Índice Cognitivo e Último Checkpoint.

### 8.4 Capabilities iniciais recomendadas

Ordem incremental:

1. `reporter.snapshot` — para formalizar observabilidade antes de execução mutável.
2. `reporter.audit` — para consultar evidências.
3. `supabase.query` somente leitura — para memória oficial sob contrato.
4. `github.read_file` somente leitura — para inspeção arquitetural auditável.
5. `filesystem.read` somente leitura e restrito ao repo — para diagnóstico local.
6. Capabilities mutáveis com `dryRun` obrigatório no primeiro ciclo: `github.write_file`, `github.create_branch`, `github.commit`, `filesystem.write`.

### 8.5 Integração com Reporter

O Gateway deve emitir eventos/evidências para o Reporter, mas não gerar interpretação. Exemplo de eventos:

- `capability.requested`
- `capability.authorized`
- `capability.executed`
- `capability.failed`
- `capability.dry_run_completed`
- `context.synced`

Se `reporter.snapshot` ainda não existir como runtime, a primeira entrega deve ser adaptar o audit documental existente para uma interface executável mínima, sem deslocar responsabilidade para o Gateway.

### 8.6 Integração com Supabase

Supabase deve armazenar memória e auditoria estruturada, não logs brutos. Proposta inicial:

- tabela/coleção de audit trail para execuções de capability;
- referência a checkpoint/contexto em vez de duplicar todo o conteúdo;
- persistência de evidências com tipo, origem, hash/metadata e timestamp;
- separação entre memória cognitiva e auditoria operacional.

### 8.7 Integração com GitHub, Railway e n8n

- GitHub: adapter único em `src/gateway/adapters/github.ts`, usado por capabilities GitHub.
- Railway: adapter único para logs/deploy; `railway.deploy` deve exigir autorização explícita e `dryRun` quando aplicável.
- n8n: adapter único para execução de workflows por id/nome permitido; sem lógica de planejamento dentro do Gateway.

## 9. Decisão arquitetural proposta

**ADR-GATEWAY-001:** o LUNA Gateway deve ser implementado como órgão do backend soberano em `apps/frontend/artifacts/api-server/src/gateway`, exposto por rotas contract-driven em `apps/frontend/artifacts/api-server/src/routes/gateway.ts` e especificado primeiro em `apps/frontend/lib/api-spec/openapi.yaml`.

**Racional:** esta localização preserva o runtime CORE, evita runtimes paralelos, separa execução de cognição, reutiliza contratos e dependências existentes, e mantém Reporter e Supabase como órgãos cooperantes em vez de responsabilidades internas do Gateway.

## 10. Critério de aprovação para avançar à Fase 3

A implementação só deve começar após aprovação explícita destes pontos:

1. Local: `apps/frontend/artifacts/api-server/src/gateway`.
2. Contrato: OpenAPI primeiro, schemas gerados depois.
3. Capability envelope único.
4. Reporter como observador externo via capability/adapters.
5. Supabase como memória/auditoria estruturada.
6. Nenhuma IA, agente, planner ou workflow autônomo dentro do Gateway.

Princípio final preservado: **as capacidades pertencem à LUNA. A inteligência pertence às IAs. A governança pertence ao usuário.**
