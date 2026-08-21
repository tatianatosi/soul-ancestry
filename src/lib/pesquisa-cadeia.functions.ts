import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const VAZIO_UUID = "00000000-0000-0000-0000-000000000000";

/**
 * Leitura e escrita da cadeia de Pesquisa Genealógica e Evidências.
 * Nenhuma função aqui contata instituição, dispara OCR/IA, envia mensagem,
 * altera contrato/cobrança ou publica algo no App Cliente.
 */

/** Visão consolidada da pesquisa do caso (seções 1, 2, 6, 7 e 8). */
export const cadeiaPesquisaDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => {
    if (!d?.caseId) throw new Error("Caso inválido.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) {
      throw new Error("Seu papel não acessa a área de pesquisa e evidências.");
    }

    const pesquisa = await supabase
      .from("research_cases")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();

    const researchCaseId = (pesquisa.data as any)?.id ?? null;

    const [pessoas, variantes, relacoes, eventos, linhagens, fontes, evidencias, achados, relatorios, pendencias] =
      await Promise.all([
        researchCaseId
          ? supabase
              .from("research_people")
              .select(
                "id,canonical_name,preferred_display_name,identity_status,person_status,papel_na_linhagem,geracao,linha_transmissao,pais_localidade,birth_date,death_date,notes_internal,genealogical_person_profile_id",
              )
              .eq("organization_id", organizationId)
              .eq("research_case_id", researchCaseId)
              .is("archived_at", null)
          : { data: [] },
        supabase
          .from("research_name_variants")
          .select("id,person_id,variant_name,variant_type,status")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("research_relationships")
          .select("id,relationship_type,person_a_id,person_b_id,confidence_level,status,supporting_evidence_count")
          .eq("organization_id", organizationId)
          .eq("research_case_id", researchCaseId ?? VAZIO_UUID)
          .is("archived_at", null),
        supabase
          .from("research_events")
          .select("id,tipo,titulo,data_inicio,local,person_id,confirmado,evidencia_id")
          .eq("organization_id", organizationId)
          .eq("case_id", data.caseId)
          .is("archived_at", null),
        supabase
          .from("lineage_paths")
          .select("id,case_id,nome_da_linha,tipo_da_linha,status,objetivo,proximo_marco,geracao_alvo,responsavel")
          .eq("organization_id", organizationId)
          .eq("case_id", data.caseId),
        supabase
          .from("research_sources")
          .select(
            "id,title,source_type,repository_or_institution,source_location,access_level,source_status,consulted_at,consulted_by,result_summary_internal,external_source,archived_at,archive_reason",
          )
          .eq("organization_id", organizationId)
          .eq("research_case_id", researchCaseId ?? VAZIO_UUID),
        supabase
          .from("evidences")
          .select(
            "id,title_internal,evidence_type,workflow_status,confidence_level,legal_review_status,reviewed_by,reviewed_at,validation_notes_internal,research_person_id,source_id,reference_date,reference_location,archived_at",
          )
          .eq("organization_id", organizationId)
          .eq("case_id", data.caseId)
          .order("created_at", { ascending: false }),
        supabase
          .from("genealogical_findings")
          .select(
            "id,title,finding_type,validation_status,confidence,client_projection_status,internal_summary,responsible_user_id,updated_at",
          )
          .eq("organization_id", organizationId)
          .eq("case_id", data.caseId)
          .is("archived_at", null),
        researchCaseId
          ? supabase
              .from("research_reports")
              .select(
                "id,report_type,title,status,version,internal_reference,evidence_summary_internal,approved_summary_client,responsible_user_id,approved_by,approved_at,published_at,updated_at",
              )
              .eq("organization_id", organizationId)
              .eq("research_case_id", researchCaseId)
              .order("updated_at", { ascending: false })
          : { data: [] },
        supabase
          .from("research_pending_items")
          .select("id,title,description,status,category,severity,due_at,responsible_user_id,blocking_reason")
          .eq("organization_id", organizationId)
          .eq("research_case_id", researchCaseId ?? VAZIO_UUID)
          .is("archived_at", null),
      ]);

    return {
      papel,
      podeEditar: PAPEIS_EDITA.includes(papel),
      pesquisa: (pesquisa.data ?? null) as any,
      pessoas: ((pessoas as any).data ?? []) as any[],
      variantes: ((variantes as any).data ?? []) as any[],
      relacoes: ((relacoes as any).data ?? []) as any[],
      eventos: ((eventos as any).data ?? []) as any[],
      linhagens: ((linhagens as any).data ?? []) as any[],
      fontes: ((fontes as any).data ?? []) as any[],
      evidencias: ((evidencias as any).data ?? []) as any[],
      achados: ((achados as any).data ?? []) as any[],
      relatorios: ((relatorios as any).data ?? []) as any[],
      pendencias: ((pendencias as any).data ?? []) as any[],
    };
  });

