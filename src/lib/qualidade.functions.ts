import { semCache } from "@/lib/no-store";
import { semFixtures } from "@/lib/fixtures";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CONJUNTOS_CSV,
  contextoQualidade,
  paraCsv,
  type Sb,
} from "@/lib/qualidade.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Executa a varredura de qualidade no banco e devolve o resumo. */
export const rodarVarredura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    if (!ctx.podeTratar) throw new Error("Somente admin e operações executam a varredura.");
    const { data, error } = await supabase.rpc("quality_scan", { _org: ctx.organizationId });
    if (error) throw new Error(error.message);
    const linha = Array.isArray(data) ? data[0] : data;
    return {
      criadas: Number(linha?.criadas ?? 0),
      sanadas: Number(linha?.sanadas ?? 0),
      abertas: Number(linha?.abertas ?? 0),
    };
  });

type FiltroIssues = { severidade?: string; status?: string; dominio?: string; casoId?: string };

/** Lista inconsistências com o caso relacionado. */
export const listarInconsistencias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: FiltroIssues) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);

    let q = supabase
      .from("quality_issues")
      .select("*, crm_casos(codigo,titulo,status,fase)")
      .eq("organization_id", ctx.organizationId)
      .order("detectada_em", { ascending: false });

    if (data.severidade) q = q.eq("severidade", data.severidade);
    if (data.status) q = q.eq("status", data.status);
    else q = q.in("status", ["aberta", "reconhecida", "resolvida", "falso_positivo"]);
    if (data.dominio) q = q.eq("dominio", data.dominio);
    if (data.casoId) q = q.eq("case_id", data.casoId);

    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);

    const abertas = (linhas ?? []).filter((l: any) => ["aberta", "reconhecida"].includes(l.status));
    const resumo = { critica: 0, alta: 0, media: 0, baixa: 0 } as Record<string, number>;
    for (const l of abertas) resumo[l.severidade] = (resumo[l.severidade] ?? 0) + 1;

    return {
      inconsistencias: (linhas ?? []) as Record<string, any>[],
      resumo,
      papel: ctx.papel,
      ehAdmin: ctx.ehAdmin,
      podeTratar: ctx.podeTratar,
    };
  });

type Tratamento = {
  id: string;
  acao: "reconhecer" | "resolver" | "falso_positivo";
  comentario: string;
  evidencia?: string;
};

/** Reconhece, resolve ou marca falso positivo — sempre com autor, data e comentário. */
export const tratarInconsistencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Tratamento) => {
    if (!data?.id) throw new Error("Inconsistência não informada.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    if (!ctx.podeTratar) throw new Error("Somente admin e operações tratam inconsistências.");

    const status =
      data.acao === "reconhecer" ? "reconhecida" : data.acao === "resolver" ? "resolvida" : "falso_positivo";
    const comentario = (data.comentario ?? "").trim() || "Sem comentário informado.";

    const { data: linha, error } = await supabase
      .from("quality_issues")
      .update({
        status,
        resolucao_comentario: comentario,
        resolucao_evidencia: data.evidencia?.trim() || null,
        reconhecida_por: status === "reconhecida" ? context.userId : undefined,
        resolvida_por: status === "reconhecida" ? undefined : context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", ctx.organizationId)
      .select("id,status,case_id,titulo")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linha) throw new Error("Inconsistência não encontrada nesta organização.");
    if (linha.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId: ctx.organizationId,
        caseId: linha.case_id as string,
        eventType: "caso",
        title: `Inconsistência de qualidade: ${status}`,
        summaryInternal: `${String(linha.titulo ?? "")} — ${comentario}`,
        sourceEntityType: "quality_issues",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return linha as Record<string, any>;
  });

/** Relatório operacional semanal calculado no banco. */
export const relatorioSemanal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { inicio?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    const { data: json, error } = await supabase.rpc("quality_relatorio_semanal", {
      _org: ctx.organizationId,
      _inicio: data.inicio || null,
    });
    if (error) throw new Error(error.message);
    return { relatorio: (json ?? {}) as Record<string, any>, ehAdmin: ctx.ehAdmin };
  });

/** Casos com o resumo do checklist e itens do caso selecionado. */
export const listarChecklists = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);

    const [casos, modelos, itens] = await Promise.all([
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,status,fase,tipo_servico,demo,dados_teste,data_origin")
        .eq("organization_id", ctx.organizationId)
        .is("archived_at", null)
        .order("codigo"),
      supabase
        .from("quality_checklist_templates")
        .select("*")
        .eq("organization_id", ctx.organizationId)
        .is("archived_at", null)
        .order("fase")
        .order("ordem"),
      data.casoId
        ? supabase
            .from("case_checklist_items")
            .select("*")
            .eq("organization_id", ctx.organizationId)
            .eq("case_id", data.casoId)
            .is("archived_at", null)
            .order("fase")
            .order("ordem")
        : Promise.resolve({ data: [], error: null }),
    ]);

    for (const r of [casos, modelos, itens] as any[]) if (r.error) throw new Error(r.error.message);

    return {
      /*
        Corte 1c-bis (03/10/2026): este é o seletor de caso do checklist de
        qualidade e listava todos os casos — incluindo os 2 demo/teste que o
        banco tem ativos hoje. Fixture segue existindo, fora do seletor.
      */
      casos: semFixtures((casos.data ?? []) as Record<string, any>[]) as Record<string, any>[],
      modelos: (modelos.data ?? []) as Record<string, any>[],
      itens: ((itens as any).data ?? []) as Record<string, any>[],
      podeTratar: ctx.podeTratar,
    };
  });

