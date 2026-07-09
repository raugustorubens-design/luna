# LUNA_CONTEXT

Registro de continuidade arquitetural obrigatório para qualquer IA (ou humano) que trabalhe neste repositório. Criado pelo Prompt 3 (evolução do Convergia), consolidando também o que foi decidido nos Prompts 1 e 2. Atualizar este arquivo, não recriar um substituto, sempre que uma etapa arquitetural relevante for concluída.

Runtime soberano: `apps/frontend/artifacts/api-server`. Ver `AGENTS.md` na raiz para a classificação de runtimes e `docs/checkpoints/`, `docs/luna-memory/` para a camada conceitual/filosófica (que segue à frente da implementação real — ver "Conflitos encontrados" abaixo).

---

## 1. Funcionalidades implementadas

### Prompt 2 — Backend Cognitivo (12 órgãos)
- **Gateway** — inalterado no núcleo; 19 capacidades (17 ativas GitHub/Filesystem + 2 preparadas `disabled`: Railway, n8n).
- **Cognitive Engine** (`src/luna/cognitive-engine.ts`) — orquestra retrieveMemory → Context Hub → Provider Router → Hipocampo, sem persistir ou chamar provider diretamente (verificado por `architecture-check.mjs`).
- **Hipocampo** (`src/luna/hipocampo.ts`) — filtro de consolidação (conteúdo vazio, duplicata imediata), generalizado no Prompt 3 para aceitar candidatos de qualquer formato (não só chat).
- **Memory Engine** (`src/luna/memory-engine.ts`) — dono exclusivo de persistência em `memoria_luna` (Supabase), com `checkpoint()`.
- **Índice Cognitivo** (`src/luna/indice-cognitivo.ts`) — leitura real e determinística de `luna_context/*.md`; reconstrução semântica não implementada (sem infraestrutura de embeddings).
- **Context Hub** (`src/luna/context-hub.ts`) — ponto único de contexto consumido pelo Provider Router.
- **Provider Engine** (`src/luna/provider-engine.ts`) — registro de 5 adapters (Groq real; ChatGPT/Claude/Grok/Manus honestamente "não configurado").
- **Provider Router** (`src/luna/provider-router.ts`) — fallback real entre providers configurados, com checagem de orçamento.
- **Budget Manager** (`src/luna/budget-manager.ts`) — limite de chamadas/dia configurável via env, sem dados de custo em $ (inexistentes no projeto).
- **Reporter** (`src/luna/reporter.ts`) — buffer de introspecção de 200 eventos.
- **Filtro Cognitivo** — implementado dentro do Hipocampo (conforme ADR-003).
- **Renascer** — contratos Zod (`lib/api-zod/src/renascer/contracts.ts`), não implementado, não wired.
- **Planner** — bloqueado. Sem responsabilidade definida em nenhum documento do projeto.

### Prompt 3 — Convergia (órgão de transformação de informação)
- **Pipeline oficial completo**, sem atalhos: Entrada → Parser → Modelo Canônico → Validação → Transformação → Template → Renderer → Resultado (`src/convergia/pipeline.ts`).
- **Parsers reais (3/5 do MVP)**: XLSX, CSV, JSON. DOCX e PDF **não implementados** (ver Conflitos/Pendências).
- **Renderers reais (6/7 do MVP)**: CSV, JSON, Markdown, HTML, XLSX, PPTX. DOCX e PDF **não implementados**.
- **Mecanismo de templates** (`src/convergia/templates/registry.ts`) com identificador/versão/tipo/renderer/layout/variáveis/metadados — 7 templates registrados (1 SSMA tabular + 6 genéricos, um por formato de saída).
- **Catálogo dos 13 tipos de documento corporativo** (`src/convergia/templates/corporate-catalog.ts`) — catalogados, **nenhum com conteúdo de template real** (ver Conflitos).
- **Integração com Hipocampo** (`src/convergia/knowledge/knowledge-gate.ts`) — único caminho de persistência; Convergia nunca toca banco diretamente (verificado por `architecture-check.mjs`).
- **Pipeline Treinamento → Memória** (`src/convergia/training/training-to-memory.ts`) — extração determinística de conceitos/procedimentos/relações, compactação, reconstrução híbrida (lógica; semântica não implementada), submissão de até 3 tipos de conhecimento (semântica/procedimental/inferencial) ao Hipocampo.
- **API HTTP**: `GET /api/convergia/catalog`, `GET /api/convergia/templates`, `POST /api/convergia/parse`, `POST /api/convergia/transform`, `POST /api/convergia/training`.
- **Verificado em runtime real**: build de produção, upload real de CSV → transformação SSMA → PPTX (58KB, ZIP/OOXML válido) via HTTP; pipeline de treinamento executou até a fronteira real do Supabase (bloqueado por allowlist de rede do sandbox, não por bug de código).

