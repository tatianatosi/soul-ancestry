# Clube Ancestral — Biblioteca Completa de Mensagens para WhatsApp

**Versão:** 1.0  
**Data:** 28 de agosto de 2026  
**Uso:** Atendimento humano, follow-ups, onboarding, cadências, propostas, documentos, pesquisa, cidadania, memória, legado e pós-venda.  
**Integração futura:** Cada código pode ser cadastrado em `communication_templates`, associado a evento, cenário, micro-entrega, CTA e tarefa no Desk.

> Esta é uma biblioteca de mensagens operacionais. Use uma mensagem por vez, com contexto real do caso. Não dispare sequências automáticas sem revisão da proprietária, sem vínculo ao cliente/caso e sem uma regra de interrupção quando a pessoa responder, pagar, enviar documento ou pedir pausa.

---

## 1. Tom de voz

- Humano, acolhedor, profissional e direto.
- Falar de história familiar, jornada, documentos, descobertas e próximos passos.
- Explicar o que aconteceu, o que significa e qual ação é esperada.
- Usar um CTA por mensagem.
- Não prometer cidadania, passaporte, aprovação, prazo ou resultado jurídico.
- Preferir: “possibilidades”, “leitura inicial”, “enquadramento”, “conforme a documentação”, “vamos organizar”, “seguimos juntos”.
- Evitar pressão artificial, excesso de mensagens, jargão jurídico não explicado e linguagem de “ticket”, “pipeline”, “auditoria” ou “governança”.
- Emojis são opcionais; usar com moderação. O padrão sugerido é `😊` ou `🌿`.

## 2. Variáveis padrão

```text
{{primeiro_nome}}
{{nome_completo}}
{{nome_caso}}
{{codigo_caso}}
{{pais}}
{{via}}
{{objetivo}}
{{nome_documento}}
{{documento_pendente}}
{{proxima_acao}}
{{data_proxima_acao}}
{{nome_proposta}}
{{link_proposta}}
{{nome_contrato}}
{{link_contrato}}
{{valor_total}}
{{entrada}}
{{parcelas}}
{{link_pagamento}}
{{link_portal}}
{{nome_responsavel}}
{{data_reuniao}}
{{horario_reuniao}}
```

Se alguma variável não estiver preenchida, editar a mensagem manualmente antes de enviar. Nunca enviar `{{variável}}` aparente ao cliente.

---

# A. Entrada, lead e discovery

## COM-WA-LEAD-001 — Primeiro acolhimento

**Quando usar:** lead chega por WhatsApp, indicação, formulário, LinkedIn, Instagram, site ou outra origem.

```text
Oi, {{primeiro_nome}}! Tudo bem? 😊

Que bom receber sua mensagem. No Clube Ancestral, começamos pelo que você já sabe sobre a sua família para organizar possibilidades, documentos e os próximos caminhos.

Se quiser, me conte quais sobrenomes, países de origem ou histórias familiares você já conhece. Assim consigo entender melhor por onde começamos. 🌿
```

**CTA:** responder com informações iniciais.

## COM-WA-LEAD-002 — Resposta a indicação

**Quando usar:** pessoa chega indicada por cliente, parceiro ou familiar.

```text
Oi, {{primeiro_nome}}! Tudo bem? 😊

Recebi seu contato por indicação e será um prazer conhecer um pouco da história da sua família.

Para eu te orientar melhor, me conta qual é o seu objetivo neste momento: investigar a origem familiar, organizar documentos ou avaliar uma possibilidade de cidadania?
```

**CTA:** informar objetivo.

## COM-WA-LEAD-003 — Após interesse em cidadania

**Quando usar:** lead menciona cidadania por descendência.

```text
Oi, {{primeiro_nome}}! 😊

Para avaliar uma possibilidade de cidadania por ancestralidade, o primeiro passo é entender a linha familiar, o país de origem e os documentos que já existem.

Você sabe de qual país vem essa origem e qual é o parentesco com o ascendente? Com isso consigo te direcionar melhor.
```

**CTA:** responder país e parentesco.

## COM-WA-LEAD-004 — Após interesse em pesquisa genealógica/memória

**Quando usar:** pessoa quer montar árvore, descobrir história familiar ou preservar memórias.

```text
Oi, {{primeiro_nome}}! 😊

Que bonito querer aprofundar a história da sua família.

Podemos começar pelos nomes, sobrenomes, cidades de origem, documentos, fotos ou relatos que vocês já guardam. Mesmo informações incompletas ajudam a abrir os primeiros caminhos de pesquisa.
```

**CTA:** compartilhar o que já possui.

## COM-WA-LEAD-005 — Convite para diagnóstico

**Quando usar:** há interesse e dados mínimos para avançar à leitura inicial.

```text
Pelas informações que você compartilhou, já existem pontos que valem uma análise mais cuidadosa.

O diagnóstico inicial organiza a linha familiar, os documentos conhecidos e as possibilidades que podem ser investigadas no seu caso.

Se fizer sentido para você, posso te explicar como funciona essa primeira etapa.
```

**CTA:** confirmar interesse no diagnóstico.

## COM-WA-LEAD-006 — Radar/diagnóstico não concluído

