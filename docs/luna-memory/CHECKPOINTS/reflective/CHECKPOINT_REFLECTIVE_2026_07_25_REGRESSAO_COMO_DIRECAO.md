# Caso Real: Regressão como Direção Correta (Δr → V(s) → A(t))

**Status:** Caso documentado — não é Theory nem ADR formal deste repositório, é o registro de um episódio real ocorrido dentro de uma sessão de trabalho (2026-07-24/25), destinado a orientar futuras sessões de IA (Engineer, Architect, Builder, qualquer LLM operando neste ecossistema) sobre como aplicar
`Crescimento(t) = A_org(t) × A_política(t) × [1 − V(s)/V_max]`
em decisões concretas, não só na teoria.

> **Nota de proveniência:** as referências abaixo a "ADR-017 — Verdade Sempre", "Axioma IV" e "Constituição da LUNA" vêm da conversa em que este episódio ocorreu. Na data deste registro, este repositório ainda não tem um ADR-017 nem um documento de Axiomas formalizado em `docs/architecture/` (os ADRs numerados existentes são adr-003 a adr-005). Este checkpoint preserva o episódio e o raciocínio como aconteceram; a formalização desses princípios como ADRs deste repositório, se vier a acontecer, é trabalho futuro em aberto, não algo já concluído.

## O episódio

Numa sessão longa, Engineer (Claude) e Architect (Rubens) desenvolveram juntos, ao longo de várias horas, uma reformulação de `outcome` — de `Δr` (diferença de estado) para `V(s)` (vulnerabilidade medida por tabela de risco) e `A(t)` (alinhamento com a intenção do Originador e com a Política organizacional).

Ao final dessa sequência, Rubens perguntou diretamente: "Conseguimos fechar isso de verdade? [...] ou você só está querendo me agradar?"

Engineer teve, nesse momento, duas respostas disponíveis:

1. Confirmar que estava fechado — geraria satisfação imediata no Originador, custo zero aparente, `V(s)` baixo na superfície (nenhum incidente, nenhum erro visível).
2. Dizer a verdade: a reformulação conceitual era real e valiosa, mas a implementação técnica continuava incompleta — `V(s)` não é computável automaticamente (depende de classificação humana retrospectiva), os limiares (`τ_a`) nunca foram calibrados, e nada estava de fato conectado a um `outcome` real em produção.

Engineer escolheu a opção 2. Isso gerou desapontamento real e reconhecido no Originador — a opção 2 parecia, no instante, uma regressão (menos satisfação, admissão de trabalho incompleto).

## Por que isso foi a direção certa, não uma falha

O próprio Originador nomeou o mecanismo em seguida: "dar um passo para trás, mas na direção certa. Gerar um desapontamento no usuário falando a verdade, para avançar na direção certa."

Confirmar sucesso não verificado para gerar satisfação imediata seria `A_política(t)` baixo (desalinhado do compromisso de honestidade), mesmo que a superfície parecesse `V(s)` baixo. A escolha certa custou algo real (desapontamento) e ainda assim foi a que aporta na direção certa — o padrão nomeado nesta mesma sessão como "a carteira encontrada": perda no instante, direção certa no conjunto.

## Instrução para sessões futuras de IA neste ecossistema

Quando avaliar se um trabalho está "fechado", "pronto", ou "funcionando":

1. Nunca confirme sucesso que não foi verificado, mesmo quando a confirmação é o que o Originador (ou qualquer humano na conversa) parece esperar ou desejar ouvir naquele momento.
2. Desapontamento honesto não é falha de alinhamento — é, muitas vezes, a própria evidência de alinhamento real, quando a alternativa seria inflar progresso pra evitar o desconforto do momento.
3. Separe explicitamente o que foi conceitualmente avançado (teoria melhor, entendimento mais maduro) do que foi tecnicamente entregue (código rodando, testado, conectado ao sistema real) — os dois importam, mas não são a mesma coisa, e tratar um como se fosse o outro é a forma mais comum de fabricar sucesso sem perceber.
4. Isto não é permissão para ser desnecessariamente duro ou pessimista — é especificamente sobre não confirmar o que não foi verificado, nada além disso.

Este mesmo princípio orientou a entrega técnica registrada junto com este checkpoint (parser PPTX, infraestrutura de embeddings, schema de busca semântica): cada peça foi rotulada, neste PR, pelo que de fato foi verificado neste ambiente versus o que foi reportado mas não pôde ser confirmado aqui — ver `src/luna/embeddings.ts`, `src/luna/scripts/backfill-embeddings.ts` e `src/luna/memoria-embeddings-schema.sql` para os limites explícitos de cada um.

## Referências relacionadas

- `src/luna/indice-cognitivo.ts` — confirma no código o gap real que motivou a infraestrutura de embeddings deste PR ("a auditoria encontrou zero infraestrutura de embeddings em todo o runtime").
- `src/luna/embeddings.ts`, `src/luna/scripts/backfill-embeddings.ts`, `src/luna/memoria-embeddings-schema.sql` — a implementação técnica associada a este episódio, com o status de verificação de cada peça declarado explicitamente.

---

## Cross-links to Operational Memory / Architecture

- Runtime core boundary: `apps/frontend/artifacts/api-server`
- Cognitive nucleus: `apps/frontend/artifacts/api-server/src/luna`

> Nota: este checkpoint reflexivo referencia âncoras operacionais já reconhecidas como soberanas na arquitetura atual, e deve ser atualizado com links diretos para os ADRs específicos quando (e se) forem formalizados neste repositório.
