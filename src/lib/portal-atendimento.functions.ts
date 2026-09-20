import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoDocumentos, type Sb } from "@/lib/documentos.server";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { contemConteudoInterno } from "@/lib/onboarding-jornada";
import {
  CLASSIFICACAO_ENTREGA,
  PAPEIS_ENTREGA,
  PAPEIS_FATURA,
  VISIBILIDADE_ENTREGA_LABEL,
  VISIBILIDADE_FATURA_LABEL,
  bloqueioAtendimento,
  bloqueioFatura,
  sanitizarParaLog,
} from "@/lib/atendimento";

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
  metadados: any,
) {
  const limpos: any = {};
  for (const [k, v] of Object.entries(metadados ?? {})) {
    limpos[k] = typeof v === "string" ? sanitizarParaLog(v, 600) : v;
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_logs").insert({
    organization_id: organizationId,
    user_id: userId,
    acao,
    entidade,
    entidade_id: entidadeId,
    metadados: limpos,
  });
}

export const painelAtendimento = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
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

    // Permissão sempre por caso + organização: nunca confie no id vindo da URL.
    const caso = await supabase
      .from("crm_casos")
      .select(
        "id, cliente_id, contrato_assinado, pagamento_confirmado, documentos_minimos_ok, ativado_em, data_ativacao, eixo_comercial, eixo_formalizacao, responsavel_id, demo",
      )
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const bloqueio = bloqueioAtendimento(caso.data as any);
    if (bloqueio.bloqueado) {
      await auditar(
        organizationId,
        context.userId as string,
        "solicitacao_documento_bloqueada",
        "crm_casos",
        data.casoId,
        { resultado: "bloqueado", motivo: bloqueio.motivos.join("; "), categoria, finalidade },
      );
      throw new Error(`Caso sem portal elegível: ${bloqueio.motivos.join("; ")}.`);
    }

    // Responsável precisa ser pessoa ativa da mesma organização.
    const responsavel = await supabase
      .from("staff_access")
      .select("auth_user_id")
      .eq("organization_id", organizationId)
      .eq("auth_user_id", data.responsavelId)
      .eq("status", "active")
      .is("archived_at", null)
      .maybeSingle();
    if (!responsavel.data) throw new Error("Responsável interno inválido para esta organização.");

    // Participante informado por id precisa pertencer ao mesmo caso.
    if (data.participanteId) {
      const dep = await supabase
        .from("case_dependents")
        .select("id")
        .eq("id", data.participanteId)
        .eq("case_id", data.casoId)
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .maybeSingle();
      if (!dep.data) throw new Error("Participante não pertence a este caso.");
    }

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
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.casoId,
      eventType: "caso",
      title: "Documento solicitado ao cliente",
      summaryInternal: titulo,
      sourceEntityType: "portal_document_requests",
      sourceEntityId: r.data?.id as string,
      userId: context.userId as string,
    });
    return { ok: true };
  });

export const cancelarSolicitacaoDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { solicitacaoId: string; motivo: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const motivo = texto(data.motivo, 400) ?? "Sem motivo informado.";
    const r = await gravarComVerificacao({
      supabase,
      tabela: "portal_document_requests",
      id: data.solicitacaoId,
      organizationId,
      userId: context.userId as string,
      payload: { status: "cancelado", motivo_recusa: motivo },
    });
    await auditar(organizationId, context.userId as string, "solicitacao_documento_cancelada", "portal_document_requests", data.solicitacaoId, {
      motivo,
    });
    const caseId = r.registro["case_id"] as string | undefined;
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: "Solicitação de documento cancelada",
        summaryInternal: motivo,
        sourceEntityType: "portal_document_requests",
        sourceEntityId: data.solicitacaoId,
        userId: context.userId as string,
      });
    }
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

    await gravarComVerificacao({
      supabase,
      tabela: "documents",
      id: data.documentoId,
      organizationId,
      userId: context.userId as string,
      payload: {
        status: data.decisao === "aceito" ? "aprovado" : "recusado",
        // Aceitar valida o recebimento; a visibilidade permanece restrita.
        visibilidade: "equipe_do_caso",
        liberado_cliente: false,
        entrega_cliente: false,
        revisado_em: new Date().toISOString(),
        revisado_por: context.userId,
        revisao_motivo: motivo,
      },
    });

    if (doc.data.solicitacao_id) {
      await gravarComVerificacao({
        supabase,
        tabela: "portal_document_requests",
        id: doc.data.solicitacao_id,
        organizationId,
        userId: context.userId as string,
        payload: {
          status: data.decisao === "aceito" ? "aceito" : "recusado",
          motivo_recusa: data.decisao === "recusado" ? motivo : null,
        },
      });
    }

    await auditar(
      organizationId,
      context.userId as string,
      data.decisao === "aceito" ? "envio_cliente_aceito" : "envio_cliente_reenvio_solicitado",
      "documents",
      data.documentoId,
      { case_id: doc.data.case_id, papel, motivo: data.decisao === "recusado" ? motivo : null },
    );
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: doc.data.case_id as string,
      eventType: "caso",
      title: data.decisao === "aceito" ? "Envio do cliente aceito" : "Reenvio solicitado ao cliente",
      summaryInternal: motivo ?? undefined,
      sourceEntityType: "documents",
      sourceEntityId: data.documentoId,
      userId: context.userId as string,
    });
    return { ok: true };
  });

