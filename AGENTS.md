<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Clube Ancestral — regras para agentes

Texto integral (autoridade, legado, schema, navegação, artefatos 005–010, adendos): `docs/politicas/AGENTS-MEMORIA-COMPLETA-2026-10-11.md`. Ler antes de mudar fluxo, schema, nav ou App.

- Um produto só: Desk + App Cliente sobre `crm_casos`; planejador é fonte do trabalho ativo; caso ativo sempre com próxima ação (`proxima_acao_prioritaria`) — por quê: motor unificado.
- Mapear para tabelas existentes (`types.ts` + CHECK das migrations); nunca tabelas hipotéticas nem vocabulário CHECK novo — por quê: evita schema paralelo.
- Legado (planilha mestre, matriz, DRE, Asaas antigo) só em trilha rotulada (`legacy_record_links`) — por quê: nunca dirige operação.
- Desk: a lateral renderiza `SETORES_DESK`, derivado de `GRUPOS_DESK` (7 grupos da V4 + Financeiro, decisão da Proprietária 18/10/2026, confirmada/mantida em 19/10/2026 como a casca vigente do menu); nunca manter segunda lista de menu. As 13 superfícies antes mapeadas em `SUPERFICIES_PRANCHA_V4` passam a ser metadados/rotas internas mapeados dentro desses setores (sub-tabs por rota/hash), não um menu paralelo — decidido pela Proprietária em 19/10/2026. App = 7 abas (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta); nenhuma tela/menu extra — por quê: uma fonte de navegação.
- Caso 360 = 8 seções (`SECOES`) + 1 pílula adicional "Visão Concreta" no índice (consolidação de leitura agregada da seção "Visão" — linha do tempo, participantes, dossiê, pesquisa, condição comercial e publicações App —, não uma 9ª seção equivalente às outras) — decidido pela Proprietária em 19/10/2026; admin vê o App só via `/app-cliente-como-pessoa?casoId=` — por quê: sem segundo mecanismo.
- CRM Mestre é o Dicionário CA-04 (referência normativa, sem ficha/writer próprio); App Cliente congelado em 7 abas — por quê: menu segue a Prancha V4 implementada em `main`, decidido pela Proprietária em 19/10/2026.
- App mostra só conteúdo sanitizado/aprovado/publicado; vazio honesto; nada inferido — por quê: privacidade e verdade.
- Editorial presentation refinements are scoped by the existing PortalShell to the requested official tabs; shared readers and global design tokens stay unchanged — why: isolate visual changes from Desk and unrelated tabs.
- Mockup 4 Desk presentation uses opt-in data-desk-mockup4 containers and local CSS; CRUD cells expose their column labels without changing readers or writers — why: support mobile reading without affecting unrelated screens or duplicating data.
- Preservar a RPC `portal_sou_contratante_financeiro` e suas chamadas; não-contratante recebe só estado neutro quando `restritoAoContratante` — por quê: fatura pertence ao contratante.
- Autorização sempre em RLS/servidor; sem exclusão física; auditoria em mudanças — por quê: segurança real.
- Preservar `confirmarDocumentosMinimos` → `documentos_minimos_ok` (PR #85) — por quê: gate do portal.
- `painel-dia.tsx` continua aguardando decisão; não tocar. `golive-*` (arquivos/rotas) seguem intocados, mas suas composições e leitores reais já podem ser reaproveitados (import/compor, nunca reescrever) nas rotas V4 (Caso 360, leads/calls, contrato/financeiro, pesquisa/microentregas) — decidido pela Proprietária em 19/10/2026, ordem "Reintegração micro GoLive no Desk V4" — por quê: a riqueza operacional real do piloto não pode ficar isolada da casca V4.
- Nada arquiva sem `COMPROVADO_EM_USO` com prints autenticados da Proprietária; build/teste não é prova — por quê: adendo 2026-09-10.
- Sem migration, RLS, convite, publicação, merge ou deploy sem autorização explícita — por quê: efeitos externos.
- As 5 etapas do caso (Diagnóstico→App Cliente) vêm só de `src/lib/etapas-caso.ts`, agrupando `case_activation_checks` existentes; nunca gate/tabela nova — por quê: uma regra para Caso 360, lista, Radar e Painel.
- CRM presentation focus and Calls moments are local state; keep existing editors mounted and preserve all writers and persisted IDs — why: switching context must not lose drafts or create a parallel record.
- Approved existing support migrations are applied through the managed migration tool and recorded in its Drizzle journal; keep historical Supabase migration sources intact — why: tooling owns deployment history and avoids duplicate schema authorship.
