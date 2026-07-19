# ADR-014 — Sistema Sensorial, Fluxo A: navegador controlado pelo servidor, painel lateral no Forge, gate de aprovação para ações de risco

Data: 2026-07-19
Status: Proposto — aguardando ratificação do Architect
Autor: Engineer (chat)
Resolve: pendência de decisão já registrada em `GENESIS/ROADMAP.md` (P4) — "Engineer: especificar Fluxo A do Sistema Sensorial (Playwright vs. Computer Use API)"

## Contexto

Pedido do Originador: duas telas no Forge — "Prompt" (chat com a LUNA) e "Workspace". Dentro de Workspace, ao colar uma URL, abre um painel lateral com o site ao vivo, visível tanto para o Originador quanto para a LUNA simultaneamente. A LUNA pode navegar, preencher campos e selecionar opções livremente; ações de risco óbvio (deploy, excluir, pagar, enviar) exigem aprovação explícita antes de executar.

Restrição técnica real, não contornável: nenhuma aplicação web consegue ler o conteúdo de outra aba do navegador do usuário — é proteção do próprio navegador contra sites espiando uns aos outros. "A LUNA ver sua tela ao vivo, dentro do Forge" só é possível se o navegador que ela controla for um navegador próprio, rodando no servidor — não a aba real do Originador. A alternativa que vê a aba real (Claude para Chrome, extensão instalada com permissão) já existe como produto separado, fora do Forge — não resolve o pedido de painel embutido na mesma interface.

## Decisão

Caminho técnico: Playwright rodando no servidor (mesmo ambiente que já hospeda o painel Git do Forge, Railway), como motor de automação — navega, clica, preenche. A decisão de o que fazer em cada passo vem de uma chamada ao Provider Router já existente (mesmo padrão de `model.chat`/`code.generate`), no papel de "Computer Use": recebe a captura de tela atual + o objetivo em linguagem natural, devolve a próxima ação (clicar em X, preencher Y, navegar para Z).

Esse fluxo não é Playwright OU Computer Use API — é Playwright como mãos, o Provider Router/modelo como decisor — a decisão do Roadmap P4 ("Playwright vs. Computer Use API") estava formulada como escolha excludente; a resposta correta é usar os dois juntos, papéis diferentes.

Transporte visual: capturas de tela periódicas (não vídeo full-motion — custo/latência desnecessários para este caso de uso) da sessão do Playwright, transmitidas ao painel lateral da tela Workspace do Forge via WebSocket (mesmo padrão já usado pelo Terminal, `terminal-server.ts`).

Gate de aprovação (regra padrão, confirmada pelo Originador):

- Livre, sem aprovação: navegar, ler, preencher campos de texto, selecionar opções em formulários, rolar a página.
- Exige aprovação explícita antes de executar: qualquer ação classificada como "risco óbvio" — deploy, excluir, pagar, enviar (submit final de formulário que dispara efeito irreversível ou financeiro). A ação é proposta (mostrada, com o elemento destacado no painel) e só executa após clique de confirmação do Originador no próprio Forge.

## Risco identificado, não resolvido nesta decisão (fora de escopo, ver abaixo)

Prompt injection via conteúdo de página. Uma página web pode conter texto (visível ou oculto) tentando instruir o modelo a agir de forma não pedida pelo Originador — é o vetor de ataque já conhecido em qualquer agente de navegação. O gate de aprovação para ações de risco é uma mitigação parcial (mesmo que uma injeção tente disparar um deploy, ainda para na aprovação humana) — mas não cobre ações "livres" (preencher um campo com dado errado por indução da própria página, por exemplo). Não resolvido aqui; registrar como item de teste de segurança antes de liberar em produção.

Autenticação da sessão do Playwright em Railway/GitHub. Este ADR não decide como o navegador do servidor faz login nesses sites — armazenar credenciais reais no código/ambiente é sensível o suficiente para exigir decisão própria do Architect (cofre de segredo dedicado? sessão logada manualmente uma vez, mantida viva? nunca armazenar senha, só sessão efêmera?). Fora de escopo desta decisão.

## Escopo desta decisão (o que fica definido agora)

- O caminho é Playwright + Provider Router combinados, não um escolhido em vez do outro.
- Transporte é captura de tela periódica via WebSocket, não vídeo contínuo.
- Regra padrão do gate: livre exceto deploy/excluir/pagar/enviar.

## Fora de escopo desta decisão (implementação, Builder; ou decisão futura, Architect)

- O código da integração Playwright/painel em si.
- Como a sessão do Playwright se autentica em cada site (Railway, GitHub etc.) — decisão de segurança separada, pendente.
- Lista exaustiva/heurística de quais elementos de UI contam como "risco" em cada site — v1 pode usar uma lista simples de palavras-chave no texto do botão (deploy, delete/excluir, pay/pagar, submit/enviar/confirmar) refinável depois com uso real.
- Teste de resistência a prompt injection — recomendado antes de liberar em produção, não antes de um primeiro protótipo interno.

Este ADR resolve a pendência do Roadmap P4 "Fluxo A do Sistema Sensorial"; sugestão de novo item: `GEN-006 — Painel lateral de navegador controlado (Playwright + Provider Router) na tela Workspace do Forge, com gate de aprovação (ver ADR-014)`.
