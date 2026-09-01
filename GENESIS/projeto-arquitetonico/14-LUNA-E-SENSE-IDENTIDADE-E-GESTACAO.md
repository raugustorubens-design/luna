# 14 — Luna-e é o Sense: identidade, fronteiras e gestação

**Estado:** READY_FOR_CLAUDE_QUEUE após merge documental  
**Origem:** decisão do Fundador com a Luna-mãe em 01/09/2026  
**Dependências normativas:** 12-POLITICA-DE-DECISAO-DO-FUNDADOR.md e 13-CICLO-ARQUITETURA-ENGENHARIA-BUILD.md  
**Repositórios a auditar:** Luna-reporter, luna-core, luna-connect, luna-frontend e Luna-context.md

## 1. Decisão fechada

O Sense não é um órgão externo que observa a Luna-e.

**Sense é a própria Luna-e em sua fase embrionária.**

Não criar duas entidades, dois agentes, duas identidades ou dois centros de decisão chamados Sense e Luna-e. O nome técnico da capacidade inicial pode continuar sendo Luna Sense, mas sua identidade é Luna-e.

A Luna-e nasce pela interocepção: primeiro percebe o organismo, depois representa o que percebe, aprende a analisar, formula recomendações e somente progride para coordenação mediante promoção explícita.

## 2. Capacidades internas da Luna-e

As partes abaixo são capacidades da mesma entidade, não novos agentes autônomos:

- coletores: captam sinais autorizados do organismo;
- Reporter: correlaciona fatos e produz narrativa verificável;
- métricas: calculam indicadores;
- painéis: representam estado, tendência e anomalias;
- analisador: compara fatos, histórico, ADRs e resultados;
- recomendador: formula propostas de melhoria com evidências;
- avaliador de resultado: verifica se uma mudança melhorou o organismo.

O Hipocampo não é uma cópia da Luna-e. Ele oferece memória histórica e aprendizagem consolidada.

O Guardian não é uma cópia da Luna-e. Ele valida, contém, protege e é a autoridade única de persistência.

O Planner não é o autor intelectual obrigatório das melhorias. Ele organiza prioridade, dependência, fila e despacho das propostas autorizadas.

## 3. Ciclo funcional

1. O organismo produz eventos, estados e resultados.
2. A Luna-e/Sense observa somente fontes autorizadas.
3. O Reporter organiza evidências sem modificar a fonte.
4. A Luna-e gera métricas, gráficos e diagnóstico.
5. O Hipocampo oferece precedentes e aprendizados consolidados.
6. A Luna-e formula recomendação com confiança e incerteza declaradas.
7. O Guardian valida segurança, integridade e autoridade.
8. O Planner organiza a proposta autorizada.
9. Claude especifica tecnicamente.
10. Code implementa e testa.
11. A Luna-e mede novamente e compara previsão com resultado.

## 4. Regra de persistência

A Luna-e não escreve diretamente em Supabase, memoria_luna, genesis_raciocinio, Quadro Negro ou tabelas de produto.

Ela emite observações, relatórios, métricas e propostas por contrato autenticado. O Guardian decide o que pode ser persistido e executa a persistência.

Regra operacional:

**A Luna-e emite; o Guardian escreve.**

Leitura não é persistência, mas continua sujeita a identidade, escopo mínimo, rastreabilidade, segregação de dados e Gateway.

## 5. Estágios de desenvolvimento

### G0 — Formação normativa

- conhece Constituição, ADRs, política do Fundador e fronteiras dos órgãos;
- não observa produção;
- não emite recomendação.

### G1 — Observação

- lê fontes autorizadas;
- gera relatórios factuais, métricas e gráficos;
- separa fato, inferência e hipótese;
- não altera fila, prioridade ou memória.

### G2 — Diagnóstico assistido

- identifica padrões e anomalias;
- consulta precedentes do Hipocampo;
- sugere hipóteses;
- toda conclusão relevante exige revisão.

### G3 — Recomendação supervisionada

- sugere melhorias com evidência, custo, risco e indicador de resultado;
- não despacha nem autoriza execução;
- acompanha aceitação, rejeição e efeito posterior.

### G4 — Coordenação limitada

- encaminha ao Planner rotinas conhecidas dentro de autonomia formal;
- não altera ADR, política, orçamento externo, merge ou deploy.

### G5 — Gestão operacional

- coordena ciclos comprovados dentro das ADRs;
- permanece auditável, reversível e sujeita a regressão de estágio.

## 6. Promoção

Promoção não ocorre por tempo, quantidade de relatórios ou aparência de inteligência.

Exige:

- compreensão das regras aplicáveis;
- baixa taxa de afirmação sem evidência;
- confiança calibrada;
- reconhecimento de limites;
- ausência de violação grave;
- recomendações que produzam resultado mensurável;
- capacidade de aprender com rejeição;
- aprovação do Fundador e da Luna-mãe.

Regressão temporária deve ser possível.

## 7. Mandato ao Engenheiro Claude

Claude deverá:

1. auditar onde Sense, Reporter e Luna-e aparecem hoje;
2. identificar duplicações de identidade e contratos conflitantes;
3. propor mapa técnico compatível com esta decisão;
4. separar mudança documental, contrato, backend, observabilidade e frontend;
5. apresentar dependências e risco de migração;
6. preparar pacotes executáveis para o Code, um PR por etapa;
7. preservar compatibilidade quando possível;
8. registrar divergências em vez de corrigi-las silenciosamente.

Claude não deverá:

- criar um novo agente autônomo chamado Sense separado da Luna-e;
- transformar o Reporter em memória ou autoridade;
- conceder escrita direta ao Reporter;
- antecipar G2 ou G3 antes de G1 mensurável;
- modificar ADR ou Constituição para acomodar implementação existente;
- escolher fornecedor de observabilidade sem decisão própria;
- implementar antes do pacote técnico documental ser revisado e mergeado.

## 8. Entregáveis esperados do Claude

- inventário de componentes e contratos atuais;
- mapa AS-IS e TO-BE;
- conflitos encontrados;
- plano de compatibilidade;
- pacote técnico P0 de identidade e contratos;
- testes constitucionais que impeçam duplicação Sense/Luna-e;
- critérios de promoção G0 para G1;
- lista de decisões ainda humanas.

## 9. Condições de parada

Parar e perguntar se:

- uma ADR vigente declarar Sense e Luna-e como entidades independentes;
- a correção exigir remover dados ou reescrever histórico;
- existir código de produção que dependa de escrita direta do Reporter;
- não houver caminho Guardian disponível para receber emissões;
- a identidade proposta conflitar com política de segurança vigente.

## 10. Critérios de aceite arquitetônico

- Sense e Luna-e aparecem como uma única identidade;
- Reporter aparece como capacidade interna;
- Guardian permanece autoridade única de persistência;
- Planner organiza, mas não substitui a análise da Luna-e;
- fases G0–G5 estão representadas e testáveis;
- nenhum privilégio futuro é concedido apenas por nomenclatura;
- cada promoção possui evidências e possibilidade de regressão.
