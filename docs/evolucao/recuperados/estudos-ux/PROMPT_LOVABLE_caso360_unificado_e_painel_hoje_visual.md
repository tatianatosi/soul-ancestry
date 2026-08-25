Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Objetivo: resolver o cansaço diário real do Desk sem reabrir a arquitetura de navegação que já está
estável. Decisão tomada pela proprietária: manter os 8 grupos de menu atuais (Hoje, Marketing,
Comercial, Casos, Pesquisa, Contratos e financeiro, Cliente, Governança) — não mexer neles. O trabalho
aqui é dentro de duas telas específicas.

Quando rodar: pós-lançamento. Não bloqueia nada já em produção. Trate como iniciativa de UX própria,
com tempo para fazer bem feito — não é correção de bug.

Modo de execução obrigatório: EXECUTE, com evidência objetiva (print da tela antes/depois).

Escopo e proibições
- Não alterar GRUPOS_DESK nem a lista de 8 grupos em navegacao-desk.ts.
- Não remover nenhuma rota de ROTAS_PRESERVADAS — a trava de regressão continua valendo.
- Não duplicar cálculo: tudo que aparecer nas telas novas tem que ler das mesmas fontes já existentes
  (GATILHOS, calcularPrioridade, matriz jurídica, financeiro por caso, onboarding-jornada) — nunca
  criar um segundo cálculo paralelo do mesmo dado.

────────────────────────────────────────

1. Consolidar Casos 360 → página única por caso, com seções

Hoje, informação de um caso está espalhada em rotas/abas que competem entre si (radar, jurídico,
financeiro, checklist). Objetivo: uma página por caso, com seções que rolam em sequência, sem o
usuário precisar sair da tela para montar o quadro geral.

Executar: construir a página de detalhe do caso com esta ordem de seções (reusando componentes e
fontes de dado já existentes, não recriando):
1. Resumo operacional — identidade do caso, status, responsável, próxima ação.
2. Radar de prioridade — o mesmo cálculo de calcularPrioridade/prioridade-matriz.ts já usado no
   Painel Hoje e em Casos 360.
3. Financeiro e gates — status financeiro do caso e quais gates estão bloqueando avanço.
4. Validação jurídica — dado real de /matriz-juridica filtrado para este caso.
5. Checklist interno — itens confirmados/pendentes/em revisão deste caso.
6. Próxima microentrega — puxando de onboarding-jornada / client_deliverables.
7. Pesquisa e árvore (resumo) — link/resumo do dossiê em PainelPesquisaModulo, não duplicar as 12
   abas ali dentro desta página.
8. Entregas e comunicação cliente-facing — o que já foi publicado para o cliente neste caso.
9. Timeline e auditoria — histórico de mudanças do caso.

As rotas antigas que hoje mostram cada uma dessas informações separadamente podem continuar existindo
(não remover — só deixar de ser o caminho principal de navegação); a página única passa a ser o
destino padrão ao abrir um caso a partir de Casos 360.

────────────────────────────────────────

2. Redesenhar Painel Hoje no estilo visual do mockup "Fase 01" enviado pela proprietária

Referência visual: hero limpo com contexto e call-to-action, KPIs em destaque (4 métricas grandes,
fonte serifada para os números), um caso em destaque com progresso visual, e módulos organizados em
grade — não listas densas de texto.

Executar: aplicar essa linguagem visual ao Painel Hoje real (painel-dia.tsx), mantendo os dados reais
já existentes (as 5 categorias de GATILHOS, fila priorizada, sinais de atenção) — é redesign de
apresentação, não de dado. Adicionar:
- Um bloco "caso em destaque" (o caso de maior prioridade do dia, usando o mesmo cálculo de
  prioridade), com resumo visual similar ao "Caso em destaque" do mockup.
- KPIs do dia em destaque tipográfico maior (casos ativos, alertas pendentes, receita do mês, taxa de
  conversão — já existem em /metricas e /conversao, reusar a fonte).
- Se o papel do usuário for pesquisador (ver prompt anterior sobre personalização por papel, ainda
  pendente): o caso em destaque prioriza casos com pesquisa pendente.

────────────────────────────────────────

Ao final: reportar com prints antes/depois das duas telas, e confirmar que nenhum cálculo foi
duplicado — toda métrica nova nessas telas aponta para a mesma função/fonte já usada em outro lugar do
produto.
