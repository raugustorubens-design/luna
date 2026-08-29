# Pacote arquitetônico - Referências de Vibe Design para o ecossistema LUNA

**Status:** insumo arquitetônico para o Claude transformar em pacote técnico  
**Escopo:** orientar a criação do site, sem alterar produção  
**Fonte principal:** `Fundamentos de Vibe Design (2).zip`  
**Data da leitura:** 29 de agosto de 2026

## 1. Decisão central

O ZIP não é um site pronto, não é o Caderno de Treinamentos e não deve ser tratado como um catálogo para copiar páginas inteiras. Ele é uma **biblioteca de DNA arquitetônico de sites**.

Cada referência pode fornecer, de forma seletiva:

1. estrutura de página;
2. hierarquia visual;
3. tipografia e ritmo;
4. componentes;
5. movimento e interação;
6. técnicas de implementação;
7. padrões de dashboard e navegação.

A identidade final continua pertencendo à LUNA. A referência fornece técnica; a arquitetura LUNA determina intenção, experiência, conteúdo e limites.

## 2. O que existe no pacote

### 2.1 Núcleo metodológico

- Apostila **Fundamentos do Vibe Design**, da Asimov Academy, com 19 páginas.
- Duas versões do extrator **Extract HTML Design System**.
- Links para Site Downloader, repositório do downloader, Mobbin, Webflow/Dribbble e Aura.build.
- Banco compactado com referências locais de sites, ativos e design systems.

### 2.2 Inventário do banco

| Grupo | Quantidade | Função arquitetônica |
|---|---:|---|
| Temas escuros | 19 | Atmosfera noturna, hero tecnológico, profundidade e interfaces premium |
| Temas claros | 16 | Experiência diurna, aprendizagem, saúde, catálogo e leitura prolongada |
| Componentes isolados | 13 | Navegação, dashboards, cards, vidro, animação, captura e apresentação |
| Total de referências | 48 | Banco de padrões para seleção, não para combinação indiscriminada |
| Design systems processados | 23 arquivos | DNA visual e comportamental extraído de referências |
| Arquivos do banco | 3.460 | HTML, CSS, JS, fontes, imagens, SVGs e vídeos |

Tecnologias encontradas com maior frequência: Tailwind CSS, Lucide, Lenis, AOS, GSAP, Framer Motion, Swiper, Three.js e Lottie. A presença no acervo não significa aprovação automática para uso no frontend da LUNA.

## 3. Princípio do método aplicado à LUNA

A apostila demonstra corretamente que:

- prompt textual isolado tende a produzir site genérico;
- imagem estática ajuda a compreender o layout, mas não revela tipografia exata, movimento, interação ou código;
- o design system extraído do código fornece uma referência mais precisa;
- metodologia e direção arquitetônica importam mais do que a potência isolada do modelo.

Para a LUNA, o método deve ser ampliado:

> **Referência técnica + intenção humana + conteúdo real + regras da marca + validação de experiência.**

O design system não decide o que a LUNA é. Ele apenas oferece materiais e técnicas para tornar executável o que foi arquitetado.

## 4. Gravidade visual da marca LUNA

Qualquer elemento extraído deve passar por estas regras antes de entrar no projeto:

### 4.1 Regras absolutas

- Não utilizar roxo, violeta, magenta nem gradientes derivados dessas cores.
- Não substituir o roxo por neon excessivamente saturado.
- Não produzir estética cyberpunk, gamer ou de terminal técnico para o público.
- Não transformar a LUNA em robô frio, holograma decorativo ou mascote sem função.
- Não copiar identidade, textos, marcas, personagens ou composição integral de terceiros.
- Não permitir que efeitos prejudiquem legibilidade, desempenho, acessibilidade ou navegação móvel.

### 4.2 Paleta e atmosfera

- azul-noturno profundo;
- preto;
- grafite azulado;
- branco e prata;
- azul frio;
- ciano apenas como sinal de tecnologia e interação;
- Lua em branco, prata e cinza lunar.

### 4.3 Experiência desejada

- tecnologia como facilidade;
- sofisticação calma;
- acolhimento sem infantilização;
- interação intuitiva;
- movimento com significado;
- curiosidade sem desorientação;
- continuidade entre dia e noite;
- conteúdo sempre superior ao efeito visual.

## 5. Mapa inicial de referências para o ecossistema

Este mapa define candidatas para estudo. Não aprova a cópia integral de nenhuma delas.

