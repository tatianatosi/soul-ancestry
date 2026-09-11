/**
 * Cadeia canônica Legado → Alimento → Planejador → Caso 360 → Desk.
 *
 * Contrato puro de autoridade (prompt v2.1 + decisão da Proprietária):
 * a Planilha Mestre e OPS nunca são lidas em runtime operacional.
 * Destino versionado da migração: `planner_catalog_feed` +
 * `price_catalog_rescued`. Catálogo comercial vivo: `product_catalog`.
 * Planejador (`case_plans`) orquestra o caso; não redefine preço final.
 *
 * Não grava, não homologa, não cobra, não comunica.
 */

/* ------------------------------------------------------------------ */
/* Cadeia de autoridade                                                */
/* ------------------------------------------------------------------ */

export const ELOS_CADEIA_CATALOGO = [
  "legado_inventariado",
  "lista_alimento_versionada",
  "catalogo_operacional_planejador",
  "caso_360",
  "desk_produz_valida_libera",
  "app_sanitizado",
  "whatsapp_comunica_liberado",
] as const;
export type EloCadeiaCatalogo = (typeof ELOS_CADEIA_CATALOGO)[number];

export const ROTULO_ELO_CADEIA: Record<EloCadeiaCatalogo, string> = {
  legado_inventariado: "LEGADO (Planilha Mestre / OPS / arquivos históricos) — inventário e migração única",
  lista_alimento_versionada: "lista-alimento versionada (`planner_catalog_feed` + `price_catalog_rescued`)",
  catalogo_operacional_planejador: "catálogo operacional do Planejador (produtos-pai + fase + trilha)",
  caso_360: "Caso 360 (`case_plans` + trilhas + itens + condição particular)",
  desk_produz_valida_libera: "Desk produz, valida e libera",
  app_sanitizado: "App Cliente mostra só valor autorizado/sanitizado",
  whatsapp_comunica_liberado: "WhatsApp comunica o que já foi liberado",
};

/** De–para prompt → entidade real (não inventar tabela). */
export const DE_PARA_ENTIDADES_CADEIA = {
  lista_alimento: "planner_catalog_feed",
  precos_resgatados: "price_catalog_rescued",
  catalogo_comercial_vivo: "product_catalog",
  caso_planejador: "case_plans",
  trilha_nacional: "citizenship_tracks",
  marco_juridico: "versioned_legal_rules + legal_reference_milestones",
  condicao_comercial: "commercial_conditions",
  microentrega: "ops_microentregas / client_deliverables",
  legado_planilha: "catalogo-fonte-mestre.ts + campos fonte_* (auditoria)",
} as const;

export const TABELAS_PROIBIDAS_INVENTAR = [
  "legacy_catalog_import",
  "legal_framework",
  "nationality_track",
  "micro_deliveries",
  "family_case",
  "country_catalog",
] as const;

/* ------------------------------------------------------------------ */
/* Fontes de runtime                                                   */
/* ------------------------------------------------------------------ */

/** Fontes que a operação diária / preço comercial pode consultar. */
export const FONTES_OPERACIONAIS_RUNTIME = [
  "product_catalog",
  "excecao_comercial_aprovada",
  "planner_catalog_feed",
  "price_catalog_rescued",
  "case_plans",
  "commercial_conditions",
  "citizenship_tracks",
  "versioned_legal_rules",
] as const;
export type FonteOperacionalRuntime = (typeof FONTES_OPERACIONAIS_RUNTIME)[number];

/** Nunca podem alimentar preço, proposta, link, CRM ou automação em runtime. */
export const FONTES_LEGADO_SOMENTE_INVENTARIO = [
  "planilha_mestre",
  "planilha_mestre_legado",
  "catalogo_fonte_mestre_ts",
  "ops_legado",
  "parametros_xlsx",
  "skus_referencia_xlsx",
] as const;
export type FonteLegadoInventario = (typeof FONTES_LEGADO_SOMENTE_INVENTARIO)[number];

export function fonteOperacionalPermitida(fonte: string | null | undefined): boolean {
  if (!fonte) return false;
  return (FONTES_OPERACIONAIS_RUNTIME as readonly string[]).includes(fonte);
}

export function ehFonteLegadoPlanilha(fonte: string | null | undefined): boolean {
  if (!fonte) return false;
  const f = fonte.toLowerCase();
  return (
    f === "planilha_mestre" ||
    f === "planilha_mestre_legado" ||
    f.includes("catalogo-fonte-mestre") ||
    f.includes("catalogo_fonte_mestre")
  );
}

/**
 * Gate explícito: qualquer tentativa de usar Planilha Mestre (ou snapshot TS)
 * como fonte operacional deve falhar — inventário/migração única apenas.
 */