/**
 * Liberar ou recolher entrega ao cliente.
 *
 * Toda tentativa é auditada: quem (autor + papel), quando (com fuso), onde
 * (caso, documento, versão, classificação de visibilidade) e o quê (liberado,
 * recolhido, recusado ou bloqueado). Metadados nunca carregam número de
 * documento, token, link mágico ou conteúdo de arquivo.
 */
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
    const userId = context.userId as string;
    const quando = new Date().toISOString();
    const fuso = "UTC";

    const doc = await supabase
      .from("documents")
      .select("id, case_id, entrega_versao")
      .eq("id", data.documentoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!doc.data) throw new Error("Entrega não encontrada nesta organização.");

    const base = {
      case_id: doc.data.case_id,
      papel,
      quando,
      fuso,
      classificacao: CLASSIFICACAO_ENTREGA,
      visibilidade: VISIBILIDADE_ENTREGA_LABEL,
    };
    const negar = async (motivo: string, resultado: "bloqueado" | "recusado") => {
      await auditar(organizationId, userId, "entrega_cliente_" + resultado, "documents", data.documentoId, {
        ...base,
        resultado,
        motivo,
        acao: data.liberar ? "liberar" : "recolher",
      });
      throw new Error(motivo);
    };

    if (!PAPEIS_ENTREGA.includes(papel)) {
      await negar("Apenas admin e operações liberam ou recolhem entregas.", "recusado");
    }

    let patch: Record<string, unknown>;
    let metadados: Record<string, unknown>;
    if (data.liberar) {
      const caso = await supabase
        .from("crm_casos")
        .select(
          "id, codigo, titulo, cliente_id, contrato_assinado, pagamento_confirmado, documentos_minimos_ok, ativado_em, data_ativacao, eixo_comercial, eixo_formalizacao, responsavel_id, demo",
        )
        .eq("id", doc.data.case_id)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (!caso.data) await negar("Entrega sem caso elegível vinculado.", "bloqueado");
      const b = bloqueioAtendimento(caso.data as any);
      if (b.bloqueado) await negar(`Publicação bloqueada: ${b.motivos.join("; ")}.`, "bloqueado");

      const versao = texto(data.versao ?? null, 40);
      patch = {
        visibilidade: "cliente_quando_liberado",
        status: "liberado",
        entrega_cliente: true,
        entrega_classificacao: CLASSIFICACAO_ENTREGA,
        entrega_versao: versao,
        entrega_responsavel_id: data.responsavelId,
      };
      metadados = { ...base, resultado: "liberado", versao, responsavel_id: data.responsavelId, demo: !!caso.data?.demo };
    } else {
      const motivo = texto(data.motivo ?? null, 600);
      if (!motivo) throw new Error("Recolher entrega exige justificativa objetiva.");
      const substituta = texto(data.versaoSubstituta ?? null, 40);
      patch = {
        status: "aprovado",
        entrega_cliente: false,
        recolhimento_motivo: motivo,
        versao_substituta: substituta,
      };
      metadados = {
        ...base,
        resultado: "recolhido",
        motivo,
        versao: doc.data.entrega_versao ?? null,
        versao_substituta: substituta,
      };
    }

    try {
      await gravarComVerificacao({
        supabase,
        tabela: "documents",
        id: data.documentoId,
        organizationId,
        userId,
        payload: patch,
      });
    } catch (erro) {
      await negar(erro instanceof Error ? erro.message : "Não foi possível gravar a entrega.", "bloqueado");
    }
    await auditar(organizationId, userId, "entrega_cliente_publicacao", "documents", data.documentoId, metadados);
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: doc.data.case_id as string,
      eventType: "caso",
      title: data.liberar ? "Entrega liberada ao cliente" : "Entrega recolhida do cliente",
      summaryInternal: String(metadados["motivo"] ?? metadados["versao"] ?? ""),
      sourceEntityType: "documents",
      sourceEntityId: data.documentoId,
      userId,
    });
    return { ok: true };
  });

