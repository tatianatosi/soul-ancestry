# Comparação de tabelas — PR #170 × banco

Status: aprovado (opção A aprovada pela proprietária em 2026-10-20)
Versão: v1.0
Data: 2026-10-20
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: PR #170 (branch claude/force-rls-167-tabelas), repositório tatianatosi/soul-ancestry main@af05314, consulta somente leitura ao Supabase zsxpdbhdvbuulwpepemd
Substitui: complementa 2026-10-20-resolucao-divergencia-pr170-banco.md

## Escopo e limites
Só leitura. Nenhuma alteração em banco, GitHub ou deploy.

## Achado principal: banco errado na comparação
- O código (`supabase/config.toml` e `.env`) aponta para o projeto **liiqqibnirnpnvjmjrpj**, o banco gerenciado pelo Lovable.
- O conector acessa apenas o projeto **zsxpdbhdvbuulwpepemd** ("tatianatosi's Project").
- Esse banco registra 111 migrações, a última de 2026-09-11. O repositório tem 234, e 53 delas são posteriores a essa data.
- Conclusão: zsxpd… é um banco à parte e desatualizado. A divergência com a PR vem principalmente de **comparar com o banco errado**, não de um erro no SQL.

## Resultado da comparação (contra zsxpd…)
- Tabelas no banco: 187. Tabelas na PR: 167.
- Presentes nos dois: 160. Nenhuma tem FORCE RLS hoje.
- Citadas na PR e ausentes no banco: 7

| Tabela | Origem no repositório |
|---|---|
| ancestralscan_triagens | criada em 20260925160000; usada em 2 arquivos |
| case_commercial_condition | sem CREATE no repositório; usada em 5 arquivos |
| case_grupos_comunicacao | sem CREATE no repositório; usada em 1 arquivo |
| client_tab_dwell_events | criada em 20261011120000; usada em 1 arquivo |
| incremental_scope | criada em 20260926110000; sem uso no código |
| legacy_catalog_import | criada em 20260926110000; sem uso no código |
| legacy_sku_mappings | sem CREATE no repositório; usada em 2 arquivos |

Quatro delas foram criadas por migrações de 25/09 a 11/10, que nunca chegaram a zsxpd…. As outras três não têm CREATE no repositório, o que é coerente com tabelas criadas direto pelo Lovable no banco dele.

### Existem no banco e não estão na PR: 27
Todas com RLS ligado e FORCE desligado. Nenhuma tem migração de criação no repositório, então provavelmente foram criadas fora dele:
`audiovisual_records`, `cadastral_records`, `correspondence_records`, `cultural_records`, `education_records`, `historical_context_events`, `military_records`, `notarial_records`, `occupations_assets`, `preserved_objects`, `religious_records`, `research_audit_events`, `research_case_events`, `research_case_hypotheses`, `research_cases`, `research_client_summaries`, `research_document_requests`, `research_evidence_items`, `research_evidence_links`, `research_name_variants`, `research_pending_items`, `research_people`, `research_relationships`, `research_reports`, `research_sources`, `residences_migrations`, `social_political_records`

## Premissas
- `.env` e `config.toml` refletem o banco usado pelo Lovable e pelo preview. Falta confirmar a variável na Vercel (lote C4).

## Próximos passos
1. **Não aplicar a PR #170 em zsxpd….** O resultado seria parcial e no banco errado.
2. Rodar a mesma consulta somente leitura em liiqqibnirnpnvjmjrpj. Como você não tem acesso direto a esse banco, isso pode ser feito pelo Lovable, como prompt só de leitura (`select relname, relrowsecurity, relforcerowsecurity from pg_class ... public`).
3. Conferir na Vercel qual URL do Supabase o preview usa (C4).
4. Decidir o destino de zsxpd…: arquivar, ou manter como ambiente de testes declarado.
5. Verificar se as 27 tabelas research_* e *_records existem em liiqq…. Se existirem, incluí-las na PR. Se não, documentar a origem delas.

## Critério de aceite
Lista de tabelas de liiqq… comparada com a PR, com zero ausências sem explicação, antes de qualquer aplicação.
