# Mapa do projeto — Clube Ancestral

Atualizado em 25/10/2026 (auditoria pré-lançamento, Cartographer). Regras de
produto e autoridade: `AGENTS.md` e `docs/politicas/AGENTS-MEMORIA-COMPLETA-2026-10-11.md`.

## 1. Onde roda

| Peça | Onde | Observação |
|---|---|---|
| Aplicativo (Desk + App Cliente) | **Lovable** (projeto `1a628b61-…`, "Ancestral Canvas", publicado) | Build TanStack Start via `@lovable.dev/vite-tanstack-config`. |
| Banco, login, arquivos | **Lovable Cloud** = Supabase `liiqqibnirnpnvjmjrpj` | Único banco vivo. Declarado em `src/lib/config-publica.ts` (`PROJETO_DECLARADO`). |
| Banco antigo | `zsxpdbhdvbuulwpepemd` | Congelado. Nunca ler nem escrever. |
| Vercel | **desativada** | Sobrou só `vercel.json` (o Lovable ignora) e comentários. |
| Repositório | GitHub `tatianatosi/soul-ancestry` | Commits na branch conectada sincronizam com o Lovable. |

O navegador e o servidor só aceitam o projeto declarado: se uma variável de
ambiente apontar para outro banco, o código volta para `liiqq…`
(`configPublicaDoServidor`, `src/integrations/supabase/client.ts`).

## 2. Stack

- **TanStack Start + Router + Query**, React, Tailwind, shadcn/ui.
- **Funções de servidor**: `createServerFn` + middleware `requireSupabaseAuth`
  (~550 funções, em `src/lib/*.functions.ts`; regras de servidor em `*.server.ts`).
- **Supabase**: RLS em 194 tabelas; triggers de proteção (`fn_*_guard`).
- **Testes**: Vitest, ~590 arquivos em `src/lib/__tests__` (muitos leem o
  código-fonte como texto e conferem regras de produto).

## 3. Os dois lados

### 3.1 Desk (equipe) — `src/routes/_authenticated/` (91 rotas)

Portão: `_authenticated/route.tsx` (sessão + papel interno; cliente vai para `/portal`).
Casca: `src/components/saas/shell.tsx` (`SaasShell`, `useSaas`).
Menu: fonte única `GRUPOS_DESK` em `src/lib/navegacao-desk.ts`.

| Setor | Telas principais (rota) |
|---|---|
| **Hoje** | `/painel`, `/alertas`, `/proximas-acoes`, `/tarefas` |
| **Comercial** | `/leads`, `/calls` (Discovery), `/propostas`, `/contratos`, `/contrato-parametros`, `/conversao`, `/crm-mestre` |
| **Casos** | `/casos` (lista), `/casos/$caseId` (**Caso 360**, 8 seções), `/golive/*` (**GoLive · Vida do cliente**, 19 telas, sempre com `?casoId=`), `/onboarding/$id`, `/ordens-servico`, `/microentregas`, `/ops` |
| **Pessoas & Famílias** | `/clientes`, `/pessoas/$clienteId`, `/nucleos`, `/nucleos-duplicidades`, `/acessos-portal`, `/app-cliente-como-pessoa?casoId=` (admin vê o App) |
| **Pesquisa** | `/pesquisa-modulo`, `/evidencias`, `/atendimento`, `/biblioteca`, `/fontes-genealogicas`, `/relatorios`, `/achados/$caseId`, `/plano-acao/$caseId`, `/pessoas-linhagens/$caseId` |
| **Marketing** | `/marketing`, `/biblioteca-mensagens`, `/metricas` |
| **Financeiro** | `/financeiro` |
| **Configuração** | `/configuracoes`, `/catalogo`, `/equipe` (só admin), `/integracoes`, `/governanca/*`, `/importacoes`, `/qualidade`, `/matriz-juridica`, `/privacidade` |

Fora do menu, por decisão: `painel-dia.tsx` (congelado, não tocar).

### 3.2 App Cliente — `src/routes/portal/` (15 arquivos)

Casca: `src/components/portal/portal-shell.tsx`. Leitura viva: `usePortalVivo`
(`src/components/portal/fonte-portal.tsx`) → `src/lib/portal-dados-vivos.functions.ts`.

| Aba oficial (7) | Rota |
|---|---|
| Home | `/portal` |
| Jornada | `/portal/jornada` |
| Radar | `/portal/radar` |
| Árvore | `/portal/arvore` |
| Documentos | `/portal/documentos` |
| Legado | `/portal/legado` |
| Conta | `/portal/conta` |

Ainda roteáveis fora das 7 abas (auditoria pede decisão): `/portal/casos/$id`,
`/portal/mensagens/$id`, `/portal/faturas`, `/portal/entregas`, `/portal/proposta`,
`/portal/fase-01`, `/portal/fase-02`.

Login do cliente: link mágico (`/acesso`), autorizado por `authorized_portal_emails`
e `client_portal_access`; regras em `src/lib/portal.server.ts`.

## 4. Fluxo do cliente (motor único sobre `crm_casos`)

```
Lead (/leads) → Discovery (/calls) → Proposta (/propostas)
  → Condição comercial (commercial_conditions) → Contrato (/contratos, contrato-parametros)
  → OS / Anexo I (service_orders) → Ativação do caso (5 etapas: src/lib/etapas-caso.ts)
  → Pesquisa (research_*, evidências, achados) → Publicação sanitizada (app_projections)
  → App Cliente (7 abas)
```