---

## 2. Componentes reutilizados (Descobrir → Integrar)

- **Lógica de parsing XLSX** do `luna-convergia` original (`raugustorubens-design/luna-convergia`, único commit, 143 linhas) — normalização de cabeçalho e coerção de célula evoluídas para `parsers/xlsx-parser.ts`, generalizadas para qualquer conjunto de colunas.
- **Regra de negócio ASO** (RE/Nome/CPF/Data ASO) do `luna-convergia` — preservada integralmente, mas relocada da camada de parser para a camada de Transformação (`transform/ssma-aso-transform.ts`), respeitando a separação de responsabilidades do pipeline oficial.
- **`decideAndConsolidate` (Hipocampo)** e **`persistMemory`/`retrieveMemory`/`checkpoint` (Memory Engine)** do Prompt 2 — reutilizados integralmente pelo Convergia via `knowledge-gate.ts` e `training-to-memory.ts`.
- **`readProjectContext` (Índice Cognitivo)** do Prompt 2 — reutilizado pelo pipeline de treinamento para reconstrução híbrida (cross-reference com ROADMAP/DECISIONS).
- **Padrão de injeção de dependência** (adapters/clients injetáveis com default de produção) — já estabelecido no Prompt 2 (ProviderRouter, MemoryEngine), replicado em `knowledge-gate.ts` e `training-to-memory.ts` para manter os testes livres de rede.
- **`archiver` e `pptxgenjs`** — dependências já declaradas (mas nunca usadas) no `luna-convergia` original; `pptxgenjs` finalmente usada no `pptx-renderer.ts`. `archiver` segue não utilizada (nenhum caso de uso de "pacote de múltiplos documentos" no MVP).

## 3. Componentes criados (só após comprovar ausência real)

- **Modelo Canônico** (`convergia/contracts.ts`) — não existia nenhuma abstração de formato-agnóstico no `luna-convergia`.
- **Estágio de Validação** (`convergia/validation.ts`) — zod + regras semânticas; não existia validação estruturada alguma.
- **Mecanismo de templates e catálogo corporativo** — não existia nenhum template em código.
- **6 renderers** (CSV/JSON/Markdown/HTML/XLSX/PPTX) — só existia geração de nenhum formato de saída antes.
- **`knowledge-gate.ts`** — não existia ponte alguma entre Convergia e o resto do organismo.
- **`training-to-memory.ts`** (extração de conceitos/procedimentos/relações, compactação, reconstrução híbrida) — não existia nenhum pipeline de treinamento.
- **`src/lib/repo-root.ts`** (Prompt 2) — não existia resolução de caminho robusta a bundling/cwd.

---

## 4. Conflitos encontrados

