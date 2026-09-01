# 15 — Sense Reporter: telemetria, leitura do organismo e contrato com o Guardian

**Estado:** READY_FOR_CLAUDE_QUEUE após merge documental  
**Dependência:** pacote 14 e P3/P4 do documento 13  
**Repositórios-alvo para auditoria:** Luna-reporter, luna-core, luna-connect e Luna-context.md

## 1. Objetivo

Transformar o Luna-reporter, hoje predominantemente leitor de GitHub, no Reporter da Luna-e/Sense: uma capacidade de interocepção capaz de observar o organismo sem possuir autoridade de escrita.

O Reporter deve saber o que acontece no organismo, correlacionar fatos e emitir relatórios ao Guardian.

## 2. Diagnóstico conhecido

Foi verificado que o Luna-reporter possui integração com GitHub, Groq, GitPython e requests, mas não possui cliente Supabase/Postgres nem módulo próprio de banco.

Esse fato confirma uma lacuna de observabilidade. Não autoriza acoplamento irrestrito ao banco.

## 3. Decisão de acesso

O Reporter poderá ter leitura ampla do estado operacional necessário, mas nunca leitura indiscriminada de todos os tecidos do organismo.

Preferência arquitetônica:

- schema interno de observabilidade, fora do Data API público;
- views semânticas e minimizadas;
- role dedicada somente leitura;
- nenhum privilégio herdado de service_role;
- nenhuma permissão INSERT, UPDATE, DELETE, TRUNCATE, EXECUTE privilegiado ou DDL;
- nenhuma tabela de cliente exposta por conveniência;
- registro de origem, finalidade e consulta quando tecnicamente viável.

Views candidatas, sujeitas à auditoria do Claude:

- sense_fluxo_pacotes;
- sense_execucoes;
- sense_falhas_testes;
- sense_decisoes;
- sense_eventos_guardian;
- sense_saude_servicos;
- sense_divergencias;
- sense_incidentes_seguranca;
- sense_custos_agentes;
- sense_aprendizados_resultados.

Views não devem virar atalho para burlar RLS. Claude deve verificar versão do Postgres, security_invoker, grants, schemas expostos e advisors antes de especificar SQL.

## 4. Fontes observáveis

### GitHub

- commits, branches e PRs;
- checks e testes;
- reversões;
- comentários de revisão;
- tempo entre etapas;
- arquivos e escopo alterados.

### Quadro Negro

- decisão orientadora;
- plano;
- prioridade;
- dependências;
- tentativas;
- bloqueios;
- erros;
- correções;
- entrega e aceite.

### Guardian

- eventos aceitos e rejeitados;
- contenções;
- violações;
- severidade;
- procedência;
- resultado da validação.

### Serviços

- disponibilidade;
- latência;
- taxa de erro;
- filas;
- falhas de integração;
- consumo de recursos quando disponível.

## 5. Contrato de saída

O Reporter não persiste o relatório.

Fluxo obrigatório:

1. lê fontes autorizadas;
2. constrói relatório em memória;
3. envia envelope autenticado ao Guardian;
4. Guardian valida schema, procedência, integridade, classificação e dados sensíveis;
5. Guardian persiste no local adequado;
6. Guardian publica no Quadro Negro, alerta ou encaminha ao Hipocampo conforme política.

O envelope mínimo deve conter:

- report_id idempotente;
- período observado;
- fontes e evidências;
- fatos;
- inferências separadas;
- hipóteses separadas;
- confiança;
- impacto;
- severidade;
- componentes afetados;
- regras ou ADRs relacionadas;
- dados omitidos ou inacessíveis;
- versão do analisador;
- timestamp e identidade do emissor.

## 6. Taxonomia inicial

- arquitetura;
- engenharia;
- build;
- teste;
- ambiente;
- integração;
- segurança;
- dados;
- custo;
- produto;
- governança;
- falso positivo;
- indeterminado.

Reversão de PR não é automaticamente erro. Mudança de decisão não é automaticamente deriva. Correlação não é causa.

## 7. Segurança

É proibido:

- credencial de service_role no Reporter;
- segredo versionado;
- acesso direto a memoria_luna;
- acesso direto de escrita a genesis_raciocinio;
- promoção automática de relatório a aprendizado;
- reprodução de conteúdo malicioso sem neutralização;
- envio de dados pessoais desnecessários;
- uso de saída de modelo como evidência primária.

Se uma credencial Postgres read-only for necessária, pertence à infraestrutura privada de observabilidade, deve ser rotacionável, não pública e limitada às views aprovadas. A alternativa preferível poderá ser API estreita pelo Gateway se a auditoria mostrar menor acoplamento e melhor contenção.

## 8. Mandato ao Engenheiro Claude

Claude deverá primeiro auditar, depois escolher entre:

A. leitura por API estreita Gateway/Sense;  
B. role Postgres read-only em views internas;  
C. combinação: eventos por API e agregados por views.

A escolha deve comparar:

- segurança;
- acoplamento;
- latência;
- custo;
- rastreabilidade;
- operação offline;
- manutenção;
- compatibilidade com Guardian e Quadro Negro.

Claude deve recomendar uma opção e justificar. Não deve aplicar migration, criar credencial ou mudar produção no mesmo PR documental.

## 9. Etapas técnicas esperadas

### P0 — Auditoria e contratos

- mapa das fontes;
- matriz de dados permitidos;
- AS-IS do Reporter;
- contrato Reporter → Guardian;
- decisão API versus views.

### P1 — Leitura GitHub normalizada

- eventos determinísticos;
- idempotência;
- evidências e timestamps;
- testes com fixtures sintéticas.

### P2 — Leitura do Quadro Negro

- contexto aprovado;
- paginação e cursor;
- segregação por papel;
- ausência de escrita.

### P3 — Telemetria interna

- views ou endpoints;
- role read-only;
- testes negativos de privilégio;
- advisors e verificação de exposição.

### P4 — Emissão ao Guardian

- contrato autenticado;
- rejeição segura;
- retry idempotente;
- nenhuma persistência local normativa.

### P5 — Correlação

- decisão → execução → erro → correção → resultado;
- fatos separados de hipóteses;
- rastreabilidade ponta a ponta.

## 10. Testes obrigatórios

- Reporter não consegue inserir, atualizar ou excluir;
- Reporter não acessa tabelas de cliente;
- consulta não atravessa tenant;
- relatório duplicado é idempotente;
- Guardian rejeita envelope adulterado;
- conteúdo malicioso não vira instrução;
- ausência de fonte reduz confiança;
- falha do Guardian não provoca escrita alternativa;
- segredo não aparece em log.

## 11. Condições de parada

- necessidade de service_role;
- necessidade de acesso a tabela de cliente não prevista;
- inexistência de contrato Guardian;
- conflito com RLS/ADR;
- migration destrutiva;
- vazamento ou credencial histórica ainda válida;
- tentativa de escrever diretamente em genesis_raciocinio.

## 12. Critérios de aceite

- Reporter observa GitHub e ao menos uma fonte interna aprovada;
- não possui escrita no banco;
- entrega relatório verificável ao Guardian;
- cada afirmação relevante aponta evidência;
- contrato é idempotente e testado;
- acesso negativo é comprovado por teste;
- nenhum dado real entra em fixture ou repositório.
