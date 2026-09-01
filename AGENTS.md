# LUNA — AGENTS.md

## Runtime Oficial

Backend soberano:
`apps/frontend/artifacts/api-server`

Frontend soberano:
`apps/frontend/artifacts/frontend`

Núcleo cognitivo:
`apps/frontend/artifacts/api-server/src/luna`

---

## Frontends

### DEV

Responsável por:

* engenharia cognitiva
* observabilidade
* debug
* runtime inspection

### MEET

Responsável por:

* experiência cognitiva
* guidance
* onboarding
* interação humano-organismo

---

## Pipeline Cognitivo Oficial

extractSignals
retrieveMemory
buildContext
routeProvider
executeProvider
persistInteraction

---

## Contract Driven Architecture

Source of truth:
`apps/frontend/lib/api-spec/openapi.yaml`

Tecnologias soberanas:

* OpenAPI 3.1
* Orval
* Zod
* Drizzle
* Supabase

---

## Regras Soberanas

* providers NÃO são cognição
* memória NÃO é histórico bruto
* nunca criar runtime paralelo
* validar runtime real antes de refatorar
* consolidar antes de expandir
* preservar continuidade arquitetural
* não assumir redundância sem investigação

---

## Classificação dos runtimes

| Runtime                            | Status       |
| ---------------------------------- | ------------ |
| apps/frontend/artifacts/api-server | CORE         |
| apps/api/main.py                   | ADAPTER      |
| apps/api/server.js                 | LEGACY       |
| apps/core/main.py                  | EXPERIMENTAL |

---

## Objetivo Atual

PRIMEIRO LOOP COGNITIVO EXECUTÁVEL

Fluxo alvo:

USER
→ GPT Action
→ Runtime TS soberano
→ retrieveMemory
→ buildContext
→ ProviderRouter
→ Groq
→ Resposta
→ persistInteraction

---

## Fonte Canônica do Projeto Arquitetônico

A única fonte arquitetônica do ecossistema é:

`https://github.com/raugustorubens-design/Luna-context.md/tree/main/GENESIS/projeto-arquitetonico`

Este repositório é runtime e superfície de implementação. Não criar, copiar ou manter `GENESIS/projeto-arquitetonico/` aqui. Claude e Code devem consumir os pacotes no repositório canônico e registrar neste repositório somente especificações técnicas, implementação, testes e evidências.
