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
