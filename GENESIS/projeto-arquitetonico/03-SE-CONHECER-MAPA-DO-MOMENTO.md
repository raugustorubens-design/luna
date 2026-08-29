# Pacote 03 — Se conhecer: Mapa do Momento

**Status:** arquitetura consolidada para o Claude transformar em pacote técnico  
**Escopo:** percurso gratuito “Quero me entender melhor”  
**Dependências:** `00-FOCO-PROJETO-ARQUITETONICO-SITE-LUNA.md` e `02-SE-CONHECER-ORIENTACAO-E-SOCORRO-PUBLICO.md`

## 1. Objetivo

Permitir que uma pessoa observe como esteve funcionando nas últimas duas semanas, sem receber diagnóstico, rótulo de personalidade ou julgamento. O resultado deve ajudá-la a perceber o momento, explicá-lo em linguagem simples e escolher uma primeira ação possível.

O percurso gratuito entrega:

1. 15 perguntas objetivas;
2. Mapa do Momento com cinco dimensões;
3. explicação escrita;
4. uma ação prática;
5. convite para conhecer a preparação paga para testes psicológicos e outras avaliações de processos seletivos.

## 2. Limites

Este instrumento:

- não é teste psicológico;
- não é instrumento clínico validado;
- não diagnostica transtornos;
- não mede inteligência, caráter, capacidade profissional ou valor pessoal;
- não produz perfil permanente;
- não determina aptidão para uma vaga;
- não substitui psicólogo, psiquiatra, médico ou outro profissional habilitado;
- não deve ser compartilhado com empregadores ou utilizado para selecionar pessoas;
- não usa IA, GPT, token ou Connector Hub no percurso gratuito.

Texto obrigatório antes de começar:

> Este é um exercício de reflexão sobre as últimas duas semanas. O resultado mostra um momento, não define quem você é. Não existem respostas certas ou erradas.

## 3. Entrada e saída

### Entrada

Porta **Se conhecer** → **Quero me entender melhor**.

### Saídas

- refazer em outro momento;
- realizar a primeira ação sugerida;
- conhecer o catálogo da **Preparação para testes psicológicos e avaliações de processos seletivos**;
- conhecer a jornada orientada com a LUNA, se a pessoa desejar;
- acessar **Preciso de ajuda agora** em qualquer etapa.

## 4. Experiência da aplicação

- uma pergunta por tela;
- indicador discreto: `Pergunta 1 de 15`;
- botão **Voltar** para revisar resposta;
- botão **Sair e apagar minhas respostas**;
- botão permanente **Preciso de ajuda agora**;
- nenhuma animação intensa durante as perguntas;
- linguagem curta e legível em celular;
- navegação por teclado e compatibilidade com leitor de tela;
- não revelar uma “pontuação correta” durante o preenchimento;
- informar que as cinco áreas serão observadas, sem apresentar a pessoa como objeto de avaliação oculta.

## 5. Período de referência

Todas as afirmações começam implicitamente por:

> **Nas últimas duas semanas...**

O período deve permanecer visível ou facilmente recuperável durante todo o percurso.

## 6. Escala de resposta

| Valor interno | Resposta apresentada |
|---:|---|
| 1 | Nunca ou quase nunca |
| 2 | Raramente |
| 3 | Às vezes |
| 4 | Frequentemente |
| 5 | Quase sempre |
| nulo | Não sei avaliar ainda |

`Não sei avaliar ainda` é uma resposta válida. Nunca deve valer zero nem reduzir artificialmente uma dimensão.

## 7. As 15 perguntas

### Dimensão 1 — Percepção

Observa a capacidade atual de notar sinais do corpo, pensamentos e influência emocional sobre o comportamento.

1. **Percebi mudanças no meu corpo quando alguma situação me preocupou, irritou ou animou.**
2. **Consegui notar quando meus pensamentos ficaram repetitivos, acelerados ou difíceis de organizar.**
3. **Percebi que uma emoção estava influenciando meu comportamento antes de reagir.**

### Dimensão 2 — Nomeação

Observa a capacidade atual de transformar uma experiência difusa em palavras e reconhecer o que pode estar sendo necessário.

4. **Consegui dizer com alguma clareza o que eu estava sentindo.**
5. **Consegui diferenciar emoções parecidas, como preocupação e medo, irritação e frustração, ou tristeza e cansaço.**
6. **Consegui reconhecer o que era importante para mim ou do que eu precisava em uma situação difícil.**

### Dimensão 3 — Compreensão

Observa a capacidade atual de relacionar situação, interpretação, necessidade, padrão e consequência.

7. **Consegui relacionar minhas reações com as situações que aconteceram antes delas.**
8. **Percebi comportamentos ou situações que se repetiram na minha rotina.**
9. **Consegui separar o que realmente aconteceu daquilo que imaginei, temi ou concluí sobre a situação.**

### Dimensão 4 — Escolha consciente

Observa a capacidade atual de criar espaço entre impulso e decisão, considerar consequências e reconhecer o que está sob sua influência.

10. **Antes de uma decisão importante, consegui fazer uma pausa para pensar.**
11. **Considerei como minhas escolhas poderiam afetar a mim e às outras pessoas.**
12. **Consegui distinguir o que estava ao meu alcance daquilo que eu não podia controlar.**

### Dimensão 5 — Movimento

Observa a capacidade atual de transformar compreensão em uma ação pequena, coerente e revisável.

13. **Consegui transformar uma intenção em uma ação pequena e possível.**
14. **Mesmo com algum desconforto, fiz algo coerente com o que considero importante.**
15. **Depois de agir, observei o resultado e ajustei o próximo passo quando necessário.**

## 8. Ordem de apresentação

Na primeira implantação, usar a ordem de 1 a 15 para facilitar compreensão, testes e auditoria. Não randomizar antes de haver pesquisa com usuários demonstrando benefício.

Entre as dimensões, não interromper com interpretações. Pode existir apenas uma transição curta, por exemplo:

> Agora vamos observar outra parte do seu momento.

## 9. Cálculo transparente

Para cada dimensão:

1. considerar somente respostas de 1 a 5;
2. calcular a média simples das respostas válidas;
3. exigir pelo menos duas respostas válidas entre as três perguntas;
4. manter uma casa decimal apenas internamente;
5. não gerar nota geral, ranking ou comparação com outras pessoas.

Se houver duas ou três respostas `Não sei avaliar ainda` na mesma dimensão, apresentar:

> **Ainda não há informação suficiente para representar esta área. Observar também é uma forma de começar.**

O número interno de 1 a 5 serve para posicionar o ponto no mapa, não para declarar normalidade, doença, aprovação ou reprovação.

## 10. Mapa visual

Título: **Seu mapa de agora**.

Dimensões:

- Percepção;
- Nomeação;
- Compreensão;
- Escolha consciente;
- Movimento.

Regras visuais:

- gráfico radial ou circular simples, acompanhado obrigatoriamente por alternativa textual;
- escala contínua de 1 a 5 sem zonas vermelhas, verdes ou notas de aprovação;
- não usar percentuais, medalhas, troféus ou classificação;
- não usar roxo, violeta ou magenta;
- não animar o crescimento do gráfico de modo competitivo;
- destacar que o desenho representa as últimas duas semanas;
- dimensões sem dados devem aparecer como **Ainda não observado**, não como zero.

Texto fixo abaixo do mapa:

> Este mapa representa como algumas capacidades estiveram disponíveis para você nas últimas duas semanas. Ele pode mudar com o contexto, o descanso, as relações, as experiências e as ações que você escolher. Ele não define sua personalidade.

## 11. Devolutiva escrita por regras

A devolutiva não usa IA. Ela combina textos previamente revisados.

### Área mais disponível

> **[Dimensão] pareceu mais disponível neste momento.** Isso indica que, nas situações consideradas, você conseguiu acessar essa capacidade com maior frequência. Não significa que ela funcionará da mesma forma em todos os contextos.

### Área que pede atenção

> **[Dimensão] apareceu com menos frequência neste momento.** Isso não é falha nem incapacidade. Pode ser um bom lugar para observar e experimentar um passo pequeno.

### Empate

Se duas ou mais dimensões estiverem empatadas como as menos disponíveis, não escolher automaticamente uma delas. Perguntar:

> **Qual destas áreas faria mais diferença para você agora?**

Apresentar somente as dimensões empatadas.

### Dados insuficientes

> Em algumas áreas, você marcou que ainda não sabia avaliar. Em vez de completar a resposta por você, o mapa preservou essa incerteza. Sua primeira prática pode ser apenas observar.

## 12. Primeira ação prática

### Se a escolha for Percepção

**Pausa de 60 segundos**

1. Pare por um minuto em um momento seguro.
2. Observe uma sensação do corpo.
3. Observe um pensamento presente.
4. Observe se existe uma vontade de agir.
5. Não tente corrigir nada; apenas registre mentalmente.

### Se a escolha for Nomeação

**Três frases incompletas**

- Eu percebo...
- Talvez eu esteja sentindo...
- O que parece importante para mim agora é...

A palavra `talvez` evita transformar uma primeira impressão em certeza.

### Se a escolha for Compreensão

**Fato, interpretação e efeito**

- O que aconteceu e poderia ser observado por outra pessoa?
- O que eu concluí ou temi sobre isso?
- Como essa conclusão influenciou o que senti ou fiz?

### Se a escolha for Escolha consciente

**Pausa para três caminhos**

1. Liste três ações possíveis, incluindo esperar se isso for seguro.
2. Observe uma consequência provável de cada ação.
3. Identifique o que está sob seu controle.
4. Escolha o próximo passo mais seguro e reversível.

### Se a escolha for Movimento

**Passo de dez minutos**

1. Escolha algo importante que possa ser iniciado em até dez minutos.
2. Defina quando e onde fará.
3. Execute somente esse primeiro passo.
4. Depois, registre: funcionou, precisa ser ajustado ou não faz mais sentido?

### Se não houver dados suficientes

**Observação de três dias**

Uma vez por dia, complete:

> Hoje percebi que, quando ______ aconteceu, eu ______.

Não solicitar relato detalhado nem armazenar o conteúdo no servidor na versão gratuita.

## 13. Ponte para a preparação para processos seletivos

Após o mapa e a ação prática, apresentar:

### Título

**Prepare-se para entender o que está sendo observado.**

### Texto

> Processos seletivos podem utilizar testes psicológicos conduzidos por profissionais habilitados, questionários comportamentais, avaliações cognitivas, situações hipotéticas e provas de conhecimento. Conhecer os objetivos e os formatos reduz a surpresa e ajuda você a demonstrar suas capacidades com consciência e autenticidade.

### Botão

**Conhecer a preparação para testes e avaliações**

### Destino

Porta **Encontrar meu caminho** → módulo futuro **Preparação para testes psicológicos e avaliações de processos seletivos**.

O catálogo, os tipos de avaliação cobertos, os limites e o preço devem ser visíveis antes da contratação. A preparação personalizada, os simulados, o acompanhamento e a interação com a LUNA pertencem ao plano pago. Ajuda e emergência continuam públicas e gratuitas.

O módulo futuro deverá ensinar, para cada exemplo:

1. o que a pergunta pode estar tentando observar;
2. qual comportamento ou traço pode estar envolvido;
3. por que perguntas parecidas aparecem com redações diferentes;
4. como respostas podem ser comparadas em busca de coerência;
5. como contexto, cargo e cultura podem mudar a interpretação;
6. como recordar evidências reais da própria experiência;
7. por que não existe uma resposta universalmente correta;
8. o que não é possível afirmar sem conhecer o método e o algoritmo proprietários.

Não utilizar o Mapa do Momento para gerar um “perfil ideal” ou recomendar respostas falsas. O mapa pertence à pessoa. Não reproduzir itens protegidos de testes psicológicos, não oferecer gabaritos e não se apresentar como serviço de avaliação psicológica.

## 14. Privacidade do percurso gratuito

- funcionar sem cadastro;
- calcular o resultado no dispositivo sempre que tecnicamente possível;
- não enviar respostas ao GPT ou a outro modelo;
- não armazenar respostas no servidor por padrão;
- permitir apagar o percurso imediatamente;
- não usar respostas para publicidade, seleção profissional ou treinamento de modelos;
- não inferir condição de saúde;
- não transmitir o mapa ao módulo de preparação para processos seletivos: a passagem deve ocorrer somente por navegação, não por compartilhamento silencioso de dados.

## 15. Ajuda e emergência

O botão **Preciso de ajuda agora** permanece visível em todas as telas. Ao ser acionado:

- interromper o questionário;
- abrir diretamente a página pública de orientação e contatos;
- não perguntar o motivo;
- não analisar respostas anteriores;
- não executar triagem automatizada;
- não coletar localização.

As 15 perguntas não incluem perguntas sobre suicídio, autolesão ou diagnóstico. Este percurso não possui equipe clínica nem estrutura de resposta para realizar rastreamento responsável.

## 16. Critérios de aceite

1. A pessoa compreende antes de começar que não está realizando teste psicológico.
2. O período de duas semanas permanece claro.
3. As 15 perguntas aparecem uma por vez.
4. A pessoa pode voltar, mudar uma resposta ou sair apagando o percurso.
5. `Não sei avaliar ainda` nunca vale zero.
6. Nenhuma dimensão é calculada com menos de duas respostas válidas.
7. Não existe nota geral, aprovação, reprovação ou comparação social.
8. O mapa possui alternativa textual acessível.
9. O resultado contém mapa, explicação e ação prática.
10. A página funciona com todos os serviços de IA desligados.
11. Nenhuma resposta é armazenada no servidor por padrão.
12. O acesso a ajuda e emergência permanece disponível durante todo o percurso.
13. O convite para preparação para testes psicológicos e avaliações de processos seletivos aparece após o resultado.
14. Nenhum dado do mapa é enviado silenciosamente ao módulo de processos seletivos.
15. O conteúdo é testado com usuários antes de ser apresentado como instrumento estável.

## 17. Validação antes da publicação

Este pacote define uma hipótese de produto, não um instrumento psicométrico validado. Antes de publicação ampla:

1. revisão de linguagem por psicólogo habilitado;
2. revisão de risco e privacidade;
3. teste de compreensão com pessoas de diferentes escolaridades;
4. teste de acessibilidade;
5. teste de abandono e tempo de conclusão;
6. entrevistas breves para verificar se a devolutiva acolhe sem rotular;
7. revisão das perguntas que apresentarem interpretação ambígua;
8. publicação clara da versão e data de revisão.

## 18. Métricas de produto permitidas

Medir somente o necessário e, preferencialmente, de forma agregada:

- início do percurso;
- conclusão do percurso;
- abandono por número da pergunta, sem registrar a resposta;
- uso de `Não sei avaliar ainda` por pergunta, de forma agregada;
- acionamento da página de ajuda, sem associar às respostas;
- escolha de ação prática;
- acesso ao módulo sobre processos seletivos;
- avaliação opcional: **Este resultado ajudou você a entender melhor seu momento?**

Não medir “saúde mental”, “personalidade”, “empregabilidade” ou “adequação cultural” a partir deste instrumento.

## 19. Referências de desenho

- Organização Mundial da Saúde — *Doing What Matters in Times of Stress*: práticas breves, acessíveis e orientadas à ação para lidar com adversidade: <https://www.who.int/publications/i/item/9789240003927>
- GOV.UK Design System — páginas com uma pergunta por vez, possibilidade de voltar e resposta `não sei`: <https://design-system.service.gov.uk/patterns/question-pages/>
- GOV.UK Service Manual — perguntas fechadas, simples e compreensíveis: <https://www.gov.uk/service-manual/design/designing-good-questions>
- Conselho Federal de Psicologia — SATEPSI e Resolução CFP nº 31/2022: <https://satepsi.cfp.org.br/>

## 20. Handoff para Claude e Code

O Claude deverá transformar este documento em pacote técnico sem alterar o sentido das perguntas, os limites não clínicos, a privacidade ou a separação entre gratuito e pago.

O Code deverá implementar somente após revisão humana, preservando:

- cálculo determinístico e auditável;
- funcionamento sem IA;
- exclusão imediata das respostas;
- acessibilidade;
- ausência de ranking e diagnóstico;
- passagem para o módulo de preparação para processos seletivos sem transferência silenciosa de dados.
