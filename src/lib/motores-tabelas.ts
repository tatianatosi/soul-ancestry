/**
 * Motores P0–P11 e arquitetura das PRs #30–#84 → tabelas que já existem.
 *
 * Não cria `onboarding_runs`, `cadence_runs`, `citizenship_cases`,
 * `case_participants` nem vocabulário CHECK novo. A série CA02–CA24 em
 * `main` ligou pedaços; não substitui os prompts #30–#84 que ainda não
 * rodaram como motor.
 */

export const MOTORES_TABELAS = [
  {
    motor: "P0 — autoridade e persistência",
    prs: ["#31", "#34", "#39", "#44"],
    tabelas: ["crm_casos", "clientes", "tarefas", "contracts", "proposals"] as const,
    naoCriar: [] as const,
  },
  {
    motor: "P1 — caso canônico, núcleo, participantes",
    prs: ["#30", "#32", "#36", "#51", "#64"],
    tabelas: [
      "crm_casos",
      "clientes",
      "nucleos_familiares",
      "nucleo_membros",
      "case_members",
      "case_dependents",
    ] as const,
    naoCriar: ["case_participants", "citizenship_cases"] as const,
  },
  {
    motor: "P2 — proposta, contrato, OS",
    prs: ["#35", "#40", "#41", "#53"],
    tabelas: ["contracts", "proposals", "service_orders", "contract_case_parameters"] as const,
    naoCriar: [] as const,
  },
  {
    motor: "P3 — tarefa, próxima ação, cadência",
    prs: ["#32", "#75", "#76", "#80"],
    tabelas: ["tarefas", "crm_casos", "case_plans", "case_alerts"] as const,
    naoCriar: ["cadence_runs"] as const,
  },
  {
    motor: "P4 — onboarding real",
    prs: ["#75", "#81"],
    tabelas: ["onboarding_planos", "crm_casos", "tarefas", "client_deliverables"] as const,
    naoCriar: ["onboarding_runs"] as const,
  },
  {
    motor: "P5 — pesquisa, documentos, evidências",
    prs: ["#84"],
    tabelas: [
      "research_cases",
      "research_people",
      "research_sources",
      "document_requests",
      "evidencias",
      "evidences",
    ] as const,
    naoCriar: [] as const,
  },
  {
    motor: "P6 — micro-entregas e App Cliente",
    prs: ["#66", "#72", "#73", "#76", "#78", "#81"],
    tabelas: ["client_deliverables", "ops_microentregas", "app_projections"] as const,
    naoCriar: ["micro_deliveries"] as const,
  },
  {
    motor: "P7 — catálogo, financeiro, planejador",
    prs: ["#50", "#59", "#61", "#62", "#63", "#68", "#79", "#82"],
    tabelas: [
      "product_catalog",
      "planner_catalog_feed",
      "planner_tarefas",
      "case_plans",
      "citizenship_tracks",
      "invoices",
      "payments",
    ] as const,
    naoCriar: ["catalog_product", "journey_instance"] as const,
  },
  {
    motor: "P8 — marketing e conversão",
    prs: ["#48", "#54", "#56", "#58"],
    tabelas: ["leads", "crm_casos"] as const,
    naoCriar: [] as const,
  },
  {
    motor: "P9 — cockpit e alertas",
    prs: ["#55", "#84"],
    tabelas: ["case_alerts", "crm_casos"] as const,
    naoCriar: [] as const,
  },
] as const;

export type MotorTabela = (typeof MOTORES_TABELAS)[number];
