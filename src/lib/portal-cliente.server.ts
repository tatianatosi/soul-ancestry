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
import { comoUnico } from "@/lib/portal-vinculo";
import { erroDoArquivoCliente } from "@/lib/portal-envio-arquivo";

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

export function validarArquivoCliente(nome: string, tamanho: number) {
  // Regra em `portal-envio-arquivo.ts` para que a tela do cliente use
  // exatamente o mesmo critério antes de subir o arquivo. O servidor
  // continua sendo quem recusa.
  const erro = erroDoArquivoCliente(nome, tamanho);
  if (erro) throw new Error(erro);
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
    .select("id, organization_id, client_id, access_level, access_status, updated_at")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
      .limit(10)
      .then(comoUnico);
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

/**
 * Alerta interno de atendimento: a mensagem do cliente entra na fila da equipe.
 * Nunca envia e-mail, WhatsApp ou aciona automação externa, e nunca grava o
 * conteúdo da mensagem — só a referência do ticket e do caso.
 */
export async function alertaInternoTicket(params: {
  organizationId: string;
  casoId: string | null;
  ticketId: string;
  assunto: string;
  novo: boolean;
}) {
  if (!params.casoId) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // 09/09/2026 — dedup: várias mensagens seguidas do cliente no mesmo
    // ticket, antes da equipe responder, não empilham um alerta por mensagem.
    const admin = supabaseAdmin as any;
    const { data: existente } = await admin
      .from("case_alerts")
      .select("id")
      .eq("case_id", params.casoId)
      .eq("tipo", "atendimento_cliente")
      .eq("status", "pending")
      .ilike("detalhe", `Ticket ${params.ticketId}.%`)
      .limit(1)
      .maybeSingle();
    if (existente?.id) return;
    await admin.from("case_alerts").insert({
      organization_id: params.organizationId,
      case_id: params.casoId,
      tipo: "atendimento_cliente",
      criticidade: "atencao",
      titulo: params.novo
        ? `Novo atendimento do cliente: ${String(params.assunto).slice(0, 120)}`
        : `Nova mensagem do cliente no atendimento: ${String(params.assunto).slice(0, 120)}`,
      detalhe: `Ticket ${params.ticketId}. Responder em Atendimento ao cliente. Nenhuma comunicação externa foi disparada.`,
      status: "pending",
    });
  } catch {
    // Alerta é acessório: a mensagem do cliente não pode falhar por causa dele.
  }
}

