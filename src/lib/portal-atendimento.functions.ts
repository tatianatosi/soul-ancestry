import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoDocumentos, type Sb } from "@/lib/documentos.server";
import { CLASSIFICACAO_ENTREGA, PAPEIS_ENTREGA, PAPEIS_FATURA } from "@/lib/atendimento";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Atendimento ao cliente pelo lado interno: solicitar documentos, revisar
 * envios, liberar/recolher entregas, controlar faturas visíveis e tickets.
 *
 * Nada fica disponível ao cliente por padrão. Toda liberação exige caso com
 * portal elegível, papel autorizado e registro de auditoria (sem número de
 * documento, token, link mágico ou conteúdo de arquivo).
 */

function texto(valor: unknown, max = 2000) {
  if (typeof valor !== "string") return null;
  const t = valor.trim();
  if (!t) return null;
  return t.slice(0, max);
}

async function auditar(
  organizationId: string,
  userId: string,
  acao: string,
  entidade: string,
  entidadeId: string,
  metadados: Record<string, unknown>,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_logs").insert({
    organization_id: organizationId,
    user_id: userId,
    acao,
    entidade,
    entidade_id: entidadeId,
    metadados,
  });
}

export const painelAtendimento = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);

    const filtro = <T,>(q: T) => (data.casoId ? (q as any).eq("case_id", data.casoId) : q);

    const [casos, solicitacoes, envios, entregas, tickets, faturas, equipe, dependentes, acessos, clientes] =
      await Promise.all([
        supabase
          .from("crm_casos")
          .select(
            "id, codigo, titulo, cliente_id, status, ativo, contrato_assinado, pagamento_confirmado, documentos_minimos_ok, ativado_em, data_ativacao, eixo_comercial, eixo_formalizacao, responsavel_id, demo",
          )
          .eq("organization_id", organizationId)
          .is("archived_at", null)
          .order("updated_at", { ascending: false }),
        filtro(
          supabase
            .from("portal_document_requests")
            .select(
              "id, case_id, titulo, descricao, obrigatorio, prazo, status, motivo_recusa, document_id, created_at, finalidade, categoria, participante_nome, responsavel_id",
            )
            .eq("organization_id", organizationId)
            .is("archived_at", null)
            .order("created_at", { ascending: false }),
        ),
        filtro(
          supabase
            .from("documents")
            .select("id, case_id, titulo, status, categoria, created_at, solicitacao_id, revisao_motivo, revisado_em")
            .eq("organization_id", organizationId)
            .eq("origem", "cliente")
            .is("archived_at", null)
            .order("created_at", { ascending: false }),
        ),
        filtro(
          supabase
            .from("documents")
            .select(
              "id, case_id, titulo, status, visibilidade, liberado_cliente, liberado_em, entrega_cliente, entrega_classificacao, entrega_versao, entrega_responsavel_id, recolhido_em, recolhimento_motivo, versao_substituta",
            )
            .eq("organization_id", organizationId)
            .eq("origem", "interno")
            .is("archived_at", null)
            .order("created_at", { ascending: false }),
        ),
        filtro(
          supabase
            .from("portal_tickets")
            .select("id, case_id, assunto, categoria, status, responsavel_id, ultima_mensagem_em, created_at")
            .eq("organization_id", organizationId)
            .is("archived_at", null)
            .order("ultima_mensagem_em", { ascending: false }),
        ),
        filtro(
          supabase
            .from("invoices")
            .select(
              "id, case_id, client_id, numero, descricao, valor, moeda, vencimento, status, liberada_cliente, liberada_em",
            )
            .eq("organization_id", organizationId)
            .is("archived_at", null)
            .order("vencimento", { ascending: true }),
        ),
        supabase
          .from("staff_access")
          .select("auth_user_id, full_name, email, role, status")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .is("archived_at", null),
        supabase
          .from("case_dependents")
          .select("id, case_id, nome_completo, vinculo_com_titular")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("client_portal_access")
          .select("client_id, access_status, access_level")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("clientes")
          .select("id, nome")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
      ]);

    const ativos = new Set(
      ((acessos.data ?? []) as any[])
        .filter((a) => a.access_status === "active" && a.access_level === "client_workspace")
        .map((a) => a.client_id),
    );

    const listaCasos = ((casos.data ?? []) as any[]).map((c) => ({
      ...c,
      acesso_portal_ativo: c.cliente_id ? ativos.has(c.cliente_id) : false,
    }));

    return {
      papel,
      podeLiberar: PAPEIS_ENTREGA.includes(papel),
      podeFinanceiro: PAPEIS_FATURA.includes(papel),
      casos: listaCasos,
      solicitacoes: (solicitacoes.data ?? []) as any[],
      envios: (envios.data ?? []) as any[],
      entregas: (entregas.data ?? []) as any[],
      tickets: (tickets.data ?? []) as any[],
      faturas: (faturas.data ?? []) as any[],
      equipe: (equipe.data ?? []) as any[],
      dependentes: (dependentes.data ?? []) as any[],
      clientes: (clientes.data ?? []) as any[],
    };
  });