1. **`hipocampo.ts` estava hardcoded ao formato de chat.** `isMeaningful`/`isImmediateDuplicate` assumiam campos `user_message`/`assistant_response` — qualquer candidato do Convergia seria sempre descartado por não ter esses campos. Corrigido generalizando as duas funções para checagem de conteúdo agnóstica de formato (ver `src/luna/hipocampo.ts`).
2. **`knowledge-gate.ts` descartava os dados extraídos.** Uma primeira versão só persistia metadados (`summary`, `sourceFormat`, `recordCount`, `columns`), perdendo os `records`/relações reais. Corrigido para incluir `records` e um campo `extra` genérico antes de qualquer teste ser escrito contra o comportamento errado.
3. **Regra de auto-referência no `architecture-check.mjs` (recorrente).** Comentários que citam literalmente "Supabase"/"supabase" disparam a própria checagem `doesNotMatch(/supabase|drizzle/i)`. Ocorreu 2x no Prompt 2 e 2x no Prompt 3 (`cognitive-engine.ts`, `hipocampo.ts`, `knowledge-gate.ts`, `training-to-memory.ts`) — todos corrigidos reescrevendo o comentário sem o token proibido. Registrado aqui para a próxima IA não repetir a mesma pausa de depuração.
4. **`pptxgenjs` tem interop CJS/ESM inconsistente entre `tsx` (dev/test) e o bundle esbuild (produção).** Sob `tsx`, `import PptxGenJS from "pptxgenjs"` retorna `{ default: PptxGenJS }` em vez da classe diretamente; sob o bundle de produção, retorna a classe diretamente. Corrigido com resolução defensiva em `pptx-renderer.ts`. Validado nos dois runtimes (testes via tsx + smoke test via bundle de produção).
5. **`lib/db/src/index.ts` importava `"dotenv/config"` sem declarar `dotenv` como dependência própria** (Prompt 2, pré-existente) — quebrava `pnpm run build`. Corrigido.
6. **`src/lib/supabase.ts` resolvia `.env` com profundidade relativa fixa a partir de `process.cwd()`** (Prompt 2, pré-existente) — correto só sob `pnpm start`, quebrava sob `pnpm test` e ficava incorreto após bundling (esbuild muda a profundidade de `import.meta.url`). Corrigido com `src/lib/repo-root.ts` (busca por `.git` subindo diretórios), robusto a qualquer runtime.
7. **`memory-engine.ts` engole erros de persistência silenciosamente** (Prompt 2, pré-existente, **não corrigido nesta etapa**) — `persistMemory` loga o erro mas não propaga, então o Hipocampo relata `"consolidate"` mesmo quando a escrita real no Supabase falha. Confirmado em teste real nesta etapa (ver seção 6). Fora do escopo do Prompt 3; fixá-lo exige decidir se falhas de persistência devem propagar/retry, o que afeta também o Cognitive Engine — decisão de produto, não só técnica.
8. **Duas definições de schema `conversations`/`messages` em `lib/db/src/`** (`schema.ts` vs `schema/index.ts`) — encontrado ao auditar o pacote `db` para a integração do Convergia. Órtogonal ao trabalho desta etapa (Convergia nunca toca essas tabelas); **não investigado nem corrigido**, apenas registrado.
9. **`luna-convergia` era um repositório completamente isolado**, sem nenhum import cruzado com o monorepo `luna`. Decisão arquitetural tomada: absorver seu código como um novo organ (`src/convergia/`) dentro de `apps/frontend/artifacts/api-server`, em vez de mantê-lo como serviço separado — ver seção 5.

---

## 5. Decisões arquiteturais

### Posicionamento do Convergia dentro do monorepo (não como serviço separado)
O repositório `luna-convergia` original era uma ilha (zero imports cruzados, sem deploy, sem CI, um único commit). Prompt 3 exige que Convergia "nunca persista diretamente" e "nunca chame providers diretamente", com o fluxo `Convergia → Filtro Cognitivo → Hipocampo → Memory Engine → Supabase` — regras que só são verificáveis automaticamente (via `architecture-check.mjs`, o mesmo mecanismo usado para o Cognitive Engine no Prompt 2) se Convergia viver no mesmo processo/codebase que Hipocampo/Memory Engine/Provider Engine. Decisão: o código do Convergia foi evoluído para `apps/frontend/artifacts/api-server/src/convergia/`, reaproveitando a lógica real do repositório original. O repositório `luna-convergia` standalone não foi alterado nem descontinuado nesta etapa — nenhuma ação destrutiva foi tomada sobre ele; a recomendação de arquivá-lo formalmente (ele não tinha deploy real) fica registrada como pendência de decisão do usuário.

### Filtro Cognitivo não é um módulo separado
Confirmado no Prompt 2 e reafirmado aqui: a ADR-003 determina que "o Hipocampo é o guardião da memória e aplica o filtro antes de consolidar conhecimento" — logo Filtro Cognitivo vive dentro de `hipocampo.ts`, não como organ isolado. O fluxo do Convergia (`Convergia → Filtro Cognitivo → Hipocampo`) é implementado como uma única chamada a `decideAndConsolidate`.

