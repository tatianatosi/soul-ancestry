/**
 * Ponte contextual de referências normativas (leitura).
 *
 * Regras invioláveis:
 * - Somente leitura: nada aqui cadastra, edita, homologa, ativa ou arquiva.
 * - Estar catalogada não torna a fonte ativa; a ponte apenas informa.
 * - Nenhum campo técnico (URL, credencial, custo, log) pode trafegar.
 * - Nada desta camada é projetado ao App Cliente.
 */

export type SituacaoReferencia = "homologada" | "em_revisao" | "arquivada" | "sem_referencia";

export const SITUACAO_ROTULO: Record<SituacaoReferencia, string> = {
  homologada: "Homologada",
  em_revisao: "Em revisão",
  arquivada: "Arquivada",
  sem_referencia: "Sem referência aplicável",
};

/** Campos que nunca podem ser expostos por esta ponte. */
export const CAMPOS_PROIBIDOS_NA_PONTE = [
  "url",
  "url_referencia_interna",
  "link",
  "endpoint",
  "credencial",
  "senha",
  "token",
  "autenticacao_necessaria",
  "custo",
  "preco",
  "contrato",
  "log",
  "acesso_log",
] as const;

export interface ReferenciaNormativa {
  id: string;
  origem: "biblioteca" | "bases" | "decisoes";
  /** Subárea de Governança que continua proprietária do cadastro. */
  subarea: string;
  titulo: string;
  tipo: string | null;
  escopo: string | null;
  situacao: SituacaoReferencia;
  versao: string | null;
  responsavel: string | null;
  trilha: string | null;
  /** Aviso explícito quando o registro é apenas catálogo, não fonte ativa. */
  apenasCatalogada: boolean;
  /** Por que o item foi considerado aplicável ao caso. */
  motivoAplicabilidade: string;
}

/** Bloqueia qualquer objeto que carregue campo técnico ou sensível. */
export function referenciaSegura(obj: Record<string, unknown>): boolean {
  return !Object.keys(obj).some((k) =>
    CAMPOS_PROIBIDOS_NA_PONTE.some((p) => k.toLowerCase().includes(p)),
  );
}

function norm(v: unknown): string {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export type ContextoNormativo = {
  pais?: string | null;
  trilhaId?: string | null;
};

/**
 * Aplicabilidade por dados já existentes: país/escopo ou trilha do caso.
 * Registro sem país e sem trilha é normativo geral e continua aplicável.
 */
export function aplicavelAoCaso(
  reg: { pais?: string | null; citizenship_track_id?: string | null },
  ctx: ContextoNormativo,
): { aplicavel: boolean; motivo: string } {
  if (reg.citizenship_track_id && ctx.trilhaId && reg.citizenship_track_id === ctx.trilhaId) {
    return { aplicavel: true, motivo: "Trilha do caso" };
  }
  if (reg.pais && ctx.pais && norm(reg.pais) === norm(ctx.pais)) {
    return { aplicavel: true, motivo: "País/escopo do caso" };
  }
  if (!reg.pais && !reg.citizenship_track_id) {
    return { aplicavel: true, motivo: "Referência normativa geral" };
  }
  return { aplicavel: false, motivo: "Fora do escopo do caso" };
}

/** Situação derivada de campos já existentes, sem inventar estado. */
export function situacaoDe(reg: {
  archived_at?: string | null;
  status?: string | null;
  ativo?: boolean | null;
}): SituacaoReferencia {
  if (reg.archived_at) return "arquivada";
  const s = norm(reg.status);
  if (["aprovado", "homologada", "homologado", "vigente", "ativo"].includes(s)) return "homologada";
  if (reg.ativo === false) return "em_revisao";
  return s ? "em_revisao" : "em_revisao";
}

/** Ordena por utilidade de leitura: homologadas primeiro, arquivadas por último. */
export function ordenarReferencias(itens: ReferenciaNormativa[]): ReferenciaNormativa[] {
  const peso: Record<SituacaoReferencia, number> = {
    homologada: 0,
    em_revisao: 1,
    arquivada: 2,
    sem_referencia: 3,
  };
  return [...itens].sort(
    (a, b) => peso[a.situacao] - peso[b.situacao] || a.titulo.localeCompare(b.titulo),
  );
}

export const VAZIO_BIBLIOTECA =
  "Nenhuma referência da Biblioteca Mestre vinculada ou aplicável ao contexto atual.";
export const VAZIO_BASES =
  "Nenhuma Base Genealógica homologada foi vinculada a este contexto de pesquisa.";
export const VAZIO_DECISOES = "Nenhuma decisão normativa vinculada a este caso.";