**Quando usar:** pessoa iniciou coleta de informações, mas não terminou. Usar apenas uma vez antes de pausar.

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando só para dizer que, quando for um bom momento para você, podemos retomar as informações iniciais da sua família de onde paramos.

Sem pressa — quando quiser continuar, estou por aqui. 🌿
```

**CTA:** retomar conversa.

## COM-WA-LEAD-007 — Sem resposta após primeiro contato

**Quando usar:** lead não respondeu ao primeiro acolhimento. Não enviar em sequência curta.

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando só para deixar meu contato à disposição. Quando quiser retomar a conversa sobre a história da sua família ou a possibilidade de cidadania, pode me chamar por aqui. 😊
```

**CTA:** responder quando desejar.

---

# B. Reunião, discovery e devolutiva

## COM-WA-MEET-001 — Convite para conversa inicial

```text
Oi, {{primeiro_nome}}! 😊

Acredito que uma conversa breve vai nos ajudar a organizar melhor o seu cenário, entender a linha familiar e esclarecer os próximos passos possíveis.

Qual período costuma ser mais confortável para você? Eu ajusto os horários por aqui.
```

**CTA:** informar disponibilidade.

## COM-WA-MEET-002 — Confirmação de reunião

```text
Oi, {{primeiro_nome}}! 😊

Nossa conversa ficou combinada para {{data_reuniao}}, às {{horario_reuniao}}.

Vamos falar sobre a história familiar, os documentos que você já possui e os caminhos que podem fazer sentido para o seu caso. Se surgir alguma informação ou documento antes da reunião, pode me enviar por aqui.
```

**CTA:** confirmar presença ou enviar material.

## COM-WA-MEET-003 — Lembrete leve de reunião

```text
Oi, {{primeiro_nome}}! 😊

Passando só para lembrar da nossa conversa hoje, às {{horario_reuniao}}.

Se precisar ajustar o horário, me avise por aqui e encontramos uma alternativa tranquila.
```

**CTA:** confirmar ou reagendar.

## COM-WA-MEET-004 — Agradecimento após discovery

```text
Oi, {{primeiro_nome}}! 😊

Obrigada pela conversa de hoje e por compartilhar um pouco da história da sua família.

Vou organizar os pontos que levantamos, revisar as informações e preparar os próximos passos com base no seu cenário. Assim que eu finalizar essa leitura, volto por aqui.
```

**CTA:** nenhum; mensagem de acolhimento e atualização.

## COM-WA-MEET-005 — Pedido de material após discovery

```text
Oi, {{primeiro_nome}}! 😊

Para complementar a leitura que iniciamos, quando puder me envie o que tiver sobre {{documento_pendente}}.

Mesmo que não esteja completo, esse material ajuda a organizar a próxima etapa da pesquisa.
```

**CTA:** enviar o material solicitado.

## COM-WA-MEET-006 — Devolutiva inicial pronta

```text
Oi, {{primeiro_nome}}! 😊

Concluí a organização inicial dos pontos que conversamos e já temos uma leitura mais clara sobre os caminhos que valem ser investigados.

Quero te apresentar isso com calma, mostrando o que encontramos, o que ainda precisa ser confirmado e como podemos seguir.

Quando você tiver disponibilidade, me avisa e marcamos uma conversa breve.
```

**CTA:** agendar devolutiva.

---

# C. Proposta, negociação e fechamento

## COM-WA-PROP-001 — Proposta em preparação

```text
Oi, {{primeiro_nome}}! 😊

Já estou organizando a proposta com base no que levantamos sobre a sua história familiar e o seu objetivo.

Assim que fechar os últimos detalhes de escopo e próximos passos, te envio tudo de forma clara para você analisar com calma. 🌿
```

**CTA:** nenhum.

## COM-WA-PROP-002 — Proposta pronta para apresentar

```text
Oi, {{primeiro_nome}}! 😊

Finalizei a proposta e organizei o material com o escopo, a jornada e as possibilidades de investimento para o seu caso.

Quero te apresentar com calma para esclarecer qualquer ponto e mostrar como cada etapa se conecta à sua história familiar.

Quando você tiver disponibilidade, me avisa e marcamos uma conversa breve.
```

**CTA:** agendar apresentação.

## COM-WA-PROP-003 — Envio de proposta para análise

```text
Oi, {{primeiro_nome}}! Tudo bem?

Preparei a sua proposta com o escopo desta etapa, o investimento e os próximos passos para organizarmos o processo com clareza.

Estou te enviando o material para você analisar com calma. Quando puder, me diga se ficou alguma dúvida ou se está de acordo para seguirmos. 🌿
```

**CTA:** responder com dúvidas ou concordância.

## COM-WA-PROP-004 — Envio após aceite verbal

**Quando usar:** cliente já confirmou verbalmente que deseja seguir; falta aceite escrito.

```text
Oi, {{primeiro_nome}}! Tudo bem?

Conforme alinhamos na nossa última conversa, estou te enviando a proposta revisada referente à primeira etapa do seu processo.

Como já combinamos que vamos seguir, peço apenas que você me confirme por aqui que está de acordo com o material para eu avançar com a formalização e o início da etapa.

Se surgir qualquer dúvida pontual, estou à disposição. 🌿
```

