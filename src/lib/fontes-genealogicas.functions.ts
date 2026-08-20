import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CAMPOS_FONTE = [
  "nome",
  "pais_eixo",
  "citizenship_track_id",
  "tipo_de_acervo",
  "cobertura_temporal",
  "cobertura_geografica",
  "nivel_de_fonte",
  "acesso",
  "licenca_termos",
  "url_referencia_interna",
  "custo",
  "autenticacao_necessaria",
  "trata_dados_pessoais",
  "risco",
  "uso_recomendado",
  "prioridade",
  "modo_de_uso_permitido",
  "scraping_status",
  "ultima_verificacao",
  "status_documentacao",
  "status_integracao",
  "proxima_acao",
  "observacao_risco",
  "responsavel_revisao",
  "estagio_maturidade",
];

const CAMPOS_MATRIZ = ["source_id", "criterio", "nota", "parecer_interno", "evidencia_interna", "avaliado_em", "avaliado_por", "bloqueante"];

const CAMPOS_BACKLOG = [
  "source_id",
  "acao_interna",
  "motivo",
  "prioridade",
  "status",
  "responsavel",
  "prazo",
  "bloqueio_atual",
  "resultado_interno",
];

function filtrar(campos: string[], entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const c of campos) if (c in entrada) out[c] = entrada[c] === "" ? null : entrada[c];
  return out;
}

/** Painel interno do catálogo de fontes. Somente leitura de dados internos. */
export const painelFontes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa o catálogo de fontes genealógicas.");

    const org = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [fontes, matriz, backlog] = await Promise.all([
      org("genealogical_sources_catalog").order("nome", { ascending: true }),
      org("source_evaluation_matrix").is("archived_at", null),
      org("sources_activation_backlog").is("archived_at", null).order("prazo", { ascending: true }),
    ]);

    return {
      podeEditar: PAPEIS_EDITA.includes(papel),
      fontes: (fontes.data ?? []) as Record<string, any>[],
      matriz: (matriz.data ?? []) as Record<string, any>[],
      backlog: (backlog.data ?? []) as Record<string, any>[],
    };
  });

async function autorizarEscrita(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode editar o catálogo de fontes genealógicas.");
  return organizationId;
}

export const salvarFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_FONTE, data.valores);

    const r = data.id
      ? await supabase.from("genealogical_sources_catalog").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("genealogical_sources_catalog")
          .insert({ ...valores, organization_id: organizationId })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

export const salvarAvaliacaoFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_MATRIZ, data.valores);

    const r = data.id
      ? await supabase.from("source_evaluation_matrix").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("source_evaluation_matrix")
          .insert({ ...valores, organization_id: organizationId })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

export const salvarBacklogFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_BACKLOG, data.valores);

    const r = data.id
      ? await supabase.from("sources_activation_backlog").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("sources_activation_backlog")
          .insert({ ...valores, organization_id: organizationId, requires_human_approval: true })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

/** Sem exclusão física: apenas arquivamento com motivo. */
export const arquivarRegistroG08 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tabela: "genealogical_sources_catalog" | "source_evaluation_matrix" | "sources_activation_backlog";
      id: string;
      motivo: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    if (!data.motivo.trim()) throw new Error("Informe o motivo do arquivamento.");
    const r = await supabase
      .from(data.tabela)
      .update({ archived_at: new Date().toISOString(), archive_motivo: data.motivo })
      .eq("id", data.id);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });
