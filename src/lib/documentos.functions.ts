import { semFixtures } from "@/lib/fixtures";
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CATEGORIAS,
  PAPEIS_UPLOAD,
  SENSIBILIDADES,
  STATUS_DOCUMENTO,
  VISIBILIDADES,
  caminhoArquivo,
  contextoDocumentos,
  exigirTitularEFinalidadeSensivel,
  limparTexto,
  podeBaixarDocumento,
  podeVerDocumento,
  type Sb,
} from "@/lib/documentos.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { exigirPersistenciaConferida } from "@/lib/verificacao-persistencia";

/* eslint-disable @typescript-eslint/no-explicit-any */

const BUCKET = "documentos";

/** Documentos visíveis para o papel do usuário; metadados de itens sem permissão não são devolvidos. */
export const listarDocumentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string; clienteId?: string; incluirArquivados?: boolean }) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    let q = supabase
      .from("documents")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (data.casoId) q = q.eq("case_id", data.casoId);
    if (data.clienteId) q = q.eq("client_id", data.clienteId);
    if (!data.incluirArquivados) q = q.is("archived_at", null);
    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);
    return ((linhas ?? []) as Record<string, any>[])
      .filter((d) => podeVerDocumento(papel, d))
      .map((d) => ({ ...d, pode_baixar: podeBaixarDocumento(papel, d) }));
  });

/** Autoriza o envio e devolve um endereço temporário de upload no acervo privado. */
export const prepararUploadDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string; nomeArquivo: string }) => {
    if (!data?.nomeArquivo || data.nomeArquivo.length > 200) throw new Error("Nome de arquivo inválido.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!PAPEIS_UPLOAD.includes(papel)) throw new Error("Seu papel não permite enviar documentos.");
    if (data.casoId) {
      const { data: caso } = await supabase
        .from("crm_casos")
        .select("id")
        .eq("id", data.casoId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (!caso) throw new Error("Caso não encontrado nesta organização.");
    }
    const path = caminhoArquivo(organizationId, data.casoId ?? null, data.nomeArquivo);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assinado = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (assinado.error) throw new Error(assinado.error.message);
    return { path, token: assinado.data.token, signedUrl: assinado.data.signedUrl };
  });

/**
 * Cria ou atualiza o registro do documento (as travas do banco validam
 * titular, consentimento e liberação).
 *
 * Decisão da Proprietária (09/09/2026) — "documento é individual por
 * padrão": categoria sensível (identificação/certidão/documento
 * civil/financeiro) exige a pessoa titular explícita — nunca é inferida do
 * contratante do caso. Sem isso o documento de um dependente virava
 * visível, por padrão, no portal do contratante.
 */
export const salvarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id?: string;
      casoId?: string;
      clienteId?: string;
      titulo: string;
      categoria: string;
      sensibilidade: string;
      visibilidade: string;
      status: string;
      observacoes?: string;
      finalidade?: string;
      storagePath?: string;
      nomeArquivo?: string;
      mimeType?: string;
      tamanhoBytes?: number;
    }) => {
      if (!CATEGORIAS[data.categoria]) throw new Error("Categoria inválida.");
      if (!SENSIBILIDADES[data.sensibilidade]) throw new Error("Classificação de sensibilidade inválida.");
      if (!VISIBILIDADES[data.visibilidade]) throw new Error("Visibilidade inválida.");
      if (!STATUS_DOCUMENTO[data.status]) throw new Error("Status inválido.");
      exigirTitularEFinalidadeSensivel({
        categoria: data.categoria,
        clienteId: data.clienteId,
        finalidade: data.finalidade,
      });
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoDocumentos(supabase, userId);
    if (!PAPEIS_UPLOAD.includes(papel)) throw new Error("Seu papel não permite gerenciar documentos.");

    const corpo: Record<string, any> = {
      titulo: data.titulo.trim().slice(0, 200),
      categoria: data.categoria,
      sensibilidade: data.sensibilidade,
      visibilidade: data.visibilidade,
      status: data.status,
      observacoes: limparTexto(data.observacoes),
      finalidade: limparTexto(data.finalidade, 500),
    };
    if (data.storagePath) {
      corpo["storage_path"] = data.storagePath;
      corpo["nome_arquivo"] = limparTexto(data.nomeArquivo, 200);
      corpo["mime_type"] = limparTexto(data.mimeType, 120);
      corpo["tamanho_bytes"] = data.tamanhoBytes ?? null;
    }

    if (data.id) {
      const r = await gravarComVerificacao({
        supabase,
        tabela: "documents",
        id: data.id,
        organizationId,
        userId,
        payload: corpo,
      });
      if (r.registro["case_id"]) {
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId: r.registro["case_id"] as string,
          eventType: "caso",
          title: "Documento atualizado",
          summaryInternal: corpo.titulo as string,
          sourceEntityType: "documents",
          sourceEntityId: data.id,
          userId,
        });
      }
      return { id: data.id };
    }

    const { data: linha, error } = await supabase
      .from("documents")
      .insert({
        ...corpo,
        organization_id: organizationId,
        case_id: data.casoId ?? null,
        client_id: data.clienteId ?? null,
        created_by: userId,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linha?.id) throw new Error("NENHUMA_LINHA_AFETADA: documento não foi criado.");
    if (data.casoId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.casoId,
        eventType: "caso",
        title: "Documento registrado",
        summaryInternal: corpo.titulo as string,
        sourceEntityType: "documents",
        sourceEntityId: linha.id as string,
        userId,
      });
    }
    return { id: linha.id as string };
  });

