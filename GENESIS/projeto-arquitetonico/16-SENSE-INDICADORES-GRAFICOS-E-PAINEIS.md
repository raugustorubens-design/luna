# 16 — Sense: indicadores, gráficos, alertas e painéis de observabilidade

**Estado:** READY_FOR_CLAUDE_QUEUE após merge documental  
**Dependências:** pacotes 14 e 15  
**Repositórios-alvo para auditoria:** Luna-reporter, luna-frontend, luna-core e Luna-context.md

## 1. Decisão

A Luna-e/Sense deve gerar gráficos para tornar o estado do organismo compreensível.

Gráfico não é decoração. Cada visual deve responder a uma pergunta operacional, arquitetônica, econômica, de segurança ou desenvolvimento.

O Reporter produz fatos estruturados. O Guardian valida e persiste. O Sense calcula indicadores e apresenta gráficos a partir do histórico validado.

## 2. Públicos e superfícies

### Fundador e Luna-mãe

- saúde geral;
- divergências arquitetônicas;
- custos;
- evolução da Luna-e;
- decisões que exigem arbitragem.

### Claude

- dependências;
- ambiguidade;
- retrabalho por especificação;
- fila pronta sem perguntas;
- falhas antes do Builder.

### Code

- tarefas;
- critérios de aceite;
- testes;
- bloqueios;
- recorrência de defeitos de implementação.

### Guardian/CIS

- incidentes;
- severidade;
- contenção;
- credenciais;
- violações de política.

Nenhuma superfície deve expor dados pessoais ou segredos por padrão.

## 3. Painéis mínimos

### 3.1 Saúde do organismo

Perguntas:

- quais componentes estão disponíveis;
- onde aumentaram erros ou latência;
- quais integrações pararam;
- quando ocorreu a mudança.

Indicadores:

- disponibilidade;
- latência p50/p95/p99 quando aplicável;
- taxa de erro;
- backlog;
- última atividade;
- dependências degradadas.

### 3.2 Fila de trabalho

- pacotes por estado;
- envelhecimento por etapa;
- throughput;
- tempo de ciclo;
- bloqueios;
- tarefas noturnas interrompidas;
- PRs aguardando revisão ou merge.

Visuais recomendados:

- fluxo acumulado;
- aging;
- distribuição por estado;
- tendência de lead time.

### 3.3 Erros e recorrência

- erros por categoria e componente;
- Pareto de recorrência;
- primeira ocorrência e última;
- correções;
- reincidência depois da correção;
- erros conhecidos repetidos.

### 3.4 Aderência arquitetônica

- violações de ADR;
- divergência da política do Fundador;
- persistência fora do Guardian;
- acesso fora de escopo;
- mudança além do pacote;
- exploração produtiva versus deriva.

### 3.5 Eficiência dos agentes

- aceite na primeira revisão;
- retrabalho;
- perguntas evitáveis;
- custo por capacidade aceita;
- tempo por etapa;
- execução noturna sem intervenção;
- defeitos de arquitetura, engenharia e build separados.

Indicadores não serão usados para punição ou ranking simplista. Primeiro formar linha de base.

### 3.6 Desenvolvimento da Luna-e

- episódios observados;
- relatórios aceitos e rejeitados;
- hipóteses confirmadas;
- recomendações;
- confiança declarada versus acerto;
- resultados posteriores;
- critérios de promoção;
- regressões de estágio.

### 3.7 Segurança

- eventos por severidade;
- tentativas bloqueadas;
- testes defensivos;
- honeypot;
- tempo de detecção;
- tempo de contenção;
- vulnerabilidades abertas e corrigidas.

## 4. Semântica obrigatória

Todo indicador deve declarar:

- pergunta respondida;
- fórmula;
- unidade;
- fonte;
- janela temporal;
- timezone;
- atualização;
- população incluída;
- dados ausentes;
- responsável pelo contrato;
- versão.

Não misturar:

- zero com dado ausente;
- falha com cancelamento;
- mudança de decisão com defeito;
- correlação com causa;
- pacote concluído com capacidade verificada;
- teste verde com funcionamento em produção.

## 5. Alertas

Alertas pertencem ao Sense e são emitidos ao Guardian.

Cada alerta deve conter:

- regra ou detector;
- evidência;
- severidade;
- confiança;
- janela;
- deduplicação;
- cooldown;
- componente;
- ação permitida.

O Sense não executa contenção. O Guardian decide e executa ações previstas nas ADRs.

Evitar fadiga de alerta. Todo alerta precisa de proprietário, critério de encerramento e avaliação posterior.

## 6. Privacidade e segurança

- dados agregados por padrão;
- drill-down somente por papel autorizado;
- nenhuma razão social real em demonstração pública;
- nenhum token, credencial ou payload sensível;
- logs e gráficos não podem virar canal lateral;
- exportações devem ser auditáveis;
- retenção definida por classe de dado.

## 7. Mandato ao Engenheiro Claude

Claude deverá:

1. inventariar o que o Luna-reporter já mede;
2. mapear fontes reais disponíveis;
3. propor dicionário de métricas versionado;
4. escolher stack de visualização somente após auditar o frontend;
5. separar MVP determinístico de análises por IA;
6. produzir wireframe técnico dos painéis;
7. definir endpoints, caching, paginação e atualização;
8. preparar testes de fórmula e segurança;
9. evitar nova infraestrutura se componentes existentes atenderem;
10. registrar custo de operação.

Claude não deverá:

- escolher gráficos por estética;
- criar meta antes da linha de base;
- expor dados de cliente;
- permitir query arbitrária do frontend;
- acoplar dashboard à service_role;
- usar LLM para calcular métricas determinísticas;
- implementar todos os painéis em um único PR.

## 8. Ordem de entrega

### P0 — Dicionário e linha de base

- perguntas;
- métricas;
- fórmulas;
- fontes;
- eventos ausentes;
- dados sintéticos.

### P1 — Painel de saúde e fila

- saúde;
- fila;
- lead time;
- erros;
- filtros temporais.

### P2 — Erros, aderência e agentes

- recorrência;
- deriva;
- retrabalho;
- custo;
- qualidade.

### P3 — Segurança

- severidade;
- contenção;
- teste defensivo;
- honeypot.

### P4 — Desenvolvimento da Luna-e

- maturidade;
- confiança;
- recomendações;
- resultados.

### P5 — Alertas e relatórios executivos

- alertas;
- digest diário;
- relatório matinal;
- exportação controlada.

## 9. Testes obrigatórios

- fórmulas com fixtures conhecidas;
- timezone;
- ausência versus zero;
- autorização de drill-down;
- nenhum segredo no payload;
- filtros;
- paginação;
- acessibilidade;
- responsividade;
- desempenho com volume projetado;
- visual não induz conclusão incompatível com os dados.

## 10. Critérios de aceite

- todo gráfico responde uma pergunta;
- todo número tem fórmula e fonte;
- painel distingue fato, hipótese e ausência;
- linha de base precede metas;
- gráficos funcionam em PC e celular;
- Guardian recebe alertas; Sense não contém;
- dados sensíveis permanecem protegidos;
- custo e atualização são conhecidos.
