/**
 * Helpers server-only do espaço do cliente (portal).
 *
 * Regras invioláveis:
 * - toda leitura passa pelo client autenticado do próprio usuário (RLS decide),
 *   nunca pelo client administrativo;
 * - o client administrativo só é usado para gerar URL temporária de arquivo,
 *   depois de a leitura autorizada já ter sido validada por RLS;
 * - linguagem simples: nada de jargão interno, nenhuma promessa de resultado.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Sb = any;

export const BUCKET_DOCUMENTOS = "documentos";

/** Tradução do status interno do caso para linguagem simples ao cliente. */
export const STATUS_SIMPLES: Record<string, { rotulo: string; texto: string }> = {
  em_analise: { rotulo: "Em análise", texto: "Estamos analisando as informações do seu caso." },
  aguardando_documento: {
    rotulo: "Aguardando documento",
    texto: "Precisamos de documentos seus para seguir com o trabalho.",
  },
  em_andamento: { rotulo: "Em andamento", texto: "O trabalho está em execução pela equipe." },
  pausado: { rotulo: "Pausado", texto: "O caso está temporariamente pausado. A equipe entra em contato." },
  concluido: { rotulo: "Concluído", texto: "A etapa contratada foi concluída." },
};

/**
 * Converte o estado interno em um dos cinco rótulos simples acordados.
 * Nunca devolve status interno bruto para o cliente.
 */
export function statusSimples(caso: Record<string, any>, pendenciasDocumento: number) {
  const bruto = String(caso["status"] ?? "").toLowerCase();
  if (["pausado", "suspenso", "em_pausa"].includes(bruto) || caso["suspenso_em"]) return STATUS_SIMPLES["pausado"]!;
  if (["concluido", "encerrado", "finalizado", "entregue"].includes(bruto)) return STATUS_SIMPLES["concluido"]!;
  if (pendenciasDocumento > 0) return STATUS_SIMPLES["aguardando_documento"]!;
  if (caso["ativo"] === true || ["ativo", "em_execucao", "em_andamento"].includes(bruto)) {
    return STATUS_SIMPLES["em_andamento"]!;
  }
  return STATUS_SIMPLES["em_analise"]!;
}

export const STATUS_SOLICITACAO: Record<string, string> = {
  aguardando: "Aguardando envio",
  recebido: "Recebido",
  em_revisao: "Em revisão",
  aceito: "Aceito",
  recusado: "Precisa reenviar",
  cancelado: "Cancelado",
};

export const STATUS_TICKET: Record<string, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  respondido: "Respondido",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

export const CATEGORIAS_TICKET: Record<string, string> = {
  duvida: "Dúvida",
  documento: "Documento",
  prazo: "Prazo",
  financeiro: "Financeiro",
  outro: "Outro",
};

export const STATUS_FATURA_SIMPLES: Record<string, string> = {
  rascunho: "Em preparação",
  emitida: "Em aberto",
  aberta: "Em aberto",
  parcial: "Parcialmente paga",
  paga: "Paga",
  vencida: "Vencida",
  cancelada: "Cancelada",
};

const EXTENSOES_PERMITIDAS = ["pdf", "jpg", "jpeg", "png", "heic", "webp", "doc", "docx"];
const TAMANHO_MAXIMO = 25 * 1024 * 1024;

export function validarArquivoCliente(nome: string, tamanho: number) {
  const ext = String(nome).split(".").pop()?.toLowerCase() ?? "";
  if (!EXTENSOES_PERMITIDAS.includes(ext)) {
    throw new Error("Formato não aceito. Envie PDF, imagem (JPG, PNG, HEIC, WEBP) ou documento Word.");
  }
  if (!Number.isFinite(tamanho) || tamanho <= 0 || tamanho > TAMANHO_MAXIMO) {
    throw new Error("Arquivo acima do limite de 25 MB.");
  }
}

export function texto(valor: unknown, max = 2000) {
  if (typeof valor !== "string") return null;
  const t = valor.trim();
  if (!t) return null;
  return t.slice(0, max);
}

/** Caminho privado do arquivo enviado pelo cliente. */
export function caminhoEnvioCliente(organizationId: string, casoId: string, nome: string) {
  const seguro = String(nome).replace(/[^\w.\-]+/g, "_").slice(-80);
  return `${organizationId}/${casoId}/cliente/${Date.now()}-${seguro}`;
}

/** Vínculo ativo do cliente autenticado. Lido com RLS, nunca com admin. */
export async function acessoDoCliente(supabase: Sb, userId: string) {
  const { data } = await supabase
    .from("client_portal_access")
    .select("id, organization_id, client_id, access_level, access_status")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!data || data.access_status !== "active") throw new Error("Acesso não autorizado.");
  return data as {
    id: string;
    organization_id: string;
    client_id: string;
    access_level: string;
    access_status: string;
  };
}

/**
 * Confirma que o caso está autorizado para este cliente.
 * A consulta usa RLS: caso não autorizado simplesmente não retorna linha.
 */
export async function casoAutorizado(supabase: Sb, casoId: string) {
  const { data } = await supabase
    .from("portal_casos")
    .select("id, organization_id, cliente_id, codigo, titulo, pais, via, status, ativo, suspenso_em, updated_at")
    .eq("id", casoId)
    .maybeSingle();
  return (data ?? null) as Record<string, any> | null;
}