/** Link temporário para download, sempre registrado em auditoria. */
export const baixarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { documentoId: string }) => {
    if (!data?.documentoId) throw new Error("Informe o documento.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoDocumentos(supabase, userId);
    const { data: doc, error } = await supabase
      .from("documents")
      .select("id,titulo,storage_path,visibilidade,sensibilidade,categoria,case_id,client_id")
      .eq("id", data.documentoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!doc) throw new Error("Documento não encontrado.");
    if (!podeBaixarDocumento(papel, doc)) {
      throw new Error("Seu papel não pode baixar documentos internos restritos.");
    }
    if (!doc.storage_path) throw new Error("Este registro não tem arquivo anexado.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assinado = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(doc.storage_path as string, 120);
    if (assinado.error) throw new Error(assinado.error.message);

    await supabaseAdmin.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      acao: "download",
      entidade: "documents",
      entidade_id: doc.id,
      metadados: {
        categoria: doc.categoria,
        sensibilidade: doc.sensibilidade,
        visibilidade: doc.visibilidade,
        case_id: doc.case_id,
        papel,
      },
    });

    return { url: assinado.data?.signedUrl as string };
  });

/** Arquiva o documento com motivo — nunca há exclusão física. */
export const arquivarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; motivo: string }) => {
    if (!data?.id) throw new Error("Informe o documento.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoDocumentos(supabase, userId);
    if (!PAPEIS_UPLOAD.includes(papel)) throw new Error("Seu papel não permite arquivar documentos.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const r = await gravarComVerificacao({
      supabase,
      tabela: "documents",
      id: data.id,
      organizationId,
      userId,
      payload: { archived_at: new Date().toISOString(), archive_motivo: motivo, status: "arquivado" },
    });
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Documento arquivado",
        summaryInternal: motivo,
        sourceEntityType: "documents",
        sourceEntityId: data.id,
        userId,
      });
    }
    return { ok: true };
  });

/**
 * 30/10/2026 — retira do App Cliente um documento já liberado, sem arquivar
 * nem apagar: volta a "pendente de revisão" e deixa de ser visível ao cliente
 * até nova liberação. Precisa de sessão autenticada (o guard de `documents`
 * recusa conexão sem usuário) e de motivo, que vai para a linha do tempo.
 */
