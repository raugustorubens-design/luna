# Área do Arquiteto — Projeto do Site LUNA

## Finalidade

Esta pasta contém os insumos arquitetônicos que o Claude deve analisar e transformar em pacote técnico para o Code. Os documentos não são autorização para alterar produção.

## Ordem de leitura

1. `00-FOCO-PROJETO-ARQUITETONICO-SITE-LUNA.md`
2. `01-REFERENCIAS-VIBE-DESIGN-LUNA.md`
3. `02-SE-CONHECER-ORIENTACAO-E-SOCORRO-PUBLICO.md`
4. `03-SE-CONHECER-MAPA-DO-MOMENTO.md`
5. `04-PREPARACAO-TESTES-E-AVALIACOES-PROCESSOS-SELETIVOS.md`
6. `05-MODULO-PAGO-PERSONALIDADE-E-COMPORTAMENTO.md`
7. `06-MODULO-PAGO-RACIOCINIO-E-APTIDOES.md`

## Decisões obrigatórias

- A primeira entrega consolida a arquitetura do site, navegação, botões e seis portas.
- A primeira implantação é **Se conhecer**.
- Orientação e contatos de socorro são públicos, gratuitos, estáticos e fora do plano pago.
- A página de socorro não usa IA, GPT, token, Connector Hub, login, triagem, diagnóstico, coleta de localização ou dados sensíveis.
- O Mapa do Momento é gratuito, determinístico, não clínico e funciona sem IA.
- A preparação personalizada para testes psicológicos e outras avaliações de processos seletivos é um serviço pago escolhido pela própria pessoa.
- A preparação não é antagonista de nenhuma plataforma, não reproduz testes protegidos e não promete aprovação.
- Renascer público e Casa de Máquinas são superfícies distintas.
- Não usar roxo, violeta ou magenta.
- Referências externas são repertório técnico; não devem ser copiadas integralmente.

## Handoff

O Claude deverá devolver um pacote técnico delimitado contendo jornada, arquitetura de informação, páginas e estados, componentes, comportamento dos botões, acessibilidade, responsividade, critérios de aceite e lista explícita do que não será implementado.

Fluxo de governança:

**LUNA arquiteta → Claude empacota → Code implementa e testa → responsável humano revisa e autoriza.**


---

## Nova frente — Luna-e/Sense

Antes dos pacotes 14–17, Claude deve consultar no repositório de regras Luna-context.md a Política de Decisão do Fundador, o Ciclo Arquitetura–Engenharia–Build, a Constituição e as ADRs aplicáveis.

Ler nesta pasta, na ordem:

8. 14-LUNA-E-SENSE-IDENTIDADE-E-GESTACAO.md
9. 15-SENSE-REPORTER-TELEMETRIA-E-GUARDIAN.md
10. 16-SENSE-INDICADORES-GRAFICOS-E-PAINEIS.md
11. 17-LUNA-E-ANALISE-RECOMENDACOES-E-PROMOCAO.md

Decisões obrigatórias:

- Sense é a própria Luna-e em gestação.
- Reporter é capacidade interna da Luna-e/Sense.
- Reporter observa e emite; não persiste.
- Guardian é autoridade única de persistência.
- Sense gera métricas, gráficos e alertas; quando promovida, a Luna-e diagnostica e recomenda.
- Planner organiza propostas autorizadas; não substitui a análise da Luna-e.
- Hipocampo fornece memória e consolida somente aprendizagem validada.
- G1 é observação. Não antecipar recomendação, despacho ou autonomia.
- Reporter nunca usa service_role.
- Dados reais de clientes não entram em fixture, teste, log ou documentação pública.

Handoff ao Claude:

1. auditar o estado real;
2. apresentar AS-IS, TO-BE, conflitos e dependências;
3. produzir pacote técnico documental próprio;
4. aguardar revisão e merge;
5. só depois liberar etapas delimitadas ao Code;
6. um PR por etapa;
7. registrar divergência sem alterar silenciosamente identidade, autoridade ou persistência.