export const criarSolicitacaoDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      casoId: string;
      titulo: string;
      categoria: string;
      finalidade: string;
      participanteNome: string;
      participanteId?: string | null;
      responsavelId: string;
      prazo: string;
      descricao?: string;
      obrigatorio?: boolean;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const titulo = texto(data.titulo, 160);
    const categoria = texto(data.categoria, 60);
    const finalidade = texto(data.finalidade, 80);
    const participante = texto(data.participanteNome, 160);
    if (!titulo) throw new Error("Informe o documento solicitado.");
    if (!categoria) throw new Error("Informe a categoria do documento.");
    if (!finalidade) throw new Error("Informe a finalidade da solicitação.");
    if (!participante) throw new Error("Informe o participante a quem o documento se refere.");
    if (!data.responsavelId) throw new Error("Informe o responsável interno.");
    if (!data.prazo) throw new Error("Informe o prazo.");

    const caso = await supabase
      .from("crm_casos")
      .select("id, cliente_id")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const r = await supabase
      .from("portal_document_requests")
      .insert({
        organization_id: organizationId,
        case_id: data.casoId,
        client_id: caso.data.cliente_id,
        titulo,
        categoria,
        finalidade,
        participante_id: data.participanteId || null,
        participante_nome: participante,
        responsavel_id: data.responsavelId,
        descricao: texto(data.descricao ?? null, 1000),
        prazo: data.prazo,
        obrigatorio: data.obrigatorio ?? true,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);

    await auditar(organizationId, context.userId as string, "solicitacao_documento_criada", "portal_document_requests", r.data?.id, {
      case_id: data.casoId,
      categoria,
      finalidade,
      prazo: data.prazo,
      responsavel_id: data.responsavelId,
    });
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
    await auditar(organizationId, context.userId as string, "solicitacao_documento_cancelada", "portal_document_requests", data.solicitacaoId, {
      motivo,
    });
    return { ok: true };
  });

/**
 * Revisão do envio do cliente. "Aceitar" valida o recebimento interno: não
 * publica o arquivo nem amplia a visibilidade.
 */
export const revisarEnvioCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { documentoId: string; decisao: "aceito" | "recusado"; motivo?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    const motivo = texto(data.motivo ?? null, 600);
    if (data.decisao === "recusado" && !motivo) {
      throw new Error("Explique de forma objetiva o que o cliente precisa reenviar.");
    }

    const doc = await supabase
      .from("documents")
      .select("id, case_id, solicitacao_id, origem")
      .eq("id", data.documentoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!doc.data || doc.data.origem !== "cliente") throw new Error("Documento não encontrado.");

    const r = await supabase
      .from("documents")
      .update({
        status: data.decisao === "aceito" ? "aprovado" : "recusado",
        // Aceitar valida o recebimento; a visibilidade permanece restrita.
        visibilidade: "equipe_do_caso",
        liberado_cliente: false,
        entrega_cliente: false,
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

    await auditar(
      organizationId,
      context.userId as string,
      data.decisao === "aceito" ? "envio_cliente_aceito" : "envio_cliente_reenvio_solicitado",
      "documents",
      data.documentoId,
      { case_id: doc.data.case_id, papel, motivo: data.decisao === "recusado" ? motivo : null },
    );
    return { ok: true };
  });

/** Liberar ou recolher entrega ao cliente. O banco reforça papel e elegibilidade. */
export const liberarEntregaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      documentoId: string;
      liberar: boolean;
      versao?: string;
      responsavelId?: string;
      motivo?: string;
      versaoSubstituta?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!PAPEIS_ENTREGA.includes(papel)) throw new Error("Apenas admin e operações liberam ou recolhem entregas.");

    let patch: Record<string, unknown>;
    if (data.liberar) {
      const versao = texto(data.versao ?? null, 40);
      if (!versao) throw new Error("Informe a versão da entrega.");
      if (!data.responsavelId) throw new Error("Informe o responsável pela entrega.");
      patch = {
        visibilidade: "cliente_quando_liberado",
        status: "liberado",
        entrega_cliente: true,
        entrega_classificacao: CLASSIFICACAO_ENTREGA,
        entrega_versao: versao,
        entrega_responsavel_id: data.responsavelId,
      };
    } else {
      const motivo = texto(data.motivo ?? null, 600);
      if (!motivo) throw new Error("Recolher entrega exige justificativa objetiva.");
      patch = {
        status: "aprovado",
        entrega_cliente: false,
        recolhimento_motivo: motivo,
        versao_substituta: texto(data.versaoSubstituta ?? null, 40),
      };
    }

    const r = await supabase
      .from("documents")
      .update({ ...patch, updated_by: context.userId })
      .eq("id", data.documentoId)
      .eq("organization_id", organizationId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

/** Alterar visibilidade de fatura ao cliente. Só admin ou financeiro. */
export const liberarFaturaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { faturaId: string; liberar: boolean; motivo?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!PAPEIS_FATURA.includes(papel)) throw new Error("Apenas admin e financeiro liberam faturas ao cliente.");

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

/**
 * Resposta da equipe. Fica registrada no ticket: nada sai por e-mail,
 * WhatsApp ou qualquer automação externa.
 */
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
  .inputValidator((data: { ticketId: string; status: string; responsavelId?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const permitidos = ["aberto", "em_analise", "respondido", "resolvido", "fechado"];
    if (!permitidos.includes(data.status)) throw new Error("Situação inválida.");
    const patch: Record<string, unknown> = { status: data.status, updated_by: context.userId };
    if (data.responsavelId !== undefined) patch['responsavel_id'] = data.responsavelId || null;
    const r = await supabase
      .from("portal_tickets")
      .update(patch)
      .eq("id", data.ticketId)
      .eq("organization_id", organizationId);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });
