/**
 * PROJEÇÃO DA ÁRVORE NO APP CLIENTE (CA-UX-01.4)
 *
 * O Desk mantém notas internas, evidências, fontes, hipóteses e riscos.
 * O App Cliente recebe SOMENTE nomes e datas explicitamente aprovados e
 * publicados. Esta função é a única porta autorizada dessa projeção.
 *
 * Nada aqui dispara pesquisa externa, OCR, IA, mensagem, contrato ou
 * publicação automática: a projeção só reflete o que um humano já aprovou.
 */

/** Estados de projeção que autorizam exibição ao cliente. */
export const PROJECAO_AUTORIZADA = ["autorizado", "publicado"] as const;

/** Campos internos que nunca podem atravessar a barreira do App Cliente. */
export const CAMPOS_INTERNOS_BLOQUEADOS = [
  "hipotese",
  "hypothesis",
  "evidencia",
  "evidence",
  "fonte",
  "source",
  "risco",
  "risk",
  "nota_interna",
  "internal_notes",
  "confidence_level",
  "workflow_status",
  "sku",
  "preco",
  "price",
  "relatorio_nao_publicado",
] as const;

export type PessoaInterna = {
  id: string;
  canonical_name?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  /** Estado de projeção do registro no App Cliente. */
  client_projection_status?: string | null;
  [k: string]: unknown;
};

export type PessoaProjetada = {
  id: string;
  nome: string;
  /** Datas só aparecem quando confirmadas e aprovadas. */
  nascimento: string | null;
  falecimento: string | null;
};

function aprovada(p: PessoaInterna): boolean {
  return (PROJECAO_AUTORIZADA as readonly string[]).includes(
    String(p.client_projection_status ?? ""),
  );
}

function dataLimpa(v: unknown): string | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.slice(0, 10);
}

/**
 * Reduz pessoas internas à projeção mínima do cliente: nome e datas aprovadas.
 * Qualquer pessoa sem aprovação explícita é omitida — não é exibida "em cinza".
 */
export function projetarArvoreCliente(pessoas: PessoaInterna[]): PessoaProjetada[] {
  return pessoas
    .filter(aprovada)
    .filter((p) => typeof p.canonical_name === "string" && p.canonical_name.trim() !== "")
    .map((p) => ({
      id: p.id,
      nome: String(p.canonical_name).trim(),
      nascimento: dataLimpa(p.birth_date),
      falecimento: dataLimpa(p.death_date),
    }));
}

/** Verificação defensiva: nenhum campo interno pode estar no objeto projetado. */
export function projecaoLimpa(obj: Record<string, unknown>): boolean {
  const chaves = Object.keys(obj).map((k) => k.toLowerCase());
  return !CAMPOS_INTERNOS_BLOQUEADOS.some((c) => chaves.includes(c));
}
