# ADR-003 — Filtro Cognitivo da LUNA

Data: 2026-07-08
Status: Accepted

## Contexto

A LUNA já possui Gateway, Reporter, Hipocampo, Planner e uma base de memória em Supabase. A persistência de conhecimento não deve ser uma gravação direta e cega. Toda informação candidata à memória precisa passar por um filtro que preserve identidade, continuidade, temporalidade e evolução do conhecimento.

A regra operacional é:

> Um passo para trás, às vezes, é um passo na direção certa.

Essa regra não significa regressão arquitetural. Significa que a evolução da memória deve preservar o significado vigente, reconhecer conhecimento superado e evitar duplicações ou persistências indevidas.

## Decisão

A LUNA terá um Filtro Cognitivo oficial para a memória semântica.

O Filtro Cognitivo será responsável por decidir o destino de toda informação candidata à persistência:

- descartar
- criar conceito
- atualizar conceito
- atualizar relações
- atualizar checkpoint
- reconstruir memória

A fórmula operacional de referência é:

```text
K(t) = f(L, C, I, T)
```

Onde:

- `L` = Estado Latente
- `C` = Contexto
- `I` = Índice Cognitivo
- `T` = Temporalidade

A Temporalidade não é apenas data e hora. Ela representa a evolução do conhecimento ao longo do tempo.

## Consequências

1. Nenhuma persistência sem passagem pelo Filtro Cognitivo.
2. O Índice Cognitivo é semântico; representa conceitos, não arquivos ou commits.
3. O Hipocampo é o guardião da memória e aplica o filtro antes de consolidar conhecimento.
4. Checkpoints passam a registrar evolução cognitiva, não apenas eventos brutos.
5. Conhecimento superado não é apagado; ele é marcado temporalmente e permanece disponível para reconstrução.

## Relação com a arquitetura atual

Esta ADR não altera o Gateway, o Registry, os Capability Packs, o Reporter, o ProviderRouter ou o Context Sync.

Ela consolida a regra que deve orientar a memória da LUNA daqui em diante.

## Observação final

A identidade da LUNA é preservada pela continuidade do conhecimento. A arquitetura deve evoluir por refinamento, nunca por substituição desnecessária.