**CTA:** confirmar aceite escrito.

## COM-WA-PROP-005 — Escolha de forma de contratação

```text
Oi, {{primeiro_nome}}! 😊

Para seguirmos com a formalização, preciso apenas que você me confirme qual formato faz mais sentido para este momento:

- à vista;
- recorrência/parcelamento;
- início por etapas.

Com a sua escolha, preparo o próximo documento e organizamos o início da jornada.
```

**CTA:** escolher uma opção.

## COM-WA-PROP-006 — Follow-up suave de proposta

**Quando usar:** proposta foi enviada e não houve resposta. Não usar como cobrança; respeitar intervalo e contexto.

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando só para confirmar se você conseguiu ver a proposta que te enviei.

Quando puder, me diz se ficou alguma dúvida ou se está tudo certo para seguirmos. Estou à disposição. 🌿
```

**CTA:** responder.

## COM-WA-PROP-007 — Follow-up para rotina corrida

```text
Oi, {{primeiro_nome}}! 😊

Imagino que a rotina possa estar corrida, então passo só para deixar a proposta disponível e dizer que não há problema se você precisar de mais tempo para olhar com calma.

Quando for um bom momento, me chama por aqui e seguimos do ponto que fizer mais sentido para você.
```

**CTA:** retomar quando possível.

## COM-WA-PROP-008 — Proposta próxima da validade

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando para lembrar que a proposta que preparamos permanece válida até {{data_proxima_acao}}.

Se quiser seguir dentro dessas condições, basta me confirmar por aqui. Se precisar conversar ou ajustar algum ponto antes, estou à disposição.
```

**CTA:** confirmar, pedir ajuste ou agendar conversa.

## COM-WA-PROP-009 — Aceite recebido

```text
Oi, {{primeiro_nome}}! 😊

Recebi sua confirmação. Que bom seguirmos juntos!

Agora vou preparar a formalização da contratação e organizar as primeiras ações da sua jornada. Assim que estiver tudo pronto, volto por aqui com o próximo passo.
```

**CTA:** nenhum.

## COM-WA-PROP-010 — Proposta não seguida agora

```text
Oi, {{primeiro_nome}}! 😊

Obrigada por me contar. Entendo perfeitamente o seu momento.

Vou deixar os pontos que levantamos organizados e, quando fizer sentido retomar a pesquisa ou a possibilidade de cidadania, será um prazer continuar de onde paramos.
```

**CTA:** nenhum.

---

# D. Contrato, formalização e pagamento

## COM-WA-CONT-001 — Contrato pronto

```text
Oi, {{primeiro_nome}}! 😊

Preparei o documento de formalização conforme a proposta escolhida e deixei tudo organizado para sua leitura.

Quando puder, confira o material. Se estiver tudo certo, me confirme por aqui para seguirmos com a próxima etapa.
```

**CTA:** confirmar leitura/concordância.

## COM-WA-CONT-002 — Contrato enviado para assinatura

```text
Oi, {{primeiro_nome}}! 😊

O documento de formalização está disponível para sua assinatura.

Assim que essa etapa estiver concluída, organizamos o início da jornada e os primeiros itens do seu caso.

Se surgir qualquer dúvida durante a leitura, pode me chamar por aqui.
```

**CTA:** assinar/confirmar.

## COM-WA-CONT-003 — Lembrete de assinatura

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando só para confirmar se você conseguiu olhar o documento de formalização.

Quando puder concluir ou se tiver alguma dúvida, me avisa por aqui para seguirmos com tranquilidade.
```

**CTA:** concluir assinatura ou esclarecer dúvida.

## COM-WA-PAG-001 — Link de pagamento após escolha

```text
Oi, {{primeiro_nome}}! 😊

Conforme a modalidade que você escolheu, organizei o link de pagamento correspondente.

Você pode acessar por aqui: {{link_pagamento}}

Assim que a confirmação aparecer, seguimos para {{proxima_acao}}. Se precisar de qualquer apoio, estou à disposição.
```

**CTA:** realizar pagamento.

## COM-WA-PAG-002 — Pagamento confirmado

```text
Oi, {{primeiro_nome}}! 😊

Recebemos a confirmação do pagamento. Obrigada pela confiança!

Agora seguimos para {{proxima_acao}}. Você poderá acompanhar as atualizações pelo seu espaço do Clube Ancestral: {{link_portal}}
```

**CTA:** abrir portal ou cumprir próximo passo.

## COM-WA-PAG-003 — Pagamento parcial/sinal confirmado

```text
Oi, {{primeiro_nome}}! 😊

Recebemos a confirmação do pagamento inicial e já podemos organizar o começo da sua jornada.

O próximo passo é {{proxima_acao}}. Vou acompanhando tudo com você por aqui e pelo seu espaço no Clube Ancestral.
```

**CTA:** cumprir próximo passo.

## COM-WA-PAG-004 — Lembrete de parcela

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando para lembrar da parcela prevista para {{data_proxima_acao}}.

Se precisar conferir informações ou reorganizar algum ponto, me avisa por aqui e eu te ajudo.
```

**CTA:** responder ou regularizar.

## COM-WA-PAG-005 — Pendência financeira acolhedora

