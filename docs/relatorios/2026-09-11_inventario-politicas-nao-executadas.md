# Inventário — políticas / prompts não executados (2026-09-11)

Cruzamento de `docs/politicas/README.md`, adendos 2026-09-11, quadro PRs #1–#85 e código em `src/` nesta branch.

Fontes: [políticas main](https://github.com/tatianatosi/soul-ancestry/tree/main/docs/politicas) · [quadro PRs](https://github.com/tatianatosi/soul-ancestry/blob/claude/ancestral-club-desk-intelligence-0gsoeg/docs/relatorios/2026-09-05_quadro_completo_prs_1_ate_atual.md) · `ADENDO-PROMPTS-SAO-EXECUCAO` · `ESTRATEGIA-RESGATE-PRODUTO`.

## Legenda

| Prioridade | Significado |
|---|---|
| P0 | Trilha A — bloqueia operação diária Pessoa↔Caso↔Contrato |
| P1 | Trilha A/B — fecha cadeia ou indicadores mínimos |
| later | Trilha C / Cockpit / comunicação / visual — só depois do motor mínimo |

## Matriz

| Documento / pedido | Status reivindicado (README/quadro) | Gap real no código | Prioridade | Agora vs deferir |
|---|---|---|---|---|
| CA-PESSOA-360-UNIFICACAO-008 — nav Pessoa 360 em Leads, Contratos, Documentos, Pesquisa | Artefato de execução; Pessoa↔Caso parcialmente feito (2026-09-11) | Links em Propostas/Casos/Núcleos/Clientes existem; **faltavam** em Leads, Contratos, Documentos (privacidade), Pesquisa/evidências e Formalização preparar | P0 | **Executar agora** (esta fatia) |
| Pessoa 360 próxima ação + Caso→Pessoa | Adendo prompts — “prioridade agora” | Já entregue nesta PR (#101 fatia anterior) | P0 | Feito |
| Formalização simples + Canva | Adendo Canvas — Formalização | Banner Canva existe; faltava CTA explícito Pessoa 360 a partir de preparar/contratos | P0 | **Executar agora** (links) |
| `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO` — cadeia única | README: parcial | Módulos separados; writers existem; não unificar motor nesta rodada | P1 | Deferir — Trilha A nav primeiro |
| `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES` Fase 3 sync auto | README: Fase 2 parcial; sem `case_participants` | Sync `nucleo_membros`→`case_members` existe; sync automática contínua não | P1 | Deferir — não inventar tabela; sync auto = fatia própria |
| `PROMPT-COCKPIT-DESK-INDICADORES` | README + quadro: não iniciado | Zero rota Cockpit | later | Deferir — estratégia: depois Trilha A |
| `PROMPT-EIXO-COMUNICACAO` | README: só após cadeia comercial | Sem motor único | later | Deferir — próprio doc exige esperar |
| `TAXONOMIA` / P11 visual tela a tela | Não implementado (decisão) | Paleta parcial; nav 8 grupos OK | later | Deferir — Trilha C |
| `PROMPT-CORRECAO-ADMIN-VISAO-CLIENTE` | Parcial (caminho diferente) | 3/10 telas App; rota `admin_preview` literal ausente | P1 | Deferir — não bloquear Pessoa↔Caso |
| Quadro: PRs #41–#49 sobretudo docs | DOCS/AUDITORIA EM MAIN | Operacional ainda fragmentado | P0/P1 | Inventariar; executar só gaps Trilha A |
| Quadro: dezenas de PRs abertas sem merge (#30–#84 docs/fix) | ABERTA/DRAFT | Conteúdo pode estar em #85/#90/#101 ou morto | later | Deferir — não reabrir branch; cruzar item a item se necessário |
| Portal 7 abas (sem Entregas/Fase na barra) | Dívida declarada AGENTS | `portal-shell` ainda injeta extras | P1 | Deferir nesta rodada (outro agente/branch citado em AGENTS) |
| Indicadores Painel vs auditoria 47 + dedup | Trilha B | Parcial | P1 | Deferir — após nav Pessoa |
| Prova autenticada UI / Cliente A×B | Adendo prova | Não comprovado | P0 processo | Deferir — exige login proprietária |
| `lead_activities` / `micro_deliveries` / `cadence_runs` | README: faltam | Tabelas novas — **proibido inventar** nesta etapa | later | Deferir — reusar o que existe (`case_alerts`, `communication_queue`, `tarefas`) |

## Executado nesta sessão (código)

Ver relatório irmão e diff: navegação Pessoa 360 a partir de Leads (via `cliente_id` do caso), Contratos, Documentos/Privacidade, Pesquisa/evidências e Formalização preparar; enriquecimento de leitores existentes sem tabela nova.

## Próximo passo concreto após merge desta fatia

1. Fechar seta proposta→contrato na operação diária com prova de reload.  
2. Retirar Entregas/Fase 01/02 da barra do App Cliente.  
3. Só então Trilha B (indicadores) / Cockpit.
