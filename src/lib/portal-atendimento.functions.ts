import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoDocumentos, type Sb } from "@/lib/documentos.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Atendimento ao cliente pelo lado interno: solicitar documentos, revisar
 * envios, liberar entregas e faturas e responder tickets.
 *
 * Liberar entrega ou fatura exige usuário interno ativo (validado no banco) e
 * gera registro automático em audit_logs com data e hora.
 */

const PAPEIS_LIBERACAO = ["admin", "operacoes"];
const PAPEIS_FINANCEIRO = ["admin", "financeiro"];

function texto(valor: unknown, max = 2000) {
  if (typeof valor !== "string") return null;
  const t = valor.trim();
  if (!t) return null;
  return t.slice(0, max);
}

export const painelAtendimento = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);

    const filtro = <T,>(q: T) => (data.casoId ? (q as any).eq("case_id", data.casoId) : q);

    const [casos, solicitacoes, envios, entregas, tickets, faturas] = await Promise.all([
      supabase
        .from("crm_casos")
        .select("id, codigo, titulo, cliente_id, status, ativo")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("updated_at", { ascending: false }),
      filtro(
        supabase
          .from("portal_document_requests")
          .select("id, case_id, titulo, descricao, obrigatorio, prazo, status, motivo_recusa, document_id, created_at")
          .eq("organization_id", organizationId)
          .is("archived_at", null)
          .order("created_at", { ascending: false }),
      ),
      filtro(
        supabase
          .from("documents")
          .select("id, case_id, titulo, status, nome_arquivo, created_at, solicitacao_id, revisao_motivo")
          .eq("organization_id", organizationId)
          .eq("origem", "cliente")
          .is("archived_at", null)
          .order("created_at", { ascending: false }),
      ),
      filtro(
        supabase
          .from("documents")
          .select("id, case_id, titulo, status, visibilidade, liberado_cliente, liberado_em, entrega_cliente")
          .eq("organization_id", organizationId)
          .eq("origem", "interno")
          .is("archived_at", null)
          .order("created_at", { ascending: false }),
      ),
      filtro(
        supabase
          .from("portal_tickets")
          .select("id, case_id, assunto, categoria, status, ultima_mensagem_em, created_at")
          .eq("organization_id", organizationId)
          .is("archived_at", null)
          .order("ultima_mensagem_em", { ascending: false }),
      ),
      filtro(
        supabase
          .from("invoices")
          .select("id, case_id, numero, descricao, valor, moeda, vencimento, status, liberada_cliente, liberada_em")
          .eq("organization_id", organizationId)
          .is("archived_at", null)
          .order("vencimento", { ascending: true }),
      ),
    ]);

    return {
      papel,
      podeLiberar: PAPEIS_LIBERACAO.includes(papel),
      podeFinanceiro: PAPEIS_FINANCEIRO.includes(papel),
      casos: (casos.data ?? []) as any[],
      solicitacoes: (solicitacoes.data ?? []) as any[],
      envios: (envios.data ?? []) as any[],
      entregas: (entregas.data ?? []) as any[],
      tickets: (tickets.data ?? []) as any[],
      faturas: (faturas.data ?? []) as any[],
    };
  });

export const criarSolicitacaoDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { casoId: string; titulo: string; descricao?: string; prazo?: string | null; obrigatorio?: boolean }) =>
      data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const titulo = texto(data.titulo, 160);
    if (!titulo) throw new Error("Informe o documento solicitado.");

    const caso = await supabase
      .from("crm_casos")
      .select("id, cliente_id")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const r = await supabase.from("portal_document_requests").insert({
      organization_id: organizationId,
      case_id: data.casoId,
      client_id: caso.data.cliente_id,
      titulo,
      descricao: texto(data.descricao ?? null, 1000),
      prazo: data.prazo || null,
      obrigatorio: data.obrigatorio ?? true,
      created_by: context.userId,
      updated_by: context.userId,
    });
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