```text
Oi, {{primeiro_nome}}! Tudo bem?

Identificamos uma pendência financeira referente ao seu processo e queria verificar com você a melhor forma de organizarmos isso.

Quando puder, me chama por aqui para alinharmos com tranquilidade.
```

**CTA:** responder para alinhamento.

---

# E. Onboarding e início da jornada

## COM-WA-ONB-001 — Boas-vindas após contratação

```text
Oi, {{primeiro_nome}}! 😊

Que bom seguirmos juntos. A partir de agora, vamos organizar as primeiras informações e documentos do seu caso.

Seu primeiro passo é: {{proxima_acao}}.

Você também poderá acompanhar a jornada pelo seu espaço do Clube Ancestral: {{link_portal}}

Qualquer dúvida, estou por aqui. 🌿
```

**CTA:** executar próxima ação.

## COM-WA-ONB-002 — Apresentação do espaço do cliente

```text
Oi, {{primeiro_nome}}! 😊

Seu espaço no Clube Ancestral já está disponível.

Por lá, você poderá acompanhar a jornada do caso, documentos, atualizações e descobertas que forem liberadas ao longo do processo.

Acesse quando quiser: {{link_portal}}
```

**CTA:** entrar no portal.

## COM-WA-ONB-003 — Solicitação de dados iniciais

```text
Oi, {{primeiro_nome}}! 😊

Para começarmos a organizar seu caso, preciso reunir algumas informações iniciais sobre a família e os documentos que você já possui.

Quando puder, envie {{documento_pendente}}. Mesmo que algo esteja incompleto, já ajuda a direcionar a próxima etapa.
```

**CTA:** enviar informações/documentos.

## COM-WA-ONB-004 — Lembrete de coleta inicial

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando para lembrar das informações iniciais do seu caso. Quando puder, nos envie {{documento_pendente}} para continuarmos a organização da jornada.

Se tiver qualquer dúvida sobre o que procurar, me chama por aqui. 🌿
```

**CTA:** enviar item.

## COM-WA-ONB-005 — Primeira etapa iniciada

```text
Oi, {{primeiro_nome}}! 😊

Já iniciamos a organização da primeira etapa do seu caso.

Neste momento, estamos trabalhando em {{proxima_acao}}. Assim que houver uma atualização relevante ou uma nova entrega, aviso você por aqui e pelo seu espaço.
```

**CTA:** nenhum.

## COM-WA-ONB-006 — Onboarding pausado por falta de retorno

```text
Oi, {{primeiro_nome}}! Tudo bem?

Para respeitar o seu tempo, vou deixar a etapa inicial do seu caso em pausa até recebermos {{documento_pendente}} ou uma orientação sua para seguir.

Quando estiver pronto, é só me chamar por aqui que retomamos sem perder o contexto. 🌿
```

**CTA:** retomar quando desejar.

---

# F. Documentos, certidões, tradução, apostila e retificação

## COM-WA-DOC-001 — Checklist documental disponível

```text
Oi, {{primeiro_nome}}! 😊

Organizamos o checklist inicial de documentos do seu caso.

Vamos começar pelos itens mais importantes, e você pode acompanhar tudo pelo seu espaço: {{link_portal}}

O primeiro item é {{nome_documento}}. Quando puder, envie ou me avise se precisar de ajuda para localizar.
```

**CTA:** abrir checklist/enviar documento.

## COM-WA-DOC-002 — Solicitação de documento

```text
Oi, {{primeiro_nome}}! Tudo bem?

Para seguirmos com a organização do seu caso, precisamos do seguinte documento: {{nome_documento}}.

Quando puder, envie pelo seu espaço ou me avise caso tenha alguma dúvida sobre como localizar esse item. 🌿
```

**CTA:** enviar documento ou pedir orientação.

## COM-WA-DOC-003 — Documento recebido

```text
Oi, {{primeiro_nome}}! 😊

Recebemos o documento que você enviou. Obrigada!

Agora ele seguirá para análise e, se precisarmos de algum complemento, voltamos a falar com você por aqui.
```

**CTA:** nenhum.

## COM-WA-DOC-004 — Documento validado

```text
Oi, {{primeiro_nome}}! 😊

O documento {{nome_documento}} foi validado e já fortalece a organização do seu caso.

Seguimos agora para {{proxima_acao}}. Você pode acompanhar o progresso pelo seu espaço.
```

**CTA:** ver progresso.

## COM-WA-DOC-005 — Pedido de certidão iniciado

```text
Oi, {{primeiro_nome}}! 😊

Iniciamos a busca/solicitação de {{nome_documento}}.

Essa etapa depende do retorno da fonte ou do órgão responsável, mas vamos acompanhando e atualizamos você assim que houver novidade relevante.
```

**CTA:** nenhum.

## COM-WA-DOC-006 — Certidão localizada

```text
Oi, {{primeiro_nome}}! 😊

Encontramos um registro importante para o seu caso: {{nome_documento}}.

Agora vamos verificar como essa informação se conecta à documentação e aos próximos passos da sua jornada. Assim que a análise estiver concluída, atualizamos você.
```

**CTA:** nenhum.

## COM-WA-DOC-007 — Tradução necessária

```text
Oi, {{primeiro_nome}}! 😊

