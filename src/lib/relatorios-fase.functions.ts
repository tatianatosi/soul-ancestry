import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { conteudoProjetavel } from "@/lib/biblioteca-evidencias";
import { projetarParaApp, visivelNoApp } from "@/lib/relatorios-fase";

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

    const [caso, relatorios, vinculos, microVinculos, evidencias, microentregas, equipe, modelos] = await Promise.all([
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
      // CA21-BIBLIOTECA-MESTRE-CONECTADA (09/09/2026): mesma tabela já usada por
      // listarBibliotecaMestre (Biblioteca Mestre → subárea "Modelos F1/F2"),
      // filtrada para o que interessa aqui. Só leitura de referência — nenhum
      // vínculo é gravado em case_reports, que não tem campo para isso.
      supabase
        .from("master_library_items")
        .select("id,titulo,versao,status,vigencia_estado,archived_at")
        .eq("organization_id", organizationId)
        .eq("categoria", "modelos")
        .is("archived_at", null)
        .order("titulo", { ascending: true }),
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
      modelosBiblioteca: (modelos.data ?? []) as any[],
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

    // P5 (26/09/2026) — Estágio 5 (Relatório) nunca deixava rastro em
    // `case_timeline_events` (criar/editar ficavam sem histórico, diferente
    // de evidência/projeção).
    const registro = r.data as any;
    if (registro.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: String(registro.case_id),
        eventType: "caso",
        title: data.id ? `Relatório de fase atualizado — ${registro.report_type}` : `Relatório de fase criado — ${registro.report_type}`,
        summaryInternal: `Situação: ${registro.report_status}`,
        sourceEntityType: "case_reports",
        sourceEntityId: registro.id as string,
        userId: context.userId as string,
      });
    }

    return { id: r.data.id as string, registro: r.data as any, divergentes };
  });

/**
 * P5 (26/09/2026) — fecha o gap mais concreto encontrado na auditoria da
 * cadeia de pesquisa: `case_reports.publicado_no_app` tinha validação real
 * (`visivelNoApp`) mas nenhuma rota do Portal lia `case_reports` — marcar um
 * relatório como "publicado no App" nunca tinha consequência visível para o
 * cliente. Mesmo padrão já testado de `projetarMicroentregaParaApp`
 * (biblioteca-evidencias.functions.ts): cria a projeção em RASCUNHO — a
 * publicação de fato continua exigindo a mesma revisão/aprovação humana da
 * Biblioteca Mestre (aprovarProjecao), nunca automática. Dedup por origem:
 * um relatório nunca gera duas projeções.
 */
export const projetarRelatorioParaApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { reportId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode projetar relatórios para o App.");

    const relatorio = await supabase
      .from("case_reports")
      .select("id,case_id,report_type,report_status,resumo_aprovado_cliente,publicado_no_app,fase_jornada,data_entrega,organization_id")
      .eq("id", data.reportId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!relatorio.data) throw new Error("Relatório não encontrado nesta organização.");
    if (!visivelNoApp(relatorio.data as any)) {
      throw new Error(
        "Relatório ainda não está pronto para o App: precisa estar entregue, marcado como publicado no App e com resumo aprovado.",
      );
    }

    const existente = await supabase
      .from("app_projections")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("source_entity_type", "case_report")
      .eq("source_entity_id", data.reportId)
      .is("archived_at", null)
      .maybeSingle();
    if (existente.data?.id) return { id: existente.data.id as string, criado: false };

    const projecao = projetarParaApp(relatorio.data as any);
    if (!projecao) throw new Error("Relatório ainda não está pronto para o App.");

    const checagem = conteudoProjetavel(projecao.resumo);
    if (!checagem.ok) throw new Error(checagem.erros.join(" "));

    const r = await supabase
      .from("app_projections")
      .insert({
        organization_id: organizationId,
        source_entity_type: "case_report",
        source_entity_id: data.reportId,
        case_id: relatorio.data["case_id"],
        projection_type: "relatorio_fase",
        destination: "app",
        content_sanitized: projecao.resumo,
        approval_status: "draft",
        visibility_scope: "titular",
      })
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");

    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: String(relatorio.data["case_id"]),
      eventType: "caso",
      title: "Relatório de fase projetado para o App (rascunho)",
      summaryInternal: "Ainda exige aprovação e publicação na Biblioteca Mestre.",
      sourceEntityType: "app_projections",
      sourceEntityId: r.data.id as string,
      userId: context.userId as string,
    });

    return { id: r.data.id as string, criado: true };
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
