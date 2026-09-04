import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao } from "@/lib/persistencia.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Governança e Biblioteca — funções de servidor.
 *
 * Nenhuma exclusão física: tudo é versionado (change_log) e arquivado.
 */

async function contexto(supabase: any, userId: string) {
  const h = await import("./documentos.server");
  return h.contextoDocumentos(supabase, userId);
}

async function auditar(entrada: {
  organizationId: string;
  userId: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  metadados: Record<string, unknown>;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_logs").insert({
    organization_id: entrada.organizationId,
    user_id: entrada.userId,
    acao: entrada.acao,
    entidade: entrada.entidade,
    entidade_id: entrada.entidadeId,
    metadados: entrada.metadados,
  } as any);
}

export const listarBiblioteca = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);

    const [artefatos, conhecimento, decisoes, historico] = await Promise.all([
      supabase
        .from("artifact_register")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("knowledge_items")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("decisions")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("change_log")
        .select("id, entidade, entidade_id, titulo, versao_anterior, versao_nova, resumo, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(150),
    ]);

    return {
      papel,
      organizationId,
      artefatos: artefatos.data ?? [],
      conhecimento: conhecimento.data ?? [],
      decisoes: decisoes.data ?? [],
      historico: historico.data ?? [],
    };
  });

export const salvarArtefato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    nome_original: string;
    localizacao?: string | null;
    origem?: string | null;
    classificacao?: string;
    status_recuperacao: string;
    fonte_primaria?: string | null;
    backup_historico?: string | null;
    relacao_operacional?: string | null;
    proxima_acao?: string | null;
    lacuna?: string | null;
    dominio?: string;
    responsavel_nome?: string | null;
    sucessor_id?: string | null;
    nivel_acesso?: string;
    change_resumo?: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const userId = context.userId as string;
    const { organizationId } = await contexto(supabase, userId);

    const registro = {
      nome_original: data.nome_original,
      localizacao: data.localizacao ?? null,
      origem: data.origem ?? null,
      classificacao: data.classificacao ?? "operacional",
      status_recuperacao: data.status_recuperacao,
      fonte_primaria: data.fonte_primaria ?? null,
      backup_historico: data.backup_historico ?? null,
      relacao_operacional: data.relacao_operacional ?? null,
      proxima_acao: data.proxima_acao ?? null,
      lacuna: data.lacuna ?? null,
      dominio: data.dominio ?? "operacao",
      responsavel_nome: data.responsavel_nome ?? null,
      sucessor_id: data.sucessor_id ?? null,
      nivel_acesso: data.nivel_acesso ?? "equipe",
      change_resumo: data.change_resumo ?? null,
      updated_by: userId,
    };

    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "artifact_register",
        id: data.id,
        organizationId,
        userId,
        payload: registro,
      });
      await auditar({
        organizationId, userId, acao: "artefato_atualizado", entidade: "artifact_register",
        entidadeId: data.id, metadados: { status: data.status_recuperacao },
      });
      return { id: data.id };
    }

    const { data: criado, error } = await supabase
      .from("artifact_register")
      .insert({ ...registro, organization_id: organizationId, created_by: userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await auditar({
      organizationId, userId, acao: "artefato_registrado", entidade: "artifact_register",
      entidadeId: criado.id, metadados: { nome: data.nome_original },
    });
    return { id: criado.id as string };
  });

export const arquivarArtefato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string; sucessor_id?: string | null }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const userId = context.userId as string;
    const { organizationId } = await contexto(supabase, userId);
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";

    await gravarComVerificacao({
      supabase,
      tabela: "artifact_register",
      id: data.id,
      organizationId,
      userId,
      payload: {
        archived_at: new Date().toISOString(),
        archived_by: userId,
        archive_motivo: motivo,
        sucessor_id: data.sucessor_id ?? null,
        change_resumo: `Arquivado: ${motivo}`,
      },
    });

    await auditar({
      organizationId, userId, acao: "artefato_arquivado", entidade: "artifact_register",
      entidadeId: data.id, metadados: { motivo, sucessor: data.sucessor_id ?? null },
    });
    return { ok: true };
  });