Na análise de {{nome_documento}}, identificamos que será necessária uma tradução para a próxima etapa do processo.

Vamos organizar essa necessidade dentro do seu caso e te orientar sobre o próximo passo assim que o escopo estiver definido.
```

**CTA:** acompanhar orientação.

## COM-WA-DOC-008 — Apostilamento necessário

```text
Oi, {{primeiro_nome}}! 😊

Para a rota definida no seu caso, o documento {{nome_documento}} precisa passar por apostilamento antes de seguirmos.

Vamos organizar essa etapa e te avisar sobre a forma mais adequada de avançar.
```

**CTA:** acompanhar orientação.

## COM-WA-DOC-009 — Divergência/retificação necessária

```text
Oi, {{primeiro_nome}}! 😊

Durante a análise, identificamos uma divergência em {{nome_documento}} que merece atenção antes de avançarmos.

Não precisa se preocupar: vamos organizar com você o impacto dessa informação e o caminho mais adequado para tratá-la.
```

**CTA:** aguardar orientação ou agendar conversa.

## COM-WA-DOC-010 — Documento indisponível ou sem localização inicial

```text
Oi, {{primeiro_nome}}! 😊

Nesta primeira busca, ainda não conseguimos localizar {{nome_documento}} na fonte consultada.

Isso não encerra a pesquisa: vamos revisar dados, localidades e alternativas de busca antes de definir o próximo caminho. Assim que tivermos uma atualização, te aviso.
```

**CTA:** nenhum.

---

# G. Pesquisa genealógica, achados e memória familiar

## COM-WA-PESQ-001 — Pesquisa iniciada

```text
Oi, {{primeiro_nome}}! 😊

Iniciamos a pesquisa da sua linhagem familiar a partir das informações e documentos que reunimos até aqui.

Vamos trabalhar na organização dos nomes, lugares, vínculos e fontes que podem ajudar a reconstruir essa história. Quando houver uma descoberta relevante, compartilho com você.
```

**CTA:** nenhum.

## COM-WA-PESQ-002 — Primeira linha organizada

```text
Oi, {{primeiro_nome}}! 🌿

Já começamos a organizar os primeiros vínculos da sua linhagem familiar.

A árvore vai ganhando forma aos poucos, conforme conectamos pessoas, documentos e lugares. Você poderá acompanhar as descobertas que forem liberadas no seu espaço.
```

**CTA:** explorar árvore/portal.

## COM-WA-PESQ-003 — Achado histórico relevante

```text
Oi, {{primeiro_nome}}! 😊

Encontramos um registro que ajuda a contar mais um capítulo da sua família.

Já estamos conectando essa descoberta à linha de pesquisa e, quando a análise estiver concluída, ela ficará disponível no seu espaço para você conhecer com calma.
```

**CTA:** aguardar/liberar descoberta.

## COM-WA-PESQ-004 — Achado liberado no portal

```text
Oi, {{primeiro_nome}}! 🌿

Uma nova descoberta foi liberada no seu espaço do Clube Ancestral.

Ela reúne informações importantes sobre a sua família e ajuda a dar mais forma à história que estamos reconstruindo.

Você pode ver por aqui: {{link_portal}}
```

**CTA:** abrir descoberta.

## COM-WA-PESQ-005 — Solicitação de fotos, relatos e memórias

```text
Oi, {{primeiro_nome}}! 😊

Além dos documentos, fotos, histórias, apelidos, cartas e lembranças de família podem ajudar muito a enriquecer a pesquisa.

Se tiver algo que queira compartilhar sobre {{nome_caso}}, pode enviar quando se sentir à vontade. Cada detalhe pode abrir uma nova conexão. 🌿
```

**CTA:** compartilhar memória.

## COM-WA-PESQ-006 — Relatório de pesquisa disponível

```text
Oi, {{primeiro_nome}}! 😊

Preparamos uma nova entrega da pesquisa para você consultar com calma.

O material reúne os avanços, fontes, conexões e próximos pontos que seguimos investigando.

Você pode acessar pelo seu espaço: {{link_portal}}
```

**CTA:** abrir relatório.

## COM-WA-PESQ-007 — Pesquisa precisa de informação adicional

```text
Oi, {{primeiro_nome}}! 😊

Para avançarmos em uma parte importante da pesquisa, preciso confirmar uma informação sobre {{documento_pendente}}.

Se você ou alguém da família souber algo a respeito, mesmo que seja uma lembrança aproximada, pode me contar por aqui.
```

**CTA:** responder com informação.

## COM-WA-PESQ-008 — Atualização sem achado conclusivo

```text
Oi, {{primeiro_nome}}! 😊

Passando para compartilhar uma atualização da pesquisa: seguimos trabalhando nas fontes e hipóteses levantadas, mas ainda não temos uma conclusão segura para essa etapa.

Preferimos avançar com cuidado, conectando cada informação a evidências confiáveis. Assim que houver algo consistente, atualizo você.
```

**CTA:** nenhum.

---

# H. Planejador, jornada, milestones e protocolo

## COM-WA-PLAN-001 — Mudança de fase

```text
Oi, {{primeiro_nome}}! 😊

