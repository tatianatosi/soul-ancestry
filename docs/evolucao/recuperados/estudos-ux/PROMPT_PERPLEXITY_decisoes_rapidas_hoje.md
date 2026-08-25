Preciso de decisões rápidas hoje — lanço o Clube Ancestral amanhã. Contexto resumido abaixo (não deu
para subir o material completo aqui: dois PDFs de auditoria + histórico integral de um chat de
execução no Lovable). Me ajude a decidir os 3 pontos ao final, de forma direta — não preciso de nova
auditoria técnica, isso já está sendo executado no Lovable em paralelo.

O QUE É O PRODUTO
Clube Ancestral: pesquisa genealógica e cidadania por descendência. App Cliente (mobile, o cliente vê)
+ Desk Intelligence (cockpit interno da equipe, 14 abas). 92 telas no total, evoluiu em 10 versões sem
remover nenhuma tela aprovada — só adicionou camadas (fundação SaaS → CRM → pesquisa genealógica →
governança/contratos → conciliação de catálogo → paleta de marca nova).

ESTADO TÉCNICO HOJE
- Login da proprietária teve histórico de falha em produção; correção mais recente foi reset manual de
  senha — sendo reverificada agora antes do lançamento.
- Paleta de marca nova já está aplicada globalmente no código, mas a documentação de aceite ainda diz
  que deveria estar restrita a uma área específica, pendente de aceite tela a tela — decisão de manter
  a paleta nova como definitiva está sendo tomada hoje por padrão (timeout de 1h) se não houver
  resposta, porque reverter na véspera é mais arriscado que manter o que já está no ar.
- Há 10 decisões humanas comerciais/jurídicas ainda pendentes no projeto (SKU e preço não
  reconciliados, método de assinatura de contrato não homologado, fonte comercial oficial não
  definida) — nenhuma delas foi resolvida ainda.
- O produto tem uma boa disciplina de auditoria: nenhuma exclusão física de dado é permitida (só
  arquivamento com motivo/autor/data), e existem 8 gates formais que travam contrato/cobrança até
  precificação e fonte de dado estarem reconciliadas.

DECISÃO 1 — O que "lançar amanhã" deve significar
Dado que SKU/preço/assinatura ainda não estão fechados: o lançamento de amanhã deveria ser (a) acesso
liberado ao produto com fluxo comercial/cobrança real ainda desligado (equipe usa o Desk, cliente usa
o App, mas nenhuma cobrança nova é gerada até as decisões pendentes fecharem), ou (b) lançamento
completo incluindo cobrança real? Meu entendimento é que (a) é o caminho mais seguro para amanhã — você
concorda, ou vê um motivo de negócio para forçar (b) mesmo com essas pendências?

DECISÃO 2 — Prioridade da próxima semana
Depois do lançamento, dois fluxos vão competir pelo mesmo tempo de equipe: (i) destravar as 10
decisões comerciais/jurídicas pendentes, ou (ii) continuar melhorando UX/métricas do Desk Intelligence
(funil de conversão, SLA visível, etc.). Qual entra primeiro na fila — ou dá pra tocar os dois em
paralelo com baixo risco?

DECISÃO 3 — Estrutura da aba Alertas
O Desk tem uma aba "Alertas" que parece, em parte, replicar dado que já existe em outras abas (Casos
360, Checklist Semanal) em vez de ser um cálculo próprio de urgência. Faz sentido, do ponto de vista de
quem vai usar isso todo dia, manter Alertas como aba separada, ou ela deveria virar uma visão filtrada
dentro do Checklist Semanal? Isso não precisa ser decidido hoje — pode ficar para depois do
lançamento, mas quero sua opinião de produto sobre qual dos dois modelos tende a gerar menos
confusão de equipe com o tempo.

Responda direto nos 3 pontos — não preciso de mais contexto ou levantamento, só a sua leitura.
