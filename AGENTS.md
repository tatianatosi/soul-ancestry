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

- Conclusão (01/11/2026): tarefa pedida é tarefa entregue de ponta a ponta (código, teste, commit, PR, CI verde); não encerrar com lista de pendências que o agente mesmo pode executar. Perguntar só o que é irreversível, externo ou decisão nova da Proprietária, e uma pergunta por vez, com o motivo. Nunca escrever "feito" sem evidência (teste, CI, grep do código); ao final, dizer o que ficou feito e provado e o que falta, com a causa concreta — por quê: planos marcaram como feito o que não estava (ex.: P1) e PRs foram arquivados sem executar.
- Sincronia com o Lovable (01/11/2026): com o editor ativo, trabalhe só em branch `claude/*` e não empurre na `main`; antes de PR, `git merge origin/main` — por quê: o merge do editor sobre base antiga já derrubou 101 arquivos (`00ab0cc5`). Protocolo: `docs/politicas/PROTOCOLO-SINCRONIA-LOVABLE-GIT-2026-11-01.md`.
- PR evidence is validated by trusted-base scripts against the exact head SHA and declared file reservations; merge, CI, declared evidence and live publication remain separate states — why: automated presence checks cannot establish authenticated use or prevent undeclared concurrent editing.
- Reservation-sync executes only trusted main code and revalidates all open PR head statuses after PR changes and main pushes; CLAUDE.md points to these canonical rules — why: another agent's reservation change must not leave a stale green result, and repository presence is not proof of Claude session receipt.
- Classic main protection requires guard and typecheck-test-build on an up-to-date branch plus independent review, including administrators; Lovable publication remains a separate human action — why: GitHub integration restrictions do not gate the editor's Publish button.
- Lead and customer duplicate checks share pure comparison signals, retaining their own CPF, fixture, query and error policies — why: consolidate normalization without changing identity or persistence behavior.

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
- Painel Hoje: a fonte viva é `/painel` (Prancha V4, mockup aprovado e já aplicado); `painel-dia.tsx` é desenho anterior superado — decidido pela Proprietária em 01/11/2026 (N7), não será religado; não apagar nem mexer nos seus testes sem pedido — por quê: um só Hoje.
- GoLive = VIDA COMPLETA de CADA cliente; Caso 360 = visão MACRO (cards-resumo da vida do cliente) que aponta para o GoLive; o GoLive tem lugar próprio em Casos → "GoLive · Vida do cliente", abre dentro do Desk V4 (`GoLiveShell` sobre `SaasShell`), recebe o caso por `?casoId=` nas 19 telas e grava SEMPRE no caso escolhido (`contexto(…, casoEscolhido(data))`; sem caso, o piloto) — decidido pela Proprietária em 23/10/2026, substitui a regra de 19/10 ("golive-* intocados") e a Fase 6 do plano de 07/10 (absorver o GoLive) — por quê: o GoLive só servia ao piloto e gravava tudo no caso da Ana. Decisão: `00_governanca/DECISAO-CASO360-MACRO-GOLIVE-VIDA-COMPLETA-2026-10-23.md`.
- Nada arquiva sem `COMPROVADO_EM_USO` com prints autenticados da Proprietária; build/teste não é prova — por quê: adendo 2026-09-10.
- Sem migration, RLS, convite, publicação, merge ou deploy sem autorização explícita — por quê: efeitos externos.
- As 5 etapas do caso (Diagnóstico→App Cliente) vêm só de `src/lib/etapas-caso.ts`, agrupando `case_activation_checks` existentes; nunca gate/tabela nova — por quê: uma regra para Caso 360, lista, Radar e Painel.
- CRM presentation focus and Calls moments are local state; keep existing editors mounted and preserve all writers and persisted IDs — why: switching context must not lose drafts or create a parallel record.
- Approved existing support migrations are applied through the managed migration tool and recorded in its Drizzle journal; keep historical Supabase migration sources intact — why: tooling owns deployment history and avoids duplicate schema authorship.
- Documentos displays completion only from the canonical portal request checklist in both the client App and administrative preview; available files are not completed requests — why: avoid false completion and keep one request source.
- The client tree uses a single SVG genogram of published people and explicit relationships with local zoom, pan, and person detail; no repeated relationship list. A child's connector may descend from a union only when both parents' filiations to that child are published — why: keep one family visualization without implying unregistered parentage.
- Client genogram layout and framing use browser-safe pure helpers; root highlights require an owner-authorized case/person identity pair, rendered generations have no illustrative ceiling, and an explicit published filiação always places the parent above the child (spouses share a row) even when published generation numbers disagree — why: names, ordering and mockup limits cannot establish genealogy or hide published people, and a parent drawn beside a child misstates the family.
- Narrow genogram containers use compact card geometry and width-based framing with natural page height; labels reuse the canonical generation scale — why: preserve complete names at readable sizes without inventing people or clipping descendants.
- Years under tree-card names come only from the person's approved profile date or a strictly year-only registered profile value; free-text ranges never select a year and "c." marks approximate/estimated precision — why: avoid fabricated month/day or inferred genealogy.
- Contract version tracking expands the existing version history and shows stored generation/update timestamps and author identities using existing team reads — why: no second ledger or invented historical editor.
- Case-specific authorized commercial presentation is resolved by canonical case identity, never by person name or matching price — why: prevent terms from leaking into another family's account.
- Explicit dossier identification takes precedence in the shared collection classifier — why: mentions of family or records must not move a dossier into notebooks or memories.
- Sitemap URLs derive from required per-route staticData decisions; only public institutional content is included, private parents exclude their subtrees, and lastmod is omitted without authoritative page timestamps — why: prevent operational records from becoming discovery entries or fabricated freshness signals.
- The Desk published-tree view reuses pessoasDaArvore on published, non-archived projections; generation connectors never infer person-to-person parentage — why: restore the approved presentation without manufacturing genealogy or writing live data.
- Commercial and contract approval uses organization-scoped server authorization plus fail-closed INSERT/UPDATE triggers on existing approval records; preserve draft preparation — why: UI restrictions cannot prevent direct writes or alternative approval paths.
- Contract send approval may waive only documentary validation keys through an active organization-scoped validation_waiver exception created by admin; retain pending results and link the exception in approval audit — why: owner-authorized missing attachments do not authorize financial, legal-representation, review or signature bypasses.