Seu caso avançou para a etapa de {{via}}.

O próximo passo é {{proxima_acao}}. Você pode acompanhar a jornada e os marcos pelo seu espaço do Clube Ancestral.
```

**CTA:** ver jornada.

## COM-WA-PLAN-002 — Atualização de jornada

```text
Oi, {{primeiro_nome}}! 😊

Atualizamos a jornada do seu caso com os avanços mais recentes.

Neste momento, estamos em {{via}} e o próximo marco previsto é {{proxima_acao}}.

Você pode consultar a linha do tempo pelo seu espaço: {{link_portal}}
```

**CTA:** abrir jornada.

## COM-WA-PLAN-003 — Pasta em progresso

```text
Oi, {{primeiro_nome}}! 😊

A organização documental do seu caso avançou e já concluímos uma parte importante da pasta.

Agora estamos priorizando {{proxima_acao}} para fortalecer a próxima etapa.
```

**CTA:** ver o que falta.

## COM-WA-PLAN-004 — Pasta em revisão final

```text
Oi, {{primeiro_nome}}! 😊

A documentação essencial do seu caso entrou em revisão final.

Estamos conferindo os últimos pontos antes de orientar você sobre o próximo marco da jornada.
```

**CTA:** nenhum.

## COM-WA-PLAN-005 — Protocolo realizado

```text
Oi, {{primeiro_nome}}! 😊

O protocolo do seu processo foi realizado.

A partir de agora, acompanharemos os próximos movimentos e manteremos você informado sobre cada marco relevante. O comprovante e a jornada atualizada estarão disponíveis no seu espaço.
```

**CTA:** ver comprovante/jornada.

## COM-WA-PLAN-006 — Acompanhamento externo periódico

```text
Oi, {{primeiro_nome}}! 😊

Passando para compartilhar a atualização mais recente do seu processo.

No momento, seguimos acompanhando o andamento junto à instância responsável. Assim que houver um movimento relevante ou uma nova ação necessária, avisamos você.
```

**CTA:** abrir andamento.

## COM-WA-PLAN-007 — Sem novidade externa, com transparência

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando para manter você atualizado: neste momento, não houve uma nova movimentação externa relevante no processo.

Seguimos acompanhando e manteremos contato assim que houver qualquer atualização que exija ação ou represente avanço no caso.
```

**CTA:** nenhum.

---

# I. Pós-reconhecimento, família, assinatura e legado

## COM-WA-POS-001 — Reconhecimento confirmado

```text
Oi, {{primeiro_nome}}! 🌿

Recebemos a confirmação de uma etapa muito importante: o reconhecimento foi concluído.

Agora podemos organizar os próximos passos práticos, como registros, AIRE e passaporte, conforme o seu caso e os planos da sua família.
```

**CTA:** conhecer próximos passos.

## COM-WA-POS-002 — AIRE e passaporte

```text
Oi, {{primeiro_nome}}! 😊

Com o reconhecimento concluído, podemos organizar a próxima etapa de regularização e documentos, incluindo AIRE e passaporte, conforme a sua necessidade.

Se fizer sentido para você, preparo o caminho dessa etapa e te explico os próximos passos.
```

**CTA:** confirmar interesse.

## COM-WA-POS-003 — Registro de filhos/casamento

```text
Oi, {{primeiro_nome}}! 😊

Agora que a jornada avançou, podemos avaliar a regularização de registros familiares, como filhos ou casamento, quando aplicável.

Isso ajuda a estender o legado documental para as próximas gerações. Se quiser, posso organizar essa leitura com você.
```

**CTA:** solicitar avaliação familiar.

## COM-WA-LEG-001 — Linha do tempo familiar liberada

```text
Oi, {{primeiro_nome}}! 🌿

Organizamos uma linha do tempo com marcos importantes da história da sua família.

Ela reúne pessoas, lugares, documentos e acontecimentos que ajudam a dar mais sentido à trajetória que vocês construíram.

Você pode explorar pelo seu espaço: {{link_portal}}
```

**CTA:** explorar linha do tempo.

## COM-WA-LEG-002 — Convite à preservação de memória

```text
Oi, {{primeiro_nome}}! 😊

As descobertas reunidas até aqui já mostram uma história familiar rica, que pode ser preservada para você e para as próximas gerações.

Quando fizer sentido, podemos transformar esse material em uma linha do tempo ampliada, caderno de memória, álbum comentado ou livro da família.
```

**CTA:** conhecer possibilidades de legado.

## COM-WA-LEG-003 — Renovação de plano/assinatura

```text
Oi, {{primeiro_nome}}! 😊

Seu plano de continuidade está se aproximando da renovação.

Ele mantém a organização da história familiar, das descobertas e dos documentos já reunidos, além de abrir espaço para novas etapas de memória e legado.

Se quiser, posso te mostrar as opções para seguirmos.
```

**CTA:** ver opções de continuidade.

## COM-WA-LEG-004 — Pedido de indicação

```text
Oi, {{primeiro_nome}}! 🌿

Fico muito feliz por acompanhar uma parte tão importante da história da sua família.

Se você conhecer alguém que também queira investigar a própria origem, organizar documentos ou entender uma possibilidade de cidadania, será um prazer acolher essa pessoa.
```

