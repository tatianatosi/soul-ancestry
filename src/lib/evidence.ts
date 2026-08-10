import type { CaseData, EvidenceStatus, StatusCaso } from "@/types/case";

/**
 * Textos institucionais de fallback — nunca usar "erro", "sem dados",
 * "indefinido" ou "não encontrado" na interface da cliente.
 */
export const FALLBACK = {
  atualizacao: "Em atualização documental",
  aguardando: "Aguardando documento",
  referencia: "Referência localizada",
  validacao: "Em validação documental",
  proximaEtapa: "Nova etapa será liberada após a confirmação dos registros",
  semArquivo: "Ainda não há um arquivo associado a este item",
  semDescoberta: "A próxima descoberta será adicionada após a validação da pesquisa",
} as const;

/** Rótulo humano de cada status de evidência (linguagem para a cliente). */
export const EVIDENCE_LABEL: Record<EvidenceStatus, string> = {
  confirmado_documentalmente: "Confirmado por documento",
  referencia_localizada: "Referência localizada",
  relato_familiar: "Informação compartilhada pela família",
  pendente_validacao: "Em validação documental",
};

/** Tom visual por status de evidência (tokens da marca). */
export const EVIDENCE_TOM: Record<EvidenceStatus, string> = {
  confirmado_documentalmente: "border-sage/40 bg-sage/10 text-sage",
  referencia_localizada: "border-gold/50 bg-gold/15 text-navy",
  relato_familiar: "border-plum/30 bg-plum/10 text-plum",
  pendente_validacao: "border-terracotta/40 bg-terracotta/10 text-terracotta",
};

export const STATUS_CASO_LABEL: Record<StatusCaso, string> = {
  novo: "Cadastro iniciado",
  em_leitura: "Leitura da linha familiar",
  em_documentos: "Etapa documental",
  em_upgrade: "Próxima etapa apresentada",
};

/** Texto seguro: devolve o valor limpo ou o fallback institucional. */
export function texto(valor: string | null | undefined, fallback: string = FALLBACK.atualizacao): string {
  const v = (valor ?? "").trim();
  return v.length > 0 ? v : fallback;
}

/** Verdadeiro quando o campo tem conteúdo exibível. */
export function preenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  if (typeof valor === "number") return Number.isFinite(valor);
  if (Array.isArray(valor)) return valor.length > 0;
  return true;
}

/** Lista sem itens vazios. */
export function lista(itens: (string | null | undefined)[] | undefined): string[] {
  return (itens ?? []).map((i) => (i ?? "").trim()).filter((i) => i.length > 0);
}

/**
 * Referência de pesquisa exibida à cliente.
 * Com `dados_sensiveis_ocultos = true` nunca expõe URL ou ID.
 */
export function referenciaVisivel(
  pessoa: { familysearch_id?: string; familysearch_url?: string; status_evidencia: EvidenceStatus },
  ocultarSensiveis: boolean,
): string | null {
  const temRef = preenchido(pessoa.familysearch_id) || preenchido(pessoa.familysearch_url);
  if (!temRef) return null;
  if (ocultarSensiveis) return "Árvore de referência localizada";
  return `FamilySearch | ID ${pessoa.familysearch_id || "—"} | referência localizada`;
}

/** Aderência de rota — leitura interna de pesquisa, nunca confirmação jurídica. */
export function rotaLabel(caso: CaseData): string {
  return caso.rota.status_hipotese === "confirmado_documentalmente"
    ? texto(caso.rota.pais_principal, FALLBACK.validacao)
    : "Rota em validação documental";
}

/** Países com dados reais — usado para não renderizar cards vazios. */
export function paisesComAderencia(caso: CaseData): { pais: string; aderencia: number | null }[] {
  return [
    { pais: caso.rota.pais_principal, aderencia: caso.rota.aderencia_principal },
    { pais: caso.rota.pais_secundario, aderencia: caso.rota.aderencia_secundaria },
    { pais: caso.rota.pais_terciario, aderencia: caso.rota.aderencia_terciaria },
  ].filter((p) => preenchido(p.pais));
}