### Nenhum template de documento regulatório foi fabricado
Certificados, APR, PGR, DDS, Procedimentos e as famílias de relatórios SSMA/gerencial/estatístico são formatos reais e regulados de segurança do trabalho no Brasil. Decisão: catalogar os 13 tipos (`corporate-catalog.ts`, todos com `regulatoryStatus: "pending_specialist_review"`) sem fabricar sua estrutura. Apenas um template genérico e seguro (tabular) foi implementado. Fabricar conteúdo de documento de compliance sem validação de especialista foi julgado um risco maior do que não implementar.

### DOCX/PDF (entrada e saída) ficaram fora desta etapa
Ambos exigem uma dependência nova não avaliada e um modelo de documento em árvore/seções que o Modelo Canônico atual (tabular) não cobre. Implementar um parser/renderer raso "só para cumprir a lista" produziria resultado silenciosamente errado para qualquer documento não trivial — julgado pior do que não implementar.

### IA/Provider Engine não foi necessário nesta etapa
Todas as transformações do MVP (normalização de coluna, extração de conceitos/procedimentos/relações, compactação, renderização) são resolvidas por regras determinísticas. Por instrução explícita ("nunca utilizar IA quando uma transformação determinística resolver o problema"), nenhuma chamada a provider foi adicionada ao Convergia. Quando uma transformação futura precisar de IA (ex.: parsing de PDF não estruturado), a integração deve nascer registrando um novo adapter no Provider Engine existente — nunca uma chamada direta, e a prioridade determinística > open-source > comercial já está documentada nesta decisão para a próxima etapa.

---

## 6. Verificação real (não apenas testes unitários)

- Build de produção (esbuild) gerado com sucesso.
- Servidor real iniciado; `GET /api/healthz`, `GET /api/convergia/catalog`, `GET /api/convergia/templates` confirmados.
- Upload real de CSV → `POST /api/convergia/parse` (preserva o comportamento original do `luna-convergia`, generalizado) confirmado.
- Upload real de CSV → transformação SSMA → `POST /api/convergia/transform` → PPTX real (58KB, ZIP/OOXML válido, reaberto e validado) confirmado.
- `POST /api/convergia/training` executou a extração determinística real e tentou persistir via Hipocampo → Memory Engine → Supabase; bloqueado apenas por allowlist de rede do sandbox (`Host not in allowlist: <supabase-host>`), não por erro de código — confirma que o fluxo arquitetural completo está corretamente ligado ponta a ponta.
- 90/90 testes automatizados passam (49 pré-existentes do Prompt 2 intactos + 41 novos do Convergia).
- `architecture-check.mjs` estendido com 3 novas regras específicas do Convergia (nunca persiste diretamente; nunca chama provider diretamente; só `knowledge-gate.ts` pode chamar Hipocampo) — todas verificadas automaticamente, não apenas por inspeção manual.

---

## 7. Inferências consolidadas

- O domínio real de uso do Convergia é SSMA (Saúde, Segurança e Meio Ambiente) — inferido do único caso de uso que já existia em produção prévia (upload de planilha de ASO), e confirmado pela lista de 13 documentos corporativos do Prompt 3, todos do mesmo domínio regulatório brasileiro.
- A separação entre "parsing" e "regra de negócio" (Transformação) que o pipeline oficial exige é exatamente o que faltava no `luna-convergia` original — o parser antigo tinha a regra ASO hardcoded, o que o tornava inutilizável para qualquer outro tipo de planilha. A evolução para o pipeline de 8 estágios resolve isso estruturalmente, não é só uma reorganização de arquivos.
- A infraestrutura de rede deste ambiente de desenvolvimento (sandbox) permite HTTPS de saída (Supabase REST/PostgREST) mas não TCP direto de Postgres nem hosts fora de uma allowlist — relevante para qualquer futura etapa que precise validar persistência real neste ambiente.

## 8. Alterações de roadmap

- **Adicionado**: pipeline de transformação de documentos como órgão oficial (Convergia), com 3 parsers, 6 renderers e mecanismo de templates funcionando ponta a ponta.
- **Adiado explicitamente**: parsing/renderização de DOCX e PDF; conteúdo real dos 13 templates corporativos (pendente de especialista SSMA); reconstrução semântica (embeddings) em qualquer camada (Índice Cognitivo e Treinamento→Memória); correção do "engolimento" de erro em `persistMemory`; decisão sobre arquivar o repositório `luna-convergia` standalone; consolidação das duas definições de schema `db`.
- **Não iniciado**: Planner (sem definição de responsabilidade); Budget Manager com custo em $ real; credenciais reais para ChatGPT/Claude/Grok/Manus; qualquer modelo open-source (Qwen/DeepSeek/Gemma/Whisper/CosyVoice/Qwen-VL).

