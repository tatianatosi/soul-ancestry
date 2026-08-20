/**
 * Espelho executável das políticas RLS de `public.case_source_documents`.
 *
 * Serve para teste automatizado das negativas de acesso: leitura, inclusão,
 * edição e arquivamento de documentos de outros casos ou de outra organização.
 * Qualquer mudança nas policies do banco deve ser refletida aqui.
 */

export type Papel = "admin" | "operacoes" | "pesquisador" | "comercial" | "financeiro" | "leitura";

export const PAPEIS_CAN_WRITE: Papel[] = ["admin", "operacoes", "pesquisador", "comercial", "financeiro"];

export type Usuario = {
  userId: string;
  /** Organizações em que a pessoa é membro ativo com staff_access ativo. */
  organizacoes: string[];
  /** Papel por organização. */
  papeis: Record<string, Papel>;
};

export type Caso = {
  id: string;
  organizationId: string;
  responsavelId: string | null;
};

export type Documento = {
  id: string;
  organizationId: string;
  caseId: string;
  confidencialidade: "publico_interno" | "equipe_do_caso" | "restrito" | string;
};

export type Acao = "select" | "insert" | "update";

export type Veredito = { permitido: boolean; motivo: string };

const OK: Veredito = { permitido: true, motivo: "ok" };

function membro(u: Usuario, org: string) {
  return u.organizacoes.includes(org);
}

function papel(u: Usuario, org: string): Papel | null {
  return membro(u, org) ? (u.papeis[org] ?? null) : null;
}

/** public.can_write(_org) */
export function canWrite(u: Usuario, org: string): boolean {
  const p = papel(u, org);
  return p !== null && PAPEIS_CAN_WRITE.includes(p);
}

/** public.pode_pesquisar_caso(_case) */
export function podePesquisarCaso(u: Usuario, caso: Caso | undefined): boolean {
  if (!caso) return false;
  const org = caso.organizationId;
  const p = papel(u, org);
  if (p === null) return false;
  if (p === "admin" || p === "operacoes") return true;
  if (p === "pesquisador") return caso.responsavelId === u.userId;
  return canWrite(u, org);
}

/**
 * Avalia a policy correspondente à ação. `caso` é o caso do documento,
 * resolvido pelo `case_id` (undefined quando o caso não existe).
 */
export function avaliarAcessoDocumento(
  acao: Acao,
  u: Usuario,
  doc: Documento,
  caso: Caso | undefined,
): Veredito {
  if (!membro(u, doc.organizationId)) return { permitido: false, motivo: "FORA_DA_ORGANIZACAO" };
  if (!caso || caso.organizationId !== doc.organizationId) {
    return { permitido: false, motivo: "CASO_FORA_DA_ORGANIZACAO" };
  }
  if (!podePesquisarCaso(u, caso)) return { permitido: false, motivo: "SEM_ACESSO_A_ESTE_CASO" };

  if (acao === "select") {
    const p = papel(u, doc.organizationId);
    if (doc.confidencialidade === "restrito" && p !== "admin" && p !== "pesquisador") {
      return { permitido: false, motivo: "DOCUMENTO_RESTRITO" };
    }
    return OK;
  }

  if (!canWrite(u, doc.organizationId)) return { permitido: false, motivo: "PAPEL_SEM_ESCRITA" };
  return OK;
}

/** Arquivar é um UPDATE (não existe exclusão física). */
export function podeArquivarDocumento(u: Usuario, doc: Documento, caso: Caso | undefined): Veredito {
  return avaliarAcessoDocumento("update", u, doc, caso);
}

/** Não existe policy de DELETE: exclusão física é sempre negada. */
export function podeExcluirFisicamente(): Veredito {
  return { permitido: false, motivo: "EXCLUSAO_FISICA_PROIBIDA" };
}
