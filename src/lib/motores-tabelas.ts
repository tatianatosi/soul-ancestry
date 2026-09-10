/**
 * Motores primordiais P0–P11 (PROMPT-MESTRE-MOTORES-A-IMPLANTAR) e
 * arquitetura das PRs #30–#84 → tabelas que já existem.
 *
 * Não cria `onboarding_runs`, `cadence_runs`, `citizenship_cases`,
 * `case_participants` nem vocabulário CHECK novo. A série CA02–CA24 em
 * `main` ligou pedaços; não substitui os prompts #30–#84 que ainda não
 * rodaram como motor.
 */

export type EstadoMotor = "operando" | "parcial" | "planta";

export const MOTORES_TABELAS = [
  {
    id: "P0",
    motor: "P0 — Autoridade operacional e persistência",
    estado: "operando" as EstadoMotor,
    prs: ["#31", "#34", "#39", "#44"],
    tabelas: ["crm_casos", "clientes", "tarefas", "contracts", "proposals"] as const,
    naoCriar: [] as const,
  },
  {
    id: "P1",
    motor: "P1 — Caso canônico, núcleo e participantes",
    estado: "parcial" as EstadoMotor,
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
    id: "P2",
    motor: "P2 — Contrato, proposta e Ordem de Serviço",
    estado: "parcial" as EstadoMotor,
    prs: ["#35", "#40", "#41", "#53"],
    tabelas: ["contracts", "proposals", "service_orders", "contract_case_parameters"] as const,
    naoCriar: [] as const,
  },
  {
    id: "P3",
    motor: "P3 — Tarefa, próxima ação e cadência",
    estado: "parcial" as EstadoMotor,
    prs: ["#32", "#75", "#76", "#80"],
    tabelas: ["tarefas", "crm_casos", "case_plans", "case_alerts"] as const,
    naoCriar: ["cadence_runs"] as const,
  },
  {
    id: "P4",
    motor: "P4 — Onboarding real",
    estado: "parcial" as EstadoMotor,
    prs: ["#75", "#81"],
    tabelas: ["onboarding_planos", "crm_casos", "tarefas", "client_deliverables"] as const,
    naoCriar: ["onboarding_runs"] as const,
  },
  {
    id: "P5",
    motor: "P5 — Pesquisa, documentos e evidências",
    estado: "parcial" as EstadoMotor,
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
    id: "P6",
    motor: "P6 — Micro-entregas, App Cliente e portal",
    estado: "parcial" as EstadoMotor,
    prs: ["#66", "#72", "#73", "#76", "#78", "#81"],
    tabelas: ["client_deliverables", "ops_microentregas", "app_projections"] as const,
    naoCriar: ["micro_deliveries"] as const,
  },
  {
    id: "P7",
    motor: "P7 — Comercial, financeiro e catálogo",
    estado: "parcial" as EstadoMotor,
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
    id: "P8",
    motor: "P8 — Marketing, conteúdos e conversão",
    estado: "parcial" as EstadoMotor,
    prs: ["#48", "#54", "#56", "#58"],
    tabelas: ["leads", "crm_casos"] as const,
    naoCriar: [] as const,
  },
  {
    id: "P9",
    motor: "P9 — Cockpit de indicadores e alertas",
    estado: "parcial" as EstadoMotor,
    prs: ["#55", "#84"],
    tabelas: ["case_alerts", "crm_casos"] as const,
    naoCriar: [] as const,
  },
  {
    id: "P10",
    motor: "P10 — Integrações externas e escala",
    estado: "planta" as EstadoMotor,
    prs: [] as string[],
    tabelas: ["communication_queue", "invoices", "payments"] as const,
    naoCriar: [] as const,
  },
  {
    id: "P11",
    motor: "P11 — Revisão visual e marca",
    estado: "parcial" as EstadoMotor,
    prs: ["#91"] as string[],
    tabelas: [] as const,
    naoCriar: [] as const,
  },
] as const;

export type MotorTabela = (typeof MOTORES_TABELAS)[number];

/** Ordem obrigatória do prompt-mestre: não pular fase. */
export const ORDEM_MOTORES_PRIMORDIAIS = [
  "P0",
  "P1",
  "P2",
  "P3",
  "P4",
  "P5",
  "P6",
  "P7",
  "P8",
  "P9",
  "P10",
  "P11",
] as const;

export const ROTULO_ESTADO_MOTOR: Record<EstadoMotor, string> = {
  operando: "Operando",
  parcial: "Parcial",
  planta: "Planta",
};

/** O Planejador de Cidadania 0–8 não é um 13º P: mora em P7, nas tabelas já existentes. */
export const MOTOR_CIDADANIA_SOB = "P7";
