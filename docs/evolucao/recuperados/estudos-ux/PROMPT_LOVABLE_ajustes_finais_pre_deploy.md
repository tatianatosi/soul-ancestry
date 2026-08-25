Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Objetivo: fechar os bloqueadores P0 identificados no Estudo UX/UI e Auditoria de Prontidão para
Deploy (23/08/2026) antes de qualquer publicação final. Este prompt cobre acesso, paleta de marca,
vazamento de UI interna e classificação de dados. Não cobre SKU/preço/jurídico (DH-001, DH-002,
DH-003, DH-005) — essas são decisões humanas e devem ser resolvidas fora deste ciclo, por quem tem
autoridade comercial e jurídica, antes de habilitar cobrança real.

Modo de execução obrigatório: EXECUTE. Não responda com plano, resumo, auditoria genérica, mockup
ou promessa. Para cada item, implemente ou valide de fato, rode testes/build, publique somente após
os testes, e reporte evidência objetiva (URL testada, hora, resultado literal, screenshot ou log).
Se uma condição não puder ser comprovada, marque-a como FALHOU com causa e correção necessária.
Não declare "concluído" para nenhum item sem o teste real correspondente ter passado em sessão limpa,
no domínio publicado — este projeto já teve mais de uma declaração de sucesso prematura para o mesmo
tipo de item (login da proprietária), então toda alegação de "resolvido" precisa vir com evidência
reproduzível, não com a palavra do próprio agente.

Escopo e proibições
- Ambiente canônico de produção: https://soul-ancestry.lovable.app.
- Conta proprietária: tati@pluggedresearch.com.
- Não usar conta demo, seed, fixture, preview, localhost, editor ou banco diferente para afirmar aceite.
- Não criar novos módulos, fluxos, menus, telas ou "auditorias" como substituto de corrigir defeitos reais.
- Não enviar e-mail, WhatsApp, contrato, pedido institucional, cobrança, link de pagamento, assinatura,
  pesquisa externa, publicação no App Cliente ou ação em nome de cliente durante este trabalho.
- Não alterar/remover dados reais, casos, contratos, catálogo, preços, permissões de terceiros, DNS,
  domínio, plano pago ou integração externa sem instrução e confirmação separadas da proprietária.
- Não decidir, sozinho, se a paleta nova é definitiva — apenas relatar o estado real encontrado e
  aplicar exatamente a decisão que a proprietária tomar no item 2.
- Preservar RLS por organização, auditoria append-only, soft delete, histórico, versionamento,
  entidades canônicas e controles de confirmação final.

────────────────────────────────────────

1. P0 — Reverificação independente do acesso da proprietária

Resultado exigido: a proprietária entra uma vez no domínio publicado e permanece administradora ao
navegar, recarregar a página e abrir uma nova aba — comprovado em uma sessão que nunca foi usada
antes neste ciclo (sem cookies, sem cache, idealmente outro dispositivo ou rede).

Executar:
- Autenticar tati@pluggedresearch.com em sessão genuinamente limpa no domínio publicado.
- Validar, nesta ordem, e reportar o código de status de cada um: login → /painel → reload →
  /modo-proprietaria → nova aba → /equipe.
- Se qualquer etapa falhar, reportar o erro exato (código, mensagem, timestamp) e a causa raiz —
  não tentar mascarar como sucesso parcial.
- Não tocar em membership, role, dados, contratos, catálogo ou integrações neste item.

Retorne: horário do teste, dispositivo/ambiente usado, resultado literal de cada etapa, e se passou
ou falhou. Só marque este item como fechado se todas as etapas passaram nesta nova verificação.

────────────────────────────────────────

2. P0 — Reconciliar a paleta de marca (relatório vs. código)