export function proibirPlanilhaMestreRuntime(fonte: string | null | undefined): {
  permitido: false;
  motivo: string;
} | { permitido: true } {
  if (ehFonteLegadoPlanilha(fonte)) {
    return {
      permitido: false,
      motivo:
        "Planilha Mestre é legado inventariado — não pode ser lida em runtime para preço, proposta, link, CRM ou automação.",
    };
  }
  return { permitido: true };
}

/* ------------------------------------------------------------------ */
/* Estados de preço resgatado                                          */
/* ------------------------------------------------------------------ */

export const ESTADOS_PRECO_RESGATADO = [
  "REFERENCIA_RESGATADA",
  "CONDICAO_PARTICULAR_DE_CASO",
  "HOMOLOGADO_CATALOGO",
  "PENDENTE_DE_HOMOLOGACAO",
  "DIVERGENTE",
  "ARQUIVADO",
] as const;
export type EstadoPrecoResgatado = (typeof ESTADOS_PRECO_RESGATADO)[number];

/** Só este estado pode aparecer em oferta/canal/link (ainda exige product_catalog). */
export const ESTADOS_PRECO_EXPOSTOS_COMERCIALMENTE: readonly EstadoPrecoResgatado[] = [
  "HOMOLOGADO_CATALOGO",
];

/** Nunca viram preço de catálogo, CTA, link ou cobrança nesta fatia. */
export const ESTADOS_PRECO_BLOQUEADOS_EXPOSICAO: readonly EstadoPrecoResgatado[] = [
  "REFERENCIA_RESGATADA",
  "CONDICAO_PARTICULAR_DE_CASO",
  "PENDENTE_DE_HOMOLOGACAO",
  "DIVERGENTE",
  "ARQUIVADO",
];

export function podeExporPrecoComercialmente(status: string | null | undefined): boolean {
  return ESTADOS_PRECO_EXPOSTOS_COMERCIALMENTE.includes(status as EstadoPrecoResgatado);
}

export function bloqueiaExposicaoComercial(status: string | null | undefined): boolean {
  if (!status) return true;
  return ESTADOS_PRECO_BLOQUEADOS_EXPOSICAO.includes(status as EstadoPrecoResgatado);
}

export function motivoBloqueioExposicao(status: string | null | undefined): string {
  switch (status) {
    case "DIVERGENTE":
      return "Há referências incompatíveis — bloquear exposição/cobrança até validação.";
    case "PENDENTE_DE_HOMOLOGACAO":
      return "Estrutura sem valor comercial aprovado — sem CTA, link ou cobrança.";
    case "CONDICAO_PARTICULAR_DE_CASO":
      return "Valor válido só para o case_id/proposta correspondentes — não vira catálogo.";
    case "REFERENCIA_RESGATADA":
      return "Referência resgatada em revisão — não é oferta vigente.";
    case "ARQUIVADO":
      return "Valor arquivado — sem uso operacional.";
    case "HOMOLOGADO_CATALOGO":
      return "";
    default:
      return "Status de preço ausente ou desconhecido — bloquear exposição.";
  }
}

/* ------------------------------------------------------------------ */
/* Itens arquivados / proibidos no motor comercial                     */
/* ------------------------------------------------------------------ */

export const ITENS_ARQUIVADOS_DECISAO_PROPRIETARIA = ["CA-CURSO-001"] as const;

export function itemPermitidoEmRecomendacaoComercial(itemId: string | null | undefined): boolean {
  if (!itemId) return false;
  return !(ITENS_ARQUIVADOS_DECISAO_PROPRIETARIA as readonly string[]).includes(itemId);
}

/* ------------------------------------------------------------------ */
/* Gaps estruturais (não inventar nesta fatia)                         */
/* ------------------------------------------------------------------ */

export const GAPS_SCHEMA_PENDENTES = [
  {
    conceito: "legal_gate",
    classificacao: "PENDENTE_DE_DECISAO_PROPRIETARIA" as const,
    nota: "Gate estruturado por marco jurídico — hoje difuso em bloqueios-dicionario.",
  },
  {
    conceito: "research_base",
    classificacao: "PENDENTE_DE_DECISAO_PROPRIETARIA" as const,
    nota: "Base de pesquisa compartilhada multipaís — não criar tabela paralela sem decisão.",
  },
  {
    conceito: "family_branch",
    classificacao: "PENDENTE_DE_DECISAO_PROPRIETARIA" as const,
    nota: "Ramos familiares multipaís — usar nucleos_familiares / case_plans até decisão.",
  },
] as const;

export const CADEIA_CATALOGO_NUNCA_COBRA = true as const;
export const CADEIA_CATALOGO_NUNCA_LE_PLANILHA_RUNTIME = true as const;
