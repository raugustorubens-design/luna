# FOCO — Projeto Arquitetônico do Site LUNA / Renascer

## 1. Objetivo central

Construir o projeto arquitetônico do site LUNA/Renascer como uma experiência humana de desenvolvimento de capacidades. O site não será apenas uma vitrine de cursos nem uma reprodução das referências recebidas. Ele deverá transformar conhecimento confiável em percursos de aprendizagem, prática, avaliação, progresso e autonomia.

Este documento é o ponto de convergência entre:

1. o Caderno de Treinamentos SSMA, que fornece conteúdo, práticas, riscos, avaliações e experiência operacional;
2. o banco de referências arquitetônicas de sites, que fornece repertório de composição, interação, ritmo, componentes e sistemas visuais;
3. a base LUNA, que fornece arquitetura cognitiva, memória, governança, handoffs e visão de produto;
4. as decisões já tomadas nas conversas sobre a experiência pública Renascer e a interface administrativa da LUNA.

## 2. Papel de cada acervo

### Caderno de Treinamentos SSMA

É fonte de verdade para conteúdo de segurança, saúde, meio ambiente e operação. Reúne cartilhas, APRs, PISSMA, integrações, avaliações, reciclagens, checklists e materiais técnicos.

Uso no site:

- estruturar trilhas e módulos;
- extrair situações reais, riscos, controles e boas práticas;
- criar atividades e avaliações;
- medir compreensão, aplicação e evolução;
- sustentar a futura porta **Trabalhar com segurança**.

### Referências Arquitetônicas

O pacote “Fundamentos de Vibe Design” é um banco privado de referências para criação. Ele serve para estudar soluções e princípios, não para copiar sites completos. Contém referências claras e escuras, componentes, exemplos de design systems e recursos de interação.

Uso no site:

- estudar hierarquia, densidade, ritmo e navegação;
- selecionar padrões de componentes e microinterações;
- orientar protótipos e pacotes de implementação;
- comparar alternativas antes de adotar uma solução.

Fonte original: [Fundamentos de Vibe Design (2).zip](https://drive.google.com/file/d/1MFtlNnKT1GQQBQOIt8T1bf589pzm52z5/view)

### Base LUNA

É a camada de arquitetura, memória e governança. Mantém registros de MVP, handoffs, contexto cognitivo e relações entre os componentes do ecossistema.

Uso no site:

- preservar coerência entre intenção, interface, conteúdo e implementação;
- preparar pacotes arquitetônicos verificáveis;
- registrar decisões, relações, impactos e critérios de aceite;
- permitir continuidade entre LUNA, Claude, Code e revisão humana.

## 3. Arquitetura de experiência já consolidada

### Duas superfícies, duas funções

- **Renascer público:** acolhedor, humano e orientado à transformação do usuário.
- **Casa de Máquinas:** ambiente administrativo e técnico, reservado à construção, supervisão, memória e operação da LUNA.

As duas superfícies pertencem ao mesmo ecossistema, mas não devem compartilhar a mesma linguagem de uso.

### Unidade principal: capacidade

O produto deve organizar a jornada por capacidades, não apenas por arquivos ou cursos:

**curiosidade → conhecimento → prática → capacidade → autonomia**

Cada porta do site deverá explicitar:

- o que a pessoa poderá fazer ao concluir;
- como aprenderá e praticará;
- como será acompanhada e avaliada;
- quais evidências demonstram progresso;
- qual é o próximo passo possível.

### Arquitetura inicial da entrada pública

A primeira entrega é a arquitetura do site: navegação, botões, portas e regras de passagem. A página inicial apresenta a pergunta:

> **O que você quer transformar hoje?**

As seis portas iniciais são:

1. **Se conhecer** — autoconhecimento, emoções e decisões conscientes;
2. **Encontrar meu caminho** — direção, carreira e próximos passos;
3. **Trabalhar com segurança** — SSMA, operação e capacidade demonstrada;
4. **Aprender tecnologia** — dados, Python, Power BI e IA;
5. **Desenvolver pessoas** — liderança e desenvolvimento humano;
6. **Ainda não sei** — acolhimento e orientação para quem ainda não consegue nomear a necessidade.

Navegação pública prevista: **Início, Capacidades, Trilhas, Para Empresas, Sobre, Ajuda e Entrar**. Chamadas principais: **Quero começar agora** e **Veja como funciona**.

### Primeira implantação

A primeira porta a ser detalhada e implantada é **Se conhecer**. Segurança e Operação Industrial permanece como porta estratégica sustentada pelo Caderno de Treinamentos SSMA, mas não é a primeira implantação.

## 4. Direção visual

- paleta principal: azul-noturno profundo, preto, azul-grafite, branco, prata e azul-frio;
- ciano apenas como sinal de energia, interação e bioluminescência;
- não usar roxo, violeta ou magenta, inclusive em brilhos, gradientes, gráficos e estados de interação;
- evitar estética cyberpunk, gamer ou excesso de efeitos;
- noite: lua cheia, céu estrelado e lago reativo em azul/ciano;
- dia e noite devem manter coerência narrativa e legibilidade;
- texto, imagem e movimento não devem competir entre si.

A lua pode atuar como presença narrativa: pulsa, responde e, quando apropriado, revela a LUNA. O lago pode reagir ao cursor de modo sutil, reforçando a ideia de conhecimento vivo.

## 5. Método de aprendizagem

O conteúdo deve poder adotar o método L-Ariel:

1. LUNA pergunta;
2. Ariel raciocina;
3. LUNA aprofunda;
4. Ariel descobre;
5. LUNA consolida.

Para treinamentos estruturados:

- um tema por vez;
- três questões objetivas por tema como padrão inicial;
- aprovação mínima de 80%;
- feedback explicativo e possibilidade de retomada;
- registro de progresso sem reduzir aprendizagem a uma nota.

## 6. “Para Empresas”

A proposta não é apenas garantir que o documento correto exista. A LUNA deve ajudar a garantir que a operação descrita realmente aconteça, seja observada e aprenda com a execução.

Direção de produto:

- documentos e requisitos como fontes de controle;
- acompanhamento da execução operacional;
- evidências, desvios, aprendizagem e melhoria contínua;
- conexão futura entre treinamento, capacidade demonstrada e realidade do trabalho.

## 7. Governança de construção

- **LUNA:** mantém intenção, arquitetura, relações e critérios; prepara o pacote arquitetônico.
- **Claude:** analisa o pacote e ajuda a detalhar soluções e conteúdos.
- **Code:** implementa, testa e registra evidências técnicas.
- **Responsável humano:** revisa, decide e autoriza o que será consolidado ou publicado.

Toda entrega arquitetônica deverá conter, quando aplicável:

1. caminho;
2. objetivo;
3. conteúdo;
4. branch;
5. orientação de Git;
6. relações arquitetônicas;
7. impacto cognitivo;
8. critérios de aceite.

## 8. Ordem de trabalho

1. Consolidar a arquitetura pública do site, a navegação, os botões e as seis portas.
2. Detalhar a porta **Se conhecer** como primeira implantação.
3. Manter orientação e contatos de socorro públicos, gratuitos, estáticos e fora do plano pago.
4. Entregar o material ao Claude para transformar a arquitetura em pacote técnico delimitado.
5. Encaminhar o pacote técnico ao Code somente após revisão humana.

A porta **Se conhecer** deverá ser desenhada até o nível de:

- mapa de conteúdo;
- jornada do usuário;
- páginas e estados;
- interações;
- progresso e avaliação;
- evidências de aprendizagem;
- componentes reutilizáveis;
- critérios visuais e técnicos;
- pacote de revisão para Claude e Code.

Somente após validar essa porta, o padrão deverá ser generalizado para as demais áreas do site. Nenhum destes documentos autoriza alteração direta da produção.
