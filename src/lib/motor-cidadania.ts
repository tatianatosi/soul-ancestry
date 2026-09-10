/**
 * Motor Planejador de Cidadania (PRs #61–#63) sobre tabelas que já existem.
 *
 * O prompt pedia `country_catalog` / 11 entidades novas: rejeitado (#59).
 * Fases 0–8 viram leitura + diagnóstico nas tabelas vivas. Não emite
 * parecer, não calcula % de elegibilidade, não grava preço em trilha.
 */

export const FASES_MOTOR_CIDADANIA = [
  {
    fase: 0,
    nome: "Leitura",
    tabelas: ["crm_casos"] as const,
    naoCriar: [] as const,
  },
  {
    fase: 1,
    nome: "Fundação (catálogo de países/trilhas)",
    tabelas: ["citizenship_tracks"] as const,
    naoCriar: ["country_catalog"] as const,
  },
  {
    fase: 2,
    nome: "Jurídico (marcos versionados)",
    tabelas: ["citizenship_tracks", "legal_reference_milestones"] as const,
    naoCriar: [] as const,
  },
  {
    fase: 3,
    nome: "Genealogia (pessoas, elos, evidências)",
    tabelas: [
      "research_people",
      "research_relationships",
      "research_case_events",
      "research_evidence_items",
    ] as const,
    naoCriar: [] as const,
  },
  {
    fase: 4,
    nome: "Avaliação (próxima ação, sem % de elegibilidade)",
    tabelas: ["case_plans", "tarefas"] as const,
    naoCriar: [] as const,
  },
  {
    fase: 5,
    nome: "Desk (painel no caso)",
    tabelas: ["crm_casos", "research_cases"] as const,
    naoCriar: [] as const,
  },
  {
    fase: 6,
    nome: "App Cliente (projeção sanitizada)",
    tabelas: ["client_deliverables", "app_projections"] as const,
    naoCriar: [] as const,
  },
  {
    fase: 7,
    nome: "Catálogo (consulta, sem preço no jurídico)",
    tabelas: ["product_catalog", "planner_catalog_feed"] as const,
    naoCriar: [] as const,
  },
  {
    fase: 8,
    nome: "Revisão humana / go-live",
    tabelas: ["legal_clause_matrix"] as const,
    naoCriar: [] as const,
  },
] as const;

export type SinalFaseCidadania = {
  trilhas: number;
  marcos: number;
  pessoas: number;
  evidencias: number;
  planoCaso: boolean;
  pesquisa: boolean;
  skuCatalogo: boolean;
};

export type LeituraFaseCidadania = {
  fase: number;
  nome: string;
  estado: "com_dado" | "sem_dado" | "planta";
  nota: string;
};

export function avaliarFasesMotorCidadania(s: SinalFaseCidadania): LeituraFaseCidadania[] {
  return FASES_MOTOR_CIDADANIA.map((f) => {
    if (f.fase === 0) {
      return { fase: 0, nome: f.nome, estado: "com_dado" as const, nota: "Caso canônico em crm_casos." };
    }
    if (f.fase === 1) {
      return {
        fase: 1,
        nome: f.nome,
        estado: s.trilhas > 0 ? "com_dado" : "sem_dado",
        nota: s.trilhas > 0 ? `${s.trilhas} trilha(s) em citizenship_tracks.` : "Nenhuma trilha catalogada.",
      };
    }
    if (f.fase === 2) {
      return {
        fase: 2,
        nome: f.nome,
        estado: s.marcos > 0 || s.trilhas > 0 ? "com_dado" : "sem_dado",
        nota: s.marcos > 0 ? `${s.marcos} marco(s) jurídico(s).` : "Trilha sem marco versionado ainda.",
      };
    }
    if (f.fase === 3) {
      return {
        fase: 3,
        nome: f.nome,
        estado: s.pessoas > 0 || s.evidencias > 0 ? "com_dado" : "sem_dado",
        nota: `${s.pessoas} pessoa(s) · ${s.evidencias} evidência(s) do módulo vivo.`,
      };
    }
    if (f.fase === 4) {
      return {
        fase: 4,
        nome: f.nome,
        estado: s.planoCaso ? "com_dado" : "sem_dado",
        nota: s.planoCaso
          ? "case_plans presente; próxima ação vem da RPC, sem % de elegibilidade."
          : "Sem case_plans neste caso.",
      };
    }
    if (f.fase === 5) {
      return {
        fase: 5,
        nome: f.nome,
        estado: s.pesquisa ? "com_dado" : "sem_dado",
        nota: s.pesquisa ? "research_cases ligado ao caso." : "Área de pesquisa ainda não preparada.",
      };
    }
    if (f.fase === 6) {
      return {
        fase: 6,
        nome: f.nome,
        estado: "com_dado" as const,
        nota: "App Cliente projeta próxima ação sanitizada; não mostra regra jurídica.",
      };
    }
    if (f.fase === 7) {
      return {
        fase: 7,
        nome: f.nome,
        estado: s.skuCatalogo ? "com_dado" : "sem_dado",
        nota: s.skuCatalogo
          ? "SKU confirmado em product_catalog."
          : "Catálogo ainda não confirmou o SKU deste caso.",
      };
    }
    return {
      fase: 8,
      nome: f.nome,
      estado: "planta" as const,
      nota: "Go-live jurídico continua revisão humana — o motor não decide sozinho.",
    };
  });
}

/** Título estável da tarefa da fase 4 — idempotente por caso. */
export const TITULO_TAREFA_AVALIACAO_CIDADANIA = "Planejador: avaliar próxima ação (fase 4)";
