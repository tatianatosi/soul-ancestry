/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Escritor do Histórico por fase (item E, 07/10/2026). Mesma tabela do
 * histórico automático já exibido em Caso 360 (`case_timeline_events`) —
 * ver `historico-fase.ts` para o porquê de não haver tabela nova.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import {
  MARCADOR_HISTORICO_FASE,
  paraRegistroHistorico,
  validarEntradaHistorico,
  type EntradaHistoricoFase,
} from "@/lib/historico-fase";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

export const painelHistoricoFase = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: linhas, error } = await supabase
      .from("case_timeline_events")
      .select("id,event_type,occurred_at,title,summary_internal,created_at,responsavel_nome")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .eq("source_entity_type", MARCADOR_HISTORICO_FASE)
      .is("archived_at", null)
      .order("occurred_at", { ascending: false });
    if (error) throw new Error(error.message);

    return { registros: (linhas ?? []).map((l: Record<string, unknown>) => paraRegistroHistorico(l)) };
  });

export const registrarHistoricoFase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string } & EntradaHistoricoFase) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const erros = validarEntradaHistorico(data);
    if (erros.length) throw new Error(erros.join(" "));

    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    const r = await inserirComVerificacao({
      supabase,
      tabela: "case_timeline_events",
      organizationId,
      userId,
      payload: {
        case_id: data.caseId,
        event_type: data.fase,
        source_entity_type: MARCADOR_HISTORICO_FASE,
        source_entity_id: data.caseId,
        title: data.fonte.trim(),
        summary_internal: data.conteudo.trim(),
        occurred_at: new Date(data.dataOcorrencia).toISOString(),
        status: "registrado",
        visibility: "interno",
      },
    });

    await registrarAuditoria(supabase, {
      organization_id: organizationId,
      entidade: "case_timeline_events",
      entidade_id: r.id,
      acao: "historico_fase_registrado",
      user_id: userId,
      valores_posteriores: { fase: data.fase, fonte: data.fonte, data: data.dataOcorrencia },
      metadados: { case_id: data.caseId },
    });

    return { ok: true, id: r.id, salvoEm: r.salvoEm };
  });

export const arquivarHistoricoFase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; registroId: string; motivo: string }) => {
    if (!data?.registroId) throw new Error("Registro não informado.");
    if (!String(data?.motivo ?? "").trim()) throw new Error("Informe o motivo do arquivamento.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const agora = new Date().toISOString();

    const r = await gravarComVerificacao({
      supabase,
      tabela: "case_timeline_events",
      id: data.registroId,
      organizationId,
      userId,
      payload: { archived_at: agora, archived_by: userId, archive_motivo: data.motivo.trim() },
    });

    await registrarAuditoria(supabase, {
      organization_id: organizationId,
      entidade: "case_timeline_events",
      entidade_id: data.registroId,
      acao: "historico_fase_arquivado",
      user_id: userId,
      metadados: { case_id: data.caseId, motivo: data.motivo.trim() },
    });

    return { ok: true, salvoEm: r.salvoEm };
  });