- Próxima ação de todo caso ativo: RPC `proxima_acao_prioritaria`.
- GoLive grava sempre no caso escolhido: `contexto(…, casoEscolhido(data))` em
  `src/lib/golive-escritores.functions.ts`.
- Publicar no App passa por `exigirPublicavelNoApp` (`src/lib/projecao-publicavel.ts`).

## 5. Autoridade (quem pode o quê)

| Camada | Arquivo / objeto | Regra |
|---|---|---|
| Tela | `src/lib/autoridade-operacional.ts` → `decidirAcao`; hook `useAutoridade` | Proprietária admin: só bloqueia carregando, sem papel ou sem organização. |
| Contexto | `getContexto` (`src/lib/saas.functions.ts`) | Papel vem de `staff_access` ativo + `user_roles` da pessoa. |
| Servidor | `src/lib/autoridade.server.ts` → `proprietariaOperando`, `assumirOuRecusar` | Pendência de processo informa, não impede, para a admin ativa. |
| Banco | `public.fn_proprietaria_operando()` dentro dos triggers | 118 funções cedem à proprietária; 19 valem para todos (sem exclusão física, histórico append-only, último admin, log sem credencial, integração desligada, colisão de alias). |
| RLS | `can_write(org)`, `is_org_member` | Testado em 25/10: a proprietária edita 100/100 tabelas com dados. |

Continua valendo para todos, por proteger o cliente: convite ao App só com
contrato + pagamento + documentos mínimos; texto interno não chega ao App;
contrato assinado não muda; fatura só para o contratante
(`portal_sou_contratante_financeiro`).

## 6. Persistência ("salvou mesmo?")

- `gravarComVerificacao` (`src/lib/persistencia.server.ts`): grava, relê e
  compara; devolve `divergencias` (campos que o banco não guardou como enviados).
- `atualizarRegistro` devolve `naoGuardados`; o Caso 360 mostra aviso amarelo
  em vez de "Salvo e conferido" quando há campo divergente.

## 7. Banco de dados — tabelas por domínio (Lovable Cloud)

| Domínio | Tabelas principais |
|---|---|
| Acesso e equipe | `organizations`, `organization_members`, `staff_access`, `user_roles`, `profiles` |
| Caso (núcleo) | `crm_casos`, `case_activation_checks`, `case_plans`, `case_timeline_events`, `case_alerts`, `caso_log`, `tarefas`, `planner_tarefas` |
| Pessoas e famílias | `clientes`, `nucleos_familiares`, `nucleo_membros`, `case_members`, `case_dependents`, `genealogical_person_profiles` |
| Comercial | `leads`, `opportunities`, `crm_interactions`, `touchpoints`, `discovery_assessments`, `proposals`, `commercial_conditions`, `product_catalog`, `sku_catalog`, `price_catalog_rescued` |
| Contrato | `contracts`, `contract_versions`, `contract_case_parameters`, `contract_parameter_values`, `contract_parameter_previews`, `contract_annexes`, `contract_scope_items`, `service_orders` |
| Pesquisa | `research_cases`, `research_people`, `research_evidence_items`, `research_pending_items`, `research_action_plan_items`, `genealogical_findings`, `genealogical_sources_catalog`, `evidences`, `master_library_items`, `controlled_taxonomies` |
| Documentos | `documents`, `portal_document_requests`, `document_requests`, `consent_records` |
| App Cliente | `client_portal_access`, `client_portal_case_access`, `authorized_portal_emails`, `app_projections`, `portal_tickets`, `client_deliverables` |
| Financeiro | `invoices`, `payments`, `eventos_financeiros`, `invoice_adjustments` |
| Histórico (só acrescenta) | `audit_logs`, `owner_override_events`, `conversion_events`, `research_audit_events`, `catalog_audit_events` |
| Legado | `legacy_record_links`, `legacy_catalog_import`, `legacy_sku_mappings` |

Mudanças de banco: proposta em `supabase/pendentes/` com cabeçalho `ESTADO`;
`supabase/migrations/` é histórico (234 arquivos), não editar.

## 8. Pastas de código

| Pasta | O que tem |
|---|---|
| `src/routes/` | Telas (Desk em `_authenticated/`, App em `portal/`, login em `acesso*`/`equipe.*`) |
| `src/lib/` | Regras e servidor (~510 arquivos): `*.functions.ts` (chamadas da tela), `*.server.ts` (só servidor), `*.ts` (regras puras) |
| `src/components/` | `caso/` (Caso 360), `contrato/`, `crm/`, `painel/`, `portal/` (App), `desk/`, `golive/`, `pesquisa/`, `saas/` (casca e autoridade), `ui/` (shadcn) |
| `src/integrations/supabase/` | Cliente do navegador e do servidor, middleware de login, `types.ts` (tipos do banco) |
| `supabase/pendentes/` | Mudanças de banco propostas ou aplicadas, com `ESTADO` |
| `.cartographer/` | Mapa gerado e relatórios da auditoria (não versionado) |

## 9. Para começar (onboarding)

1. Ler `AGENTS.md` e este mapa.
2. `bun install`, `npx tsc --noEmit`, `npx vitest run`.
3. Escrita do Desk: sempre por função de servidor com `requireSupabaseAuth` e
   `gravarComVerificacao`/`inserirComVerificacao`.
4. Antes de usar coluna nova: conferir em `src/integrations/supabase/types.ts`
   **e** no CHECK do banco (vários erros silenciosos vieram de valores fora do CHECK).
5. Nada vai ao App sem passar por publicação sanitizada.
