# Solução de banco único — Lovable Cloud × Supabase próprio

Status: aprovado (opção A aprovada pela proprietária em 2026-10-20)
Versão: v1.0
Data: 2026-10-20
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: repositório tatianatosi/soul-ancestry main@af05314 (`supabase/config.toml`, `.env`, `.mcp.json`, `docs/IMPLEMENTACAO_27-AUG-2026.md`, `docs/evolucao/recuperados/fontes-primarias/LOVABLE-CHAT_2026-08-25.md`); consultas só de leitura ao Supabase zsxpdbhdvbuulwpepemd em 20/10/2026; documentação do Lovable ([Lovable Cloud](https://docs.lovable.dev/features/cloud), [Advanced settings](https://docs.lovable.dev/features/advanced-settings), [Connect to Supabase](https://docs.lovable.dev/integrations/supabase))
Substitui: complementa 2026-10-20-comparacao-tabelas-pr170-banco.md

## 0. Registro de decisão e execução
- 2026-10-20: a proprietária aprovou a Opção A e autorizou o congelamento de `zsxpd…`.
- A0, parte banco (executado em 2026-10-20): `alter database postgres set default_transaction_read_only = on`. Comentário de congelamento gravado no banco. Teste de escrita rejeitado com o erro 25006 (read-only transaction). Linha de base: `audit_logs` com 1.752 linhas, última em 2026-10-11 02:38 UTC. Sem jobs de cron e sem edge functions nesse projeto.
- Reverter, se necessário: `alter database postgres reset default_transaction_read_only;`
- A0, parte repositório: `.mcp.json` renomeado para `.mcp.json.congelado-2026-10-20`, para o Claude Code deixar de usar `zsxpd…`.

## 1. Diagnóstico: por que os dados nunca sincronizam

Existem dois bancos, e cada ferramenta grava em um deles:

| Banco | Quem usa | Situação |
|---|---|---|
| `liiqqibnirnpnvjmjrpj` (Lovable Cloud) | Lovable, `.env`, `supabase/config.toml` e o app publicado `soul-ancestry.lovable.app`. O chat do Lovable de 25/08 confirma que o login público resolve nesse banco. | Recebe todas as migrações do Lovable. Você não tem painel nem acesso direto. |
| `zsxpdbhdvbuulwpepemd` (Supabase próprio) | Claude Code (`.mcp.json`), o conector e as auditorias de agosto a outubro | 111 migrações, a última de 11/09 (o repositório tem 234). 127 tabelas com dados (4.122 linhas), 5 usuários, 7 arquivos. Última gravação em `audit_logs`: 11/10. Tem 27 tabelas (`research_*`, `*_records`) sem migração no repositório. |

Em 25/08, o documento IMPLEMENTACAO tratou `zsxpd…` como o banco "real" e `liiqq…` como "demo". O Lovable, porém, continuou ligado ao próprio Cloud. Desde então:
- as telas feitas no Lovable leem e gravam em `liiqq…`;
- as correções e auditorias do Claude e do conector leem e gravam em `zsxpd…`.

Por isso cada correção "some" para a outra ferramenta. Enquanto houver dois bancos ativos, nenhum lote do App Cliente ou do Desk fecha.

## 2. Regra que resolve

**Um banco só, declarado em um único lugar.** Todas as ferramentas (Lovable, Vercel, Claude Code, conector) apontam para o mesmo `project_ref`. O outro banco fica congelado, só para leitura, como arquivo histórico.

## 3. Opções

### Opção A — Consolidar no Lovable Cloud (`liiqq…`) — RECOMENDADA AGORA
- O Lovable e o app publicado já usam esse banco, então nada quebra no ar.
- O que só existe em `zsxpd…` é trazido para o Lovable Cloud por migrações versionadas no repositório (estrutura) e por cargas de dados revisadas (conteúdo). O Lovable aplica as duas.
- `zsxpd…` é congelado: sem novas gravações e `.mcp.json` desativado. Depois da conferência, o projeto é pausado.
- Limite: nem você nem o Claude terão SQL direto. As consultas passam por prompts de leitura no Lovable, e as mudanças, por migrações no GitHub.
- Reversível: nada é apagado.

### Opção B — Mover tudo para um Supabase próprio — FASE 2, OPCIONAL
- O Lovable oferece exportação oficial do Cloud, com estrutura, dados e usuários com senha ([Advanced settings](https://docs.lovable.dev/features/advanced-settings)).
- A restauração seria feita num projeto Supabase seu, novo e limpo. Não em `zsxpd…`, cuja estrutura diverge.
- Para religar o Lovable, é preciso **remover o Cloud**, e essa remoção é **permanente e irreversível**. Não existe migração automática ([Connect to Supabase](https://docs.lovable.dev/integrations/supabase)).
- Ganho: posse total, painel, SQL direto e conector funcionando.
- Risco: login, segredos, funções e arquivos precisam ser refeitos. Fazer isso no meio da finalização multiplica o retrabalho.
- Momento certo: depois da Opção A estabilizada, numa janela planejada.

Por que A agora: ela acaba com a divergência em dias, sem tirar do ar o app que já funciona, e preserva os dados do banco antigo. A opção B só faz sentido com um banco único e limpo, que é justamente o resultado da A.

## 4. Plano da Opção A

| Etapa | O quê | Quem | Altera algo? |
|---|---|---|---|
| A0 | Congelar `zsxpd…`: ninguém grava mais nele. Desativar `.mcp.json` no repositório (PR). | Proprietária autoriza; Claude faz o PR | Só o repositório |
| A1 | Inventário de `liiqq…`: colar no Lovable o prompt da seção 6 (só leitura) | Proprietária cola; o Lovable responde | Não |
| A2 | Matriz de reconciliação por tabela: igual / só em zsxpd / só em liiqq / conflito. Chave: id e, na falta dele, e-mail ou nome mais data. | Perplexity, a partir de A1 e de `zsxpd…` | Não (documento) |
| A3 | Estrutura: migração que cria em `liiqq…` as tabelas que só existem em `zsxpd…` (as 27 `research_*` e `*_records`), com RLS e FORCE RLS | Claude Code (PR); o Lovable aplica | Sim, após aprovação |
| A4 | Dados: carga só do que é "só em zsxpd" e foi aprovado na matriz. Conflitos: decisão da proprietária, linha a linha, nos casos críticos (clientes, casos, contratos). | Claude Code (PR com seed idempotente); o Lovable aplica | Sim, após aprovação |
| A5 | Arquivos (7 objetos) e usuários (5): comparar com `liiqq…`; reenviar arquivos que faltam; recriar usuários faltantes com convite, nunca copiando senha | Lovable | Sim, após aprovação |
| A6 | Vercel: apontar `VITE_SUPABASE_URL`/`PUBLISHABLE_KEY` para `liiqq…` (lote C4) | Proprietária autoriza | Sim |
| A7 | Refazer a PR #170 contra a lista real de `liiqq…` (A1 + tabelas de A3) | Claude Code | PR |
| A8 | Conferência final e pausa de `zsxpd…` (não excluir) | Perplexity confere; a proprietária autoriza a pausa | Sim |

## 5. Critério de aceite
- `.env`, `config.toml`, Vercel e as ferramentas de agente citam o mesmo `project_ref`.
- A matriz de A2 não tem nenhuma linha "só em zsxpd" sem decisão registrada.
- O mesmo cliente e o mesmo caso (ex.: Ana Luiza) aparecem idênticos no Desk e no App Cliente, em 1280 e 375 px.
- Ninguém gravou em `zsxpd…` depois do congelamento: `max(created_at)` de `audit_logs` permanece em 11/10/2026.

## 6. Prompt A1 para o Lovable (só leitura)

```
TAREFA SOMENTE LEITURA. Não altere código, banco, migrações nem roadmap. Não faça commit.
No banco deste projeto (Lovable Cloud), execute e me devolva o resultado em tabelas:
1) select relname, n_live_tup, relrowsecurity, relforcerowsecurity
   from pg_stat_user_tables s join pg_class c on c.oid=s.relid
   where s.schemaname='public' order by relname;
2) select count(*) from auth.users; select bucket_id, count(*) from storage.objects group by 1;
3) select version from supabase_migrations.schema_migrations order by version desc limit 5;
   select count(*) from supabase_migrations.schema_migrations;
4) Para clientes, crm_casos, contracts (ou a tabela de contratos existente) e research_cases (se existir):
   id, created_at e um identificador legível (nome ou e-mail mascarado: 3 primeiras letras + ***).
Responda apenas com os resultados. Se alguma tabela não existir, escreva "não existe".
```

## 7. Inventário atual de `zsxpd…` (tabelas com dados)

| Tabela | Linhas |
|---|---|
| audit_logs | 1752 |
| case_activation_checks | 238 |
| catalog_source_divergences | 185 |
| contract_parameter_values | 124 |
| label_taxonomy | 109 |
| product_catalog | 90 |
| research_audit_events | 85 |
| contract_validation_results | 84 |
| planner_catalog_feed | 78 |
| planner_tarefas | 63 |
| price_catalog_rescued | 62 |
| controlled_taxonomies | 61 |
| message_templates | 60 |
| auth_throttle | 54 |
| checklist_cadastral | 49 |
| contract_review_events | 49 |
| citizenship_tracks | 46 |
| quality_checklist_templates | 42 |
| owner_override_events | 40 |
| contract_scope_items | 37 |
| caso_log | 36 |
| legal_clause_matrix | 36 |
| case_timeline_events | 33 |
| legal_reference_milestones | 33 |
| contract_annexes | 29 |
| message_template_categories | 27 |
| quality_issues | 26 |
| tarefas | 24 |
| piloto_bloqueios | 19 |
| clientes | 18 |
| piloto_conferencia | 18 |
| crm_casos | 17 |
| artifact_register | 16 |
| editorial_content_items | 15 |
| entity_labels | 15 |
| staff_access | 15 |
| case_checklist_items | 14 |
| integrations | 14 |
| onboarding_template_items | 14 |
| user_roles | 13 |
| onboarding_checklist | 12 |
| ops_sla_regras | 12 |
| case_members | 11 |
| case_service_criterios | 10 |
| communication_queue | 10 |
| research_people | 10 |
| versioned_legal_rules | 10 |
| contract_parties | 9 |
| institutional_profile_events | 9 |
| leads | 9 |
| research_action_plan_items | 9 |
| research_pending_items | 9 |
| contract_parameter_previews | 8 |
| contract_versions | 8 |
| contracts | 8 |
| touchpoints | 8 |
| genealogical_person_profiles | 7 |
| master_library_state_events | 7 |
| proposal_canva_pages | 7 |
| proposals | 7 |
| research_sources | 7 |
| contract_source_links | 6 |
| knowledge_items | 6 |
| master_library_items | 6 |
| microentregas | 6 |
| research_relationships | 6 |
| case_alerts | 5 |
| casos | 5 |
| client_portal_access | 5 |
| client_portal_case_access | 5 |
| commercial_conditions | 5 |
| consent_exceptions | 5 |
| conversion_events | 5 |
| organization_members | 5 |
| profiles | 5 |
| research_document_requests | 5 |
| research_evidence_items | 5 |
| research_hypotheses | 5 |
| sla_regras | 5 |
| authorized_portal_emails | 4 |
| case_aliases | 4 |
| contract_case_parameters | 4 |
| contract_clause_overrides | 4 |
| genealogical_relationships | 4 |
| nucleo_membros | 4 |
| service_orders | 4 |
| app_projections | 3 |
| crm_interactions | 3 |
| documents | 3 |
| evidencias | 3 |
| organizations | 3 |
| portal_ticket_messages | 3 |
| research_case_events | 3 |
| research_cases | 3 |
| research_events | 3 |
| case_phase_history | 2 |
| catalog_reconciliation_runs | 2 |
| client_access_events | 2 |
| composition_template_events | 2 |
| composition_templates | 2 |
| contract_templates | 2 |
| expense_estimates | 2 |
| institutions | 2 |
| invoices | 2 |
| nucleos_familiares | 2 |
| research_case_hypotheses | 2 |
| research_evidence_links | 2 |
| research_name_variants | 2 |
| blueprint_parameters | 1 |
| bootstrap_lock | 1 |
| case_dependents | 1 |
| case_plans | 1 |
| case_services | 1 |
| contract_exceptions | 1 |
| drive_provisioning_queue | 1 |
| evidencia_acessos | 1 |
| genealogical_events | 1 |
| genealogical_sources_catalog | 1 |
| institutional_profiles | 1 |
| lineage_paths | 1 |
| onboarding_planos | 1 |
| onboarding_templates | 1 |
| ops_microentregas | 1 |
| portal_document_requests | 1 |
| portal_tickets | 1 |
| research_client_summaries | 1 |
| research_reports | 1 |

## Premissas
- `liiqq…` é o banco do Lovable e do app publicado (confirmado por `.env`, `config.toml` e pelo chat do Lovable de 25/08).
- A Vercel não pôde ser conferida: o acesso à Vercel não está autenticado neste ambiente.

## Limites
- Nenhuma alteração foi feita. Os números de `zsxpd…` são estimativas do Postgres (`n_live_tup`).
- O conteúdo de `liiqq…` só fica conhecido depois do A1.

## Próximos passos
1. Proprietária: escolher entre A e B e autorizar A0 (congelar `zsxpd…`).
2. Colar o prompt A1 no Lovable e trazer a resposta.
3. Montar a matriz A2.
