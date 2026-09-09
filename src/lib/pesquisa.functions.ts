import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CAMPOS_EVENTO,
  CAMPOS_EVIDENCIA,
  CAMPOS_HIPOTESE,
  CAMPOS_PENDENCIA,
  CAMPOS_PESSOA,
  contextoPesquisa,
  exigirPesquisaNoCaso,
  limparCampos,
  type Sb,
} from "@/lib/pesquisa.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Bloco = "pessoas" | "hipoteses" | "evidencias" | "eventos" | "pendencias";

/** Carrega o dossiê de pesquisa completo de um caso. */
export const carregarPesquisa = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; incluirArquivados?: boolean }) => {
    if (!data.casoId) throw new Error("Informe o caso.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoPesquisa(supabase, userId);
    const arquivados = Boolean(data.incluirArquivados);

    const base = (tabela: string, coluna: string) => {
      let q = supabase
        .from(tabela)
        .select("*")
        .eq("organization_id", organizationId)
        .eq(coluna, data.casoId)
        .order("created_at", { ascending: true });
      if (!arquivados) q = q.is("archived_at", null);
      return q;
    };

    const [caso, hipoteses, evidencias, eventos, pendencias] = await Promise.all([
      supabase
        .from("crm_casos")
        .select("*")
        .eq("id", data.casoId)
        .eq("organization_id", organizationId)
        .maybeSingle(),
      base("research_hypotheses", "case_id"),
      base("evidencias", "caso_id"),
      base("research_events", "case_id"),
      base("tarefas", "caso_id"),
    ]);

    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    // 07/09/2026 — mesmo achado do cotéjo tela a tela: leitura crua de
    // case_members sem fallback para Núcleos. Arquivados não entram aqui
    // porque não havia flag `incluirArquivados` equivalente na função de
    // fallback — mantém o comportamento de sempre mostrar só pessoas ativas.
    const pessoas = { data: await pessoasDoCasoComFallbackNucleo(supabase, data.casoId) };

    const podeEditar =
      papel === "admin" ||
      papel === "operacoes" ||
      (papel === "pesquisador" && caso.data.responsavel_id === userId);

    return {
      caso: caso.data as Record<string, any>,
      pessoas: (pessoas.data ?? []) as Record<string, any>[],
      hipoteses: (hipoteses.data ?? []) as Record<string, any>[],
      evidencias: (evidencias.data ?? []) as Record<string, any>[],
      eventos: (eventos.data ?? []) as Record<string, any>[],
      pendencias: (pendencias.data ?? []) as Record<string, any>[],
      papel,
      podeEditar,
      userId,
    };
  });

/** Lista os casos disponíveis para pesquisa. */
export const listarCasosPesquisa = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoPesquisa(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo,status,pais,via,responsavel_id")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Record<string, any>[];
  });

const TABELA: Record<Bloco, { nome: string; caso: string; campos: string[] }> = {
  pessoas: { nome: "case_members", caso: "case_id", campos: CAMPOS_PESSOA },
  hipoteses: { nome: "research_hypotheses", caso: "case_id", campos: CAMPOS_HIPOTESE },
  evidencias: { nome: "evidencias", caso: "caso_id", campos: CAMPOS_EVIDENCIA },
  eventos: { nome: "research_events", caso: "case_id", campos: CAMPOS_EVENTO },
  pendencias: { nome: "tarefas", caso: "caso_id", campos: CAMPOS_PENDENCIA },
};

/** Cria ou atualiza um registro de pesquisa dentro do caso. */
export const salvarPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { bloco: Bloco; casoId: string; id?: string; dados: Record<string, unknown> }) => {
    if (!TABELA[data.bloco]) throw new Error("Bloco de pesquisa inválido.");
    if (!data.casoId) throw new Error("Informe o caso.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoPesquisa(supabase, userId);
    await exigirPesquisaNoCaso(supabase, organizationId, papel, userId, data.casoId);

    const alvo = TABELA[data.bloco];
    const dados = limparCampos(alvo.campos, data.dados);
    if (data.bloco === "evidencias" && !dados["pesquisador_id"]) {
      // O responsável pela evidência é sempre quem registra, exigência da trava do banco.
      dados["pesquisador_id"] = userId;
    }

    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: alvo.nome,
        id: data.id,
        organizationId,
        userId,
        payload: dados,
      });
      return { id: data.id };
    }

    // Idempotência (achado de 09/09/2026, rodada de limpeza pré-Perfil 360):
    // "Adicionar pendência" grava em tarefas sem a proteção que salvarTarefa
    // (ops.functions.ts) já tem — reenviar o formulário podia duplicar.
    if (data.bloco === "pendencias" && dados["titulo"]) {
      const janela = new Date(Date.now() - 60_000).toISOString();
      const { data: existente } = await supabase
        .from("tarefas")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("caso_id", data.casoId)
        .eq("titulo", dados["titulo"] as string)
        .not("status", "in", "(concluida,cancelada)")
        .is("archived_at", null)
        .gte("created_at", janela)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existente?.id) return { id: existente.id as string };
    }

    const { data: linha, error } = await supabase
      .from(alvo.nome)
      .insert({
        ...dados,
        organization_id: organizationId,
        [alvo.caso]: data.casoId,
        created_by: userId,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string };
  });

/** Arquivamento com motivo: nunca há exclusão física. */
export const arquivarPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { bloco: Bloco; casoId: string; id: string; motivo: string }) => {
    if (!TABELA[data.bloco]) throw new Error("Bloco de pesquisa inválido.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoPesquisa(supabase, userId);
    await exigirPesquisaNoCaso(supabase, organizationId, papel, userId, data.casoId);
    const alvo = TABELA[data.bloco];
    await gravarComVerificacao({
      supabase,
      tabela: alvo.nome,
      id: data.id,
      organizationId,
      userId,
      payload: {
        archived_at: new Date().toISOString(),
        archived_by: userId,
        archive_motivo: (data.motivo ?? "").trim() || "Sem motivo informado.",
      },
    });
    return { ok: true };
  });

/** Link temporário e privado para o arquivo de uma evidência (sem URL pública). */
export const linkArquivoEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { evidenciaId: string }) => {
    if (!data.evidenciaId) throw new Error("Informe a evidência.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoPesquisa(supabase, context.userId as string);
    const { data: evidencia, error } = await supabase
      .from("evidencias")
      .select("id,storage_path")
      .eq("id", data.evidenciaId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!evidencia?.storage_path) throw new Error("Esta evidência não tem arquivo anexado.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assinado = await supabaseAdmin.storage
      .from("pesquisa")
      .createSignedUrl(evidencia.storage_path as string, 120);
    if (assinado.error) throw new Error(assinado.error.message);

    await supabase.from("evidencia_acessos").insert({
      organization_id: organizationId,
      evidencia_id: data.evidenciaId,
      acao: "download",
    });

    return { url: assinado.data?.signedUrl as string };
  });
