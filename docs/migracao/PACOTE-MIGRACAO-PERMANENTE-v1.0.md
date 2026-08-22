# Pacote de Migração Permanente — Clube Ancestral (v1.0)

Documento de preparação. Nada aqui foi executado em produção. Nenhum segredo é exposto.
Data de referência: 2026-08-22.

## 1. Inventário de banco

| Item | Quantidade |
| --- | --- |
| Migrations versionadas em `supabase/migrations/` | 137 (todas aplicadas no ambiente atual) |
| Migrations pendentes | 0 |
| Tabelas no schema `public` | 182 |
| Índices | 356 |
| Funções em `public` | 218 |
| Triggers | 799 |
| Policies RLS | 520 |
| Tabelas sem policy | 2 — `auth_throttle`, `bootstrap_lock` (internas, sem Data API de usuário) |
| Tabelas com RLS desabilitada | 0 |
| Buckets de storage | `contracts`, `pesquisa`, `documentos` — todos privados, leitura só por URL assinada |
| Registros de auditoria | 670 em `audit_logs`; `owner_override_events` append-only |

Secrets/integrações referenciadas por nome (valores nunca expostos):
`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`,
`SUPABASE_SERVICE_ROLE_KEY` (somente servidor), `LOVABLE_API_KEY` (assistente de
pesquisa), integração Asaas registrada em `integrations` (sem credencial em código).

## 2. Inventário de aplicação

- Stack: TanStack Start v1 + React 19 + Vite 7 + Tailwind v4.
- Rotas: 20 arquivos públicos/estruturais em `src/routes/` + 66 rotas internas em
  `src/routes/_authenticated/` (Desk Intelligence) + `src/routes/portal` (App Cliente)
  + `src/routes/api` (endpoints).
- Bibliotecas de domínio: ~200 módulos em `src/lib/` (regras puras, `*.functions.ts`
  para RPC e `*.server.ts` para código privilegiado).
- Dependências: 55 de produção, 18 de desenvolvimento.
- Scripts: `dev`, `build`, `build:dev`, `preview`, `lint`, `format`; testes via `vitest run`.
- Variáveis de ambiente por nome: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
  `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_PROJECT_ID` (servidor), `SUPABASE_SERVICE_ROLE_KEY` (servidor).

## 3. Manifesto de dados

Entidades canônicas e fonte de verdade:

| Domínio | Fonte canônica |
| --- | --- |
| Comercial | `leads`, `opportunities`, `proposals`, `commercial_conditions` |
| Catálogo | `product_catalog`, `sku_catalog`, `sku_price_exceptions` |
| Pessoas/família | `clientes`, `contacts`, `nucleos_familiares`, `nucleo_membros`, `case_dependents` |
| Casos | `crm_casos` (+ `case_aliases` para códigos legados) |
| Operação | `tarefas`, `ops_microentregas`, `ops_excecoes`, `case_timeline_events` |
| Pesquisa | `research_*`, `evidencias`, `genealogical_*`, 13 módulos históricos |
| Contratual | `contracts`, `contract_versions`, `contract_annexes`, `service_orders` |
| Financeiro | `invoices`, `payments`, `eventos_financeiros` |
| App Cliente | `app_projections`, `client_deliverables`, `client_portal_access` |
| Auditoria | `audit_logs`, `owner_override_events`, `caso_log`, `change_log` |

Regras de dados: isolamento por `organization_id` em RLS; sem exclusão física
(apenas arquivamento com motivo/autor/data); dados DEMO/TESTE marcados por
`demo`/`is_demo`/`dados_teste`/`data_origin = fixture_demo` e, agora, também por
rótulo (`src/lib/fixtures.ts`), sempre fora de métricas, filas e App Cliente.

Backup/rollback: snapshot lógico do banco antes de cada etapa; migrations são
aditivas; rollback por etapa descrito na seção 4.

## 4. Plano de migração reproduzível

1. **Pré-requisitos**: projeto de destino criado, papéis `anon`/`authenticated`/
   `service_role` ativos, variáveis de ambiente cadastradas por nome, domínio reservado.
2. **Backup**: snapshot completo do banco atual + export CSV das entidades canônicas.
3. **Ordem de migrations**: aplicar `supabase/migrations/` em ordem lexicográfica
   (137 arquivos, do bootstrap ao `20260822205306_*`). Nenhuma reordenação.
4. **Validação de schema**: conferir 182 tabelas, 356 índices, 218 funções, 799 triggers.
5. **Carga de dados**: importar apenas dados reais; massa DEMO/TESTE em lote separado,
   marcada, opcional.
6. **Verificação de RLS**: 520 policies presentes; conferir que nenhuma tabela de
   negócio fica sem policy e que `auth_throttle`/`bootstrap_lock` seguem sem Data API.
7. **Smoke tests autenticados**: login da proprietária, Painel Hoje, caso
   `CA-CID-AT-FAM-2026-001`, preparação de contrato, janela de confirmação externa
   (sem confirmar), App Cliente sem dado DEMO.
8. **Rollback por etapa**: cada etapa reverte para o snapshot anterior; migrations
   nunca são apagadas, apenas o banco é restaurado.
9. **Go/no-go**: schema íntegro, RLS íntegra, smoke tests verdes, auditoria gravando,
   nenhuma ação externa disparada, acesso da proprietária funcional.

## 5. Checklist de go-live

- [ ] Domínio próprio apontado e certificado válido.
- [ ] Autenticação: magic link (cliente, 20 min) e e-mail/senha (equipe) testados.
- [ ] E-mail transacional com remetente verificado.
- [ ] Asaas: credenciais cadastradas como secret, modo de confirmação manual ativo.
- [ ] Armazenamento: buckets privados, URLs assinadas com expiração curta.
- [ ] Observabilidade: logs de erro e auditoria acessíveis.
- [ ] Backups automáticos e teste de restauração.
- [ ] Acesso da proprietária administradora confirmado no ambiente novo.
- [ ] Contingência: segundo administrador de emergência e procedimento documentado.
