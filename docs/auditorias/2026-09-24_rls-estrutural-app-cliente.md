# RLS estrutural das fontes do App Cliente — 2026-09-24

**Prova estrutural ≠ prova de UI.** Esta auditoria lê o catálogo do banco
conectado (projeto Lovable "Ancestral Canvas", mesmo histórico de migrations
do repositório) e mostra que cada fonte lida pelo App recorta por caso
autorizado e por cliente. Ela **não** substitui o teste com dois logins de
cliente reais (roteiro `docs/relatorios/2026-09-24_roteiro-homologacao-pessoa-unificada.md#app`).
Nenhuma política foi alterada.

Consulta: `pg_class.relrowsecurity`, `pg_policies`, `pg_get_viewdef` (somente leitura).

| Fonte lida pelo App | Tipo | Recorte para o cliente |
|---|---|---|
| `portal_casos` | view (`security_barrier`) | `crm_casos` não arquivado e `portal_caso_permitido(id)`; do plano só expõe `fase_jornada` e `composicao` |
| `portal_projecoes` | view (`security_invoker`, `security_barrier`) | só `app_projections` publicadas para o App e vigentes; a RLS de `app_projections` (`app_proj_select_portal`) exige `portal_caso_permitido(case_id)` e titular/núcleo/compartilhamento do próprio cliente |
| `portal_meu_cadastro` | view (`security_invoker`) | só o cadastro do próprio cliente (`portal_meu_cliente()`), sem CPF |
| `documents` | tabela, RLS ligada | `documents_sel_portal`: caso permitido, `client_id` do próprio cliente e (`liberado_cliente = true` ou enviado pelo cliente) |
| `portal_document_requests` | tabela, RLS ligada | caso permitido e cliente próprio (ou sem cliente) |
| `invoices` | tabela, RLS ligada | `liberada_cliente = true`, caso permitido, cliente próprio (ou sem cliente) |
| `portal_tickets` / `portal_ticket_messages` | tabelas, RLS ligada | caso permitido e cliente próprio; mensagens só `visivel_cliente = true` |
| `client_portal_access` / `client_portal_case_access` | tabelas, RLS ligada | só o próprio acesso (`auth.uid()` / `portal_meu_acesso()` ativo) |
| `app_projection_shares` | tabela, RLS ligada | compartilhado com o próprio cliente ou titular da projeção |

Leitura das políticas de equipe (`is_org_member`, `can_write`) não se aplica
a login de cliente, que não é membro da organização.

## Conclusão

Estruturalmente, cliente A não alcança linha de caso de cliente B em
nenhuma fonte do App: todas passam por `portal_caso_permitido` e/ou pelo
próprio cliente. Resultado para o registro: **estrutural OK; prova de UI
pendente** (dois logins de cliente, no Lovable).
