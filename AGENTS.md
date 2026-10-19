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
- Desk: lateral = 6 grupos da prancha visual V4 (Hoje · Marketing & Comercial · Pessoas & Casos · Inteligência & Pesquisa · Formalização & Financeiro · Governança & Administração), em `SETORES_DESK_V5`, + pílulas das 13 superfícies (`SUPERFICIES_PRANCHA_V4`) — decidido pela Proprietária em 19/10/2026; `GRUPOS_DESK` (7) fica como registro histórico. App = 7 abas (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta); nenhuma tela/menu extra — por quê: decisão da Proprietária.
- Caso 360 = 8 seções (`SECOES`); admin vê o App só via `/app-cliente-como-pessoa?casoId=` — por quê: sem segundo mecanismo.
- App mostra só conteúdo sanitizado/aprovado/publicado; vazio honesto; nada inferido — por quê: privacidade e verdade.
- Editorial presentation refinements are scoped by the existing PortalShell to the requested official tabs; shared readers and global design tokens stay unchanged — why: isolate visual changes from Desk and unrelated tabs.
- Preservar a RPC `portal_sou_contratante_financeiro` e suas chamadas; não-contratante recebe só estado neutro quando `restritoAoContratante` — por quê: fatura pertence ao contratante.
- Autorização sempre em RLS/servidor; sem exclusão física; auditoria em mudanças — por quê: segurança real.
- Preservar `confirmarDocumentosMinimos` → `documentos_minimos_ok` (PR #85) — por quê: gate do portal.
- `painel-dia.tsx` × `golive-*` aguardam decisão; não tocar — por quê: fonte de verdade indefinida.
- Nada arquiva sem `COMPROVADO_EM_USO` com prints autenticados da Proprietária; build/teste não é prova — por quê: adendo 2026-09-10.
- Sem migration, RLS, convite, publicação, merge ou deploy sem autorização explícita — por quê: efeitos externos.
- As 5 etapas do caso (Diagnóstico→App Cliente) vêm só de `src/lib/etapas-caso.ts`, agrupando `case_activation_checks` existentes; nunca gate/tabela nova — por quê: uma regra para Caso 360, lista, Radar e Painel.
