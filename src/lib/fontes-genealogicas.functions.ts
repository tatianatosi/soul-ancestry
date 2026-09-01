import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";

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
    semCache();
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

/**
 * 30/08/2026 — achado real (P0, reportado pela proprietária no preview):
 * as 4 gravações deste arquivo faziam `.update(...).select("id").maybeSingle()`
 * sem checar se `data` voltou nulo. Quando o UPDATE bate em zero linhas —
 * RLS filtrando por permissão/organização, ou um id que não existe mais —
 * o Postgres/PostgREST não gera erro nenhum: só devolve zero linhas. A tela
 * via `r.error` vazio e declarava sucesso, e o dado nunca tinha sido gravado.
 * `gravarComVerificacao`/`inserirComVerificacao` (persistencia.server.ts,
 * já usado em caso-canonico.functions.ts) fecham esse buraco: exigem
 * `organization_id` na cláusula do UPDATE, conferem que pelo menos uma linha
 * foi afetada e relêem do banco comparando campo a campo antes de devolver
 * sucesso — a mesma regra "salvar não é o servidor não ter dado erro".
 */
export const salvarFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const userId = context.userId as string;
    const valores = filtrar(CAMPOS_FONTE, data.valores);

    if (data.id) {
      const r = await gravarComVerificacao({
        supabase,
        tabela: "genealogical_sources_catalog",
        id: data.id,
        organizationId,
        userId,
        payload: valores,
      });
      return { id: data.id, salvoEm: r.salvoEm };
    }
    const r = await inserirComVerificacao({ supabase, tabela: "genealogical_sources_catalog", organizationId, userId, payload: valores });
    return { id: r.id, salvoEm: r.salvoEm };
  });

export const salvarAvaliacaoFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const userId = context.userId as string;
    const valores = filtrar(CAMPOS_MATRIZ, data.valores);

    if (data.id) {
      const r = await gravarComVerificacao({
        supabase,
        tabela: "source_evaluation_matrix",
        id: data.id,
        organizationId,
        userId,
        payload: valores,
      });
      return { id: data.id, salvoEm: r.salvoEm };
    }
    const r = await inserirComVerificacao({ supabase, tabela: "source_evaluation_matrix", organizationId, userId, payload: valores });
    return { id: r.id, salvoEm: r.salvoEm };
  });

export const salvarBacklogFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const userId = context.userId as string;
    const valores = filtrar(CAMPOS_BACKLOG, data.valores);

    if (data.id) {
      const r = await gravarComVerificacao({
        supabase,
        tabela: "sources_activation_backlog",
        id: data.id,
        organizationId,
        userId,
        payload: valores,
      });
      return { id: data.id, salvoEm: r.salvoEm };
    }
    const r = await inserirComVerificacao({
      supabase,
      tabela: "sources_activation_backlog",
      organizationId,
      userId,
      payload: { ...valores, requires_human_approval: true },
    });
    return { id: r.id, salvoEm: r.salvoEm };
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
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    if (!data.motivo.trim()) throw new Error("Informe o motivo do arquivamento.");
    const r = await gravarComVerificacao({
      supabase,
      tabela: data.tabela,
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { archived_at: new Date().toISOString(), archive_motivo: data.motivo },
    });
    return { ok: true, salvoEm: r.salvoEm };
  });
