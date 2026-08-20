/**
 * VISIBILIDADE PROGRESSIVA DO APP CLIENTE (CA-UX-01.2)
 *
 * As 10 telas do App permanecem. Nenhuma tela é removida da navegação por
 * estado de dados: o que muda é o ESTADO exibido dentro da tela.
 * Nenhum prazo, data estimada ou juízo de mérito é gerado aqui.
 */

export type EstadoVisibilidade =
  | "always_available"
  | "available_empty"
  | "in_preparation"
  | "contracted_not_released"
  | "released"
  | "not_applicable"
  | "hidden_by_permission";

export const ESTADO_VISIBILIDADE_LABEL: Record<EstadoVisibilidade, string> = {
  always_available: "Disponível",
  available_empty: "Sem itens no momento",
  in_preparation: "Em preparação",
  contracted_not_released: "Contratada — ainda não liberada",
  released: "Disponível",
  not_applicable: "Não prevista no seu acompanhamento",
  hidden_by_permission: "Sem acesso",
};

export const ESTADO_VISIBILIDADE_TEXTO: Record<EstadoVisibilidade, string> = {
  always_available: "Esta área está disponível no seu acompanhamento.",
  available_empty: "Ainda não há itens publicados nesta área.",
  in_preparation: "Este conteúdo está em preparação pela equipe.",
  contracted_not_released: "Esta etapa faz parte do seu acompanhamento e será liberada quando estiver pronta.",
  released: "Conteúdo disponível para consulta.",
  not_applicable: "Esta etapa não está prevista no seu acompanhamento atual.",
  hidden_by_permission: "Seu acesso atual não inclui esta área.",
};

export type TelaApp =
  | "home"
  | "jornada"
  | "radar"
  | "arvore"
  | "docs"
  | "entrega"
  | "relatorio"
  | "fase02"
  | "biblio"
  | "conta";

export const TELA_APP_LABEL: Record<TelaApp, string> = {
  home: "Home",
  jornada: "Jornada",
  radar: "Radar",
  arvore: "Árvore",
  docs: "Documentos",
  entrega: "Entregas da Jornada",
  relatorio: "Fase 01",
  fase02: "Fase 02",
  biblio: "Legado",
  conta: "Conta",
};

/** Telas que nunca são ocultadas por estado de dados. */
export const TELAS_SEMPRE_DISPONIVEIS: TelaApp[] = [
  "home",
  "jornada",
  "radar",
  "arvore",
  "docs",
  "biblio",
  "conta",
];

export type EscopoCliente = {
  /** Tem acesso ao workspace do cliente. */
  temAcesso: boolean;
  /** Entregas aprovadas/released disponíveis (client_deliverables). */
  entregasLiberadas: number;
  /** Fase 01 contratada ou explicitamente liberada. */
  fase1Contratada: boolean;
  fase1Status: "em_preparacao" | "disponivel" | "entregue" | "nao_prevista";
  /** Escopo do case_service inclui pesquisa completa, assessoria ou entrega F2. */
  escopoIncluiFase2: boolean;
  fase2Status: "prevista" | "em_preparacao" | "disponivel" | "entregue" | "nao_aplicavel";
};

export type ResultadoVisibilidade = {
  tela: TelaApp;
  estado: EstadoVisibilidade;
  titulo: string;
  mensagem: string;
  /** A tela continua na navegação principal? Sempre true, exceto sem acesso. */
  navegavel: boolean;
  /** Nunca há CTA de upsell para quem já contratou pesquisa completa. */
  permiteUpsell: boolean;
};

function base(tela: TelaApp, estado: EstadoVisibilidade, mensagem?: string): ResultadoVisibilidade {
  return {
    tela,
    estado,
    titulo: ESTADO_VISIBILIDADE_LABEL[estado],
    mensagem: mensagem ?? ESTADO_VISIBILIDADE_TEXTO[estado],
    navegavel: estado !== "hidden_by_permission",
    permiteUpsell: false,
  };
}

