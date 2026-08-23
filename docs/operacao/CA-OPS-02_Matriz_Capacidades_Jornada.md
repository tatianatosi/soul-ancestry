# CA-OPS-02 — Matriz de capacidades da jornada

Fonte canônica em código: `src/lib/matriz-capacidades-jornada.ts` (módulo puro, somente leitura).
Cadeia de referência: `src/lib/orquestracao-jornada.ts` (11 elos, CA-OPS-01).

| Capacidade | Mockups/estudos definem | Desk atual | Papel operacional correto | Rota canônica | Elos cobertos |
| --- | --- | --- | --- | --- | --- |
| Biblioteca de Mensagens | Templates governados e comunicação por jornada | Biblioteca isolada em /biblioteca-mensagens | Repositório acionável por etapa e evento, com versão vigente automática | /biblioteca-mensagens | template_sugerido, rascunho_ou_microentrega |
| WhatsApp | Atualização essencial ao cliente; onboarding previsto | Integração externa desligada | Prévia e fila interna; envio só após configuração/gate | /integracoes | publicacao_ou_fila |
| CRM e Calls | Lead, interação, responsável, próxima ação datada | Leads, Calls e Conversão existem | Disparar tarefa e sugerir template pela fase/evento | /leads | evento_ou_fase, regra_de_jornada, tarefa_responsavel_prazo |
| Onboarding | Contrato + pagamento + checklist mínimo | Gates e checklist existem | Cadência de acolhimento e primeira entrega | /onboarding/$id | regra_de_jornada, tarefa_responsavel_prazo |
| Microentregas | 21 tipos, rascunho → publicado → arquivado | Entregas/atendimento e publicação existem | Conectar a fase, responsável, prazo e atualização ao cliente | /atendimento | rascunho_ou_microentrega, revisao_humana, publicacao_ou_fila, touchpoint_ou_entrega |
| Alertas | Achados/notificações | Derivados e consolidados no Painel Hoje | Sinalizar exceção e abrir objeto + ação canônica | /painel | alerta_derivado |
| Cadência | Touchpoint em até 14 dias | Tarefas e Painel Hoje existem | Regra única com próximo marco verificável | /painel | touchpoint_ou_entrega, cadencia_recalculada |
| Indicadores | Saúde do caso e funil | Fase B consolidou métricas | Medir resultado dos fluxos, sem cards concorrentes | /metricas | painel_hoje |
| App Cliente | Jornada, documentos, entregas, histórico | Portal real mais simples | Receber somente microentrega publicada e atualizações autorizadas | /portal | publicacao_ou_fila |

## Invariantes

- Nenhuma capacidade executa ação externa por conta própria (`acaoExternaAutomatica: false`).
- Todo elo da cadeia CA-OPS-01 tem ao menos uma capacidade responsável (`elosSemCobertura()` retorna vazio, coberto por teste).
- Alertas e indicadores permanecem visões derivadas: não criam entidade nem painel novo.
- App Cliente é projeção sanitizada; Desk Intelligence continua a única fonte.
