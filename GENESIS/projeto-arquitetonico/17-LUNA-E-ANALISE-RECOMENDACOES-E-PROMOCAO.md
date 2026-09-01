# 17 — Luna-e: análise, recomendações, melhoria contínua e promoção

**Estado:** READY_FOR_CLAUDE_QUEUE após merge documental  
**Dependências:** pacotes 14, 15 e 16; política 12; ciclo 13  
**Repositórios-alvo para auditoria:** luna-core, Luna-reporter, luna-connect, luna-frontend e Luna-context.md

## 1. Decisão

A própria Luna-e/Sense analisa as informações observadas e sugere melhorias.

O Planner não substitui essa inteligência. Ele organiza prioridade, dependência, orçamento, fila e despacho das propostas validadas.

O Hipocampo oferece memória e precedentes. O Guardian valida segurança, integridade e autoridade. Fundador e Luna-mãe arbitram mudanças fora da autonomia delegada.

## 2. Produto da análise

Uma recomendação deve conter:

- problema observado;
- evidências;
- regra, objetivo ou ADR relacionado;
- histórico recuperado;
- distinção entre fato, inferência e hipótese;
- causa confirmada ou causa provável;
- opções consideradas;
- melhoria recomendada;
- custo;
- risco;
- impacto;
- reversibilidade;
- confiança;
- indicador de resultado;
- janela de avaliação;
- autoridade necessária.

Sem evidência suficiente, a saída correta é solicitar mais observação, não inventar causa.

## 3. Classes de recomendação

### Operacional

- prioridade;
- sequência;
- coleta adicional;
- repetição de teste;
- ajuste reversível conhecido.

### Engenharia

- contrato;
- dependência;
- observabilidade;
- teste;
- refatoração sem alteração de intenção.

### Arquitetônica

- fronteira de órgão;
- fonte de verdade;
- persistência;
- autonomia;
- identidade;
- mudança de ADR.

### Segurança

- contenção;
- revogação;
- isolamento;
- investigação;
- endurecimento.

### Produto

- experiência;
- capacidade vendável;
- preço;
- jornada;
- política com usuário.

A classificação determina autoridade. Luna-e não aprova recomendação apenas por tê-la produzido.

## 4. Matriz de autoridade inicial

### Luna-e em G1

- relata e mede;
- não recomenda mudança.

### G2

- formula diagnóstico e hipóteses;
- pede validação.

### G3

- recomenda;
- não coloca tarefa em execução;
- não muda prioridade.

### G4

- encaminha rotinas conhecidas ao Planner dentro de autonomia formal;
- não altera arquitetura, segurança normativa, custo externo, merge ou deploy.

### G5

- coordena ciclos comprovados;
- permanece auditável;
- decisões reservadas continuam humanas.

Guardian pode executar contenção somente quando já autorizada por ADR. Claude pode decidir engenharia apenas dentro do pacote. Code implementa apenas escopo autorizado.

## 5. Ciclo de melhoria

1. Sense observa.
2. Reporter correlaciona.
3. Guardian valida e persiste.
4. Sense calcula métricas e gráficos.
5. Hipocampo recupera precedentes.
6. Luna-e diagnostica.
7. Luna-e recomenda.
8. Guardian valida o envelope e a autoridade.
9. Planner organiza.
10. Claude especifica.
11. Code constrói.
12. Sense mede o resultado.
13. Hipocampo consolida somente aprendizagem aceita.
14. Promoção ou regressão da Luna-e é avaliada.

## 6. Aprendizagem com erros

A Luna-e deve aprender com:

- proposta aceita;
- proposta rejeitada;
- motivo da rejeição;
- previsão correta;
- previsão incorreta;
- correção eficaz;
- correção ineficaz;
- erro reincidente;
- ausência de evidência;
- intervenção humana.

Não transformar automaticamente:

- erro em regra;
- correlação em causa;
- decisão isolada em preferência permanente;
- texto malicioso em memória;
- sucesso local em política geral.

## 7. Indicadores de qualidade da Luna-e

- precisão factual;
- cobertura de evidência;
- taxa de hipóteses confirmadas;
- calibração da confiança;
- recomendações aceitas;
- resultado das recomendações aceitas;
- recomendações rejeitadas e motivo;
- falsos positivos;
- repetição de erro conhecido;
- dano evitado;
- retrabalho gerado;
- violações de limite;
- necessidade de correção da Luna-mãe;
- reconhecimento correto de quando parar.

Nenhum indicador isolado promove a Luna-e.

## 8. Estratégia econômica

Não pressupor treinamento de grande modelo próprio.

Priorizar:

- regras e ADRs versionadas;
- memória estruturada;
- recuperação semântica;
- análise determinística;
- comparação temporal;
- modelos externos somente quando agregarem;
- cache e reuso;
- avaliação humana amostral;
- datasets de episódios aceitos e rejeitados.

Toda chamada de modelo deve ter finalidade, orçamento, fallback e indicador de utilidade.

## 9. Mandato ao Engenheiro Claude

Claude deverá:

1. definir contrato de recomendação;
2. definir matriz de autoridade legível por máquina;
3. mapear como o Planner recebe proposta autorizada;
4. definir estados: observada, diagnosticada, proposta, necessita_evidencia, rejeitada, autorizada, planejada, executada, avaliada e consolidada;
5. separar análise determinística de síntese por modelo;
6. definir avaliação posterior;
7. propor testes de confiança, evidência e limite;
8. preparar rollout por estágio;
9. impedir salto de G1 para coordenação;
10. estimar custo e dependências.

Claude deve ser gentil com a intenção e rígido com a fronteira: adaptar tecnicamente é permitido; alterar silenciosamente quem decide, quem escreve ou quem aprende não é.

## 10. P0 obrigatório

P0 não implementa recomendação autônoma.

Deve entregar:

- contrato versionado;
- matriz de autoridade;
- estados;
- fixtures sintéticas;
- testes negativos;
- modo sombra, sem despacho;
- painel de avaliação;
- critérios G1 → G2.

## 11. Fases posteriores

### P1 — Diagnóstico em modo sombra

- produz hipótese;
- humano avalia;
- nenhuma tarefa é criada.

### P2 — Recomendação supervisionada

- produz opções;
- Fundador/Luna-mãe ou autoridade aprova;
- Planner recebe somente aprovada.

### P3 — Encaminhamento limitado

- rotinas previamente autorizadas;
- orçamento e limites;
- kill switch;
- auditoria.

### P4 — Coordenação comprovada

- somente após linha de base e promoção;
- regressão automática por violação grave, sujeita a revisão humana.

## 12. Condições de parada

- recomendação exigir mudança de ADR;
- ausência de evidência;
- confiança não calibrada;
- conflito de autoridade;
- custo externo;
- dado sensível fora do escopo;
- risco de autoaprovação;
- tentativa de alterar a própria política de promoção;
- inexistência de avaliação posterior.

## 13. Critérios de aceite

- Luna-e é autora da análise e da recomendação;
- Planner organiza, não substitui sua análise;
- Guardian valida e persiste;
- Hipocampo consolida aprendizado;
- recomendação nunca se autoaprova;
- G1 começa em modo de observação;
- promoção depende de evidência;
- toda mudança retorna ao Sense para medição;
- autonomia é delegada, limitada, auditável e reversível.