export function visibilidadeTela(tela: TelaApp, escopo: EscopoCliente): ResultadoVisibilidade {
  if (!escopo.temAcesso) return base(tela, "hidden_by_permission");

  if (TELAS_SEMPRE_DISPONIVEIS.includes(tela)) {
    return base(tela, "always_available");
  }

  if (tela === "entrega") {
    if (escopo.entregasLiberadas > 0) return base(tela, "released");
    return base(
      tela,
      "available_empty",
      "Sua próxima entrega está em preparação.",
    );
  }

  if (tela === "relatorio") {
    if (!escopo.fase1Contratada || escopo.fase1Status === "nao_prevista") {
      return base(tela, "not_applicable", "A Fase 01 não está prevista no seu acompanhamento atual.");
    }
    if (escopo.fase1Status === "em_preparacao") return base(tela, "in_preparation");
    if (escopo.fase1Status === "disponivel" || escopo.fase1Status === "entregue") {
      return base(tela, "released");
    }
    return base(tela, "contracted_not_released");
  }

  if (tela === "fase02") {
    if (!escopo.escopoIncluiFase2 || escopo.fase2Status === "nao_aplicavel") {
      // Diagnóstico isolado: sem Fase 02 e sem upsell automático.
      return base(tela, "not_applicable", "A Fase 02 não está prevista no seu acompanhamento atual.");
    }
    if (escopo.fase2Status === "prevista") {
      return base(tela, "contracted_not_released", "A Fase 02 está prevista no seu acompanhamento.");
    }
    if (escopo.fase2Status === "em_preparacao") return base(tela, "in_preparation");
    return base(tela, "released");
  }

  return base(tela, "always_available");
}

export function visibilidadeCompleta(escopo: EscopoCliente): ResultadoVisibilidade[] {
  return (Object.keys(TELA_APP_LABEL) as TelaApp[]).map((t) => visibilidadeTela(t, escopo));
}

/* ---------------- Taxonomia de fases e entregas ---------------- */

export type TipoEntrega = "relatorio_f1" | "relatorio_f2" | "microentrega" | "proxima_acao";

export const TAXONOMIA_ENTREGA: Record<TipoEntrega, { rotulo: string; ehEntrega: boolean; nota: string }> = {
  relatorio_f1: { rotulo: "Relatório Fase 01", ehEntrega: true, nota: "Entrega robusta." },
  relatorio_f2: { rotulo: "Relatório Fase 02", ehEntrega: true, nota: "Entrega robusta." },
  microentrega: { rotulo: "Micro-entrega", ehEntrega: true, nota: "Card menor, exibido apenas após aprovação." },
  proxima_acao: { rotulo: "Próxima ação", ehEntrega: false, nota: "Não é entrega; não gera card em Entregas da Jornada." },
};

export function ehEntrega(tipo: TipoEntrega): boolean {
  return TAXONOMIA_ENTREGA[tipo].ehEntrega;
}

/** SKU técnico nunca aparece no App nem na timeline do cliente. */
export function nomeComercialParaCliente(entrada: {
  nomeComercial?: string | null;
  sku?: string | null;
  fase?: string | null;
}): string {
  const nome = (entrada.nomeComercial ?? "").trim();
  if (nome) return nome;
  return entrada.fase?.trim() || "Etapa do seu acompanhamento";
}

export function exponhaSku(_texto: string): never {
  throw new Error("SKU técnico não pode ser exposto ao App Cliente");
}

/* ---------------- Exemplos normativos ---------------- */

export const ESCOPO_ANA: EscopoCliente = {
  temAcesso: true,
  entregasLiberadas: 0,
  fase1Contratada: true,
  fase1Status: "em_preparacao",
  escopoIncluiFase2: true,
  fase2Status: "prevista",
};

export const ESCOPO_JOAO: EscopoCliente = {
  temAcesso: true,
  entregasLiberadas: 1,
  fase1Contratada: true,
  fase1Status: "disponivel",
  escopoIncluiFase2: true,
  fase2Status: "em_preparacao",
};

export const ESCOPO_DIAGNOSTICO_ISOLADO: EscopoCliente = {
  temAcesso: true,
  entregasLiberadas: 1,
  fase1Contratada: true,
  fase1Status: "entregue",
  escopoIncluiFase2: false,
  fase2Status: "nao_aplicavel",
};
