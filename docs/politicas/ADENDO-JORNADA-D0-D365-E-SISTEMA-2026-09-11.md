# Adendo — Jornada D0–D365 é sistema, não indicador (2026-09-11)

- Status: vigente
- Decisão da proprietária: cadência D0→D365, fluxo da jornada do cliente, micro-entregas e onboarding formam um **sistema operacional** atravessando o Desk; KPIs/contagens são leitura, não o produto.

## Norma

1. Datas D+ são **cadência de acompanhamento e alerta**. Não autorizam sozinhas assinatura, cobrança, portal, publicação, avanço de fase ou promessa ao cliente.
2. Marco liberado = gate cumprido + evidência persistida + aprovação humana quando exigida.
3. Fonte de verdade da jornada ativa: **caso** (`crm_casos`) + planejador (`case_plans` / `salvarPlanejadorOperacional`) + próxima ação canônica — não planilha mestre, não DRE, não Asaas legado.
4. Contador no Painel Hoje / Ops sem deep link para caso/onboarding/micro-entrega é **dívida de sistema** (indicador órfão).

## Inventário canônico (prompts e de-paras)

| Artefato | Papel |
|---|---|
| `docs/arquitetura/2026-09-03_MAPA-CADENCIAS-D0-D365-ANA-REGRA-UNIVERSAL.md` | Política: régua D0–D365 (Ana = piloto → regra universal) |
| `docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md` | De-para técnico micro-entregas × tabelas reais |
| `docs/arquitetura/2026-09-03_DE-PARA-ONBOARDING-JORNADA-DE-VIDA-CADENCIA.md` | Onboarding / fases / cadência (mecanismos A–H) |
| `docs/auditorias/2026-09-04-consolidacao-12-documentos-drive-cadencia-d0-d365.md` | Consolidação Drive + réguas A–F |
| `docs/operacao/CA-OPS-01_Orquestracao_Jornada_CRM_Onboarding_Microentregas.md` | Cadeia CRM → onboarding → cadência → micro → alertas → Hoje |
| `docs/operacao/CA-OPS-02_Fiacao_Cadencia_Mensagens_Alertas.md` | Fiação cadência / mensagens / alertas |
| `docs/operacao/CA-OPS-02_Matriz_Capacidades_Jornada.md` | Matriz de capacidades |
| `docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` | Prompt execução: motores + onboarding + cadências |
| `docs/politicas/PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md` | Cockpit: indicador só vale se abre ação |
| `docs/politicas/CLUBE_ANCESTRAL_CRM_JOURNEY.md` | Journey comercial (Calls/Discovery) — ver gap report |
| `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md` | Cadência MVP D0–D30 vigente |
| `docs/relatorios/2026-09-09_ca05_cadencia_microentregas.md` | Execução: 3 sistemas de micro-entrega distintos |
| `docs/evolucao/recuperados/prompts-lovable-2026-08-31/PROMPT_MOTORES_UNIFICADOS_CRM_VIVO_ONBOARDING_CADENCIAS_INDICADORES.md` | Prompt Lovable irmão |
| `docs/evolucao/recuperados/prompts-lovable-2026-08-31/CA_Planejador_Jornada_Microentregas_Touchpoints_SKU.md` | Planejador × micro × touchpoints |
| `src/lib/cadencia-d0-d30.ts` + `src/lib/cadencia-d31-d365.ts` | Norma em código (sem envio automático) |
| `src/lib/orquestracao-jornada.ts` | Motor puro CA-OPS-01 |
| `src/lib/onboarding-jornada.ts` (+ `.functions`) | Diagnóstico / painel Ops |

## Três mecanismos de “micro-entrega” (não misturar)

| Mecanismo | Tabela | Uso |
|---|---|---|
| Trabalho interno OPS | `ops_microentregas` | Desk Ops / SLA |
| Entrega cliente-facing | `client_deliverables` | Caso 360 → Jornada (publicação sanitizada) |
| Projeção App | `app_projections` | Biblioteca Mestre → portal |

Não criar `micro_entregas`, `cadence_runs`, `onboarding_runs`.

## Réguas (qual obedece)

| Régua | Status |
|---|---|
| A — WhatsApp automático D0–D30 | **Proibida / superada** |
| B — Cadência MVP D0–D30 (decisões canônicas) | **Vigente** (`cadencia-d0-d30.ts`) |
| F — Mapa D0–D365 Ana → universal | **Vigente como sistema** (`cadencia-d31-d365.ts` + mapa) |

Comunicação externa continua humana e aprovada (`PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA`).

## Superfícies Desk que devem operar o sistema

Hoje · Ops · Caso 360 (Onboarding/Jornada) · `/onboarding/$id` · Calls (pré-D0) · Pessoa 360 · Contratos (gates) · App Cliente (só conteúdo publicado).

Gap report comercial: `docs/relatorios/2026-09-11_gap-crm-journey-vs-app.md`.