export const retirarDocumentoDoApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; motivo: string }) => {
    if (!data?.id) throw new Error("Informe o documento.");
    if (!data.motivo || data.motivo.trim().length < 5) throw new Error("Informe o motivo para retirar o documento do App.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoDocumentos(supabase, userId);
    if (!PAPEIS_UPLOAD.includes(papel)) throw new Error("Seu papel não permite retirar documentos do App.");
    const motivo = data.motivo.trim().slice(0, 500);
    const payload = { liberado_cliente: false, status: "pendente_de_revisao" };
    const r = await gravarComVerificacao({
      supabase,
      tabela: "documents",
      id: data.id,
      organizationId,
      userId,
      payload,
    });
    exigirPersistenciaConferida(payload, r.registro);
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Documento retirado do App Cliente",
        summaryInternal: motivo,
        sourceEntityType: "documents",
        sourceEntityId: data.id,
        userId,
      });
    }
    return { ok: true };
  });

/* ===================== CONSENTIMENTOS ===================== */

export const listarConsentimentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string; clienteId?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    let q = supabase
      .from("consent_records")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (data.casoId) q = q.eq("case_id", data.casoId);
    if (data.clienteId) q = q.eq("client_id", data.clienteId);
    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);
    return (linhas ?? []) as Record<string, any>[];
  });

export const registrarConsentimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      clienteId: string;
      casoId?: string;
      tipo: string;
      versaoTexto: string;
      textoAceito?: string;
      metodoColeta: string;
      escopoCompartilhamento?: string;
      evidenciaConsentimento?: string;
      coletadoEm?: string;
    }) => {
      if (!data?.clienteId) throw new Error("Selecione o cliente.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!["admin", "operacoes", "comercial"].includes(papel)) {
      throw new Error("Somente administração, operações ou comercial registram consentimentos.");
    }
    const { data: linha, error } = await supabase
      .from("consent_records")
      .insert({
        organization_id: organizationId,
        client_id: data.clienteId,
        case_id: data.casoId ?? null,
        tipo_consentimento: data.tipo,
        versao_texto: data.versaoTexto.trim().slice(0, 120),
        texto_aceito: limparTexto(data.textoAceito, 8000),
        metodo_coleta: data.metodoColeta,
        escopo_compartilhamento: limparTexto(data.escopoCompartilhamento),
        evidencia_consentimento: limparTexto(data.evidenciaConsentimento, 500),
        coletado_em: data.coletadoEm ? new Date(data.coletadoEm).toISOString() : new Date().toISOString(),
        status: "coletado",
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data.casoId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.casoId,
        eventType: "caso",
        title: `Consentimento registrado (${data.tipo})`,
        sourceEntityType: "consent_records",
        sourceEntityId: linha?.id as string,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

export const revogarConsentimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; motivo: string }) => {
    if (!data?.id) throw new Error("Informe o consentimento.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoDocumentos(supabase, userId);
    if (!["admin", "operacoes"].includes(papel)) {
      throw new Error("Somente administração ou operações revogam consentimentos.");
    }
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const r = await gravarComVerificacao({
      supabase,
      tabela: "consent_records",
      id: data.id,
      organizationId,
      userId,
      payload: {
        status: "revogado",
        revogado_em: new Date().toISOString(),
        revogacao_motivo: motivo.slice(0, 1000),
      },
    });
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Consentimento revogado",
        summaryInternal: motivo,
        sourceEntityType: "consent_records",
        sourceEntityId: data.id,
        userId,
      });
    }
    return { ok: true };
  });

/** Exceção formal de consentimento: privilégio exclusivo de administração. */
export const registrarExcecaoConsentimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string; clienteId?: string; motivo: string; validoAte?: string }) => {
    if (!data.casoId && !data.clienteId) throw new Error("Vincule a exceção a um caso ou cliente.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoDocumentos(supabase, userId);
    if (papel !== "admin") throw new Error("Somente administração registra exceções formais.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const { data: linha, error } = await supabase
      .from("consent_exceptions")
      .insert({
        organization_id: organizationId,
        case_id: data.casoId ?? null,
        client_id: data.clienteId ?? null,
        motivo: motivo.slice(0, 1000),
        valido_ate: data.validoAte || null,
        aprovado_por: userId,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data.casoId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.casoId,
        eventType: "caso",
        title: "Exceção de consentimento registrada",
        summaryInternal: motivo,
        sourceEntityType: "consent_exceptions",
        sourceEntityId: linha?.id as string,
        userId,
      });
    }
    return { ok: true };
  });