/** Alterar visibilidade de fatura ao cliente. Só admin ou financeiro. */
export const liberarFaturaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { faturaId: string; liberar: boolean; motivo?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    const userId = context.userId as string;
    const base = {
      papel,
      quando: new Date().toISOString(),
      fuso: "UTC",
      visibilidade: VISIBILIDADE_FATURA_LABEL,
      acao: data.liberar ? "liberar" : "recolher",
    };
    const negar = async (motivo: string, resultado: "bloqueado" | "recusado", extra?: any) => {
      await auditar(organizationId, userId, "fatura_cliente_" + resultado, "invoices", data.faturaId, {
        ...base,
        ...extra,
        resultado,
        motivo,
      });
      throw new Error(motivo);
    };

    if (!PAPEIS_FATURA.includes(papel)) {
      await negar("Apenas admin e financeiro liberam faturas ao cliente.", "recusado");
    }

    const fatura = await supabase
      .from("invoices")
      .select("id, case_id, client_id")
      .eq("id", data.faturaId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!fatura.data) throw new Error("Fatura não encontrada nesta organização.");

    if (data.liberar) {
      if (!fatura.data.case_id) await negar("Fatura sem caso vinculado.", "bloqueado");
      const [caso, acesso] = await Promise.all([
        supabase
          .from("crm_casos")
          .select(
            "id, cliente_id, contrato_assinado, pagamento_confirmado, documentos_minimos_ok, ativado_em, data_ativacao, eixo_comercial, eixo_formalizacao, demo",
          )
          .eq("id", fatura.data.case_id)
          .eq("organization_id", organizationId)
          .maybeSingle(),
        supabase
          .from("client_portal_access")
          .select("client_id, access_status, access_level")
          .eq("organization_id", organizationId)
          .eq("access_level", "client_workspace")
          .eq("access_status", "active")
          .is("archived_at", null),
      ]);
      if (!caso.data) await negar("Fatura sem caso elegível vinculado.", "bloqueado");
      const ativo = ((acesso.data ?? []) as any[]).some((a) => a.client_id === caso.data?.cliente_id);
      const b = bloqueioFatura({ ...(caso.data as any), acesso_portal_ativo: ativo });
      if (b.bloqueado) {
        await negar(`Publicação bloqueada: ${b.motivos.join("; ")}.`, "bloqueado", { case_id: fatura.data.case_id });
      }
    }

    try {
      await gravarComVerificacao({
        supabase,
        tabela: "invoices",
        id: data.faturaId,
        organizationId,
        userId,
        payload: { liberada_cliente: data.liberar },
      });
    } catch (erro) {
      await negar(erro instanceof Error ? erro.message : "Não foi possível gravar a fatura.", "bloqueado", {
        case_id: fatura.data.case_id,
      });
    }

    await auditar(organizationId, userId, "fatura_cliente_publicacao", "invoices", data.faturaId, {
      ...base,
      case_id: fatura.data.case_id,
      resultado: data.liberar ? "liberado" : "recolhido",
      motivo: texto(data.motivo ?? null, 400),
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: fatura.data.case_id as string,
      eventType: "caso",
      title: data.liberar ? "Fatura liberada ao cliente" : "Fatura recolhida do cliente",
      summaryInternal: texto(data.motivo ?? null, 400) ?? undefined,
      sourceEntityType: "invoices",
      sourceEntityId: data.faturaId,
      userId,
    });
    return { ok: true };
  });