## 9. Impactos na arquitetura

- `hipocampo.ts` agora é genuinamente polimórfico (aceita candidatos de qualquer organ, não só do Cognitive Engine) — qualquer organ futuro que precise persistir conhecimento deve reutilizá-lo pelo mesmo caminho, não criar um atalho novo.
- `architecture-check.mjs` passou de checagem por arquivo nomeado para checagem por diretório completo (`listFilesRecursive`) — o padrão está pronto para ser reaproveitado por qualquer organ futuro sem precisar listar arquivos manualmente.
- O padrão de dependências injetáveis com default de produção (estabelecido no Prompt 2) provou-se necessário de novo no Prompt 3 — deve ser tratado como convenção obrigatória para qualquer novo módulo que toque rede/banco, não uma escolha caso a caso.

---

## 10. Virada estratégica — órgãos como MVPs independentes (ADR-004)

**A consolidação física dos Prompts 2 e 3 foi parcialmente revertida em nível de estratégia (não de código).** Ver `docs/architecture/adr-004-organs-as-independent-mvps.md` para o registro completo. Resumo:

### O que motivou a virada
Descoberta de 5 repositórios adicionais não mapeados nas etapas anteriores: `raugustorubens-design/Luna-context.md` (contexto compartilhado do organismo, atualizado no mesmo dia desta etapa com a mesma conclusão antes de eu chegar a ela), `raugustorubens-design/luna-reporter` (Reporter real, com missão e arquitetura próprias), `raugustorubens-design/luna-core` e `raugustorubens-design/luna-api` (fontes/duplicatas de `apps/core`/`apps/api`), `raugustorubens-design/luna-frontend` (protótipo visual). O princípio "um órgão, um repositório" já estava documentado na constituição do `luna-reporter` antes desta consolidação começar.

### Reclassificação de órgãos
- **Reporter**: o órgão oficial é `luna-reporter` (repositório próprio, independente). `src/luna/reporter.ts` neste monorepo **não é o Reporter oficial** — é um log de auditoria interno ao pipeline cognitivo, e deve ser tratado/documentado como tal daqui em diante.
- **Convergia**: reclassificado como candidato prioritário a produto/repositório independente. Permanece fisicamente no monorepo nesta etapa por falta de um contrato de API formal entre Convergia-serviço e Hipocampo/Memory Engine (hoje é chamada de função TS direta).
- **Cognitive Engine, Hipocampo, Memory Engine, Provider Engine, Provider Router, Budget Manager, Filtro Cognitivo, Índice Cognitivo, Context Hub**: permanecem no monorepo — são fortemente acoplados entre si por chamada de função, sem contrato de API, e extraí-los agora quebraria a verificação automática de fronteira sem substituí-la por nada equivalente.
- **Planner**: continua bloqueado, sem responsabilidade definida em nenhum documento (nem no monorepo, nem no `Luna-context.md` externo).
- **LUNA Forge**: nome oficial do "Modo Dev" (IDE cognitiva tipo Cursor), citado no `Luna-context.md` externo. Não existe ainda como código ou repositório. Decisão: nasce direto como repositório próprio quando for criado.

### Não executado nesta etapa (risco/decisão de produto, não técnica)
- Nenhum código foi movido para fora do monorepo.
- Nenhum repositório novo foi criado.
- `apps/core`/`apps/api` (cópias prováveis de `luna-core`/`luna-api`) não foram removidos — decidir qual é a fonte de deploy real é uma pergunta de produto.
- `src/luna/reporter.ts` não foi renomeado — a mudança de nome exige atualizar `architecture-check.mjs`, testes e imports; melhor feita isolada, não misturada com esta virada estratégica.

### Ação prioritária registrada, não executada
Extrair as interfaces principais hoje espalhadas em `contracts.ts` por organ (`LunaContext`, `ProviderAdapter`, `ConsolidationCandidate`/`ConsolidationDecision`, `CanonicalDocument`) para um pacote de contratos formal e publicável — é o que tornaria qualquer extração futura de organ (a começar por Convergia) segura, sem quebrar a verificação de fronteira.

