Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Quando rodar: DEPOIS do lançamento (não roda hoje — não compete com o prompt de pré-lançamento).
Nada aqui bloqueia o go-live de amanhã.

Modo de execução obrigatório: EXECUTE. Implemente com dado real, rode build, reporte evidência
objetiva por item. Se um item depender de dado que não existe no schema hoje, reporte BLOQUEADO com o
campo que falta — não simule número.

Escopo e proibições
- Não alterar as 14 abas principais nem criar abas novas.
- Não alterar dado real de cliente/contrato/catálogo/financeiro — só forma de exibição/organização.
- Não remover dado hoje visível; só reorganizar, agregar ou destacar.

────────────────────────────────────────

PARTE 1 — Auditoria de módulos contextuais vs. métricas (Desk Intelligence)

Contexto: o Desk segue a arquitetura CA-UX-01.2 (src/lib/desk-modulos.ts) — 14 abas fixas, tudo mais
vira "módulo contextual" (subrota/painel/aba_interna/lateral) dentro de 8 telas principais, hoje 38
módulos catalogados. Objetivo: separar o que é operação real do que é só métrica duplicada.

1. Classificar cada um dos 38 módulos com um campo `tipo`:
   - operacional: tem ação própria, merece painel/subrota dedicado.
   - metrica: é número/status derivado de outro módulo — deveria virar badge no cabeçalho da aba, sem
     painel próprio.
   - duplicado: mesmo sinal aparece como módulo separado em mais de uma tela.
2. Verificar especificamente: chk-d10-d14 (Checklist) vs. ale-d10-d14 (Alertas) — mesma fonte de dado
   ou critérios diferentes? Reportar a fonte real de cada um.
3. Verificar se Alertas (ale-achados, ale-microentregas, ale-documentos, ale-acoes-vencidas,
   ale-rascunhos, ale-fila-revisao) é view derivada dos módulos equivalentes em Casos 360/Checklist, ou
   mantém dado próprio que pode divergir da origem.
4. Para os classificados como "metrica": mover a exibição para badge no cabeçalho da aba de origem,
   sem painel separado, com cálculo real (não hardcoded).
5. Para os "duplicado" confirmados: escolher uma tela como fonte única operacional; nas demais, trocar
   o painel duplicado por um contador/link para a fonte. Se não for possível decidir sozinho qual tela
   deve ser a fonte, reportar as opções e aguardar decisão da proprietária — não decidir por conta
   própria quando afetar o fluxo de trabalho da equipe.

Entregar: matriz MODULOS_DESK com a coluna `tipo` preenchida, lista de mudanças implementadas com
commit, e lista do que ficou pendente de decisão humana.

────────────────────────────────────────

PARTE 2 — Melhorias de UX voltadas a métrica, por aba

Ordem sugerida por impacto (pode ajustar se a Parte 1 destravar algo primeiro):

1. Radar Interno na Visão Geral: card-resumo com contagem real do quadrante "Agir Agora" da matriz de
   priorização, linkando para a tela completa. Não duplicar o gráfico inteiro.
2. SLA como estado vivo no CRM Vivo: calcular status real de cada SLA (Resposta WhatsApp 4h, Retorno
   pós-call 24h, Follow-up discovery 72h, Tarefa planner 96h, Microentrega 120h) contra o tempo
   decorrido, com cor: no prazo / em risco / estourado.
3. Badge numérico no menu lateral: contagem real ao lado de Alertas, Financeiro (saldo em aberto),
   Validação Jurídica (pendências), Checklist Semanal (pendente crítico).
4. Funil de leads como funil visual na Visão Geral, com % de queda destacado entre etapas.
5. Idade da proposta sem resposta, nos cards de Propostas (dias desde o envio).
6. Responsável nos cards do kanban do Checklist Semanal.
7. Idade do saldo em aberto por caso, no Financeiro (dias desde vencimento/registro).
8. Tempo no status atual, em Casos 360 (dias desde a última mudança de status).
9. Barra de progresso (em vez de fração textual) no Checklist AppCliente.
10. Dono e prazo nos itens pendentes de Integrações, se o dado existir; senão, reportar BLOQUEADO.

────────────────────────────────────────

Ao final: reportar por item — implementado / bloqueado (motivo) / aguardando decisão humana — com a
rota de cada tela alterada para conferência visual.
