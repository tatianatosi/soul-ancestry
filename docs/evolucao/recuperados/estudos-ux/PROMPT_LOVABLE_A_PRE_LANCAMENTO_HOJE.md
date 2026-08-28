Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Prazo: lançamento amanhã. Este prompt cobre SOMENTE o que pode travar o lançamento. Execute os 4
itens nesta ordem, um de cada vez, sem pular para o próximo até o anterior estar PASSOU com evidência.

Modo de execução obrigatório: EXECUTE. Não responda com plano, resumo ou promessa. Implemente/valide
de verdade, rode teste real no domínio publicado, e reporte evidência objetiva (URL, horário, resultado
literal). Se algo não puder ser comprovado, marque como FALHOU com causa e correção necessária. Não
declare "pronto" sem o teste real ter passado — este projeto já teve mais de uma declaração de sucesso
prematura para o mesmo tipo de item, então toda alegação de "resolvido" precisa de evidência
reproduzível.

Escopo e proibições (valem para todo este prompt)
- Ambiente canônico: https://soul-ancestry.lovable.app. Conta proprietária: tati@pluggedresearch.com.
- Não usar conta demo/seed/preview/localhost para afirmar aceite de nada.
- Não criar telas, menus ou módulos novos. Não mudar paleta além do decidido no item 2.
- Não enviar e-mail, WhatsApp, contrato, cobrança real ou qualquer ação em nome de cliente.
- Não alterar dado real de cliente, contrato, catálogo, preço, DNS, domínio ou integração externa.
- Preservar RLS, auditoria append-only, soft delete e histórico.

────────────────────────────────────────

ITEM 1 (bloqueia tudo) — Confirmar login estável da proprietária em produção

Autenticar tati@pluggedresearch.com em sessão genuinamente limpa (sem cache, idealmente outro
dispositivo/rede) no domínio publicado. Validar nesta ordem, reportando o status de cada etapa:
login → /painel → reload → /modo-proprietaria → nova aba → /equipe.
Se qualquer etapa falhar: reportar erro exato (código, mensagem, timestamp) e corrigir antes de seguir
para o item 2. Não avançar com login instável véspera de lançamento.

────────────────────────────────────────

ITEM 2 (decisão + execução, sem esperar reunião) — Fechar a paleta de marca hoje

Contexto: o :root de src/styles.css já está com os valores novos (--navy: #2F4B6E, --gold: #FCB73A,
--terracotta: #9A3A2F) aplicados globalmente, embora o relatório de aceite ainda diga "só ativo em
Pesquisa, resto congelado, depende de aceite tela a tela".

Decisão padrão para hoje (aplicar se a proprietária não responder em até 1h, para não travar o
lançamento): MANTER a paleta nova como definitiva e global — é o que já está no ar, reverter na
véspera é risco maior do que manter. Se a proprietária responder antes com decisão diferente, seguir
a decisão dela.

Executar:
- Se ficou mantida: gerar/atualizar o registro de aceite (data, responsável, "paleta nova aprovada
  como padrão global em [data]") — não deixar a documentação seguir dizendo o oposto do que está no ar.
- Confirmar visualmente 3 telas do App Cliente e 3 do Desk no domínio publicado para garantir que não
  há mistura de paleta antiga/nova na mesma tela (o que seria pior que qualquer uma das duas opções).
- Reportar: decisão aplicada, quem decidiu (proprietária ou padrão por timeout), e as 6 URLs
  verificadas.

────────────────────────────────────────

ITEM 3 (bloqueia se falhar) — Garantir que UI interna não aparece para cliente real

Fazer um teste real: autenticar como cliente via link mágico de um caso real ou de teste explicitamente
marcado como tal, navegar por todas as rotas /portal/* e /canvas/$token, e confirmar ausência total de:
alternância "App Cliente/Desk Intelligence", faixa "MÓDULOS INTERNOS (NOVOS)/ACESSO DA EQUIPE", botão
"Devolutivas (interno)", qualquer seletor "VISUALIZAR (INTERNO)" ou "Caso modelo".
Se algo aparecer: corrigir o gate de visibilidade por papel/sessão antes de liberar o lançamento, e
reexecutar o teste. Isso é o item de maior risco de imagem se vazar para um cliente real amanhã —
trate como bloqueador rígido.

────────────────────────────────────────

ITEM 4 (bloqueia se houver dado real classificado errado) — Checagem rápida de dado demo vs. real

Não é a auditoria completa de src/data (essa fica para depois do lançamento). Para amanhã, fazer só a
checagem mínima de segurança: confirmar que nenhum dos casos de demonstração usados nas telas (ex.:
Giovanna da Veiga Prade, Ana Luiza Gomes Silveira, Sophia Piccoli Santiago, Danilo Klayber) é visível
como opção real para um cliente autenticado de verdade, e que nenhum cliente/caso real está marcado
como demo. Reportar a lista de casos que existem hoje no ambiente de produção com a classificação
mock/seed/real de cada um, mesmo que resumida.

────────────────────────────────────────

Fechamento: ao final dos 4 itens, enviar um resumo de uma linha cada:
[PASSOU/FALHOU] Item 1 (login) — evidência
[PASSOU/FALHOU] Item 2 (paleta) — decisão aplicada
[PASSOU/FALHOU] Item 3 (vazamento de UI interna) — evidência
[PASSOU/FALHOU] Item 4 (dado demo vs. real) — evidência
Só considerar o produto pronto para lançar se os 4 estiverem PASSOU.