### Relação entre os dois LUNA_CONTEXT.md
`raugustorubens-design/Luna-context.md` é a fonte de continuidade em nível de organismo (multi-repositório). Este arquivo (`luna_context/LUNA_CONTEXT.md`, dentro do monorepo `luna`) é o registro detalhado do que acontece dentro do núcleo cognitivo. Os dois devem permanecer consistentes; divergência entre eles é, por definição, um conflito arquitetural a ser registrado, não ignorado.

---

## 11. Consolidação final do Ecossistema (ADR-005) — último prompt macro

A arquitetura completa do ecossistema (mapa de sistemas, classificação, matriz de dependências, contratos oficiais, shared kernel, APIs públicas, roadmap por MVP, estratégia comercial, princípios de longo prazo e constituição executável futura) foi consolidada em `raugustorubens-design/Luna-context.md` → `ECOSYSTEM_ARCHITECTURE.md`, que passa a ser a fonte de verdade — não este arquivo. Ver `docs/architecture/adr-005-ecosystem-architecture-consolidation.md` para o resumo mínimo local.

**Nenhum código foi alterado nesta etapa.** Um achado real emergiu da auditoria (registrado, não corrigido): `src/convergia/training/training-to-memory.ts` chama `checkpoint()` do Memory Engine diretamente, contornando o Hipocampo — violação sutil de "Convergia nunca persiste diretamente" que o `architecture-check.mjs` atual não detecta. Prioridade registrada no roadmap oficial.

Este é o último prompt macro de arquitetura, por decisão explícita desta etapa. Toda evolução futura deste monorepo deve corresponder a um item do roadmap oficial (`ECOSYSTEM_ARCHITECTURE.md` §7), nunca a uma nova consolidação ampla.

---

## 12. LUNA Forge — MVP-01 (Ambiente Oficial de Engenharia)

Primeiro MVP construído sob o novo padrão pós-ADR-005: responsabilidade única, sem consolidação ampla. Código em `forge/` (workspace pnpm próprio, independente do monorepo).

### Funcionalidades implementadas
Explorer (árvore de diretórios via `filesystem.list`, expansão preguiçosa), Editor (Monaco real — não CodeMirror simulado —, abas com múltiplos arquivos, indicador de sujo, salvar via Cmd/Ctrl+S usando `filesystem.write`), Chat (janela única, fala apenas com `/api/chat`, nunca com um provider diretamente), Painel GitHub (branches/commits/PRs reais via capacidades `github.*` do Gateway, diff de commit via `github.compare_commits`; merge/review desabilitados na UI com explicação — capacidades ainda não existem), Terminal (WebSocket para um processo bash local via `child_process.spawn`, execução simples, sem automação), Painel de Contexto (lê `luna_context/LUNA_CONTEXT.md` real, combina com branch/último commit locais via `git`).

### Componentes reutilizados
5 componentes shadcn/radix do `apps/frontend/artifacts/frontend/src/components/ui/` (`tabs`, `resizable`, `scroll-area`, `separator` copiados sem alteração; `button` adaptado para remover classes de um plugin Tailwind exclusivo do Replit) e `lib/utils.ts` (`cn()`), confirmando que a base visual da LUNA já orfã no monorepo era reaproveitável.

### Componentes criados
`api-client.ts` (única porta de saída do Forge para o organismo LUNA — Gateway `/gateway/execute` e `/gateway/capabilities`, Chat `/api/chat`), servidor local próprio (`apps/server`) só para Terminal (WebSocket) e leitura de git local (`git rev-parse`/`git log`, sem tocar GitHub remoto), `constitution-check.mjs` (constituição executável do Forge).