**CTA:** indicar alguém.

---

# J. Suporte, portal e relacionamento

## COM-WA-SUP-001 — Primeiro acesso ao portal

```text
Oi, {{primeiro_nome}}! 😊

Seu espaço no Clube Ancestral está pronto.

Por lá, você acompanha sua jornada, documentos, atualizações e descobertas que forem liberadas ao longo do processo.

Acesse por aqui: {{link_portal}}
```

**CTA:** entrar no portal.

## COM-WA-SUP-002 — Ajuda de acesso

```text
Oi, {{primeiro_nome}}! Tudo bem?

Recebi sua solicitação de ajuda com o acesso ao seu espaço.

Vou verificar o melhor caminho para você entrar e já retorno por aqui. Enquanto isso, se puder me dizer o que apareceu na tela, isso ajuda a resolver mais rápido.
```

**CTA:** descrever o problema.

## COM-WA-SUP-003 — Atualização de suporte

```text
Oi, {{primeiro_nome}}! 😊

Passando para atualizar você: estamos verificando o ponto que nos informou e seguimos acompanhando até que tudo esteja resolvido.

Assim que eu tiver uma confirmação, volto por aqui.
```

**CTA:** nenhum.

## COM-WA-SUP-004 — Retomada de caso pausado

```text
Oi, {{primeiro_nome}}! 😊

Seu caso continua organizado e podemos retomar a jornada quando for um bom momento para você.

Quando quiser seguir, me chama por aqui e revisamos juntos qual é o próximo passo mais adequado.
```

**CTA:** retomar caso.

## COM-WA-SUP-005 — Aniversário de marco/relacionamento

```text
Oi, {{primeiro_nome}}! 🌿

Hoje lembrei de uma etapa importante da sua jornada com o Clube Ancestral.

É bonito ver como a história da sua família vem ganhando forma. Quando quiser retomar, ampliar ou preservar novas descobertas, estou por aqui.
```

**CTA:** nenhum.

---

# K. Cadências práticas de WhatsApp

## 1. Cadência de proposta enviada

| Momento | Código | Ação | Condição de parada |
|---|---|---|---|
| Envio | `COM-WA-PROP-003` ou `COM-WA-PROP-004` | Enviar proposta + solicitar resposta | Cliente responde, aceita, recusa ou pede pausa |
| Follow-up 1 | `COM-WA-PROP-006` | Verificar dúvidas/recebimento | Cliente responde ou pede prazo |
| Follow-up 2 | `COM-WA-PROP-007` | Respeitar rotina e oferecer retomada | Cliente responde, aceita, recusa ou caso é pausado |
| Validade | `COM-WA-PROP-008` | Informar validade de forma objetiva | Cliente responde ou proposta expira/é revisada |

## 2. Cadência de contrato

| Momento | Código | Ação | Condição de parada |
|---|---|---|---|
| Contrato pronto | `COM-WA-CONT-001` | Informar formalização pronta | Cliente confirma/assina |
| Envio | `COM-WA-CONT-002` | Enviar para assinatura | Contrato assinado/cancelado |
| Lembrete | `COM-WA-CONT-003` | Follow-up respeitoso | Cliente responde ou assinatura ocorre |

## 3. Cadência de onboarding

| Momento | Código | Ação | Condição de parada |
|---|---|---|---|
| Início | `COM-WA-ONB-001` | Boas-vindas + primeira ação | Cliente conclui ação ou pede ajuda |
| Portal | `COM-WA-ONB-002` | Entregar acesso | Cliente acessa ou solicita suporte |
| Coleta | `COM-WA-ONB-003` | Solicitar dados/documentos | Cliente envia material |
| Lembrete | `COM-WA-ONB-004` | Lembrete contextual | Cliente envia material ou pausa |
| Pausa | `COM-WA-ONB-006` | Preservar contexto sem pressão | Cliente retoma |

## 4. Cadência de documento pendente

| Momento | Código | Ação | Condição de parada |
|---|---|---|---|
| Solicitação | `COM-WA-DOC-002` | Pedir documento específico | Documento recebido ou requisito dispensado |
| Lembrete | `COM-WA-ONB-004` | Relembrar sem pressão | Documento recebido ou caso pausado |
| Orientação | `COM-WA-DOC-009` | Explicar divergência/ação adicional | Cliente recebe plano de ação |

## 5. Cadência de pesquisa e andamento

| Momento | Código | Ação | Condição de parada |
|---|---|---|---|
| Início | `COM-WA-PESQ-001` | Comunicar começo da pesquisa | Primeira atualização/achado |
| Achado | `COM-WA-PESQ-003` | Compartilhar descoberta relevante | Entrega liberada ou análise continua |
| Sem conclusão | `COM-WA-PESQ-008` | Transparência de pesquisa | Nova evidência/decisão |
| Protocolo | `COM-WA-PLAN-005` | Comunicar marco de protocolo | Caso entra em acompanhamento |
| Acompanhamento | `COM-WA-PLAN-006` ou `007` | Atualização por marco/ciclo | Nova movimentação ou conclusão |

---

# L. De-para WhatsApp × micro-entrega × app copy × CTA