/**
 * Cria (uma única vez) a área de pesquisa do caso em estado de preparação,
 * sem pessoas, relações, eventos, linhagens ou evidências presumidas.
 */
export const prepararAreaPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; objetivo: string; tipo?: string }) => {
    if (!d?.caseId) throw new Error("Caso inválido.");
    if (!d?.objetivo || d.objetivo.trim().length < 5) throw new Error("Descreva o objetivo interno da pesquisa.");
    return { caseId: d.caseId, objetivo: d.objetivo.trim(), tipo: d.tipo?.trim() || "genealogica" };
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode preparar a área de pesquisa.");

    const existente = await supabase
      .from("research_cases")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .maybeSingle();
    if (existente.data?.id) return { id: existente.data.id, criado: false };

    const r = await supabase
      .from("research_cases")
      .insert({
        organization_id: organizationId,
        case_id: data.caseId,
        research_type: data.tipo,
        research_objective: data.objetivo,
        status: "preparacao_pendente",
        external_research_authorization_status: "pendente",
        created_by: context.userId,
      })
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id, criado: true };
  });

/** Atualiza campos internos da Visão de pesquisa (sem iniciar nada externo). */
export const salvarVisaoPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; valores: Record<string, unknown> }) => {
    if (!d?.id) throw new Error("Pesquisa inválida.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode editar a pesquisa.");

    const permitidos = [
      "research_objective",
      "internal_hypothesis",
      "authorized_scope",
      "status",
      "external_research_authorization_status",
      "assigned_researcher_user_id",
      "next_milestone",
      "next_research_action",
      "next_research_action_due_at",
      "citizenship_track_id",
    ];
    const valores: Record<string, unknown> = {};
    for (const k of permitidos) if (k in data.valores) valores[k] = data.valores[k] === "" ? null : data.valores[k];
    const sobra = Object.keys(data.valores).filter((k) => !permitidos.includes(k));
    if (sobra.length) throw new Error(`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: ${sobra.join(", ")}`);

    const r = await supabase
      .from("research_cases")
      .update({ ...valores, updated_by: context.userId })
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { ok: true };
  });

/** Muda a situação de uma evidência com nota interna obrigatória de validação. */
export const mudarEstadoEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string; nota?: string }) => {
    if (!d?.id || !d?.status) throw new Error("Evidência ou situação inválida.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode alterar evidências.");

    const revisando = ["validada_internamente", "aprovada_para_entrega_cliente", "em_revisao"].includes(data.status);
    const r = await supabase
      .from("evidences")
      .update({
        workflow_status: data.status,
        validation_notes_internal: data.nota?.trim() || null,
        reviewed_by: revisando ? context.userId : undefined,
        reviewed_at: revisando ? new Date().toISOString() : undefined,
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .select("id,workflow_status")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { ok: true, status: r.data.workflow_status };
  });

/** Arquivamento lógico de registros da cadeia; exclusão física é proibida no banco. */
export const arquivarRegistroPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tabela: string; id: string; motivo: string }) => {
    const tabelas = ["research_sources", "evidences", "genealogical_findings", "research_reports", "research_people"];
    if (!tabelas.includes(d?.tabela)) throw new Error("Registro não arquivável por esta rotina.");
    if (!d?.id) throw new Error("Registro inválido.");
    if (!d?.motivo || d.motivo.trim().length < 5) throw new Error("Informe o motivo do arquivamento.");
    return { tabela: d.tabela, id: d.id, motivo: d.motivo.trim() };
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode arquivar registros de pesquisa.");

    const campoMotivo = data.tabela === "evidences" ? "archived_reason" : "archive_reason";
    const patch: Record<string, unknown> = {
      archived_at: new Date().toISOString(),
      [campoMotivo]: data.motivo,
    };
    if (data.tabela !== "evidences") patch["archived_by"] = context.userId;

    const r = await supabase
      .from(data.tabela)
      .update(patch)
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { ok: true };
  });