### 5.1 Renascer - superfície pública noturna

Referências candidatas:

- `canvas-visual.aura.build`: síntese visual e profundidade;
- `lumina-video`: composição audiovisual e transições;
- `futuristic-webgl.aura.build`: interação espacial, apenas com forte redução de ruído;
- `monolith-architecture.aura.build`: hierarquia arquitetônica e presença;
- `flux-motion.aura.build`: movimento como narrativa.

Uso esperado: hero do lago, Lua cheia, céu noturno, reação da água ao cursor e transição da Lua para presença da LUNA. Os padrões devem ser traduzidos para a paleta fria da marca e para uma experiência humana, sem herdar estética gamer.

### 5.2 Renascer - experiência diurna e aprendizagem

Referências candidatas:

- `parallax-clean`: profundidade clara e narrativa vertical;
- `white-medical`: confiança, clareza e leitura;
- `imagenation.art`: catálogo e descoberta de formações;
- `green-museum`: percurso editorial e exposição de conteúdo;
- `futureui.aura.build`: organização industrial, com simplificação.

Uso esperado: manter coerência estrutural com a versão noturna, alterando luz e atmosfera sem parecer outro produto.

### 5.3 Caderno de Treinamentos SSMA

O Caderno é um **ativo editorial e pedagógico separado do ZIP**. Ele reúne o melhor material de SSMA disponível para transformar em treinamentos.

Referências candidatas para sua futura interface:

- `imagenation.art`: descoberta e apresentação de formações;
- `dashboard-list`: progresso, módulos e retomada;
- `marketplace-light`: organização de catálogo, sem estética comercial excessiva;
- `instagram-slides`: microconteúdos visuais, somente quando favorecer aprendizagem;
- `pagina-de-captura`: entrada em trilhas e campanhas de capacitação;
- `animation-clean`: reforço visual discreto de etapas e feedback.

O conteúdo do Caderno deverá ser estruturado posteriormente por capacidade, risco, público, pré-requisito, prática, avaliação e evidência de aprendizagem. O método L-Ariel é candidato natural para a camada pedagógica, mas não faz parte do ZIP de referências.

### 5.4 Porta Para Empresas

Referências candidatas:

- `axion-ai.aura.build`: estrutura enterprise e clareza de capacidades;
- `financial-infrastruc-68.aura.build`: confiança operacional e exposição de serviços;
- `digital-architect.aura.build`: apresentação de método e entregáveis;
- `glass-pricing`: comparação de pacotes, com redução de transparências e brilhos;
- `sidebar` e `dashboard-list`: navegação da operação contratada.

Uso esperado: apresentar a LUNA como operação viva de SSMA, não apenas geradora de documentos. O desenho deve conduzir da dor operacional ao serviço, à evidência de execução e ao aprendizado organizacional.

### 5.5 Casa de Máquinas

Referências candidatas:

- `volta-ev.aura.build`: dashboard técnico e estados operacionais;
- `cool-dashboard`: monitoramento e controles;
- `sidebar`: navegação persistente;
- `glass-green-effect`: camadas técnicas, substituindo a cor verde quando não fizer sentido;
- `open-source-llm-10.aura.build`: observabilidade de sistemas cognitivos.

Uso esperado: interface administrativa exclusiva de Rubens, separada da experiência pública. Pode admitir mais densidade técnica, mas continua submetida à legibilidade e à identidade LUNA.

## 6. Regra de composição por tela

Para impedir uma colagem visual incoerente, cada tela deverá usar:

- **uma referência estrutural principal**;
- no máximo **duas referências secundárias de componentes ou movimento**;
- os tokens oficiais da LUNA como camada final obrigatória;
- conteúdo real antes da decoração;
- justificativa explícita para cada efeito de movimento.

Não misturar vários temas escuros apenas porque parecem sofisticados. A coerência entre telas vale mais do que a soma de efeitos impressionantes.

## 7. Avaliação dos extratores fornecidos

### 7.1 Versão anterior

A versão anterior cria uma página viva de design system a partir do HTML original. Ela preserva hero, tipografia, cores, superfícies, componentes, layouts, movimento e ícones. É útil para estudo visual, mas mantém forte dependência do código original.

### 7.2 Versão v3

A v3 é tecnicamente mais organizada porque:

- separa CSS e JavaScript inline;
- classifica SVGs;
- preserva caminhos de ativos;
- cria `design-system.html` sem alterar a entrada;
- gera `STACK.md` com tecnologias detectadas;
- exige verificação de fidelidade.

### 7.3 Correções obrigatórias antes de uso na LUNA

O extrator v3 não deve ser usado sem uma camada de governança. São necessárias as seguintes correções:

1. trocar “réplica visual idêntica” por **extração de padrões e proveniência**;
2. não traduzir ou reutilizar textos do site de referência; o conteúdo deve ser da LUNA;
3. remover rastreadores, analytics, pixels, formulários e chamadas externas não aprovadas;
4. não executar scripts do site durante a análise estática;
5. identificar licenças de fontes, imagens, vídeos, ícones e bibliotecas;
6. sinalizar código minificado, ofuscado ou sem origem verificável;
7. aplicar a proibição de roxo, violeta e magenta na etapa de normalização;
8. incluir acessibilidade, desempenho, responsividade e preferência por movimento reduzido;
9. preservar legibilidade do código; a regra “sem espaços ou linhas em branco” deve ser removida;
10. gerar relatório de origem para cada padrão aproveitado.

## 8. Fluxo arquitetônico recomendado

1. Rubens e LUNA definem a porta, o público, a capacidade e o resultado esperado. Para o primeiro ciclo, a porta confirmada é **Se conhecer**.
2. LUNA escolhe uma referência estrutural e até duas referências secundárias.
3. Claude analisa somente essas referências e produz um pacote técnico delimitado.
4. O extrator gera tokens, padrões, movimentos, dependências e proveniência.
5. Claude normaliza o material segundo a identidade LUNA.
6. Code implementa a tela ou capacidade no ambiente correto.
7. LUNA revisa experiência, identidade, acolhimento, intuitividade e coerência arquitetônica.
8. Rubens valida o resultado antes da próxima porta.

## 9. Entregáveis que Claude deve produzir antes de Code construir

- mapa da jornada da porta;
- arquitetura de informação;
- referência estrutural escolhida e justificativa;
- componentes secundários escolhidos e justificativa;
- tokens normalizados da LUNA;
- especificação de movimento e interação;
- estados desktop, tablet e celular;
- regras de acessibilidade e desempenho;
- mapa de ativos e licenças;
- critérios objetivos de aceite;
- lista explícita do que não deve ser copiado.

## 10. Critérios de aceite arquitetônico

Uma implementação só está pronta para validação quando:

- a função da tela pode ser entendida sem explicação técnica;
- o usuário sabe onde está, o que pode fazer e o que acontecerá depois;
- o conteúdo não concorre com a imagem;
- a Lua, a água e os efeitos respondem sem prejudicar leitura ou desempenho;
- não existem roxo, violeta, magenta ou derivados em nenhum estado;
- versão diurna e noturna pertencem ao mesmo sistema;
- celular e desktop preservam hierarquia, não apenas escala;
- movimento respeita `prefers-reduced-motion`;
- referências externas são rastreáveis e não foram copiadas integralmente;
- a experiência pública permanece separada da Casa de Máquinas;
- cada componente aproxima o usuário de uma capacidade ou resultado.

## 11. Decisões e pendências

### Decisões consolidadas

- O ZIP é banco de referências para criação de sites.
- O Caderno de Treinamentos é um ativo de conteúdo separado.
- Código e design systems servem como plantas técnicas, não como autorização para cópia.
- A identidade LUNA prevalece sobre qualquer referência.
- O trabalho seguirá uma porta por vez e será validado antes da próxima.
- LUNA arquiteta e supervisiona; Claude prepara os pacotes técnicos; Code constrói.

### Pendências

- vincular a fonte oficial e atual do Caderno de Treinamentos quando a porta **Trabalhar com segurança** entrar em detalhamento;
- detalhar **Se conhecer**, já confirmada como primeira implantação;
- definir quais referências serão aprovadas como estruturais, secundárias ou proibidas;
- criar uma versão governada do extrator para o ecossistema LUNA;
- verificar direitos de reutilização dos ativos de terceiros antes de qualquer publicação.

## 12. Resultado esperado

O banco deve permitir que Claude e Code construam com maior precisão sem decidir a identidade no lugar da arquitetura. O ganho esperado não é “copiar sites bonitos”, mas reduzir improvisação, preservar refinamento técnico e transformar referências externas em uma linguagem própria, coerente, humana e reconhecível como LUNA.