| Micro-entrega / evento | WhatsApp | Copy no app | CTA do app | Próxima ação no Desk |
|---|---|---|---|---|
| Lead registrado | `COM-WA-LEAD-001` | “Seu caminho começa aqui.” | “Iniciar diagnóstico” | Criar/atribuir lead e primeiro contato |
| Discovery concluída | `COM-WA-MEET-004` | “Estamos organizando a leitura inicial do seu caso.” | “Ver próximos passos” | Preparar devolutiva/proposta |
| Diagnóstico pronto | `COM-WA-MEET-006` | “Sua leitura inicial está pronta.” | “Ver diagnóstico” | Agendar devolutiva ou enviar proposta |
| Proposta pronta | `COM-WA-PROP-002` | “Sua proposta está em preparação.” | “Acompanhar próximos passos” | Preparar envio de proposta |
| Proposta enviada | `COM-WA-PROP-003` | “Sua proposta está disponível para leitura.” | “Abrir proposta” | Registrar envio e data de follow-up |
| Aceite verbal | `COM-WA-PROP-004` | “Aguardamos sua confirmação para formalizar.” | “Confirmar escolha” | Aguardar aceite escrito |
| Aceite escrito | `COM-WA-PROP-009` | “Sua escolha foi registrada.” | “Ver próximos passos” | Criar contrato/plano financeiro |
| Contrato enviado | `COM-WA-CONT-002` | “Seu documento de formalização está disponível.” | “Abrir contrato” | Registrar envio e acompanhar assinatura |
| Pagamento confirmado | `COM-WA-PAG-002` | “Pagamento confirmado. Vamos seguir.” | “Ver próximos passos” | Iniciar onboarding |
| Onboarding iniciado | `COM-WA-ONB-001` | “Vamos organizar os primeiros itens do seu caso.” | “Enviar informações” | Criar tarefas/requisitos do cenário |
| Documento solicitado | `COM-WA-DOC-002` | “Precisamos deste documento para continuar.” | “Enviar documento” | Criar requisito/tarefa documental |
| Documento recebido | `COM-WA-DOC-003` | “Recebemos seu documento. Ele está em análise.” | “Ver status” | Criar tarefa de revisão |
| Documento validado | `COM-WA-DOC-004` | “Documento validado.” | “Ver progresso” | Atualizar checklist e próximo passo |
| Certidão localizada | `COM-WA-DOC-006` | “Encontramos um novo registro para seu caso.” | “Ver descoberta” | Revisar/emitir/vincular documento |
| Achado histórico | `COM-WA-PESQ-003` | “Uma nova peça da sua história foi encontrada.” | “Conhecer descoberta” | Liberar descoberta/atualização |
| Relatório de pesquisa | `COM-WA-PESQ-006` | “Sua nova entrega está disponível.” | “Abrir relatório” | Registrar micro-entrega |
| Mudança de fase | `COM-WA-PLAN-001` | “Você avançou para uma nova etapa.” | “Ver jornada” | Atualizar milestone e próxima ação |
| Pasta em revisão | `COM-WA-PLAN-004` | “Sua documentação entrou em revisão final.” | “Acompanhar jornada” | Revisão e preparação do protocolo |
| Protocolo realizado | `COM-WA-PLAN-005` | “Seu processo foi protocolado.” | “Ver comprovante” | Registrar comprovante/marco |
| Reconhecimento | `COM-WA-POS-001` | “Uma nova etapa da sua história começa agora.” | “Ver próximos passos” | Criar jornada pós-reconhecimento |
| Linha do tempo liberada | `COM-WA-LEG-001` | “Sua linha do tempo está disponível.” | “Explorar história” | Registrar entrega de legado |
| Renovação de assinatura | `COM-WA-LEG-003` | “Seu plano de continuidade está próximo da renovação.” | “Ver plano” | Criar tarefa de retenção |

---

# M. Governança de uso leve

## Não enviar quando

- O cliente já respondeu à mesma solicitação.
- O documento já foi recebido.
- O pagamento já foi confirmado.
- A proposta já foi aceita, recusada ou substituída.
- O caso foi pausado por solicitação da pessoa.
- Não há contexto real ou próxima ação útil.

## Sempre registrar no Caso 360

```text
Data e hora
Canal: WhatsApp
Código da mensagem
Cliente/caso
Objetivo do contato
Status: rascunho, enviado, respondido, concluído, pausado
Próxima ação
Data do próximo follow-up, se houver
```

## Métricas úteis, sem inventar dados

```text
Mensagens enviadas
Respostas recebidas
Tempo médio até resposta
Propostas enviadas → aceites
Documentos solicitados → recebidos
Onboardings iniciados → coleta concluída
Atualizações liberadas → acessos no portal
Renovações → continuidades
```

---

# N. Origem e contexto recuperados

Esta biblioteca amplia o artefato de comunicação anterior com mensagens operacionais completas para WhatsApp. Ela consolida o tom acolhedor e orientado à parceria usado nos materiais de Ana Luiza, Giovanna, João e demais fluxos de discovery/proposta, além da lógica de micro-entregas, app cliente, jornadas, cards e ofertas contextuais já registrada nos materiais do Clube Ancestral. [file:22][file:36][file:83][file:92]