Contexto: o relatório "antes/depois" (26 telas) afirma que o token de marca [data-marca="guia"]
está ativo apenas na área de Pesquisa, com todo o resto do produto "congelado" na paleta antiga,
pendente de aceite tela a tela da Proprietária. O código publicado hoje em src/styles.css tem os
valores da paleta NOVA (--navy: #2F4B6E, --gold: #FCB73A, --terracotta: #9A3A2F) escritos direto
no :root, ou seja, aplicados globalmente — sem escopo de [data-marca="guia"] e sem relação visível
com a área de Pesquisa especificamente.

Executar:
- Confirmar, lendo o histórico de commits de src/styles.css, quando e em que contexto os valores
  novos foram promovidos para o :root global. Reportar o commit, data e a mensagem/prompt que
  originou essa mudança.
- Reportar objetivamente ao lado da proprietária as duas hipóteses possíveis (promoção intencional
  já global vs. vazamento acidental do trabalho de Pesquisa para o :root) sem escolher por conta
  própria qual delas é a verdadeira.
- Aplicar exatamente a decisão que a proprietária tomar entre: (a) manter a paleta nova como padrão
  global definitivo — e então atualizar o relatório antes/depois para registrar aceite explícito,
  com data, das 26 telas; ou (b) restringir os tokens novos ao escopo real de [data-marca="guia"]
  na área de Pesquisa, revertendo o :root para os valores antigos (#1B2B4B / #C9A84C / #8B4513) em
  todo o restante do produto.
- Não prosseguir com nenhuma das duas ações sem essa confirmação explícita da proprietária.

Retorne: commit/data da mudança original, as duas hipóteses documentadas lado a lado, e — somente
após resposta da proprietária — a ação aplicada e o link para conferência visual do resultado.

────────────────────────────────────────

3. P0 — Confirmar que a UI interna não vaza para o cliente real

Contexto: capturas do App Cliente mostram, na mesma tela, elementos claramente administrativos:
alternância "App Cliente / Desk Intelligence", faixa "MÓDULOS INTERNOS (NOVOS) · ACESSO DA EQUIPE ·
ACESSO DO CLIENTE", botão "Devolutivas (interno)" e, na tela de Entregas, um seletor
"VISUALIZAR (INTERNO): Caso modelo (Sophi Piccoli)". O princípio documentado do produto é que o
App Cliente é "projeção autorizada do Desk: nunca é fonte de verdade e não exibe juízo de mérito
sobre o caso".

Executar:
- Verificar, por código (condição de renderização, não inspeção visual), se esses elementos são
  gated por papel/sessão (equipe interna) e comprovadamente ausentes quando o acesso é feito pelo
  fluxo real do cliente (/acesso por link mágico → /portal).
- Fazer um teste real: autenticar como cliente via link mágico de um caso real ou de teste
  explicitamente marcado como tal, navegar pelas rotas /portal/*, e confirmar ausência total de
  rótulos "(interno)", alternância de superfícies e qualquer seletor de "caso modelo".
- Se algum desses elementos aparecer no fluxo de cliente, corrigir o gate de visibilidade antes de
  qualquer outro ajuste, e reexecutar o teste.

Retorne: rota testada, papel usado, screenshot ou trecho de DOM confirmando ausência dos elementos
internos, e — se algo vazava — o que foi corrigido e o resultado do reteste.

────────────────────────────────────────

4. P0 — Classificar dados de demonstração vs. dados reais (src/data)

Contexto: nomes recorrentes nas capturas (Giovanna da Veiga Prade, Ana Luiza Gomes Silveira,
João Marcelo Faria Moraes, Danilo Klayber de Souza, Lara, Sophi Piccoli) aparecem tanto no Desk
quanto no App Cliente. Não há hoje classificação explícita de qual desses é caso-modelo/seed e
qual é dado vivo real.

Executar:
- Inventariar cada fonte de dado em src/data/ e cada caso citado nas telas acima, classificando-o
  como: mock, seed, caso-modelo (uso interno de referência) ou dado vivo real.
- Para qualquer registro classificado como mock/seed/caso-modelo, confirmar que ele nunca é
  acessível a um cliente autenticado real (nem por acaso, nem por fallback de dado ausente).
- Não apagar, renomear ou migrar nenhum dado — apenas classificar e reportar. Qualquer ação de
  remoção ou arquivamento depende de decisão separada da proprietária, e segue a regra do produto
  de nunca excluir fisicamente registros.

Retorne: uma lista objetiva {registro/caso → classificação → visível para cliente real? sim/não},
e, se algum dado de demonstração estiver hoje visível para clientes reais, a correção aplicada e
o reteste.

────────────────────────────────────────

Aceite único deste ciclo: os quatro itens acima retornam evidência objetiva de PASSOU ou FALHOU,
sem exceção. Nenhum item pode ser declarado concluído apenas com a afirmação do agente — precisa
do teste real correspondente, no domínio publicado, em sessão limpa. Ao final, produza um resumo
de uma linha por item (1. Acesso, 2. Paleta, 3. Vazamento de UI interna, 4. Classificação de dados)
no formato: [PASSOU/FALHOU] — evidência — próxima ação se falhou.
