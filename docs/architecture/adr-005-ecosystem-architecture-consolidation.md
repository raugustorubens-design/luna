# ADR-005 — Consolidação da Arquitetura do Ecossistema LUNA

Data: 2026-07-09
Status: Accepted

## Contexto

Esta é a etapa final de consolidação arquitetural macro do Ecossistema LUNA (ver ADR-004 para o contexto imediatamente anterior). Nenhum código foi movido, nenhum repositório foi criado ou reestruturado nesta etapa — é puramente documentação.

## Decisão

O documento arquitetural oficial e completo do ecossistema (mapa de todos os sistemas, classificação, matriz de dependências, contratos oficiais, shared kernel, APIs públicas, roadmap por MVP, estratégia comercial, arquitetura de longo prazo e constituição executável futura) vive em:

**`raugustorubens-design/Luna-context.md` → `ECOSYSTEM_ARCHITECTURE.md`**

Esse repositório é, por decisão explícita desta etapa, a fonte de verdade do ecossistema — não este monorepo. Este ADR não duplica o conteúdo; aponta para ele.

## Resumo mínimo (para quem não pode sair deste repositório agora)

- 10 repositórios conhecidos no ecossistema, todos auditados. Nenhum novo encontrado nesta etapa (busca ampla, sem filtro, confirmou a lista já levantada no ADR-004).
- **Reporter oficial = `Luna-reporter`** (repositório próprio). `src/luna/reporter.ts` aqui é um log de auditoria interno, não o órgão oficial — segue sem renomear (ação registrada, não executada).
- **Convergia** segue fisicamente absorvido neste monorepo (`src/convergia/`), reclassificado como candidato prioritário a produto independente, aguardando um contrato de API real com Hipocampo/Memory Engine antes de qualquer extração física.
- **Inconsistência encontrada nesta etapa** (registrada, não corrigida): `src/convergia/training/training-to-memory.ts` chama `checkpoint()` do Memory Engine diretamente, sem passar pelo Hipocampo — uma violação sutil de "Convergia nunca persiste diretamente" que o `architecture-check.mjs` atual não detecta (só verifica tokens `supabase|drizzle`, não topologia de chamadas). Ver `ECOSYSTEM_ARCHITECTURE.md` para o teste futuro recomendado.
- `apps/core` e `apps/api` neste monorepo continuam sendo, com alta confiança, cópias de `luna-core` e `luna-api`. Nenhuma ação de remoção foi tomada — decisão de produto pendente.
- Este é o último prompt macro de arquitetura. Toda implementação futura nasce como um MVP independente, listado no roadmap oficial (`ECOSYSTEM_ARCHITECTURE.md` §7).

## Consequências

- `luna_context/LUNA_CONTEXT.md` (neste monorepo) para de tentar ser uma cópia completa da estratégia do ecossistema — mantém apenas o registro operacional do que acontece dentro do núcleo cognitivo, com este ADR como ponteiro para a visão completa.
- Qualquer IA ou humano que inicie trabalho neste monorepo sem ler `Luna-context.md`/`ECOSYSTEM_ARCHITECTURE.md` primeiro está operando com contexto incompleto por definição.
