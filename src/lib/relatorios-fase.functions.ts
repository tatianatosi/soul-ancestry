import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CAMPOS_RELATORIO = [
  "case_id",
  "report_type",
  "report_status",
  "fase_jornada",
  "versao",
  "titulo",
  "responsavel_id",
  "revisor_id",
  "data_aprovacao",
  "data_entrega",
  "link_interno",
  "resumo_aprovado_cliente",
  "publicado_no_app",
  "observacao_interna",
  "data_origin",
  "archived_at",
  "archived_reason",
];

function filtrar(entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const c of CAMPOS_RELATORIO) if (c in entrada) out[c] = entrada[c] === "" ? null : entrada[c];
  return out;
}

function recusarNaoMapeado(entrada: Record<string, unknown>) {
  const sobra = Object.keys(entrada).filter((k) => !CAMPOS_RELATORIO.includes(k));
  if (sobra.length) throw new Error(`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: ${sobra.join(", ")}`);
}

/** Painel dos relatórios de fase do caso, com evidências e micro-entregas vinculáveis. */
export const painelRelatoriosFase = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa os relatórios de fase.");

    const [caso, relatorios, vinculos, microVinculos, evidencias, microentregas, equipe] = await Promise.all([
      supabase.from("crm_casos").select("id,codigo,titulo,pais").eq("id", data.caseId).maybeSingle(),
      supabase
        .from("case_reports")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: true }),
      supabase.from("report_evidence_links").select("*").eq("organization_id", organizationId),
      supabase.from("report_microdelivery_links").select("*").eq("organization_id", organizationId),
      supabase
        .from("evidences")
        .select("id,title_internal,workflow_status,confidence_level")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ops_microentregas")
        .select("id,titulo,fase,status")
        .eq("organization_id", organizationId)
        .eq("caso_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,nome").limit(200),
    ]);

    const ids = new Set((relatorios.data ?? []).map((r: any) => r.id));
    return {
      papel,
      podeEditar: PAPEIS_EDITA.includes(papel),
      caso: (caso.data ?? null) as any,
      relatorios: (relatorios.data ?? []) as any[],
      vinculos: ((vinculos.data ?? []) as any[]).filter((v) => ids.has(v.report_id)),
      microVinculos: ((microVinculos.data ?? []) as any[]).filter((v) => ids.has(v.report_id)),
      evidencias: (evidencias.data ?? []) as any[],
      microentregas: (microentregas.data ?? []) as any[],
      equipe: (equipe.data ?? []) as any[],
    };
  });

/** Cria ou atualiza o relatório de fase. Nenhuma geração de PDF, envio ou publicação externa. */
export const salvarRelatorioFase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode editar relatórios de fase.");

    recusarNaoMapeado(data.valores);
    const valores = filtrar(data.valores);

    const r = data.id
      ? await supabase.from("case_reports").update(valores).eq("id", data.id).select("*").maybeSingle()
      : await supabase
          .from("case_reports")
          .insert({ ...valores, organization_id: organizationId } as any)
          .select("*")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");

    const divergentes = Object.keys(valores).filter((k) => {
      const enviado = valores[k];
      if (enviado === null || enviado === undefined) return false;
      return String(enviado) !== String((r.data as any)[k] ?? "");
    });

    return { id: r.data.id as string, registro: r.data as any, divergentes };
  });

/** Vincula evidência ao relatório sem duplicar (uma evidência por relatório). */
export const vincularEvidenciaRelatorio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { reportId: string; evidenceId: string; relacao: string; observacao?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode vincular evidências a relatórios.");

    const existente = await supabase
      .from("report_evidence_links")
      .select("id")
      .eq("report_id", data.reportId)
      .eq("evidence_id", data.evidenceId)
      .maybeSingle();

    if (existente.data?.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "report_evidence_links",
        id: existente.data.id,
        organizationId,
        userId: context.userId as string,
        payload: { relacao: data.relacao, observacao_interna: data.observacao ?? null },
      });
      return { id: existente.data.id as string, duplicado: false, atualizado: true };
    }

    const r = await supabase
      .from("report_evidence_links")
      .insert({
        organization_id: organizationId,
        report_id: data.reportId,
        evidence_id: data.evidenceId,
        relacao: data.relacao,
        observacao_interna: data.observacao ?? null,
      } as any)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string, duplicado: false, atualizado: false };
  });

/** Vincula micro-entrega a um relatório existente. Nunca cria relatório novo. */
export const vincularMicroentregaRelatorio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { reportId: string; microentregaId: string; observacao?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode vincular micro-entregas.");

    const alvo = await supabase.from("case_reports").select("id").eq("id", data.reportId).maybeSingle();
    if (!alvo.data?.id) throw new Error("Relatório inexistente. Micro-entrega não cria relatório novo.");

    const existente = await supabase
      .from("report_microdelivery_links")
      .select("id")
      .eq("report_id", data.reportId)
      .eq("microentrega_id", data.microentregaId)
      .maybeSingle();
    if (existente.data?.id) return { id: existente.data.id as string, duplicado: true };

    const r = await supabase
      .from("report_microdelivery_links")
      .insert({
        organization_id: organizationId,
        report_id: data.reportId,
        microentrega_id: data.microentregaId,
        observacao_interna: data.observacao ?? null,
      } as any)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string, duplicado: false };
  });

/** Arquivamento com motivo — não existe exclusão física. */
export const arquivarRelatorioFase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode arquivar relatórios.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";

    await gravarComVerificacao({
      supabase,
      tabela: "case_reports",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { report_status: "arquivado", archived_at: new Date().toISOString(), archived_reason: motivo },
    });
    return { ok: true };
  });