export const cancelarSolicitacaoDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { solicitacaoId: string; motivo: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const motivo = texto(data.motivo, 400);
    if (!motivo) throw new Error("Informe o motivo do cancelamento.");
    const r = await supabase
      .from("portal_document_requests")
      .update({ status: "cancelado", motivo_recusa: motivo, updated_by: context.userId })
      .eq("id", data.solicitacaoId)
      .eq("organization_id", organizationId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

/** Revisão do arquivo enviado pelo cliente: aceitar ou pedir reenvio. */
export const revisarEnvioCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { documentoId: string; decisao: "aceito" | "recusado"; motivo?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const motivo = texto(data.motivo ?? null, 600);
    if (data.decisao === "recusado" && !motivo) throw new Error("Explique ao cliente o que precisa ser reenviado.");

    const doc = await supabase
      .from("documents")
      .select("id, solicitacao_id, origem")
      .eq("id", data.documentoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!doc.data || doc.data.origem !== "cliente") throw new Error("Documento não encontrado.");

    const r = await supabase
      .from("documents")
      .update({
        status: data.decisao === "aceito" ? "aprovado" : "recusado",
        revisado_em: new Date().toISOString(),
        revisado_por: context.userId,
        revisao_motivo: motivo,
        updated_by: context.userId,
      })
      .eq("id", data.documentoId);
    if (r.error) throw new Error(r.error.message);

    if (doc.data.solicitacao_id) {
      await supabase
        .from("portal_document_requests")
        .update({
          status: data.decisao === "aceito" ? "aceito" : "recusado",
          motivo_recusa: data.decisao === "recusado" ? motivo : null,
          updated_by: context.userId,
        })
        .eq("id", doc.data.solicitacao_id)
        .eq("organization_id", organizationId);
    }
    return { ok: true };
  });

/** Liberar entrega ao cliente: exige admin/operações; o banco audita. */
export const liberarEntregaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { documentoId: string; liberar: boolean }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!PAPEIS_LIBERACAO.includes(papel)) throw new Error("Apenas admin e operações liberam entregas.");

    const patch = data.liberar
      ? { visibilidade: "cliente_quando_liberado", status: "liberado", entrega_cliente: true }
      : { status: "aprovado", entrega_cliente: false };

    const r = await supabase
      .from("documents")
      .update({ ...patch, updated_by: context.userId })
      .eq("id", data.documentoId)
      .eq("organization_id", organizationId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

/** Liberar fatura para visualização do cliente. */
export const liberarFaturaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { faturaId: string; liberar: boolean }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!PAPEIS_FINANCEIRO.includes(papel)) throw new Error("Apenas admin e financeiro liberam faturas ao cliente.");

    const r = await supabase
      .from("invoices")
      .update({ liberada_cliente: data.liberar, updated_by: context.userId })
      .eq("id", data.faturaId)
      .eq("organization_id", organizationId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

export const ticketInterno = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const [ticket, mensagens] = await Promise.all([
      supabase
        .from("portal_tickets")
        .select("id, case_id, assunto, categoria, status, ultima_mensagem_em")
        .eq("id", data.ticketId)
        .eq("organization_id", organizationId)
        .maybeSingle(),
      supabase
        .from("portal_ticket_messages")
        .select("id, autor_tipo, corpo, visivel_cliente, created_at")
        .eq("ticket_id", data.ticketId)
        .order("created_at", { ascending: true }),
    ]);
    if (!ticket.data) return null;
    return { ticket: ticket.data as any, mensagens: (mensagens.data ?? []) as any[] };
  });

/** Resposta da equipe. Nada sai por e-mail ou WhatsApp: fica no ticket. */
export const responderTicketEquipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string; mensagem: string; interna?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const corpo = texto(data.mensagem, 4000);
    if (!corpo) throw new Error("Escreva a resposta.");

    const r = await supabase.from("portal_ticket_messages").insert({
      organization_id: organizationId,
      ticket_id: data.ticketId,
      autor_tipo: "equipe",
      autor_user_id: context.userId,
      corpo,
      visivel_cliente: !data.interna,
      created_by: context.userId,
    });
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

export const atualizarStatusTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const permitidos = ["aberto", "em_analise", "respondido", "resolvido", "fechado"];
    if (!permitidos.includes(data.status)) throw new Error("Situação inválida.");
    const r = await supabase
      .from("portal_tickets")
      .update({ status: data.status, updated_by: context.userId })
      .eq("id", data.ticketId)
      .eq("organization_id", organizationId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });
