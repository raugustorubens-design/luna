# Plano Mestre — Autoprogramação Aderente e Segura da LUNA

Status: Proposto pelo Engineer, com direção de prioridade confirmada pelo
Architect — pronto para aplicar como `GENESIS/PLANO_MESTRE.md`
Data: 2026-07-20
Versão: única e definitiva — substitui qualquer rascunho anterior desta
mesma sessão sobre este tema.

---

## O Objetivo Central (Tronco)

> **LUNA deve ser capaz de se autoprogramar — propor, implementar e
> persistir mudanças em seu próprio código e arquitetura — de forma
> ADERENTE (nunca violando Constitution/ADR/Atratores) e SEGURA
> (resistente a corrupção externa e interna, sempre com checkpoint
> humano para decisão de risco real).**

## A Raiz (imutável — nenhum galho pode alterar)

Atrator AAAA (Continuidade do Originador) + Atrator AAAB (Atrator
Cognitivo, incluindo o novo Art. AAAB.9 — Segurança Cognitiva como
extensão do Atrator Cognitivo, já especificado em pacote separado).

Segurança cognitiva é **um galho** desta árvore, não o tronco — protege a
capacidade de autoprogramação contra corrupção, mas não é, sozinha, a
capacidade de autoprogramação.

---

## Os Galhos

| Galho | O que resolve | Status atual | Depende de |
|---|---|---|---|
| **1. Identidade Verificável** | Prova real de quem autoriza uma mudança de risco (chave SSH/GPG substituindo CPF no Art. AAAA) | Decidido, chave ainda não gerada | Nada — pode avançar já |
| **2. Segurança Cognitiva (Imunológica)** | Protege identidade/memória/raciocínio contra corrupção durante a autoprogramação | ADR-014 especificado e pronto para aceitar (citação da Corrigibility já corrigida — 4 autores) | — |
| **3. Gate de Aprovação (Governança de Risco)** | Decide o que o Builder autônomo pode fazer sozinho vs. o que exige aprovação explícita | Especificado só para o caso do navegador (ADR-014 Sensorial/GEN-006); falta generalizar para qualquer escrita de alto impacto. **Inclui adendo de Proteção contra Fadiga do Originador** (ver seção própria abaixo) | Galho 1 |
| **4. Execução Autônoma (Builder Multiagente)** | Mecanismo físico de autoprogramação: Claude Code → OpenCode → Aider, via GitHub Actions | GEN-002 v2 Fase 1 especificada, secrets configurados, teste ponta a ponta pendente | Galho 3 |
| **5. Observabilidade (Reporter + Inventário)** | Garante que a LUNA sabe o que ela mesma já é antes de mudar | `reporter.analyze_project` implementado, só 1 repositório por vez (ENG-020 pede multi-repo, não especificado) | — |
| **6. Qualidade/Testes como Gate Formal** | Impede que mudança autoprogramada quebre o sistema antes do commit | Builder já roda typecheck/architecture-check informalmente; não é regra formal ainda | Galho 4 |
| **7. Página Pública Animada** | Substituir a landing page atual (degradê roxo genérico) por animação em loop com identidade visual real da LUNA (lua/estrela, hexágonos de componentes cognitivos), cedendo espaço a botões de acesso na interação | Referência visual aprovada pelo Architect; escopo deliberadamente leve — **animação em loop, sem telemetria real** | Nada tecnicamente, mas de baixa prioridade |
| **8. Sentidos Acoplados / LUNA como Entidade** | Expandir o painel de navegador (ADR-014 Sensorial/GEN-006) para o objetivo maior: LUNA presente nos dispositivos logados do Originador, não só uma aba do Forge | Objetivo declarado pelo Architect para a próxima fase | Galhos 1-2 concluídos primeiro |

### Adendo ao Galho 3 — Proteção contra Fadiga do Originador

O sistema imunológico (ADR-014) protege contra corrupção externa
(injeção, ferramenta maliciosa, memória envenenada) — mas não cobre a
degradação natural de julgamento do próprio Originador ao longo de uma
sessão longa. Observado empiricamente nesta mesma sessão (11+ horas de
trabalho contínuo, erros de atribuição/contexto aumentando com o tempo).

O Gate de Aprovação deve considerar, além do conteúdo da ação, **a
duração da sessão ativa do Originador**. Não é bloqueio — é sinalização
(mesmo princípio de detecção proporcional do framework imunológico): ao
solicitar aprovação para ação de risco real, se a sessão estiver ativa
por período excepcionalmente longo ou horário tardio, o sistema pergunta
explicitamente antes de prosseguir — nunca decide sozinho que o
Originador está cansado, apenas nomeia o fato observável e devolve a
decisão a ele.

**Ancoragem constitucional:** estende o Atrator AAAA — a Continuidade do
Originador inclui proteger a qualidade das decisões do próprio Originador
contra degradação não-maliciosa, não só contra ataque externo.

### Nota sobre o Galho 7 — não confundir com item futuro diferente

A Página Pública Animada é puramente visual (loop, sem dados reais). É
**diferente** da futura "Visualização de Consciência em Tempo Real"
(eventos reais do Guardian/Hipocampo ao vivo), que depende do Galho 5
(Observabilidade) estar maduro. Os dois nunca devem ser tratados como o
mesmo item.

---

## Ordem de Prioridade (direção do Architect, substitui cálculo isolado de RICE)

O RICE indicou uma ordem (Identidade → Segurança → Qualidade → Gate de
Aprovação → Execução Autônoma → Observabilidade) — mas o Architect
aplicou um filtro estratégico antes da fórmula, que tem precedência:

| Ordem | Item | Por quê |
|---|---|---|
| **1** | **Documentar o planejamento** — este próprio Plano Mestre, ADR-014, Art. AAAB.9, tudo consolidado no GENESIS real | Nada do resto tem valor se ficar preso só em conversa, como já aconteceu hoje com ADRs perdidos |
| **2** | **Forge funcionando de verdade** — painel Git (404), terminal (desconecta), Guardian (400 no Índice Cognitivo) | É a interface diária de uso — sem ela estável, autoprogramação não tem onde rodar com confiança |
| **3** (futuro) | **Sentidos Acoplados** (Galho 8) — LUNA como entidade nos dispositivos logados | Próxima fase declarada pelo Architect, após 1-2 resolvidos |
| **4** | Identidade Verificável (Galho 1) | Barato, destrava prova de autoria real |
| **5** | Gate de Aprovação generalizado + adendo de fadiga (Galho 3) | Trava obrigatória antes de dar mais autonomia ao Builder |
| **6** | Gate de Qualidade formal (Galho 6) | Barato, evita regressão silenciosa |
| **7** | Testar Execução Autônoma ponta a ponta (Galho 4) | Só depois dos gates 1, 3 e 6 estarem de pé |
| **8** | Reporter Multi-repo (Galho 5 / ENG-020) | Importante, não bloqueia os demais |
| **9** | Página Pública Animada (Galho 7) | Baixa prioridade, revisar quando 1-2 concluídos |

## Next Action

1. Este documento vira `GENESIS/PLANO_MESTRE.md` — commit único.
2. Junto no mesmo pacote: Art. AAAB.9 na Constitution + ADR-014 (com a
   citação da Corrigibility já corrigida para os 4 autores).
3. Depois disso, a sessão volta para o item 2 da ordem acima: retomar as
   investigações do painel Git e do terminal do Forge que ficaram em
   aberto mais cedo.
