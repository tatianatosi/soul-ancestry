# CA-UX-03 — Métricas canônicas por grupo

**Versão:** 1.0
**Data:** 23 de agosto de 2026
**Regra geral:** no máximo 5 métricas principais no topo de cada grupo. As demais ficam em
"Ver detalhes". Toda métrica é derivada de fonte canônica; nenhuma métrica cria registro,
tarefa, fila paralela ou ação externa.

**Regra de não duplicação (vale para todos os grupos):** um mesmo objeto (caso, lead,
tarefa, microentrega) só é contado como pendência em UMA fila operacional. A fila diária é
o Painel Hoje; alertas e prioridade são leituras derivadas do mesmo objeto e, ao serem
clicados, abrem o registro canônico em vez de criar item novo.

## 1. Hoje

| Métrica | Fonte | Fórmula/regra | Responsável | Ação ao clicar |
|---|---|---|---|---|
| Itens na fila de hoje | tarefas, ops_microentregas | pendências com prazo ≤ hoje, deduplicadas | responsável do caso | abre o objeto canônico |
| Vencidos | tarefas, ops_microentregas | prazo < hoje e não concluído | responsável do caso | abre o objeto |
| Exceções sem dono | ops_excecoes | exceção aberta sem responsável | operações | abre a exceção |
| Sinais de atenção | derivado (alertas-derivados.ts) | SLA + cadência D10/D14 + gates | responsável do caso | abre o objeto de origem |
| Prioridade dos casos | derivado (prioridade-matriz.ts) | elegibilidade × urgência | responsável do caso | abre o caso |

Secundárias em "Ver detalhes": métricas comerciais completas (`/metricas`) e relatórios.

## 2. Comercial

| Métrica | Fonte | Fórmula/regra | Responsável | Ação ao clicar |
|---|---|---|---|---|
| Leads novos no período | leads | contagem por data de criação | comercial | abre a lista filtrada |
| Discovery agendadas × realizadas | crm_interactions, discovery_assessments | realizadas / agendadas | comercial | abre Calls |
| Propostas em aberto | proposals | proposta enviada sem decisão registrada | comercial | abre a proposta |
| Follow-ups vencidos | derivado de tarefas + leads | próxima ação com data < hoje | dono do lead | abre o lead |
| Leads sem próxima ação | leads | lead ativo sem próxima ação definida | dono do lead | abre o lead |

Secundárias: origem/campanha, entrada semanal e mensal, funil completo, CAC — em `/metricas`.

## 3. Casos

| Métrica | Fonte | Fórmula/regra | Responsável | Ação ao clicar |
|---|---|---|---|---|
| Casos ativos | crm_casos | status ativo e não arquivado | operações | abre Casos 360 |
| Tarefas atrasadas | tarefas | prazo < hoje, não concluída | responsável da tarefa | abre a tarefa |
| Microentregas atrasadas | ops_microentregas | prazo < hoje, não publicada | responsável do caso | abre a microentrega |
| Exceções abertas | ops_excecoes | exceção sem encerramento | operações | abre a exceção |
| Casos sem responsável | crm_casos | responsável nulo | proprietária | abre o caso |

Secundárias: gates de fechamento, checklists por fase, qualidade por severidade — em `/qualidade`.

## 4. Pesquisa

| Métrica | Fonte | Fórmula/regra | Responsável | Ação ao clicar |
|---|---|---|---|---|
| Casos em pesquisa | research_cases | caso com pesquisa ativa | pesquisador | abre o caso de pesquisa |
| Evidências pendentes de validação | evidencias, evidence_validations | evidência sem validação concluída | pesquisador | abre a evidência |
| Consultas a fontes em aberto | genealogical_sources_catalog, research_requests | solicitação sem retorno | pesquisador | abre a consulta |
| Achados aguardando confirmação | research_findings | estado de validação ≠ confirmado | pesquisador | abre o achado |
| Pendências de privacidade | consent_records, consent_exceptions | consentimento ausente ou vencido | operações | abre o registro de consentimento |

Secundárias: relatórios F1/F2, histórico de pesquisa, sugestões do Assistente IA (nunca confirmam achado).
Lacuna declarada: radar multi-país — sem fonte canônica, não é exibido nem estimado.

## 5. Contratos e financeiro

| Métrica | Fonte | Fórmula/regra | Responsável | Ação ao clicar |
|---|---|---|---|---|
| Contratos aguardando assinatura | contracts, contract_versions | versão enviada sem assinatura registrada | proprietária | abre o contrato |
| OS bloqueadas por divergência | catalog_source_divergences | divergência aberta que bloqueia emissão | financeiro | abre a divergência |
| SKUs pendentes de homologação | sku_catalog | preço/SKU sem homologação | financeiro | abre a homologação |
| Faturas em aberto | invoices | fatura sem pagamento confirmado | financeiro | abre a fatura |
| Escopo sem origem homologada | contract_scope_items | item sem proposta/condição de origem | comercial | abre a origem do escopo |

Secundárias: parâmetros contratuais, conciliação histórica, anexos por versão.
Cobrança externa permanece bloqueada e exige confirmação final da Proprietária.

## 6. Cliente

| Métrica | Fonte | Fórmula/regra | Responsável | Ação ao clicar |
|---|---|---|---|---|
| Acessos ativos ao portal | client_portal_access | acesso válido e não revogado | operações | abre o acesso |
| Solicitações de documento em aberto | portal_document_requests | solicitação sem atendimento | operações | abre a solicitação |
| Entregas aguardando publicação autorizada | client_deliverables | pronta e não publicada | proprietária | abre a entrega |
| Tickets de atendimento abertos | portal_tickets | ticket sem encerramento | operações | abre o ticket |
| Aberturas/downloads registrados | eventos canônicos do portal | contagem de eventos existentes | operações | abre o histórico |

A última métrica só aparece quando existir evento canônico registrado — nunca estimada.
O espelho do App Cliente reutiliza a projeção sanitizada; nenhuma cópia é criada.

## 7. Governança

| Métrica | Fonte | Fórmula/regra | Responsável | Ação ao clicar |
|---|---|---|---|---|
| Itens jurídicos com pendência técnica | legal_clause_matrix | cláusula/anexo sem materialização | proprietária | abre a Validação Jurídica |
| Inconsistências críticas | quality_issues | severidade crítica em aberto | operações | abre o Radar Interno |
| Decisões registradas no período | decisions, change_log | contagem por data | proprietária | abre o log de decisões |
| Itens de completude pendentes | derivações de varredura | item não coberto por evidência | proprietária | abre a completude |
| Integrações não confirmadas | integrations | integração sem credencial ou verificação | proprietária | abre Integrações |

Secundárias: inventário patrimonial, corte vertical, matriz de conformidade, matriz de equivalência.

## 8. Administração

| Métrica | Fonte | Fórmula/regra | Responsável | Ação ao clicar |
|---|---|---|---|---|
| Overrides da Proprietária no período | owner_override_events | contagem por data | proprietária | abre o evento |
| Usuários internos ativos | staff_access | status ativo | admin | abre o usuário |
| Papéis sem atribuição | user_roles | usuário ativo sem papel | admin | abre o usuário |
| Ações externas aguardando confirmação | fila de ações externas | ação restrita sem confirmação final | proprietária | abre a confirmação |
| Pendências de verificação administrativa | audit_logs, varredura | item de varredura não conferido | proprietária | abre a varredura |
