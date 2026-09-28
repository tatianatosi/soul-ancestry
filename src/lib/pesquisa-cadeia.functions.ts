import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { statusEvidenciaCanonico, statusPesquisaCanonico, validarTransicaoEvidencia } from "@/lib/pesquisa-cadeia";
import { workflowStatusDeEvidenciaModulo } from "@/lib/rotulo-negocio";
import { idsJaCopiados } from "@/lib/fontes-pesquisa-canonicas";

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
    semCache();
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

    const [pessoas, relacoes, eventos, eventosModulo, linhagens, fontes, evidencias, evidenciasModulo, achados, relatorios, pendencias, relacoesGen, eventosGen] =
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
        researchCaseId
          ? supabase
              .from("research_case_events")
              .select("id,event_type,event_date,location_text,person_id,status,confidence_level,notes_internal")
              .eq("organization_id", organizationId)
              .eq("research_case_id", researchCaseId)
              .is("archived_at", null)
          : { data: [] },
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
        researchCaseId
          ? supabase
              .from("research_evidence_items")
              .select(
                "id,title,evidence_type,evidence_status,confidence_level,person_id,source_id,reviewed_by,reviewed_at,validation_rationale,archived_at",
              )
              .eq("organization_id", organizationId)
              .eq("research_case_id", researchCaseId)
              .is("archived_at", null)
          : { data: [] },
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
        // 24/09/2026 — camada genealógica canônica (fontes-pesquisa-canonicas.ts).
        supabase
          .from("genealogical_relationships")
          .select("id,relation_type,person_from_id,person_to_id,confidence_level,status,supporting_evidence_count,internal_notes")
          .eq("organization_id", organizationId)
          .eq("case_id", data.caseId)
          .is("archived_at", null),
        supabase
          .from("genealogical_events")
          .select("id,event_type,start_date,locality,person_id,validation_status,evidence_id,description_internal")
          .eq("organization_id", organizationId)
          .eq("case_id", data.caseId)
          .is("archived_at", null),
      ]);

    const pessoasLista = ((pessoas as any).data ?? []) as any[];
    const idsPessoas = new Set(pessoasLista.map((p) => p.id));
    const variantes = idsPessoas.size
      ? await supabase
          .from("research_name_variants")
          .select("id,person_id,variant_name,variant_type,status")
          .eq("organization_id", organizationId)
          .in("person_id", [...idsPessoas])
          .is("archived_at", null)
      : { data: [] };
    const evidenciasCadeia = ((evidencias as any).data ?? []) as any[];
    const evidenciasDoModulo = (((evidenciasModulo as any).data ?? []) as any[]).map((e) => ({
      ...e,
      title_internal: e.title ?? e.title_internal,
      workflow_status: workflowStatusDeEvidenciaModulo(e.evidence_status),
    }));
    /*
      24/09/2026 — canônica primeiro: genealogical_events / _relationships.
      Legado (research_events, research_case_events, research_relationships)
      só aparece enquanto não foi copiado pela ponte, marcado como legado.
    */
    const eventosCanonicos = (((eventosGen as any).data ?? []) as any[]).map((e) => ({
      id: e.id,
      tipo: e.event_type,
      titulo: e.event_type,
      data_inicio: e.start_date,
      local: e.locality,
      person_id: e.person_id,
      confirmado: e.validation_status === "confirmado",
      legado: false,
    }));
    const eventosModuloCopiados = idsJaCopiados(
      (((eventosGen as any).data ?? []) as any[]).map((e) => e.description_internal),
      "research_case_events",
    );
    const eventosCadeia = (((eventos as any).data ?? []) as any[]).map((e) => ({ ...e, legado: true }));
    const eventosDoModulo = (((eventosModulo as any).data ?? []) as any[])
      .filter((e) => !eventosModuloCopiados.has(String(e.id).toLowerCase()))
      .map((e) => ({
        ...e,
        tipo: e.event_type ?? e.tipo,
        titulo: e.event_type ?? e.titulo,
        data_inicio: e.event_date ?? e.data_inicio,
        local: e.location_text ?? e.local,
        legado: true,
      }));
    const relacoesCopiadas = idsJaCopiados(
      (((relacoesGen as any).data ?? []) as any[]).map((r) => r.internal_notes),
      "research_relationships",
    );
    const relacoesCanonicas = (((relacoesGen as any).data ?? []) as any[]).map((r) => ({
      id: r.id,
      relationship_type: r.relation_type,
      person_a_id: r.person_from_id,
      person_b_id: r.person_to_id,
      confidence_level: r.confidence_level,
      status: r.status,
      supporting_evidence_count: r.supporting_evidence_count,
      legado: false,
    }));

    return {
      papel,
      podeEditar: PAPEIS_EDITA.includes(papel),
      pesquisa: (pesquisa.data ?? null) as any,
      pessoas: pessoasLista,
      variantes: (((variantes as any).data ?? []) as any[]).filter((v) => idsPessoas.has(v.person_id)),
      relacoes: [
        ...relacoesCanonicas,
        ...(((relacoes as any).data ?? []) as any[])
          .filter((r) => !relacoesCopiadas.has(String(r.id).toLowerCase()))
          .map((r) => ({ ...r, legado: true })),
      ],
      eventos: [...eventosCanonicos, ...eventosCadeia, ...eventosDoModulo],
      linhagens: ((linhagens as any).data ?? []) as any[],
      fontes: ((fontes as any).data ?? []) as any[],
      evidencias: [...evidenciasCadeia, ...evidenciasDoModulo],
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

    // Corte U1 (28/09/2026): a pesquisa nasce com a linha familiar que a
    // Discovery já capturou (lead de origem do caso), marcada "a confirmar" —
    // a equipe não redigita. Autorização externa continua "pending": o
    // consentimento da Discovery não autoriza pesquisa externa sozinho.
    const { data: casoOrigem } = await supabase
      .from("crm_casos")
      .select("lead_id,citizenship_track_id")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    let linhaDaDiscovery: string | null = null;
    if (casoOrigem?.lead_id) {
      const { data: leadOrigem } = await supabase
        .from("leads")
        .select("*")
        .eq("id", casoOrigem.lead_id)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (leadOrigem) {
        const { resumoLinhaFamiliarDaDiscovery } = await import("@/lib/handoff-triagem");
        const texto = resumoLinhaFamiliarDaDiscovery(leadOrigem as never);
        linhaDaDiscovery = texto ? `Vindo da Discovery (a confirmar):\n${texto}` : null;
      }
    }

    const r = await supabase
      .from("research_cases")
      .insert({
        organization_id: organizationId,
        case_id: data.caseId,
        research_objective: data.objetivo,
        status: "preparation",
        external_research_authorization_status: "pending",
        family_line_summary_internal: linhaDaDiscovery,
        citizenship_track_id: casoOrigem?.citizenship_track_id ?? null,
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
    if ("status" in valores) {
      const canonico = statusPesquisaCanonico(valores.status);
      if (!canonico) throw new Error("Situação da pesquisa inválida para este registro.");
      valores.status = canonico;
    }
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

/** Muda a situação de uma evidência: só transições permitidas, com autor, justificativa e origem. */
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

    const atual = await supabase
      .from("evidences")
      .select("id,workflow_status,data_origin,evidence_nature")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (atual.error) throw new Error(atual.error.message);
    if (!atual.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");

    const deBruto = String((atual.data as any).workflow_status ?? "recebida");
    const de = statusEvidenciaCanonico(deBruto) ?? deBruto;
    const para = statusEvidenciaCanonico(data.status);
    if (!para) throw new Error("Situação de evidência desconhecida.");
    const origem = String((atual.data as any).data_origin ?? (atual.data as any).evidence_nature ?? "");
    const check = validarTransicaoEvidencia({
      de,
      para,
      autor: context.userId as string,
      justificativa: data.nota ?? "",
      origem,
    });
    if (!check.ok) throw new Error(check.erro as string);

    const revisando = ["aprovada_para_entrega", "em_revisao", "publicada"].includes(para);
    const agora = new Date().toISOString();
    const r = await supabase
      .from("evidences")
      .update({
        workflow_status: para,
        validation_notes_internal: data.nota?.trim() || null,
        reviewed_by: revisando ? context.userId : undefined,
        reviewed_at: revisando ? agora : undefined,
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .eq("workflow_status", deBruto)
      .select("id,workflow_status")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");

    await supabase.from("research_audit_events").insert({
      organization_id: organizationId,
      entity_type: "evidences",
      entity_id: data.id,
      event_type: `estado:${de}->${para}`,
      actor_user_id: context.userId,
      metadata: { justificativa: data.nota?.trim() ?? "", origem },
    } as any);

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
