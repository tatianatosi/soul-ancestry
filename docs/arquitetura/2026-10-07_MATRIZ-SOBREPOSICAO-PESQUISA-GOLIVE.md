# Matriz de sobreposição — Pesquisa / Go Live Pesquisa (item D, 07/10/2026)

Medido por leitura direta do código (rotas, `.functions.ts`, `.from("<tabela>")`),
não por documento anterior. Dez rotas reais no grupo Pesquisa hoje.

## Matriz

| Aba / rota | Backend (`.functions.ts`) | Tabelas reais | Sobrepõe com | Decisão |
|---|---|---|---|---|
| `/pesquisa` (lista) + `/pesquisa/$id` | `pesquisa.functions.ts` | `pesquisa` (tabela própria, legada), `evidencias`, `evidencia_acessos` | Conceitualmente com `/pesquisa-evidencias/$caseId`, mas em tabelas **diferentes** (`pesquisa`/`evidencias`, não `research_cases`/`research_evidence_items`) | **Classificar legado** — já diz na própria tela "repositório interno. Para o cliente ver o material, publique em Biblioteca de evidências". Nunca escreveu nas tabelas canônicas; não migrar dado, só deixar de ser porta de entrada nova |
| `/pesquisa-evidencias/$caseId` (hub, 9 abas) | `pesquisa-cadeia.functions.ts` + `documentos-solicitacoes.functions.ts` | `research_cases`, `research_people`, `research_relationships`, `research_evidence_items`, `research_sources`, `research_name_variants`, `research_pending_items`, `research_reports`, `genealogical_events`, `genealogical_findings`, `genealogical_relationships`, `lineage_paths`, `leads` | `pesquisa-modulo` (mesmas `research_evidence_items`/`research_name_variants`/`research_pending_items`/`research_reports`); `achados.$caseId` (mesma `research_evidence_items`); `biblioteca-evidencias` (mesma `research_people`/`genealogical_findings`) | **Manter — é o hub canônico.** As demais abas do grupo devem reusar os leitores/escritores daqui, nunca duplicar |
| `/pesquisa-modulo` (índice + `$id`) | `pesquisa-modulo.functions.ts` | `research_evidence_items`, `research_evidence_links`, `research_name_variants`, `research_pending_items`, `research_reports`, `genealogical_sources_catalog`, `quality_issues`, `research_audit_events` | **Overlap real e confirmado** com o hub acima em 4 tabelas (`research_evidence_items`, `research_name_variants`, `research_pending_items`, `research_reports`) | **Absorver no hub.** Hipóteses estruturadas (`research_case_hypotheses`, única coisa genuinamente exclusiva daqui) devem ganhar link direto do hub (já existe parcialmente, ver Fase 3 anterior desta sessão) em vez de telas separadas para as 4 tabelas em comum |
| `/achados/$caseId` | `achados-genealogicos.functions.ts` | `research_evidence_items`, `lineage_encounters`, `case_alerts`, `research_sources` | Mesma `research_evidence_items` do hub — **papel distinto**: aqui é o fluxo de "achado confirmado → vira entrega ao cliente", não duplicação de CRUD de evidência bruta | **Manter — função própria** (achado→microentrega), mas apontar para o hub como fonte de evidência, nunca recriar o CRUD de evidência aqui |
| `/biblioteca-evidencias/$caseId` | `biblioteca-evidencias.functions.ts` | `research_people`, `genealogical_findings`, `research_sources`, `app_projections`, `app_projection_shares`, `client_deliverables`, `case_services`, `evidence_validations`, `versioned_legal_rules`, `case_alerts` | Lê as mesmas pessoas/achados do hub; escreve só nas tabelas de **publicação ao cliente** (`app_projections`/`client_deliverables`) | **Manter — camada de publicação**, função própria (sanitização + projeção), não duplica pesquisa bruta |
| `/biblioteca` | `biblioteca-mestre.functions.ts` | `genealogical_sources_catalog`, `master_library_items`, `master_library_state_events`, `citizenship_tracks`, `product_catalog`, `controlled_taxonomies`, `versioned_legal_rules` | Governança/catálogo — toca `genealogical_sources_catalog` em comum com item F | **Manter — camada de governança**, não é pesquisa de caso |
| `/biblioteca-mensagens` | `message-library.functions.ts`, `consolidacao-catalogos-templates.ts`, `fiacao-cadencia-catalogo.ts` | Templates de mensagem — fora do domínio de pesquisa genealógica | Nenhum overlap com pesquisa | **Manter — domínio diferente** (CRM/comunicação), só está no mesmo grupo de navegação |
| `/golive/pesquisa` | `golive-escritores.functions.ts` (módulo amplo, não exclusivo de pesquisa) | `research_cases`, `research_sources`, `genealogical_findings` (+ dezenas de tabelas comerciais/financeiras alheias à pesquisa) | Mesmas `research_cases`/`genealogical_findings` do hub, mas side-by-side com escrita comercial (contratos, faturas) | **Classificar legado para pesquisa especificamente** — é a superfície "Go Live" de transição; a parte de pesquisa deveria ler do hub, não ter caminho de escrita próprio. Não tocar a parte comercial/financeira (fora de escopo) |
| `/plano-acao/$caseId` | `plano-acao-pesquisa.functions.ts` | `research_action_plan_items` (exclusiva) | Nenhum — tabela própria, sem overlap | **Manter.** CRUD já completo (`EditarPlanoAcao`, 03/10/2026, Corte ÓRFÃOS onda 1 — `salvarItemPlano`/`salvarInstituicao`/`salvarEstimativa`/`arquivarRegistroG07`, testado em `corte-orfaos-onda1-pesquisa-2026-10-03.test.ts`) |

## Achado central

O overlap real e acionável está entre **`/pesquisa-evidencias/$caseId`** (hub canônico) e
**`/pesquisa-modulo`**: 4 tabelas em comum (`research_evidence_items`,
`research_name_variants`, `research_pending_items`, `research_reports`), dois
`.functions.ts` diferentes podendo gravar na mesma linha por caminhos
diferentes. `/pesquisa` (legado) está isolado por tabela própria — não é
risco de escrita dupla, só confusão de navegação (já mitigada pelo próprio
aviso na tela).

## O que já estava feito (não redescoberto como pendência)

- **Plano de ação**: CRUD completo, 03/10/2026 (`EditarPlanoAcao`,
  `salvarItemPlano`/`salvarInstituicao`/`salvarEstimativa`/
  `arquivarRegistroG07`), testado em
  `corte-orfaos-onda1-pesquisa-2026-10-03.test.ts`.
- **Hipóteses estruturadas**: já linkadas do hub (Fase 3, sessão anterior).
- **"Novos tipos de relatório" — já existem, numa tabela diferente da que o
  pedido presumia.** Há duas tabelas de relatório, não uma:
  - `research_reports` (CHECK: `internal_progress`/`internal_findings`/
    `client_summary_draft`/`client_summary_approved`/`delivery_internal`) —
    hoje só com 1 escritor (`gerarResumoEstruturado`, `pesquisa-modulo.functions.ts`),
    sempre `internal_findings`, conteúdo auto-compilado.
  - **`case_reports`** (`relatorios-fase.functions.ts` + `/relatorios-fase/$caseId`,
    linkado do hub de pesquisa) — CRUD completo e já testado (P5, 26/09/2026):
    `salvarRelatorioFase` (criar/editar), `arquivarRelatorioFase`,
    `vincularEvidenciaRelatorio`, `vincularMicroentregaRelatorio`,
    `projetarRelatorioParaApp` (rascunho, nunca publica sozinho). Vocabulário
    `TIPOS_RELATORIO`: **F1 (Diagnóstico) · F2 (Pesquisa/Evidências) · F3
    (Prontidão Documental) · F4 (Protocolo) · F5 (Conclusão) · MEM_LEGADO**.
  - Isso já cobre "relatório de fase" (literal) e "relatório de achado"
    (F2, que consolida pesquisa + evidências — o mesmo conceito). **"Relatório
    diário" não tem equivalente claro em nenhuma das duas tabelas** — nenhum
    dos dois vocabulários nomeia cadência diária, e inventar um tipo novo sem
    especificação do que um relatório diário conteria (que F1-F5 não já
    cobre) seria exatamente o "requisito sem critério de aceite" que o
    `AGENTS.md` veta. Fica **declarado**, não fabricado: se for mesmo
    necessário, precisa de conteúdo mínimo especificado por você antes de
    virar código.
  - "Encontros de linhagem": já é `lineage_encounters`, escrito por
    `achados-genealogicos.functions.ts#salvarEncontro`, wired em
    `/achados/$caseId`. Nada a fazer.
- `evidencia_acessos`/`evidencias`/`pesquisa` (tabelas legadas): confirmado
  zero escrita nova desde a reconciliação de evidência canônica (Corte 0/1a).

## O que fica declarado, não executado nesta rodada

Fundir fisicamente os dados de `/pesquisa-modulo` com o hub (migrar linhas,
apagar tabela/rota) é decisão de arquitetura — risco de perder histórico de
auditoria em duas telas que hoje coexistem. Fica como próximo corte, não
como fusão silenciosa de dado.
