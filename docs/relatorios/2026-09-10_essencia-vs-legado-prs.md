# Essência vs legado — PRs aplicados × tentados (2026-09-10)

Inventário para Tatiana (tati@pluggedresearch.com). Verificado ao vivo com `gh pr list --state all --limit 100` no único repositório acessível (`tatianatosi/soul-ancestry`). Sem outros repos da org. Produção: `soul-ancestry.vercel.app` (mesmo SHA de `origin/main` na conferência de 06/09; `main` avançou desde então com a série CA de 09/09).

Branch deste trabalho: `cursor/pesquisa-alinhamento-busca-5d7b` (PR draft **#91**). Não reescreve histórico (Lovable).

---

## 1. Essência que permanece

Fonte primária de “essência”: tentativa Claude de **09/09/2026** (série CA02–CA24 em `main`) + prompts que ela executou. Distilado permanente: `AGENTS.md`, `.cursor/rules/clube-ancestral.mdc`, `docs/politicas/MEMORIA-PERMANENTE-CLUBE-ANCESTRAL-2026-09-10.md`.

O Clube Ancestral é **pesquisa genealógica operacional** — sistema de casos e jornadas — não CRM genérico, não site, não coleção de telas.

1. **Um caso** (`crm_casos`) é o eixo. Entidades distintas ligadas por IDs: Pessoa / Núcleo / Lead / Caso / Pesquisa / Contrato. App Cliente = projeção autorizada dos mesmos objetos.
2. Caso ativo responde: **próxima ação, quem, quando, o que bloqueia.** RPC `proxima_acao_prioritaria` / `_lote` (níveis 1–6, 8–9). Empacotamento único: `obterProximaAcaoCanonica`.
3. **Desk: 8 grupos** em `GRUPOS_DESK` — Visão Geral, Marketing, Comercial, Casos 360, Pesquisa, Contratos e financeiro, Cliente, Biblioteca Mestre. 8º = Cliente. Financeiro não é grupo. Administração no menu da conta.
4. **App Cliente: 7 abas**, nesta ordem: Home, Jornada, Radar, Árvore, Documentos, Legado, Conta. Sem Entregas / Fase 01 / Fase 02 como nav de primeiro nível.
5. Mapear para tabelas **já existentes**. Não inventar `case_participants`, `citizenship_cases`, nem vocabulário CHECK.
6. Mockup normativo: PDF de **17 páginas**. PDFs de 47 páginas / distorção = auditoria, não redesign.
7. Operável = fonte + escritor + persistência + consumidor + CTA + reload.
8. Política 05/09: para a proprietária, pendência **informa, não impede**; override auditado. PR **#85** mesclada: não regredir `documentos_minimos_ok`, convite/login, RLS.

Cadeia mínima (prompt mestre e CRM Vivo): lead → cliente → caso → plano → execução → evidência → comunicação → acompanhamento → encerramento.

---

## 2. Onde estão os prompts de ontem (09/09) e o que disseram

Não há pasta `.claude/` neste checkout. A tentativa de ontem **não foi um dump órfão**: está em `origin/main` (tip `18e33a7b`, CA24B). Relatórios de execução em `docs/relatorios/2026-09-09_*.md`.

| Onde | O que é | O que diz (essência) |
|---|---|---|
| `docs/politicas/PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md` | Prompt-mãe dos motores (P0–P11), destino Claude Code | Um `case_id`, uma jornada, uma próxima ação; RLS intacta; não tratar tela/mock como prova |
| `docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` | CRM vivo / seção 3.4 | Uma próxima ação por caso; origem da RPC SQL de 05/09 |
| `docs/politicas/PROMPT-REVISAO-MOTORES-E-CASO-360.md` | Revisão-mãe da cadeia (R00–R07), destino Claude Code | Mapear cadeia lead→portal contra persistência real; não criar tabela nova na revisão |
| `docs/politicas/P0-AUTORIDADE-OPERACIONAL-PERSISTENCIA-PROXIMA-ACAO.md` | P0 de 30/08, ainda vigente | editar → salvar → confirmar linha → reler → próxima ação → reload |
| `docs/politicas/fonte-de-verdade-design-e-execucao.md` | Decisão da proprietária **criada em 09/09** | Mockup 17 p. normativo; planejador = planejamento ativo; legado não dirige ops |
| Relatórios `2026-09-09_ca02` … `ca24` + limpezas | Execução Claude de ontem | CA03 pessoa única; CA04 Caso 360 (6 campos / 6 ações); CA18 próxima ação canônica também em `/ops`; CA19–CA23 ligar o que já existia; CA24 consistência App (parcial) |
| `docs/relatorios/2026-09-09_confirmacao_dez_declaracoes_canonicas.md` | 10 declarações da proprietária, conferidas ontem | Planejador = produtos-pai; Planilha Mestre = legado; SKU não bloqueia; `proxima_acao_prioritaria` = 1 ação/caso; `client_deliverables` ≠ conteúdo App automático |
| `docs/evolucao/recuperados/estudos-ux/HANDOFF_CLAUDE_CODE_todos_os_prompts.md` | Handoff mais antigo (finanças/Asaas/governança) | **Histórico.** Asaas como checkout é legado financeiro, não arquitetura atual |
| `docs/evolucao/recuperados/prompts-lovable-2026-08-31/PROMPT_CLAUDE_CODE_REVISAR_E_EXECUTAR_PROMPTS_ATE_1740.md` | Claude Code, 31/08 | Histórico de execução de prompts Lovable |
| Upload `ARTEFATO_CA-PENTE-FINO-…-010` | Dump de 05/09 (não é o prompt de ontem) | Operável só com as 6 provas; não vender migration/PR isolada como entrega |
| Branches `claude/ancestral-club-desk-intelligence-0gsoeg`, `claude/planejador-proposta-condicao-2026-09-08`, `claude/retomar-migracao-database-5fh7s4` | Experimentos Claude **não** em `main` como PR própria | Arquivar como tentativa; não dirigir ops |

Prompts Lovable em `docs/evolucao/recuperados/prompts-lovable/` e `…-2026-08-31/` são arquivo. Série original CA-01–CA-08: encerrada sem reabrir (`docs/evolucao/MANIFESTO_AUSENCIAS…`).

---

## 3. PRs — o que entrou em `main` vs o que só tentou

Total GitHub agora: **91 PRs** (#1–#91). Matriz 06/09 (`docs/auditorias/varredura-integral-2026-09-05/05-matriz-pr-000-a-090.md`) está **desatualizada** em três pontos: #28, #51 e #69 foram mescladas em 09/09; #91 nasceu nesta branch.

### Aplicado (código real em `main`)

Fundação e desbloqueio: **#1–#7, #9, #11–#24, #26–#29, #33–#34, #39, #44, #73, #77–#78, #85–#90**.

Entraram depois da matriz de 06/09:

| PR | Merge | O que de fato entrou |
|---|---|---|
| **#28** | 09/09 | Tela Contrato simplificada (antes constava “fechada sem merge”) |
| **#51** | 09/09 | Pessoa canônica via extensão de `clientes` |
| **#69** | 09/09 | Máscara CPF/CEP/UF/telefone |
| **#85** | 05/09 | App Cliente deixou de filtrar tudo; `documentos_minimos_ok`; TOP 30; persistência Comercial |
| **#86** | 05/09 | Pessoa 360 + gate Entregas/Fase 01/02 |
| **#87–#90** | 05/09 | Autoridade operacional da proprietária (UI + servidor) |

Série Claude **09/09 (CA02–CA24B)** não abriu PRs numeradas: foi commitada na recovery e **já está em `origin/main`** (até `18e33a7b`). Isso conta como **aplicado em main**, não como PR órfã.

Docs mesclados (não são motor): #8, #37–#38, #41, #43, #45–#46, #49.

### Tentado / não dirige `main`

**Abertas (quase todas draft, maioria só `docs/`):** #30, #32, #35–#36, #40, #42, #48, #50, #52–#84, **#91** (esta branch, draft).

Código aberto que **ainda não está em main** (não docs): #30 núcleos duplicados; #32 pessoa+tarefa; #35 reconciliação contratos; #40 botões contrato; #42 demo Giovanna; #48 WhatsApp→lead; #50 planilha mestre; #53–#54 perfil/lead; #66 visão do cliente; #68 SKU vivo; #74 rótulo piloto; #80 cadência D10/D14. Tratar como fila, não como arquitetura vigente — vários já foram absorvidos por outro caminho (ex. #66 vs CA06).

**Fechadas sem merge:** #10 (docs), #31 (gravação verificada — padrão chegou por outras PRs), #47 (leads arquivados), #83 (TOP 30 — código via #85).

**#25:** GitHub marca merged; na prática merge **reverso** (main → hotfix). Não trouxe hotfix para `main`.

`docs/politicas/README.md` ainda diz que `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` está “não iniciado”. **Falso hoje:** RPC + CA18 estão em main. O README de políticas é rastreador histórico, não o estado.

---

## 4. Arquivar como legado (não apagar dado vivo)

Não usar como premissa de ops, dashboard ou arquitetura:

- Matriz operacional antiga, planilha mestre, DRE, reconciliação Asaas como sistema.
- README raiz: protótipo visual de **6 abas** e KPIs fictícios (nota 24/08).
- Mockup Desk de 7 itens vs 8 grupos reais — divergência **já decidida** (manter 8).
- PDF auditoria 47 p. e PDF de distorção: auditoria visual, não briefing.
- Tabelas hipotéticas de prompts (`case_participants`, `citizenship_cases`, `onboarding_runs`, `cadence_runs`, `micro_deliveries` como tabela nova).
- Sistemas paralelos de evidência (documentar, não apagar): `evidencias` vs `evidences` vs `research_evidence_items`; rota `/pesquisa` (dossiê) vs `/pesquisa-modulo` (`research_cases`).
- `casos` vs eixo `crm_casos`; `microentregas` / `ops_microentregas` vs `client_deliverables`.
- Experimentos Claude em branches `claude/*` sem merge.
- COPY de Entregas/Fase 01/Fase 02/Faturas/Proposta como se fossem abas — dívida de copy, não taxonomia aprovada.
- PRs draft só de de-para (59–84 etc.): arquivo de estudo.

Legado segregável no schema: `legacy_record_links`.

---

## 5. O que este inventário aplica em código

Desk (Painel Hoje, Lista de Casos, Caso 360, `/ops`) **já** lê a RPC via `obterProximaAcaoCanonica` (CA18, 09/09). Faltava a **projeção autorizada no App Cliente** — Home e detalhe do caso narravam status genérico, sem a mesma ordem da RPC.

Nesta entrega: `src/lib/motor-caso.ts` (grafo Pessoa/Núcleo/Lead/Caso/Pesquisa/Contrato → tabelas reais; projeção cliente na ordem 4→6 da RPC, sem vazar tarefa interna). Consumidores: `portal-cliente.functions.ts`, Home `/portal`, detalhe do caso. Sem tabela nova, sem RPC no session do cliente (SECURITY DEFINER vaza título de `tarefas`).

---

## 6. Dívida que continua

- Fragmentação evidência / `casos` vs `crm_casos` / `/pesquisa` vs `/pesquisa-modulo`.
- Jornada do App ainda usa ritmo de publicação (`jornadaSanitizada`), não o motor.
- `COPY_TELAS.home.navegacao` ainda é “Início”; a barra usa `casos.navegacao` = “Home”.
- `case_phase_history` na migration, ausente de `types.ts`.
- Dezenas de PRs draft documentais abertas — fechar/arquivar com decisão humana.
- Homologação autenticada no browser (Supabase MCP desta sessão sem auth).
- Magic link de homologação: estrutural, não prova de clique (relatório 05/09).