/**
 * 05/09/2026 — achado real: `crm_casos.documentos_minimos_ok` é uma das
 * quatro condições que `portal.functions.ts`/`portal.server.ts` exigem para
 * liberar o espaço do cliente (client_workspace), mas nenhuma tela ou
 * função em todo o repositório jamais gravava esse campo como true — só
 * fixtures de teste. Sem isto, nenhum caso real, por mais que contrato e
 * pagamento estivessem confirmados, jamais liberava o App Cliente. Espelha
 * exatamente o padrão de liberarEntregaCliente/liberarFaturaCliente: só
 * admin/operações, com auditoria, sem alterar nenhuma outra condição do
 * gate (RLS, consentimento e as demais três continuam exigidas do mesmo jeito).
 */
export const confirmarDocumentosMinimos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; motivo?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    const userId = context.userId as string;

    if (!PAPEIS_ENTREGA.includes(papel)) {
      throw new Error("Apenas admin e operações confirmam documentos mínimos.");
    }

    const caso = await supabase
      .from("crm_casos")
      .select("id, documentos_minimos_ok")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");
    if (caso.data.documentos_minimos_ok) return { ok: true, jaConfirmado: true };

    try {
      await gravarComVerificacao({
        supabase,
        tabela: "crm_casos",
        id: data.caseId,
        organizationId,
        userId,
        payload: { documentos_minimos_ok: true },
      });
    } catch (erro) {
      throw new Error(erro instanceof Error ? erro.message : "Não foi possível confirmar os documentos mínimos.");
    }

    const motivo = texto(data.motivo ?? null, 600) ?? "Confirmado pela equipe sem observação adicional.";
    await auditar(organizationId, userId, "documentos_minimos_confirmados", "crm_casos", data.caseId, {
      quando: new Date().toISOString(),
      papel,
      motivo,
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Documentos mínimos confirmados",
      summaryInternal: motivo,
      sourceEntityType: "crm_casos",
      sourceEntityId: data.caseId,
      userId,
    });
    return { ok: true };
  });

/**
 * Publica no App Cliente uma atualização de Jornada ou um registro de Árvore.
 *
 * Achado real desta sessão: a policy de leitura do portal (`app_proj_select_portal`)
 * e o trigger de aprovação (`fn_app_projection_guard`) já existiam e funcionam
 * — a lacuna era não existir NENHUMA ação de ADMIN no Desk para gravar ali;
 * a única forma de publicar era SQL direto. Esta ação fecha essa lacuna sem
 * tocar RLS/trigger algum, só usando o caminho que eles já exigem: caso
 * elegível, texto cliente-facing (sem termo interno) e aprovação registrada
 * com autor e data no mesmo instante da publicação.
 */
export const publicarProjecaoApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; tipo: "marco" | "arvore"; conteudo: string; motivo?: string }) => ({
    ...data,
    motivo: data.motivo?.trim() || "Motivo não informado (fluxo sem confirmação humana explícita).",
  }))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    const userId = context.userId as string;
    if (!PAPEIS_ENTREGA.includes(papel)) {
      throw new Error("Apenas admin e operações publicam conteúdo para o App Cliente.");
    }

    const conteudo = texto(data.conteudo, 2000);
    if (!conteudo) throw new Error("Escreva o conteúdo a publicar.");
    if (contemConteudoInterno(conteudo)) {
      throw new Error("O texto contém termo interno que não pode ir ao App Cliente. Reescreva em linguagem de cliente.");
    }

    const caso = await (supabase as any)
      .from("crm_casos")
      .select("id")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const agora = new Date().toISOString();
    const resultado = await inserirComVerificacao({
      supabase: supabase as any,
      tabela: "app_projections",
      organizationId,
      userId,
      payload: {
        case_id: data.caseId,
        source_entity_type: "case",
        source_entity_id: data.caseId,
        projection_type: data.tipo,
        destination: "app",
        content_sanitized: conteudo,
        approval_status: "published",
        approved_by: userId,
        approved_at: agora,
        visibility_scope: "titular",
        effective_from: agora,
      },
    });

    await auditar(organizationId, userId, "projecao_app_publicada", "app_projections", resultado.id, {
      case_id: data.caseId,
      tipo: data.tipo,
      papel,
      quando: agora,
      motivo: data.motivo,
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Conteúdo publicado no App Cliente",
      summaryInternal: `${data.tipo} — ${data.motivo}`,
      sourceEntityType: "app_projections",
      sourceEntityId: resultado.id as string,
      userId,
    });
    return { ok: true, id: resultado.id };
  });

