# De-Para — Motores Unificados / CRM Vivo: entidades propostas × o que já existe

```yaml
status: em revisão
versão: 1.1
data: 2026-09-03
projeto: Clube Ancestral
classificação: auditoria de arquitetura / de-para técnico
responsável pela decisão: Proprietária Administradora do Clube Ancestral
base normativa: docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md (984 linhas);
  docs/politicas/INVENTARIO-CONSOLIDADO-PROMPTS-FASES-2026-08-31.md (já classificou este
  prompt como "não iniciar como pacote monolítico" em 31/08);
  docs/auditorias/COTEJO-TELA-A-TELA-DESK-6-ABAS-INDICADORES-VIVOS-2026-09-02.md (PR #55);
  docs/operacao/CA-OPS-01_Orquestracao_Jornada_CRM_Onboarding_Microentregas.md (v1.1)
repositório: tatianatosi/soul-ancestry
fonte: leitura completa de PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md, cruzada contra schema real
  do Supabase e código real (src/lib/painel-dia.ts, indicadores-marketing.ts, crm-fluxo.ts,
  casos.$caseId.index.tsx, src/lib/orquestracao-jornada.ts) em 2026-09-03
correção v1.1: a proprietária apontou que o achado "motor de cadência não existe hoje" estava
  errado — o motor já existe (CA-OPS-01/02) e já trata microentregas e onboarding como parte
  da cadência, não como conceitos separados. Corrigido abaixo.
```

## Causa

"Pode e deve executar tanto o CRM Operação Viva como também os Motores Unificados CRM Vivo — já
havíamos pedido para ser executado antes." (2026-09-03)