/* ===================== PRIVACIDADE POR CASO ===================== */

export const painelPrivacidade = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => {
    if (!data?.casoId) throw new Error("Informe o caso.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo,status,cliente_id,responsavel_id")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    const [documentos, consentimentos, excecoes, alertas, eventos, acessosCliente] = await Promise.all([
      supabase
        .from("documents")
        .select("id,titulo,categoria,sensibilidade,visibilidade,status,versao,created_at")
        .eq("organization_id", organizationId)
        .eq("case_id", data.casoId)
        .is("archived_at", null),
      supabase
        .from("consent_records")
        .select("*")
        .eq("organization_id", organizationId)
        .or(`case_id.eq.${data.casoId},client_id.eq.${caso.cliente_id ?? data.casoId}`),
      supabase
        .from("consent_exceptions")
        .select("*")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .or(`case_id.eq.${data.casoId},client_id.eq.${caso.cliente_id ?? data.casoId}`),
      supabase
        .from("privacy_alerts")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "aberto")
        .order("created_at", { ascending: false }),
      supabase
        .from("audit_logs")
        .select("id,acao,entidade,entidade_id,created_at,metadados")
        .eq("organization_id", organizationId)
        .in("entidade", ["documents", "consent_records", "consent_exceptions"])
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("client_portal_case_access")
        // `access_status` é o nome real; `status` não existe e a consulta falhava inteira (data = null).
        .select("id,status:access_status,created_at")
        .eq("case_id", data.casoId),
    ]);

    const docs = ((documentos.data ?? []) as Record<string, any>[]).filter((d) => podeVerDocumento(papel, d));
    const listaConsent = (consentimentos.data ?? []) as Record<string, any>[];
    const consentimentoAtivo = listaConsent.some(
      (c) => c["tipo_consentimento"] === "tratamento_dados" && ["ativo", "coletado"].includes(c["status"]) && !c["revogado_em"],
    );
    const excecaoVigente = ((excecoes.data ?? []) as Record<string, any>[]).some(
      (e) => !e["revogado_em"] && (!e["valido_ate"] || e["valido_ate"] >= new Date().toISOString().slice(0, 10)),
    );

    return {
      caso: caso as Record<string, any>,
      papel,
      documentos: docs,
      consentimentos: listaConsent,
      excecoes: (excecoes.data ?? []) as Record<string, any>[],
      alertas: (alertas.data ?? []) as Record<string, any>[],
      eventos: (eventos.data ?? []) as Record<string, any>[],
      acessosCliente: (acessosCliente.data ?? []) as Record<string, any>[],
      consentimentoAtivo,
      excecaoVigente,
    };
  });

export const resolverAlertaPrivacidade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("Informe o alerta.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoDocumentos(supabase, userId);
    if (!["admin", "operacoes"].includes(papel)) throw new Error("Sem permissão para tratar alertas.");
    const { data: linha, error } = await supabase
      .from("privacy_alerts")
      .update({ status: "resolvido", resolvido_em: new Date().toISOString(), resolvido_por: userId })
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linha?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do alerta.");
    return { ok: true };
  });

export const listarClientesECasos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const [clientes, casos] = await Promise.all([
      supabase
        .from("clientes")
        .select("id,nome,demo,is_demo,data_origin")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,cliente_id,status,dados_teste,data_origin")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
    ]);
    /*
     * Varredura de demonstração em todas as abas (04/10/2026, pedido da
     * Proprietária). `semFixtures` remove a linha da lista operacional sem
     * apagar nada no banco. Esta função não tinha o filtro.
     */
    return {
      clientes: semFixtures((clientes.data ?? []) as never) as unknown as Record<string, any>[],
      casos: semFixtures((casos.data ?? []) as never) as unknown as Record<string, any>[],
    };
  });