### Decisões arquiteturais
- **Exceção temporária de posicionamento**: o Gateway de criação de repositório (`create_repository`) retornou `403 Resource not accessible by integration` — a integração GitHub desta sessão não tem permissão para criar repositórios novos. Diante disso, o usuário decidiu explicitamente construir o Forge dentro do monorepo `luna` por ora, como dívida técnica registrada, em vez de esperar por uma ação manual externa. `forge/` mantém `package.json`/`pnpm-workspace.yaml` totalmente independentes do monorepo para que a extração futura para `luna-forge` seja um `git subtree`/copy direto, não uma reescrita.
- **Duas exceções deliberadas à regra "só contratos públicos"**: (1) o Terminal executa comandos localmente via processo próprio do Forge, não via Gateway — não existe (nem deveria existir) uma capacidade `terminal.exec` no Gateway, pois isso não é uma capacidade do organismo LUNA, é uma ferramenta do ambiente de desenvolvimento local; (2) a leitura de branch/commit local usa `git` diretamente no disco do Forge, não `github.list_branches` (que é remoto/API) — são domínios diferentes (estado local não commitado vs. estado remoto no GitHub). Nenhuma das duas toca Supabase, memória ou provider.
- **Lacuna encontrada, não implementada**: não existe endpoint HTTP para o Context Hub (`assembleContext` é uma função interna do backend, não uma rota). O Painel de Contexto do Forge hoje lê `LUNA_CONTEXT.md` como arquivo via `filesystem.read`, não via Context Hub — registrado como bloqueio para a versão definitiva do MVP-02.
- **Monaco Editor empacotado localmente** (`monaco-editor` como dependência direta + workers via Vite `?worker`), não pelo CDN padrão do `@monaco-editor/react` — um ambiente de desenvolvimento local não deveria depender de um CDN externo para o editor funcionar.

### Riscos identificados
- Terminal usa `child_process.spawn` (não node-pty) — programas interativos em tela cheia (vim, htop) não renderizam corretamente. Tradeoff deliberado para evitar risco de compilação nativa; documentado em `forge/ARCHITECTURE.md`.
- `github.merge_pull_request` e capacidades de review de PR não existem no Gateway — bloqueia a versão definitiva do MVP-03 (Git Inteligente), já registrado em `forge/ROADMAP.md`.
- Achado de segurança não relacionado ao Forge, mas descoberto durante a auditoria visual do Explorer: `README.md` da raiz do monorepo continha uma `DATABASE_URL` do Supabase em texto plano, commitada desde `7d52e181`. Removida do arquivo nesta mesma etapa (commit separado) a pedido do usuário; a senha em si segue exposta no histórico do git e precisa ser rotacionada no painel do Supabase — ação fora do alcance desta sessão.

### Novos MVPs registrados (roadmap, não implementados)
MVP-02 Context Hub (definitivo, via endpoint HTTP), MVP-03 Git Inteligente (merge/review), MVP-04 Provider Router (visibilidade), MVP-05 Python Workspace, MVP-06 Observabilidade, MVP-07 Diagnóstico Arquitetural, MVP-08 Engenharia Cognitiva, MVP-09 Pair Programming, MVP-10 Multiagentes. Detalhes em `forge/ROADMAP.md`.

### Verificação real
`pnpm run typecheck` limpo em `apps/web` e `apps/server`; 2/2 testes reais em `apps/server` (`git.test.ts`, usando repositórios git reais criados em `mkdtemp`, não mocks); `constitution-check.mjs` aprovado (23 arquivos escaneados: nenhum token de banco, nenhuma chamada direta a provider, nenhum import interno de órgão); build de produção (`vite build`) concluído com sucesso. Smoke test end-to-end via Playwright real (não simulado): Explorer expandido e navegado, arquivo real aberto e editado no Monaco, Painel de Contexto confirmado exibindo `MVP atual`/branch reais, mensagem real enviada ao Chat e resposta recebida, comando real executado no Terminal (`echo forge-terminal-ok` ecoado corretamente), Painel GitHub exibindo erro real do Gateway (`GitHub request failed with status 401` — sem token configurado neste sandbox) em vez de erro engolido.

### Inferências consolidadas
- A base de componentes shadcn do monorepo (`apps/frontend/artifacts/frontend`), embora órfã do runtime soberano, provou ser diretamente reaproveitável por um sistema externo — reforça que ela deveria virar um pacote de design system publicável, não permanecer presa dentro de um app específico.
- O padrão "CapabilityResult com `success:false` é uma resposta HTTP normal (400), não uma falha de transporte" precisa ser tratado explicitamente por qualquer client novo do Gateway — um parser de erro genérico (`{error: string}`) quebra silenciosamente para esse formato, como ocorreu aqui (`"[object Object]"`) até ser corrigido.
- A ausência de um endpoint HTTP para o Context Hub é o primeiro caso concreto, fora do núcleo cognitivo, de um consumidor externo precisando de um contrato que só existe como função interna — evidência real (não hipotética) a favor de priorizar o MVP-02.