export const salvarItemConhecimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    titulo: string;
    tipo?: string;
    dominio?: string;
    status?: string;
    owner_nome?: string | null;
    fonte?: string | null;
    link_url?: string | null;
    resumo?: string | null;
    nivel_acesso?: string;
    change_resumo?: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const userId = context.userId as string;
    const { organizationId } = await contexto(supabase, userId);

    const registro = {
      titulo: data.titulo,
      tipo: data.tipo ?? "documento",
      dominio: data.dominio ?? "operacao",
      status: data.status ?? "rascunho",
      owner_nome: data.owner_nome ?? null,
      fonte: data.fonte ?? null,
      link_url: data.link_url ?? null,
      resumo: data.resumo ?? null,
      nivel_acesso: data.nivel_acesso ?? "equipe",
      change_resumo: data.change_resumo ?? null,
      ultima_revisao_em: new Date().toISOString(),
      updated_by: userId,
    };

    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "knowledge_items",
        id: data.id,
        organizationId,
        userId,
        payload: registro,
      });
      return { id: data.id };
    }

    const { data: criado, error } = await supabase
      .from("knowledge_items")
      .insert({ ...registro, organization_id: organizationId, created_by: userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: criado.id as string };
  });

export const salvarDecisao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    titulo: string;
    dominio?: string;
    status?: string;
    contexto?: string | null;
    decisao?: string | null;
    alternativas?: string | null;
    impacto?: string | null;
    responsavel_nome?: string | null;
    data_decisao?: string | null;
    vigencia_inicio?: string | null;
    vigencia_fim?: string | null;
    substitui_ids?: string[];
    evidencias?: Array<{ rotulo: string; referencia: string }>;
    nivel_acesso?: string;
    change_resumo?: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const userId = context.userId as string;
    const { organizationId } = await contexto(supabase, userId);
    const h = await import("./governanca.server");

    const status = data.status ?? "rascunho";
    if (status === "publicada") {
      const faltando = h.pendenciasDecisao(data as any);
      if (faltando.length) {
        throw new Error(`Não é possível publicar: faltam ${faltando.join(", ")}.`);
      }
    }

    const registro = {
      titulo: data.titulo,
      dominio: data.dominio ?? "governanca",
      status,
      contexto: data.contexto ?? null,
      decisao: data.decisao ?? null,
      alternativas: data.alternativas ?? null,
      impacto: data.impacto ?? null,
      responsavel_nome: data.responsavel_nome ?? null,
      responsavel_user_id: data.responsavel_nome ? null : userId,
      data_decisao: data.data_decisao ?? null,
      vigencia_inicio: data.vigencia_inicio ?? null,
      vigencia_fim: data.vigencia_fim ?? null,
      substitui_ids: data.substitui_ids ?? [],
      evidencias: data.evidencias ?? [],
      nivel_acesso: data.nivel_acesso ?? "equipe",
      change_resumo: data.change_resumo ?? null,
      updated_by: userId,
    };

    let id = data.id;
    if (id) {
      await gravarComVerificacao({
        supabase,
        tabela: "decisions",
        id,
        organizationId,
        userId,
        payload: registro,
      });
    } else {
      const { data: criado, error } = await supabase
        .from("decisions")
        .insert({ ...registro, organization_id: organizationId, created_by: userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = criado.id as string;
    }

    // Itens substituídos passam a "substituida" e apontam para a nova decisão.
    if (status === "publicada" && (data.substitui_ids?.length ?? 0) > 0) {
      const substituidos = await supabase
        .from("decisions")
        .update({ status: "substituida", substituida_por: id, change_resumo: `Substituída por ${data.titulo}.`, updated_by: userId })
        .eq("organization_id", organizationId)
        .in("id", data.substitui_ids as string[])
        .select("id");
      if (substituidos.error) throw new Error(substituidos.error.message);
      if ((substituidos.data?.length ?? 0) !== (data.substitui_ids?.length ?? 0)) {
        throw new Error(
          "NENHUMA_LINHA_AFETADA: uma ou mais decisões a substituir não foram encontradas nesta organização.",
        );
      }
    }

    await auditar({
      organizationId, userId, acao: status === "publicada" ? "decisao_publicada" : "decisao_salva",
      entidade: "decisions", entidadeId: id as string, metadados: { titulo: data.titulo, status },
    });

    return { id: id as string };
  });

export const arquivarDecisao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const userId = context.userId as string;
    const { organizationId } = await contexto(supabase, userId);

    await gravarComVerificacao({
      supabase,
      tabela: "decisions",
      id: data.id,
      organizationId,
      userId,
      payload: {
        status: "arquivada",
        archived_at: new Date().toISOString(),
        archived_by: userId,
        archive_motivo: data.motivo,
        change_resumo: `Arquivada: ${data.motivo}`,
      },
    });

    await auditar({
      organizationId, userId, acao: "decisao_arquivada", entidade: "decisions",
      entidadeId: data.id, metadados: { motivo: data.motivo },
    });
    return { ok: true };
  });
