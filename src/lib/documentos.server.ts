/**
 * Helpers server-only de documentos, consentimentos e privacidade.
 *
 * Regras de ouro: nenhum arquivo tem URL pública, todo download é auditado e
 * metadados de documento só aparecem para quem tem permissão de leitura.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Sb = any;

export const CATEGORIAS: Record<string, string> = {
  identificacao: "Identificação",
  certidao: "Certidão",
  documento_civil: "Documento civil",
  documento_financeiro: "Documento financeiro",
  contrato: "Contrato",
  evidencia_pesquisa: "Evidência de pesquisa",
  entrega_cliente: "Entrega ao cliente",
  interno: "Interno",
};

export const CATEGORIAS_SENSIVEIS = [
  "identificacao",
  "certidao",
  "documento_civil",
  "documento_financeiro",
];

export const SENSIBILIDADES: Record<string, string> = {
  normal: "Normal",
  sensivel: "Sensível",
  altamente_sensivel: "Altamente sensível",
};

export const VISIBILIDADES: Record<string, string> = {
  interno_restrito: "Interno restrito",
  equipe_do_caso: "Equipe do caso",
  cliente_quando_liberado: "Cliente quando liberado",
};

export const STATUS_DOCUMENTO: Record<string, string> = {
  pendente: "Pendente",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  liberado: "Liberado ao cliente",
  recusado: "Recusado",
  arquivado: "Arquivado",
};

export const TIPOS_CONSENTIMENTO: Record<string, string> = {
  tratamento_dados: "Tratamento de dados",
  compartilhamento_terceiros: "Compartilhamento com terceiros",
  comunicacoes: "Comunicações",
};

export const METODOS_COLETA: Record<string, string> = {
  portal: "Aceite no portal do cliente",
  assinatura_digital: "Assinatura digital",
  documento_assinado: "Documento assinado",
  gravacao_reuniao: "Registro em reunião gravada",
  email: "Confirmação por e-mail",
};

/** Papéis que podem enviar documentos. */
export const PAPEIS_UPLOAD = ["admin", "operacoes", "pesquisador", "comercial", "financeiro"];

export async function contextoDocumentos(supabase: Sb, userId: string) {
  const { data, error } = await supabase
    .from("staff_access")
    .select("organization_id,role,status")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data && data.status === "active") {
    return { organizationId: data.organization_id as string, papel: data.role as string };
  }
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!membro.data?.organization_id) throw new Error("Acesso interno não autorizado.");
  const papeis = await supabase
    .from("user_roles")
    .select("role")
    .eq("organization_id", membro.data.organization_id)
    .eq("user_id", userId) // 25/10/2026: só os papéis DESTA pessoa
    .is("archived_at", null); // 27/10/2026: papel arquivado não conta como ativo
  const lista = ((papeis.data ?? []) as { role: string }[]).map((p) => p.role);
  return {
    organizationId: membro.data.organization_id as string,
    papel: lista.includes("admin") ? "admin" : (lista[0] ?? "leitura"),
  };
}

/** Leitura só enxerga o que não é interno restrito. */
export function podeVerDocumento(papel: string, doc: Record<string, any>) {
  if (papel === "leitura") return doc["visibilidade"] !== "interno_restrito";
  return true;
}

/** Baixar interno restrito é privilégio de quem opera o caso, nunca de leitura. */
export function podeBaixarDocumento(papel: string, doc: Record<string, any>) {
  if (!podeVerDocumento(papel, doc)) return false;
  if (doc["visibilidade"] === "interno_restrito") {
    return ["admin", "operacoes", "pesquisador", "financeiro", "comercial"].includes(papel);
  }
  return true;
}

/** Caminho previsível e privado: nunca exposto sem assinatura temporária. */
export function caminhoArquivo(organizationId: string, casoId: string | null, nome: string) {
  const seguro = nome.replace(/[^\w.\-]+/g, "_").slice(-80);
  return `${organizationId}/${casoId ?? "sem-caso"}/${Date.now()}-${seguro}`;
}

/**
 * Decisão da Proprietária (09/09/2026) — "documento é individual por
 * padrão": categoria sensível exige titular explícito e finalidade
 * registrada. Nunca é inferido do contratante do caso nem deixado em branco.
 * Espelha a mesma trava que existe no banco (fn_documents_guard), num
 * formato que dá erro amigável antes de gastar uma chamada ao servidor.
 */
export function exigirTitularEFinalidadeSensivel(input: {
  categoria: string;
  clienteId?: string | null;
  finalidade?: string | null;
}): void {
  if (!CATEGORIAS_SENSIVEIS.includes(input.categoria)) return;
  if (!input.clienteId) {
    throw new Error("Documento de categoria sensível exige o titular (a pessoa a quem o documento pertence).");
  }
  if (!input.finalidade?.trim()) {
    throw new Error("Documento de categoria sensível exige a finalidade (para que ele foi recebido).");
  }
}

export function limparTexto(valor: unknown, max = 2000) {
  if (typeof valor !== "string") return null;
  const t = valor.trim();
  if (!t) return null;
  return t.slice(0, max);
}
