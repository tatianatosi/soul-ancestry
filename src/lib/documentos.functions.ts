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
  limparTexto,
  podeBaixarDocumento,
  podeVerDocumento,
  type Sb,
} from "@/lib/documentos.server";

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

/** Cria ou atualiza o registro do documento (as travas do banco validam consentimento e liberação). */
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
      storagePath?: string;
      nomeArquivo?: string;
      mimeType?: string;
      tamanhoBytes?: number;
    }) => {
      if (!data?.titulo || data.titulo.trim().length < 2) throw new Error("Informe um título.");
      if (!CATEGORIAS[data.categoria]) throw new Error("Categoria inválida.");
      if (!SENSIBILIDADES[data.sensibilidade]) throw new Error("Classificação de sensibilidade inválida.");
      if (!VISIBILIDADES[data.visibilidade]) throw new Error("Visibilidade inválida.");
      if (!STATUS_DOCUMENTO[data.status]) throw new Error("Status inválido.");
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
    };
    if (data.storagePath) {
      corpo["storage_path"] = data.storagePath;
      corpo["nome_arquivo"] = limparTexto(data.nomeArquivo, 200);
      corpo["mime_type"] = limparTexto(data.mimeType, 120);
      corpo["tamanho_bytes"] = data.tamanhoBytes ?? null;
    }

    if (data.id) {
      const { error } = await supabase
        .from("documents")
        .update(corpo)
        .eq("id", data.id)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
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
    return { id: linha?.id as string };
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
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!PAPEIS_UPLOAD.includes(papel)) throw new Error("Seu papel não permite arquivar documentos.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const { error } = await supabase
      .from("documents")
      .update({ archived_at: new Date().toISOString(), archive_motivo: motivo, status: "arquivado" })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
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
      if (!data.versaoTexto?.trim()) throw new Error("Informe a versão do texto aceito.");
      if (!data.metodoColeta?.trim()) throw new Error("Informe o método de coleta.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!["admin", "operacoes", "comercial"].includes(papel)) {
      throw new Error("Somente administração, operações ou comercial registram consentimentos.");
    }
    const { error } = await supabase.from("consent_records").insert({
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
      status: "ativo",
    });
    if (error) throw new Error(error.message);
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
    const { organizationId, papel } = await contextoDocumentos(supabase, context.userId as string);
    if (!["admin", "operacoes"].includes(papel)) {
      throw new Error("Somente administração ou operações revogam consentimentos.");
    }
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const { error } = await supabase
      .from("consent_records")
      .update({
        status: "revogado",
        revogado_em: new Date().toISOString(),
        revogacao_motivo: motivo.slice(0, 1000),
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
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
    const { error } = await supabase.from("consent_exceptions").insert({
      organization_id: organizationId,
      case_id: data.casoId ?? null,
      client_id: data.clienteId ?? null,
      motivo: motivo.slice(0, 1000),
      valido_ate: data.validoAte || null,
      aprovado_por: userId,
    });
    if (error) throw new Error(error.message);
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
        .select("id,status,created_at")
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
    const { error } = await supabase
      .from("privacy_alerts")
      .update({ status: "resolvido", resolvido_em: new Date().toISOString(), resolvido_por: userId })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listarClientesECasos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoDocumentos(supabase, context.userId as string);
    const [clientes, casos] = await Promise.all([
      supabase.from("clientes").select("id,nome").eq("organization_id", organizationId).is("archived_at", null),
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,cliente_id,status")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
    ]);
    return {
      clientes: (clientes.data ?? []) as Record<string, any>[],
      casos: (casos.data ?? []) as Record<string, any>[],
    };
  });
