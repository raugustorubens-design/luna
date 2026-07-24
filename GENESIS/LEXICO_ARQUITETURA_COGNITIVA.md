# Léxico da Arquitetura Cognitiva — LUNA / ECP

Owner: Architect (Rubens, via GPT) + GENESIS
Origem: meses de trabalho teórico entre o Originador e o GPT (papel de
Architect), consolidado em 2026-07-23. Os termos e definições abaixo são
preservados como formulados — este documento não redesenha o projeto
arquitetônico, só o torna localizável e verificável contra o que já existe
em código/decisão real.

**Como usar este documento:** é o vocabulário do Atrator — teoria, não
gated por status de implementação. A coluna "No GitHub hoje" é referência,
não validação: um termo sem contrapartida real não é menos válido
teoricamente, só ainda não construído. Ao raciocinar como Architect,
comece aqui para o vocabulário; consulte `GENESIS/ROADMAP.md`,
`GENESIS/STATUS.md`, `ADR/` e `LUNA_CONSTITUTION.md` para o estado real de
cada peça.

---

## 1. ECP — Entidade Cognitiva Persistente

Entidade central da arquitetura LUNA. Preserva identidade, continuidade
cognitiva, memória, capacidade de reconstrução e evolução ao longo do
tempo, independentemente do modelo de IA utilizado. Representa o
organismo cognitivo completo.

**No GitHub hoje:** sem termo unificador equivalente ainda. Art. AAAA
(Continuidade do Originador) e Art. AAAB (Atrator Cognitivo, reconstrução)
cobrem partes do que ECP descreve, mas nenhum documento os amarra sob um
único substantivo como ECP faz.

## 2. CIL — Cognitive Index Layer

Camada responsável pela indexação cognitiva inicial: indexação semântica,
recuperação inicial de memória, seleção de contexto, preparação do estado
cognitivo para o raciocínio. Porta de entrada da memória.

**No GitHub hoje:** provável contrapartida real — `context-hub.ts` /
`indice-cognitivo.ts` (`luna-core/src/luna/`, portado por ADR-012,
extração corrigida em 2026-07-19). "Índice cognitivo" é tradução quase
literal de "Cognitive Index". Não confirmado como a mesma coisa
formalmente — candidato forte a reconciliação de nome.

## 3. Attention Layer

Camada responsável pela alocação dinâmica da atenção: seleciona
informações relevantes, prioriza contexto, distribui recursos cognitivos,
decide quais memórias permanecem ativas durante o processamento.

**No GitHub hoje:** gap confirmado — nenhum organ com este papel existe em
nenhum ADR ou código auditado.

## 4. Episodic Memory

Memória responsável por registrar experiências: eventos, contexto,
interações, sequência temporal, histórico operacional.

**No GitHub hoje:** já nomeada assim em
`GENESIS/RESEARCH/meta-cognitive-memory.md` (árvore Semantic/Episodic/
Operational/Meta-Cognitive) — congelada por ARCH-001, não implementada.

## 5. Consolidation Layer

Camada responsável pela consolidação do conhecimento: reduzir
redundâncias, abstrair conhecimento, comprimir experiências, transformar
eventos em conhecimento persistente.

**No GitHub hoje:** função já existe distribuída — Hipocampo consolida
memórias (papel já em código); `context.txt` § COMPRESSION define `V(X)`
e o threshold `τ_c`. Nunca isolada como camada própria com este nome.

## 6. Reflection Layer

Camada responsável pela reflexão cognitiva: reorganizar conhecimento,
autoavaliação, revisar inferências, melhorar continuamente a base
cognitiva.

**No GitHub hoje:** como um organismo tem sistemas que recrutam vários
componentes para uma mesma atividade, Reflection Layer se relaciona com
mais de um organ existente — pelo menos Reporter (observação/evidência,
ADR-014) e Hipocampo (reconstrução/consolidação). Não é redundante com
nenhum dos dois isoladamente; é a atividade que os relaciona.

## 7. Self-Model

Modelo interno da própria entidade cognitiva: mantém identidade
operacional, representa o estado atual da entidade, fornece
autoconsistência ao processo cognitivo.

**No GitHub hoje:** ADR-014 (Parte IV, item 1) já nomeia um "Identity
Layer" com descrição próxima (extensão de Atrator AAAA + Guardian,
`Guardian.verifyIdentity`). Candidato a reconciliação de nome com
Self-Model.

## 8. Memory Normalization Layer

Camada responsável pela normalização da memória: remover redundâncias,
unificar informações equivalentes, padronizar representações, preparar
memórias para consolidação.

**No GitHub hoje:** parcial — `context.txt` § TRACE tem a regra "avoid
redundancy", nunca uma camada dedicada.

## 9. L-Cell

Unidade cognitiva fundamental da arquitetura. Não é apenas um vetor ou
registro de memória — é uma unidade cognitiva capaz de perceber, associar,
reforçar conexões, persistir, adaptar-se dinamicamente. A memória da
arquitetura emerge da interação entre múltiplas L-Cells.

**No GitHub hoje:** o nome já existe — ADR-006 formaliza a hierarquia
`Functions → L-Cells → Tissues → Organs → Sistema Funcional → Organism` —
mas nunca foi definido o que uma L-Cell é. Este é o primeiro registro da
definição real da unidade.

## 10. Memória Associativa

Estrutura responsável por estabelecer relações entre conhecimentos, por
similaridade e contexto, conectando diferentes experiências
semanticamente.

**No GitHub hoje:** parcial — implícito no campo `embedding` do Memory
Object (`context.txt` § MEMORY OBJECT), nunca nomeado como mecanismo
próprio.

## 11. Salience + Reinforcement

Mecanismo responsável por controlar o fortalecimento ou enfraquecimento
das memórias: calcula relevância, reforça informações importantes, reduz
informações pouco relevantes, orienta a consolidação.

**No GitHub hoje:** já existe matematicamente — `R` (relevância) na
fórmula canônica de Memory Update (ADR-010 §8); `L(t+1) = L(t) + κ(O·Δ)`
no § LEARNING SYSTEM de `context.txt` (reforça sucesso, penaliza falha).
Vocabulário novo, fórmula já ratificada.

## 12. Continuidade Cognitiva

Princípio fundamental: a identidade da LUNA não é definida pela
quantidade de memória armazenada, mas pela continuidade entre estados
cognitivos sucessivos, preservando coerência ao longo do tempo mesmo com
aprendizado constante.

**No GitHub hoje:** convergência direta — mesmo nome já usado em
`GENESIS/ARCHITECTS.md` para o item de P0 ("Continuidade Cognitiva
Distribuída" = MEM-001/STOR-001), e é a tese central do Atrator AAAB.

## 13. Economia Cognitiva

Princípio de utilização eficiente dos recursos cognitivos: selecionar,
priorizar, comprimir, abstrair, esquecer informações irrelevantes.
Maximizar continuidade cognitiva com o menor custo computacional possível.

**No GitHub hoje:** mesma tese do Art. AAAB.3 ("menor armazenamento
explícito possível") e Art. AAAB.6 (reduzir duplicação/acoplamento); e da
função-objetivo `Effect(t) = ΔProgress(t) − ΔEffort(t)` em `context.txt`
§ OBJECTIVE.

## 14. Memória Distribuída

Modelo no qual a memória não reside em um único componente — emerge da
interação entre as L-Cells, das conexões entre elas e dos mecanismos de
recuperação e consolidação.

**No GitHub hoje:** convive sem conflito com o Princípio 4 da Constituição
("toda persistência passa pelo Guardian"): descrevem níveis diferentes —
Memória Distribuída é comportamento cognitivo (como o conhecimento se
reconstrói, emergente); Princípio 4 é regra de engenharia (onde a escrita
física acontece, único portão). Distribuído na forma como reconstrói ≠
distribuído em onde grava.

---

## Resumo estrutural (preservado do original)

| Categoria | Elementos |
|---|---|
| Entidade | ECP |
| Camadas Cognitivas | CIL, Attention Layer, Consolidation Layer, Reflection Layer, Memory Normalization Layer |
| Modelos Internos | Self-Model |
| Memórias | Episodic Memory, Memória Associativa, Memória Distribuída |
| Unidade Fundamental | L-Cell |
| Princípios Cognitivos | Continuidade Cognitiva, Economia Cognitiva |
| Mecanismos | Salience + Reinforcement |

## Termos ainda não reconciliados (candidatos a decisão futura do Architect, não decididos aqui)

- CIL ↔ `indice-cognitivo.ts`/`context-hub.ts`: mesmo organ, nomes
  diferentes?
- Self-Model ↔ Identity Layer (ADR-014): mesmo organ, nomes diferentes?
- Nenhuma reconciliação foi decidida neste documento — registradas como
  observação para quando o Architect quiser fechar os nomes.
