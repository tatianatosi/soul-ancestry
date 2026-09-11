# Inventário — prompts e docs da jornada D0–D365 / cadência / micro-entregas

Pedido da proprietária (2026-09-11): localizar tudo referente a jornada D0–D365, fluxo do cliente, cadência e micro-entregas — **é sistema, não indicador**.

Norma: `docs/politicas/ADENDO-JORNADA-D0-D365-E-SISTEMA-2026-09-11.md`.

## Núcleo normativo

1. Mapa D0–D365 Ana → universal — `docs/arquitetura/2026-09-03_MAPA-CADENCIAS-D0-D365-ANA-REGRA-UNIVERSAL.md`
2. De-para cadência × micro × planejador — `docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md`
3. De-para onboarding / jornada de vida — `docs/arquitetura/2026-09-03_DE-PARA-ONBOARDING-JORNADA-DE-VIDA-CADENCIA.md`
4. Consolidação 12 docs Drive — `docs/auditorias/2026-09-04-consolidacao-12-documentos-drive-cadencia-d0-d365.md`
5. Decisões canônicas (MVP D0–D30) — `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md`

## Operação / prompts de execução

- `docs/operacao/CA-OPS-01_Orquestracao_Jornada_CRM_Onboarding_Microentregas.md`
- `docs/operacao/CA-OPS-02_Fiacao_Cadencia_Mensagens_Alertas.md`
- `docs/operacao/CA-OPS-02_Matriz_Capacidades_Jornada.md`
- `docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md`
- `docs/politicas/PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md`
- `docs/politicas/CLUBE_ANCESTRAL_CRM_JOURNEY.md` (comercial / Calls — pré-D0)
- `docs/evolucao/recuperados/prompts-lovable-2026-08-31/PROMPT_MOTORES_UNIFICADOS_CRM_VIVO_ONBOARDING_CADENCIAS_INDICADORES.md`
- `docs/evolucao/recuperados/prompts-lovable-2026-08-31/CA_Planejador_Jornada_Microentregas_Touchpoints_SKU.md`
- `docs/evolucao/recuperados/prompts-lovable/CA-LOVABLE-ONBOARDING-JORNADA-v1.0.md`
- `docs/evolucao/recuperados/prompts-execucao-2026-09-11/Prompt_Cockpit_Desk_Indicadores_Cadencias_e_Acoes.md`

## Código que já materializa o sistema

| Peça | Arquivo |
|---|---|
| Régua D0–D30 | `src/lib/cadencia-d0-d30.ts` |
| Régua D31–D365 | `src/lib/cadencia-d31-d365.ts` |
| Orquestração | `src/lib/orquestracao-jornada.ts` |
| Painel Ops | `src/components/painel/painel-onboarding-jornada.tsx` |
| Caso — cadência | `src/components/caso/cadencia-d0-d30.tsx` (+ plano onboarding) |
| Writers | `onboarding_planos`, `case_plans`, `ops_microentregas`, `client_deliverables`, `tarefas` |

## Relatos de execução prévios

- `docs/relatorios/2026-09-09_ca05_cadencia_microentregas.md`
- `docs/relatorios/2026-09-09_consolidacao_jornada_checklists_gates_execucao.md`
- `docs/relatorios/2026-09-08_microentregas_desk_app_execucao.md`
- `docs/changelog/2026-08-23_CA-OPS-01.md` / `CA-OPS-02.md`

## O que não é o sistema

- Card/KPI sem deep link e sem escritor.
- WhatsApp automático D0–D30 (régua A, revogada).
- Tabelas inventadas (`cadence_runs`, `micro_entregas`, `crm_calls`).
