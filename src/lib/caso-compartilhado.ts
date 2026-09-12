/**
 * Identidade compartilhada App Cliente ↔ Desk.
 *
 * Ordem 2 go-live: o único `caseId` de produto é `crm_casos.id` (UUID).
 * `codigo` é rótulo humano. Fixture demo e loaders portal/Desk passam por aqui
 * para não divergir o contrato de identidade.
 */

export type IdentidadeCaso = {
  /** PK canônica = `crm_casos.id`. */
  caseId: string;
  /** Código humano (ex. CA-ITA-…). Nunca substitui caseId. */
  codigo: string | null;
  titulo: string | null;
  /** Origem da leitura, só para auditoria de UI. */
  fonte: "crm_casos" | "portal_casos" | "demo";
};

export function identidadeDeCrmCaso(row: {
  id: string;
  codigo?: string | null;
  titulo?: string | null;
}): IdentidadeCaso {
  return {
    caseId: String(row.id),
    codigo: row.codigo ?? null,
    titulo: row.titulo ?? null,
    fonte: "crm_casos",
  };
}

export function identidadeDePortalCaso(row: {
  id: string;
  codigo?: string | null;
  titulo?: string | null;
}): IdentidadeCaso {
  return {
    caseId: String(row.id),
    codigo: row.codigo ?? null,
    titulo: row.titulo ?? null,
    fonte: "portal_casos",
  };
}

export function identidadeDeDemo(row: {
  caseId: string;
  codigo: string;
  titulo: string;
}): IdentidadeCaso {
  return {
    caseId: row.caseId,
    codigo: row.codigo,
    titulo: row.titulo,
    fonte: "demo",
  };
}

/** Mesmo caso? Compara só o UUID canônico. */
export function mesmoCaso(a: IdentidadeCaso, b: IdentidadeCaso): boolean {
  return a.caseId === b.caseId;
}