/** Arquiva (nunca apaga) uma projeção publicada — some do App Cliente a partir de agora. */
export const despublicarProjecaoApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { projecaoId: string; motivo?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    const userId = context.userId as string;
    if (!PAPEIS_ENTREGA.includes(papel)) {
      throw new Error("Apenas admin e operações despublicam conteúdo do App Cliente.");
    }
    const motivo = texto(data.motivo ?? null, 600) ?? "Despublicado pela equipe.";
    const r = await gravarComVerificacao({
      supabase,
      tabela: "app_projections",
      id: data.projecaoId,
      organizationId,
      userId,
      payload: { archived_at: new Date().toISOString(), archived_reason: motivo },
    });
    await auditar(organizationId, userId, "projecao_app_despublicada", "app_projections", data.projecaoId, {
      papel,
      quando: new Date().toISOString(),
    });
    const caseId = r.registro["case_id"] as string | undefined;
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: "Conteúdo despublicado do App Cliente",
        summaryInternal: motivo,
        sourceEntityType: "app_projections",
        sourceEntityId: data.projecaoId,
        userId,
      });
    }
    return { ok: true };
  });

export const ticketInterno = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
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

    // O ticket precisa ser desta organização (evita acesso por id de URL/API).
    const ticket = await supabase
      .from("portal_tickets")
      .select("id, case_id")
      .eq("id", data.ticketId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .maybeSingle();
    if (!ticket.data) throw new Error("Ticket não encontrado nesta organização.");

    // Resposta visível ao cliente só em caso elegível; o restante fica interno.
    if (!data.interna) {
      const caso = ticket.data.case_id
        ? await supabase
            .from("crm_casos")
            .select(
              "id, cliente_id, contrato_assinado, pagamento_confirmado, documentos_minimos_ok, ativado_em, data_ativacao, eixo_comercial, eixo_formalizacao, responsavel_id, demo",
            )
            .eq("id", ticket.data.case_id)
            .eq("organization_id", organizationId)
            .maybeSingle()
        : null;
      const b = caso?.data
        ? bloqueioAtendimento(caso.data as any)
        : { bloqueado: true, motivos: ["Ticket sem caso elegível vinculado"] };
      if (b.bloqueado) {
        await auditar(
          organizationId,
          context.userId as string,
          "resposta_cliente_bloqueada",
          "portal_tickets",
          data.ticketId,
          { resultado: "bloqueado", motivo: b.motivos.join("; "), case_id: ticket.data.case_id },
        );
        throw new Error(
          `Resposta ao cliente bloqueada: ${b.motivos.join("; ")}. Registre como nota interna.`,
        );
      }
    }

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
    await auditar(
      organizationId,
      context.userId as string,
      data.interna ? "ticket_nota_interna" : "ticket_resposta_cliente",
      "portal_tickets",
      data.ticketId,
      { case_id: ticket.data.case_id, visivel_cliente: !data.interna },
    );
    if (ticket.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: ticket.data.case_id as string,
        eventType: "caso",
        title: data.interna ? "Nota interna registrada no atendimento" : "Resposta enviada ao cliente no atendimento",
        summaryInternal: corpo,
        sourceEntityType: "portal_tickets",
        sourceEntityId: data.ticketId,
        userId: context.userId as string,
      });
    }
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
    const patch: Record<string, unknown> = { status: data.status };
    if (data.responsavelId !== undefined) patch['responsavel_id'] = data.responsavelId || null;
    const r = await gravarComVerificacao({
      supabase,
      tabela: "portal_tickets",
      id: data.ticketId,
      organizationId,
      userId: context.userId as string,
      payload: patch,
    });
    const caseId = r.registro["case_id"] as string | undefined;
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: "Status do ticket de atendimento atualizado",
        summaryInternal: `Status: ${data.status}`,
        sourceEntityType: "portal_tickets",
        sourceEntityId: data.ticketId,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });
