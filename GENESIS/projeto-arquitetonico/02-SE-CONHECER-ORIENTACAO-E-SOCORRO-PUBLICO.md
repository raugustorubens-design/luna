# Pacote 01 — Porta “Se conhecer”

## Orientação e socorro público, sem IA

### Decisão arquitetônica

A porta **Se conhecer** terá uma área permanente de orientação para pessoas que estejam em sofrimento, perdidas ou em situação de emergência.

Essa área será:

- pública e gratuita;
- acessível sem cadastro ou login;
- fora de qualquer plano pago;
- independente da LUNA, GPT, token e Connector Hub;
- estática, sem conversa ou triagem automatizada;
- disponível mesmo quando os serviços de IA estiverem indisponíveis;
- sem coleta de relato, endereço, localização ou dados de saúde pelo Projeto Renascer.

O objetivo é orientar a pessoa a procurar atendimento humano e especializado. O Projeto Renascer não diagnostica, não oferece terapia e não aciona serviços de emergência.

## Localização na experiência

A orientação deverá estar acessível por três caminhos:

1. botão permanente **“Preciso de ajuda agora”** na porta Se conhecer;
2. link **“Ajuda e emergência”** no cabeçalho ou rodapé público;
3. página direta que possa ser aberta sem autenticação.

Esse acesso nunca poderá ser ocultado por paywall, modal comercial, limite de uso ou indisponibilidade do GPT.

## Texto principal da página

> **Você não precisa enfrentar isso sozinho.**
>
> Se você estiver em sofrimento, procure uma pessoa de confiança e atendimento profissional. Se houver perigo imediato para você ou outra pessoa, utilize um dos contatos abaixo agora.
>
> Este espaço fornece apenas orientações e contatos. Ele não substitui atendimento médico, psicológico, psiquiátrico ou de emergência.

## Contatos apresentados

### Emergência médica ou crise aguda

**SAMU — 192**

Para situações de urgência ou emergência médica. A pessoa deverá ligar diretamente e informar o que está acontecendo e onde se encontra.

- Botão: **Ligar para o SAMU — 192**
- Ação técnica: `tel:192`

### Violência, ameaça ou perigo policial imediato

**Polícia Militar — 190**

Ao ligar, orientar a pessoa a informar:

- endereço completo, quando souber;
- cidade e bairro;
- ponto de referência;
- o que está acontecendo;
- características importantes da situação.

- Botão: **Ligar para a Polícia — 190**
- Ação técnica: `tel:190`

O site não solicitará nem enviará automaticamente localização à polícia.

### Apoio emocional e prevenção do suicídio

**Centro de Valorização da Vida — CVV — 188**

Atendimento gratuito, sigiloso e disponível 24 horas por telefone. O CVV também oferece canais digitais próprios.

- Botão: **Ligar para o CVV — 188**
- Ação técnica: `tel:188`
- Site oficial: <https://www.cvv.org.br/>
- Orientação oficial do Ministério da Saúde: <https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/suicidio-prevencao>

### Violência contra a mulher

**Central de Atendimento à Mulher — 180**

Serviço público gratuito, disponível 24 horas.

- Botão: **Ligar para o Ligue 180**
- Ação técnica: `tel:180`
- Página oficial: <https://www.gov.br/mulheres/pt-br/ligue180>

### Violações de direitos humanos

**Disque Direitos Humanos — 100**

Canal para denúncias e orientação em violações envolvendo, entre outros grupos, crianças e adolescentes, pessoas idosas, pessoas com deficiência e pessoas em restrição de liberdade.

- Botão: **Ligar para o Disque 100**
- Ação técnica: `tel:100`
- Página oficial: <https://www.gov.br/pt-br/servicos/denunciar-violacao-de-direitos-humanos>

### Encontrar atendimento presencial

Orientar a pessoa a procurar:

- CAPS;
- Unidade Básica de Saúde — UBS;
- UPA 24 horas;
- pronto-socorro;
- hospital.

- Botão: **Encontrar atendimento do SUS perto de mim**
- Destino oficial: <https://meususdigital.saude.gov.br/rede-saude>

O serviço Rede de Saúde do Meu SUS Digital poderá utilizar a localização diretamente no ambiente oficial. O Projeto Renascer não receberá essa localização.

## Orientação complementar

Exibir, sem exigir resposta:

> Se for seguro fazer isso, procure ficar perto de alguém de confiança enquanto busca ajuda. Em uma situação urgente, não dependa apenas de mensagens ou pesquisas na internet: ligue para o serviço adequado ou vá até uma unidade de atendimento.

## Requisitos de interface

- linguagem direta, humana e sem dramatização;
- números telefônicos grandes e legíveis;
- botões com alto contraste e área de toque ampla;
- funcionamento completo em celular;
- compatibilidade com leitor de tela e navegação por teclado;
- não usar animações, partículas ou efeitos que prejudiquem leitura;
- não inserir publicidade, oferta comercial ou convite para assinar plano nessa página;
- permitir retornar ao Renascer sem esconder os contatos;
- apresentar data da última verificação dos contatos oficiais.

## Requisitos técnicos

- página estática ou renderizada sem dependência de serviços de IA;
- nenhum prompt enviado ao GPT;
- nenhum consumo de token;
- nenhuma chamada ao Connector Hub;
- nenhuma exigência de conta;
- nenhum armazenamento de texto, telefone, endereço, geolocalização ou condição de saúde;
- links telefônicos devem ser confirmados pelo próprio dispositivo antes da ligação;
- links externos devem indicar que a pessoa será direcionada a um serviço oficial;
- manter os contatos em configuração simples e auditável para atualização.

## Critérios de aceite

1. A página abre sem autenticação.
2. A página funciona com todos os serviços de IA desligados.
3. Nenhum plano ou pagamento é solicitado.
4. Os botões `192`, `190`, `188`, `180` e `100` iniciam a ação de ligação compatível com o dispositivo.
5. O botão de atendimento presencial abre a Rede de Saúde do Meu SUS Digital.
6. Nenhuma localização ou dado sensível é enviado ao Projeto Renascer.
7. A página não contém chat, triagem automatizada ou diagnóstico.
8. Todos os contatos e textos são revisados periodicamente contra fontes oficiais.

## Limite em relação ao plano pago

O plano pago poderá oferecer uma jornada orientada de autoconhecimento com a LUNA. Entretanto, orientação de socorro, números de emergência e encaminhamento a serviços humanos são patrimônio público da experiência e permanecem disponíveis para qualquer pessoa.
