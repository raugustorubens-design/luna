# ADR-004 — Órgãos da LUNA como MVPs Independentes

Data: 2026-07-09
Status: Accepted

## Contexto

As duas etapas anteriores de consolidação (backend cognitivo e Convergia) absorveram órgãos para dentro do monorepo `luna` como módulos internos (`src/luna/*`, `src/convergia/*`). Essa decisão resolveu um problema real — as regras de fronteira ("Hipocampo nunca persiste diretamente", "Convergia nunca chama provider diretamente") só eram verificáveis automaticamente se os órgãos compartilhassem processo — mas caiu na lei do menor esforço arquitetural: tratou "verificável" como sinônimo de "fisicamente unificado."

Uma auditoria adicional, motivada por esta ADR, descobriu que **isso já havia sido identificado antes**, em repositórios que não tinham sido descobertos nas etapas anteriores:

- `raugustorubens-design/Luna-context.md` — repositório dedicado de contexto compartilhado, com commit mais recente (mesmo dia desta ADR) intitulado "docs: clarify organs as independent MVP products". Seu `LUNA_CONTEXT.md` já afirma: *"Organs are not just internal modules: they must be able to exist as independent MVPs and commercial products while staying integrated through shared contracts"* e *"The monorepo is an integration surface, not the owner of every organ's identity."*
- `raugustorubens-design/luna-reporter` — um Reporter **real e substancialmente diferente** do que foi construído dentro do monorepo. Sua própria constituição (`docs/constitution/luna_constitution_v1.md`) declara: *"Cada repositório representa um sistema... Convergia: Produção de documentos. Luna-reporter: Consciência situacional do organismo."* — ou seja, o princípio de "um órgão, um repositório" já estava documentado antes da consolidação que este ADR agora reverte parcialmente.
- `raugustorubens-design/luna-core` e `raugustorubens-design/luna-api` — protótipos de backend Python/Node que são as fontes reais (ou cópias quase idênticas) do que foi encontrado como `apps/core` e `apps/api` no monorepo durante a auditoria do Prompt 1.
- `raugustorubens-design/luna-frontend` — um protótipo visual (Next.js) do "rosto da LUNA", não descoberto nas etapas anteriores.

Isso confirma, com evidência concreta e não apenas com instrução do usuário, que a estratégia correta é a de múltiplos MVPs integrados por contrato — e que a consolidação anterior, embora tecnicamente correta para o problema que resolveu, contrariou uma decisão arquitetural que já existia.

## Decisão

Aplicar **Descobrir → Integrar → Criar** a nível de organismo, não apenas a nível de arquivo:

1. Nenhum órgão que já existe como repositório próprio com identidade real será fisicamente absorvido no monorepo.
2. Órgãos hoje vivendo como módulos internos do monorepo por terem sido criados nesta fase (Cognitive Engine, Hipocampo, Memory Engine, Provider Engine, Provider Router, Budget Manager, Filtro Cognitivo, Índice Cognitivo, Context Hub) **permanecem no monorepo nesta etapa** — não porque essa seja a identidade correta em definitivo, mas porque:
   - não têm hoje um contrato de API formal (são chamadas de função TypeScript em processo);
   - extraí-los sem esse contrato quebraria a verificação automática de fronteira (`architecture-check.mjs`) sem substituí-la por nada;
   - a regra de encerramento deste ADR exige não mover nada sob risco de quebra.
3. **Reporter é reclassificado.** O módulo `src/luna/reporter.ts` construído na consolidação anterior não é o órgão Reporter oficial da LUNA — é um log de auditoria em processo, interno ao runtime cognitivo. O Reporter oficial é `raugustorubens-design/luna-reporter`, que continua independente. Ver seção "Conflito de identidade" abaixo.
4. **Convergia é reclassificado como candidato prioritário a produto independente**, mas a extração física não ocorre nesta etapa — falta o contrato de API entre Convergia-como-serviço e Hipocampo/Memory Engine (hoje chamada de função direta). Fica registrado como ação de refatoração prioritária, não imediata.
5. `apps/core` e `apps/api` dentro do monorepo são, com alta confiança, cópias estáticas de `luna-core` e `luna-api`. Nenhuma ação de remoção é executada nesta etapa — apenas o achado é registrado, por ser uma decisão que envolve saber qual dos dois é a fonte de deploy real hoje (pergunta de produto, não só técnica).
6. Todo órgão futuro (a começar por LUNA Forge) nasce como repositório próprio desde o primeiro commit — nunca como pasta do monorepo.

## Conflito de identidade: dois "Reporters"

| | `src/luna/reporter.ts` (monorepo) | `luna-reporter` (repositório próprio) |
|---|---|---|
| Responsabilidade real | Buffer de eventos de auditoria do pipeline cognitivo (200 últimos eventos, em memória) | Consciência situacional de todo o organismo: observa GitHub/Supabase/Railway, diagnostica bloqueadores, recomenda a próxima ação de maior impacto |
| Escopo | Interno ao processo do api-server | Todo o ecossistema de repositórios |
| Arquitetura | Uma função (`emitReport`) chamada em processo | Adapters → Observation Engine → Diagnostics Engine → Recommendation Engine → Report Engine |
| Maturidade | Funcional, testado, mas estritamente local | Funcional (scanner real de GitHub, `reports/repositories.json` gerado), mas com lacunas de empacotamento (requirements.txt poluído com dependências de notebook) |

**Resolução:** manter `src/luna/reporter.ts` como está — ele é genuinamente útil como log de auditoria do pipeline cognitivo — mas parar de chamá-lo de "Reporter" na documentação de órgãos oficiais. O nome "Reporter" nos 12 órgãos-alvo (Prompt 2/3) passa a se referir a `luna-reporter`. Renomear o módulo interno é uma ação de refatoração mínima registrada, não executada nesta etapa (risco baixo, mas ainda assim uma mudança de código que exige atualizar `architecture-check.mjs`, testes e imports — melhor feita isoladamente).

## Consequências

1. O monorepo `luna` deixa de ser tratado como "onde tudo mora por padrão" e passa a ser tratado como o núcleo cognitivo (Cognitive Engine + órgãos fortemente acoplados a ele) mais uma superfície de integração para órgãos externos.
2. Contratos (interfaces TypeScript hoje espalhadas em `contracts.ts` por módulo) tornam-se o artefato prioritário de estabilização — são o que permite qualquer órgão futuro ser extraído sem quebrar o organismo.
3. `LUNA_CONTEXT.md` deixa de ser um artefato só do monorepo. O repositório `Luna-context.md` é reconhecido como a fonte de continuidade em nível de organismo; `luna_context/LUNA_CONTEXT.md` (neste monorepo) permanece como o registro detalhado do que acontece dentro do núcleo cognitivo, e deve permanecer consistente com o primeiro, não divergente dele.
4. Esta ADR não desfaz nenhum código funcional das duas etapas anteriores. Cognitive Engine, Hipocampo, Memory Engine, Provider Engine/Router, Budget Manager, Índice Cognitivo, Context Hub, Filtro Cognitivo e Convergia continuam existindo exatamente como estão, dentro do monorepo, até que cada extração tenha um contrato de API real para substituir a chamada de função direta.

## Relação com ADRs anteriores

Esta ADR não reverte o ADR-003 (Filtro Cognitivo continua vivendo dentro do Hipocampo). Ela reversa parcialmente a premissa implícita das consolidações do backend cognitivo e do Convergia — não o código que produziram, apenas a assunção de que absorção física era a única forma de obter fronteiras verificáveis.