Antes de escrever qualquer linha, este documento aplica o mesmo método já validado no motor de
cidadania (PRs #59–#63): mapear o que o prompt propõe contra o que já existe, para não repetir o
mesmo erro (criar tabelas novas que duplicam schema real já em produção).

## Achado central: o mesmo padrão do motor de cidadania se repete aqui

O prompt propõe ~39 entidades novas (seção 4) com nomes em inglês (`leads`, `clients`,
`citizenship_cases`, `proposals`, `contracts`, `receivables`, `product_skus`, `onboarding_templates`,
`cadence_actions`, `case_alerts`, `micro_deliveries`...). **A esmagadora maioria já existe em
produção, com dado real, sob nome em português:**

| Entidade proposta | Já existe como | Linhas reais |
|---|---|---|
| `leads` | `leads` | 7 |
| `clients` | `clientes` | 7 |
| `citizenship_cases` / `cases` | `casos` / `crm_casos` | 5 / 5 |
| `tasks` | `tarefas` / `planner_tarefas` | 9 / 63 |
| `proposals` | `proposals` | 6 |
| `contracts` | `contracts` + `contract_*` (10 tabelas) | 7 |
| `products` | `product_catalog` | 90 (⚠️ ver PR #62 — 31 grupos duplicados) |
| `product_skus` | `sku_catalog` — existe, **nunca populada** | 0 |
| `onboarding_templates` | `onboarding_templates` | 1 |
| `onboarding_runs`/`steps`/`actions` | `onboarding_planos`, `onboarding_checklist`, `onboarding_template_items` | 1 / 12 / 14 |
| `communication_templates`/`actions` | `message_templates`, `communication_queue` | 60 / 10 |
| `research_people`/`relationships`/`sources`/`document_requests`/`evidence`/`hypotheses` | mesmos nomes em português, já mapeados no de-para do motor de cidadania (PR #62) | 9 / 3 / 6 / 5 / 5 / 5 |
| `micro_deliveries` | `microentregas` | 6 |
| `case_alerts` | `case_alerts` | 4 |
| `content_calendar_items` | `editorial_content_items` | 15 |
| `marketing_campaigns` | `marketing_campaigns` | 0 (existe, vazia) |

Criar as ~39 tabelas propostas duplicaria schema real já em uso — o mesmo erro que o de-para do
motor de cidadania já identificou e que a proprietária já decidiu não repetir ("não precisamos de
mais tabelas e sim de reorganização no core").

## Caso 360 (seção 6 do prompt) — já parcialmente implementado

O cabeçalho e as abas que o prompt pede para `/casos/:caseId` já existem em boa parte em
`casos.$caseId.index.tsx`: seções "Visão geral", "Jurídico" (comercial/formalização/motor de
contrato), "Técnico e riscos" (país/via, hipótese/radar, riscos), "Pessoa e família", "Jornada",
"Registro de alterações" — e o botão **"Abrir visão do cliente"** que o prompt pede no cabeçalho
foi implementado agora mesmo, nesta sessão (PR #66). O que falta do cabeçalho proposto: botões
"Registrar atualização", "Criar tarefa" e "Mover fase" diretamente no cabeçalho (hoje existem como
ações dentro de seções específicas, não centralizadas no topo).

## Painel Hoje (seção 14) — já real, confirmado na PR #55

O cotejo tela a tela já confirmou, com evidência de código, que 4 dos 5 blocos centrais do Painel
Hoje já são reais: Vencidos, Vence hoje, Sem responsável, Exceções críticas (todos via
`painelHojeDesk`/`painel-dia.ts`), e Sinais de marketing/comunicação (via `indicadores-marketing.ts`).
O 5º (SLA em risco) já se declara corretamente ausente em vez de mentir com zero. **Este bloco do
prompt está, na prática, feito.**

## Indicadores reais (seção 13) — já real em boa parte, gaps específicos identificados

| Indicador do prompt | Situação real |
|---|---|
| Tarefas vencidas/de hoje, casos sem próxima ação, propostas aguardando resposta | ✅ já implementado, mesma lógica do Painel Hoje |
| Leads por origem, conversão lead→proposta→aceite→contrato | ✅ `carregarConversao`/`montarFunil` (`conversao-funil.ts`), confirmado na PR #55 |
| Receita contratada/recebida, saldo | ✅ `resultadoCaixa` (`/financeiro`), confirmado na PR #55 |
| CPL/CAC/ROI de mídia | ⚠️ fórmula existe, falta fonte real de investimento (`marketing_investments`, 0 linhas) — já registrado como gap real na PR #55 |
| Cadências em atraso/concluídas | ✅ **corrigido nesta revisão** — o motor de cadência orientado a evento (seção 3.3) já existe: `src/lib/orquestracao-jornada.ts` (CA-OPS-01/02), testado, wireado em `/biblioteca-mensagens` via `OrquestracaoContextual`/`CadeiaJornada`. Falta só ligar o indicador agregado ao Painel/Indicadores — não construir o motor |
| SLA de análise/pedido documental | ❌ gap real — não encontrado cálculo equivalente |
| Tempo até primeira micro-entrega | ❌ gap real |
| Produtos/SKUs vendidos | ⚠️ depende de `sku_catalog` (vazia) ou de reconciliar com `product_catalog` (duplicado) — mesmo gap já registrado na PR #62 |

## Correção (v1.1): onboarding e microentregas já são cadência, não conceitos separados

A proprietária corrigiu o achado original: "tanto microentregas como onboarding deveriam ser
interpretados e executados como cadência." Isso já é como o sistema real funciona — não é uma
mudança a fazer, é um fato já implementado que a v1.0 deste documento relatou errado.

`docs/operacao/CA-OPS-01_Orquestracao_Jornada_CRM_Onboarding_Microentregas.md` e
`src/lib/orquestracao-jornada.ts` (mesmo módulo, código real) já descrevem e implementam uma
única cadeia: **CRM → Onboarding → Cadência → Microentregas → Alertas → Painel Hoje**. Não são
motores separados: `planejarOnboarding()` já vincula a primeira microentrega ao acolhimento,
`publicarMicroentrega()` já recalcula a cadência do caso, e `fiarCadenciaDoCaso()` (CA-OPS-02) já
liga a cadência real de cada caso ao template vigente e à fila do Painel Hoje — a "cadeia completa
da jornada" de 11 elos (`ELOS_CADEIA`), testada (`ca-ops-01-orquestracao-jornada.test.ts`,
`ca-ops-02-orquestracao-contextual.test.ts`, `cadeia-jornada-*.test.ts`) e visível hoje em
`/biblioteca-mensagens` via `<OrquestracaoContextual>` → `<CadeiaJornada>`.

A "jornada" que explica onde a microentrega acontece para o cliente é exatamente essa cadeia —
não um documento à parte a ser lido isoladamente, e não um motor a construir do zero.

## O que é gap real (vale construir, sem tabela nova)

1. **Ligar o indicador agregado de cadência** ("cadências em atraso/concluídas") ao Painel/
   Indicadores, lendo `fiarCadenciaDoCaso()` por caso — o motor já existe, falta agregação e leitura
   nos indicadores.
2. **SLAs de documento e pesquisa**: cálculo sobre `research_document_requests`/`research_evidence_items`
   já existentes — falta a fórmula, não a tabela.
3. **`product_skus`/`case_products`**: já existe `sku_catalog` (vazia) e a ambiguidade com
   `product_catalog` (duplicado) — resolver isso é pré-requisito, já registrado na PR #62/#63, antes
   de calcular "produtos vendidos".
4. **Botões centralizados no cabeçalho do Caso 360** ("Registrar atualização", "Criar tarefa",
   "Mover fase") — mudança de UI, não de schema.

## Sobre o motor de cidadania (poucos dados reais hoje)

A proprietária confirmou: os números baixos (leads=7, clientes=7, casos=5 etc.) não são um gap a
"corrigir" — a maior parte dos dados será lançada diretamente na plataforma daqui para frente, não
migrada de planilha. Nenhuma ação de preenchimento ou seed é necessária por causa disso.

## Fora do escopo desta entrega

Nenhuma tabela criada, nenhuma migração executada. Este documento é o mapeamento — o mesmo método
já aplicado e aprovado para o motor de cidadania, agora aplicado ao CRM Vivo.

## Próximos passos (ordem sugerida, sem tabela nova)

1. Resolver a duplicação/ambiguidade de `product_catalog`/`sku_catalog` (já pendente da PR #62/#63) —
   pré-requisito para qualquer indicador de "produtos vendidos".
2. Centralizar os botões de ação do Caso 360 no cabeçalho (UI, baixo risco).
3. Ligar o indicador agregado de cadência (já calculado por `fiarCadenciaDoCaso()`) ao Painel/
   Indicadores — não é construir motor novo, é ler o que o CA-OPS-01/02 já deriva.
4. Calcular os SLAs de documento/pesquisa e "tempo até primeira micro-entrega" sobre as tabelas de
   pesquisa já existentes.
5. Confirmar com a proprietária se algum dos 39 nomes propostos deveria, mesmo assim, virar tabela
   nova por representar um conceito genuinamente ausente — nenhum foi identificado nesta varredura.