/** Gera os itens de checklist do caso a partir dos modelos do tipo de serviço e fase. */
export const sincronizarChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => {
    if (!data?.casoId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    if (!ctx.podeTratar) throw new Error("Somente admin e operações geram checklists.");
    const { data: n, error } = await supabase.rpc("quality_sync_checklist", { _case: data.casoId });
    if (error) throw new Error(error.message);
    const criados = Number(n ?? 0);
    if (criados > 0) {
      await registrarTimelineCaso(supabase, {
        organizationId: ctx.organizationId,
        caseId: data.casoId,
        eventType: "caso",
        title: "Checklist de qualidade sincronizado",
        summaryInternal: `${criados} item(ns) gerado(s) a partir do modelo do serviço/fase.`,
        sourceEntityType: "quality_checklist_items",
        sourceEntityId: data.casoId,
        userId: context.userId as string,
      });
    }
    return { criados };
  });

/** Atualiza um item de checklist (o banco exige justificativa em "não aplicável"). */
export const marcarItemChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string; observacao?: string; evidenciaUrl?: string }) => {
    if (!data?.id) throw new Error("Item não informado.");
    if (!["pendente", "cumprido", "nao_aplicavel"].includes(data.status))
      throw new Error("Situação inválida para o item.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    if (!ctx.podeTratar) throw new Error("Somente admin e operações atualizam checklists.");
    const observacao =
      data.status === "nao_aplicavel"
        ? (data.observacao ?? "").trim() || "Não aplicável — sem justificativa informada."
        : data.observacao?.trim() || null;

    const { data: linhaAtualizada, error } = await supabase
      .from("case_checklist_items")
      .update({
        status: data.status,
        observacao,
        evidencia_url: data.evidenciaUrl?.trim() || null,
        concluido_por: data.status === "pendente" ? null : context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", ctx.organizationId)
      .select("id,case_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linhaAtualizada?.id) throw new Error("NENHUMA_LINHA_AFETADA: item de checklist não encontrado nesta organização.");
    if (linhaAtualizada.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId: ctx.organizationId,
        caseId: linhaAtualizada.case_id as string,
        eventType: "caso",
        title: `Item de checklist: ${data.status}`,
        summaryInternal: observacao ?? undefined,
        sourceEntityType: "case_checklist_items",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/** Prévia da exportação: campos incluídos e contagem, sem gerar o arquivo. */
export const previewExportacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { conjunto: string }) => data ?? { conjunto: "inconsistencias" })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    const conjunto = CONJUNTOS_CSV[data.conjunto];
    if (!conjunto) throw new Error("Conjunto de exportação desconhecido.");
    const linhas = await coletar(supabase, ctx.organizationId, data.conjunto);
    return {
      conjunto: data.conjunto,
      rotulo: conjunto.rotulo,
      descricao: conjunto.descricao,
      campos: conjunto.campos,
      linhas: linhas.length,
      ehAdmin: ctx.ehAdmin,
    };
  });

/** Exportação CSV: apenas admin, campos fixos e registro de auditoria. */
export const exportarCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { conjunto: string; confirmado: boolean }) => {
    if (!data?.confirmado) throw new Error("Confirme os campos incluídos antes de exportar.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    if (!ctx.ehAdmin) throw new Error("Exportação CSV é restrita à administração.");

    const conjunto = CONJUNTOS_CSV[data.conjunto];
    if (!conjunto) throw new Error("Conjunto de exportação desconhecido.");

    const linhas = await coletar(supabase, ctx.organizationId, data.conjunto);
    const csv = paraCsv(conjunto.campos, linhas);

    const campos = conjunto.campos.map((c) => c.chave);
    const { error: erroLog } = await supabase.from("quality_exports").insert({
      organization_id: ctx.organizationId,
      conjunto: data.conjunto,
      campos,
      filtros: {},
      linhas: linhas.length,
      exportado_por: context.userId,
    });
    if (erroLog) throw new Error(erroLog.message);

    await registrarAuditoria(supabase, {
      organization_id: ctx.organizationId,
      user_id: context.userId,
      acao: "export_csv",
      entidade: "quality_exports",
      metadados: { conjunto: data.conjunto, campos, linhas: linhas.length },
    });

    return {
      nome: `clube-ancestral-${data.conjunto}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      linhas: linhas.length,
    };
  });

/** Histórico de exportações para auditoria interna. */
export const listarExportacoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("quality_exports")
      .select("*")
      .eq("organization_id", ctx.organizationId)
      .order("exportado_em", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { exportacoes: (data ?? []) as Record<string, any>[] };
  });

/**
 * A09 (04/11/2026): erros do app e recusas do servidor dos últimos 7 dias, para leitura da
 * proprietária. Lê `audit_logs` com a sessão dela (a política do banco já restringe a leitura ao
 * admin da organização); erro de leitura aparece, nunca vira lista vazia.
 */
export const listarErrosERecusas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoQualidade(supabase, context.userId as string);
    if (!ctx.ehAdmin) {
      return { permitido: false as const, registros: [], desde: null as string | null };
    }
    const { ACAO_ERRO_APP, ACOES_DE_RECUSA, legivel } = await import("@/lib/erros-e-recusas");
    const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id,created_at,acao,entidade,user_id,metadados")
      .eq("organization_id", ctx.organizationId)
      .in("acao", [ACAO_ERRO_APP, ...ACOES_DE_RECUSA])
      .gte("created_at", desde)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(`Não foi possível ler os registros de erro: ${error.message}`);
    return { permitido: true as const, registros: ((data ?? []) as any[]).map(legivel), desde };
  });

/** Monta as linhas de cada conjunto usando somente os campos autorizados. */
async function coletar(supabase: Sb, org: string, conjunto: string): Promise<Record<string, any>[]> {
  if (conjunto === "inconsistencias") {
    const { data, error } = await supabase
      .from("quality_issues")
      .select("regra_key,dominio,severidade,entidade,titulo,status,detectada_em,resolvida_em")
      .eq("organization_id", org)
      .order("detectada_em", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Record<string, any>[];
  }

  if (conjunto === "relatorio_semanal") {
    const { data, error } = await supabase.rpc("quality_relatorio_semanal", { _org: org, _inicio: null });
    if (error) throw new Error(error.message);
    const rel = (data ?? {}) as Record<string, any>;
    return Object.entries(rel)
      .filter(([, v]) => typeof v === "number" || typeof v === "string")
      .map(([indicador, valor]) => ({ indicador, valor }));
  }

  if (conjunto === "checklists") {
    const { data, error } = await supabase
      .from("case_checklist_items")
      .select("fase,item_key,label,obrigatorio,status,concluido_em,crm_casos(codigo)")
      .eq("organization_id", org)
      .is("archived_at", null);
    if (error) throw new Error(error.message);
    return ((data ?? []) as any[]).map((l) => ({
      caso_codigo: l.crm_casos?.codigo ?? "",
      fase: l.fase,
      item_key: l.item_key,
      label: l.label,
      obrigatorio: l.obrigatorio ? "sim" : "não",
      status: l.status,
      concluido_em: l.concluido_em ?? "",
    }));
  }

  return [];
}
