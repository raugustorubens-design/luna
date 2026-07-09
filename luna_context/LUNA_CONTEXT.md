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
