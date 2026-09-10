/**
 * Motores primordiais P0–P11 (PROMPT-MESTRE-MOTORES-A-IMPLANTAR) e
 * arquitetura das PRs #30–#84 → tabelas que já existem.
 *
 * Não cria `onboarding_runs`, `cadence_runs`, `citizenship_cases`,
 * `case_participants` nem vocabulário CHECK novo. A série CA02–CA24 em
 * `main` ligou pedaços; não substitui os prompts #30–#84 que ainda não
 * rodaram como motor. P1 unifica núcleos com colunas já existentes
 * (archived_at / status arquivado); permanece parcial enquanto Pessoa 360
 * (#64) não existir.
 *
 * `rotaDesk` é a tela que executa o motor — a Biblioteca não é o produto.
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
    rotaDesk: "/casos" as const,
    oQueJaEscreve: "Toda escrita operacional passa por gravarComVerificacao / inserirComVerificacao.",
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
    rotaDesk: "/nucleos-duplicidades" as const,
    // Unificação de núcleos (fases 2–6) já grava em nucleos_familiares,
    // nucleo_membros e leads com colunas existentes. Pessoa 360 (#64) ainda
    // falta — por isso permanece parcial, não "operando".
    oQueJaEscreve:
      "Unificação controlada: reaponta nucleo_membros e leads.nucleo_id; arquiva a origem (archived_at, archive_motivo, archived_by, status arquivado). Sem coluna nova.",
  },
  {
    id: "P2",
    motor: "P2 — Contrato, proposta e Ordem de Serviço",
    estado: "parcial" as EstadoMotor,
    prs: ["#35", "#40", "#41", "#53"],
    tabelas: ["contracts", "proposals", "service_orders", "contract_case_parameters"] as const,
    naoCriar: [] as const,
    rotaDesk: "/contratos" as const,
    oQueJaEscreve:
      "Barra do instrumento: salvar rascunho, criar tarefa, enviar (com confirmação) e arquivar — todos gravam.",
  },
  {
    id: "P3",
    motor: "P3 — Tarefa, próxima ação e cadência",
    estado: "parcial" as EstadoMotor,
    prs: ["#32", "#75", "#76", "#80"],
    tabelas: ["tarefas", "crm_casos", "case_plans", "case_alerts"] as const,
    naoCriar: ["cadence_runs"] as const,
    rotaDesk: "/clientes" as const,
    oQueJaEscreve:
      "Após salvar a pessoa: criar tarefa no caso ou gravar sem_nova_acao_necessaria. A fila é /tarefas.",
  },
  {
    id: "P4",
    motor: "P4 — Onboarding real",
    estado: "parcial" as EstadoMotor,
    prs: ["#75", "#81"],
    tabelas: ["onboarding_planos", "crm_casos", "tarefas", "client_deliverables"] as const,
    naoCriar: ["onboarding_runs"] as const,
    rotaDesk: "/casos" as const,
    oQueJaEscreve:
      "Preparar plano grava checklist, plano de ação e tarefas dos gates. CTA cria ops_microentregas. Não ativa cliente.",
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
    rotaDesk: "/pesquisa-modulo" as const,
    oQueJaEscreve: "Módulo de pesquisa no caso e no Desk — evidências nas tabelas vivas.",
  },
  {
    id: "P6",
    motor: "P6 — Micro-entregas, App Cliente e portal",
    estado: "parcial" as EstadoMotor,
    prs: ["#66", "#72", "#73", "#76", "#78", "#81"],
    tabelas: ["client_deliverables", "ops_microentregas", "app_projections"] as const,
    naoCriar: ["micro_deliveries"] as const,
    rotaDesk: "/ops" as const,
    oQueJaEscreve: "Micro-entregas em Ops; App Cliente só vê o que foi sanitizado e publicado.",
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
    rotaDesk: "/casos" as const,
    oQueJaEscreve:
      "SKU só entra se product_catalog estiver homologado. Fase 4 do planejador pode criar tarefa de avaliação no caso.",
  },
  {
    id: "P8",
    motor: "P8 — Marketing, conteúdos e conversão",
    estado: "parcial" as EstadoMotor,
    prs: ["#48", "#54", "#56", "#58"],
    tabelas: ["leads", "crm_casos"] as const,
    naoCriar: [] as const,
    rotaDesk: "/conversao" as const,
    oQueJaEscreve: "Lead e conversão no Desk; código de achado WhatsApp grava no lead.",
  },
  {
    id: "P9",
    motor: "P9 — Cockpit de indicadores e alertas",
    estado: "parcial" as EstadoMotor,
    prs: ["#55", "#84"],
    tabelas: ["case_alerts", "crm_casos"] as const,
    naoCriar: [] as const,
    rotaDesk: "/qualidade" as const,
    oQueJaEscreve: "Alertas e radar interno leem crm_casos / case_alerts.",
  },
  {
    id: "P10",
    motor: "P10 — Integrações externas e escala",
    estado: "planta" as EstadoMotor,
    prs: [] as string[],
    tabelas: ["communication_queue", "invoices", "payments"] as const,
    naoCriar: [] as const,
    rotaDesk: "/integracoes" as const,
    oQueJaEscreve: "Fila de comunicação existe; envio continua gatilho humano. Sem escala automática.",
  },
  {
    id: "P11",
    motor: "P11 — Revisão visual e marca",
    estado: "parcial" as EstadoMotor,
    prs: ["#91"] as string[],
    tabelas: [] as const,
    naoCriar: [] as const,
    rotaDesk: "/biblioteca" as const,
    oQueJaEscreve: "Marca e navegação do Desk (8 grupos). Não é motor de dado.",
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
