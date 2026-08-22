/**
 * Decisão canônica já tomada pela Proprietária Administradora para o caso de Ana Luiza.
 * Este módulo apenas fixa apresentação e resolução de referência legada.
 * Não cria caso, não mescla registros, não altera dados operacionais e não executa ação externa.
 */

export const DECISAO_ANA_CANONICA = {
  caseId: "a11a0000-0000-4000-8000-000000000002",
  codigoCanonico: "CA-CID-AT-FAM-2026-001",
  nomeOperacional: "Projeto familiar — Ana Luiza",
  classificacao: "Piloto real",
  referenciaLegada: "CA-AUT-ANALUIZA-FAM-2026-001",
  /** Outros identificadores históricos preservados no mecanismo canônico de aliases. */
  outrasReferenciasLegadas: ["CA-2026-ANA-001"],
  status: "RESOLVIDO_POR_DECISAO_DA_PROPRIETARIA" as const,
  decididoEm: "2026-08-22",
  decididoPor: "Tatiana Melani Tosi — Proprietária Administradora",
  motivo: "Identificador canônico já definido na operação.",
  notaAuditoria: "Referência legada resolvida para CA-CID-AT-FAM-2026-001.",
} as const;

/** Todas as referências legadas que resolvem para o caso canônico. */
export const REFERENCIAS_LEGADAS_ANA: readonly string[] = [
  DECISAO_ANA_CANONICA.referenciaLegada,
  ...DECISAO_ANA_CANONICA.outrasReferenciasLegadas,
];

function normalizar(termo: string): string {
  return termo.trim().replace(/\s+/g, "").toUpperCase();
}

/** true quando o termo digitado é uma referência legada do caso de Ana Luiza. */
export function ehReferenciaLegadaAna(termo: string): boolean {
  const t = normalizar(termo);
  return REFERENCIAS_LEGADAS_ANA.some((r) => normalizar(r) === t);
}

/** true quando o termo é o código canônico. */
export function ehCodigoCanonicoAna(termo: string): boolean {
  return normalizar(termo) === DECISAO_ANA_CANONICA.codigoCanonico;
}

/**
 * Resolve qualquer referência (canônica ou legada) para o código canônico.
 * Retorna null quando o termo não pertence ao caso.
 */
export function resolverReferenciaAna(
  termo: string,
): { codigoCanonico: string; caseId: string; viaAlias: boolean; aliasUsado: string | null } | null {
  if (ehCodigoCanonicoAna(termo)) {
    return {
      codigoCanonico: DECISAO_ANA_CANONICA.codigoCanonico,
      caseId: DECISAO_ANA_CANONICA.caseId,
      viaAlias: false,
      aliasUsado: null,
    };
  }
  if (ehReferenciaLegadaAna(termo)) {
    const alias = REFERENCIAS_LEGADAS_ANA.find((r) => normalizar(r) === normalizar(termo)) ?? null;
    return {
      codigoCanonico: DECISAO_ANA_CANONICA.codigoCanonico,
      caseId: DECISAO_ANA_CANONICA.caseId,
      viaAlias: true,
      aliasUsado: alias,
    };
  }
  return null;
}

/** Rótulo exibido em telas operacionais: sempre o código canônico, nunca a referência legada. */
export function rotuloExibicaoAna(): { codigo: string; nome: string; selo: string } {
  return {
    codigo: DECISAO_ANA_CANONICA.codigoCanonico,
    nome: DECISAO_ANA_CANONICA.nomeOperacional,
    selo: DECISAO_ANA_CANONICA.classificacao,
  };
}

/** Linha de histórico/auditoria: preserva o código legado exatamente como recebido. */
export function linhaAuditoriaReferenciaLegada(codigoRecebido: string): string {
  return `${codigoRecebido} — ${DECISAO_ANA_CANONICA.notaAuditoria}`;
}

/** A divergência de ID não é pendência, bloqueio de go-live, exceção nem item de aprovação. */
export function divergenciaIdAnaEhBloqueio(): boolean {
  return false;
}
