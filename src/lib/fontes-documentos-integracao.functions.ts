import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { tipoEvidenciaCanonico } from "@/lib/evidencia-canonica";
import { evidenciaCanonicaPorId, gravarEvidenciaCanonica } from "@/lib/evidencia-canonica.server";
import {
  COLUNA_ALVO,
  payloadLimpo,
  rascunhoEvidenciaDeDocumento,
  validarDesvinculo,
  validarVinculo,
  type TipoAlvo,
} from "@/lib/fontes-documentos-integracao";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function contextoDoCaso(supabase: Sb, userId: string, caseId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  const { data } = await supabase
    .from("crm_casos")
    .select("id")
    .eq("id", caseId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!data) throw new Error("CASO_NAO_ENCONTRADO_NESTA_ORGANIZACAO");
  const permitido = await (supabase as any).rpc("pode_pesquisar_caso", { _case: caseId });
  if (permitido.error) throw new Error(permitido.error.message);
  if (permitido.data === false) throw new Error("SEM_ACESSO_A_ESTE_CASO");
  return { organizationId, papel };
}

async function lerAlvo(supabase: Sb, organizationId: string, tipoAlvo: TipoAlvo, alvoId: string) {
  if (tipoAlvo === "evidencia") {
    /*
      Corte 0-bis (03/10/2026): validava o alvo contra `evidences` — tabela
      com zero linhas desde o Corte 1a. Vínculo apontando para uma evidência
      canônica real era recusado como "alvo não encontrado". Passa a resolver
      pela canônica, que já devolve `case_id` pelo de-para de leitura.
    */
    const ev = await evidenciaCanonicaPorId(supabase as any, organizationId, alvoId);
    return ev ? ({ id: ev.id, case_id: ev.case_id, organization_id: organizationId } as any) : null;
  }
  if (tipoAlvo === "solicitacao") {
    const r = await supabase
      .from("document_requests")
      .select("id,case_id,organization_id")
      .eq("id", alvoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    return r.data as any;
  }
  if (tipoAlvo === "relatorio") {
    const r = await supabase
      .from("case_reports")
      .select("id,case_id,organization_id")
      .eq("id", alvoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    return r.data as any;
  }
  const r = await supabase
    .from("research_people")
    .select("id,organization_id")
    .eq("id", alvoId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  return r.data ? { ...(r.data as any), case_id: null } : null;
}

/** Vínculos existentes do caso, com rótulo legível do alvo. Somente leitura. */
export const listarVinculosFonte = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; sourceDocumentId?: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDoCaso(supabase, context.userId as string, data.caseId);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa os vínculos de pesquisa do caso.");

    let q = supabase
      .from("case_source_document_links")
      .select(
        "id,source_document_id,evidence_id,document_request_id,research_person_id,case_report_id,tipo_vinculo,observacao_interna,vinculado_por,vinculado_em,archived_at,archive_motivo",
      )
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("vinculado_em", { ascending: false });
    if (data.sourceDocumentId) q = q.eq("source_document_id", data.sourceDocumentId);
    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);

    // Corte 0 (01/10/2026): o seletor de evidência passa a oferecer a tabela
    // canônica. `evidences` continua sendo lida só para rotular um vínculo
    // histórico que aponte para ela — nunca oferece opção nova.
    const [evidencias, evidenciasLegado, solicitacoes, pessoas, relatorios] = await Promise.all([
      (supabase as any)
        .from("research_evidence_items")
        .select("id,title,research_cases!inner(case_id)")
        .eq("organization_id", organizationId)
        .eq("research_cases.case_id", data.caseId)
        .is("archived_at", null),
      supabase
        .from("evidences")
        .select("id,title_internal")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null),
      supabase
        .from("document_requests")
        .select("id,document_type,full_name_text")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null),
      supabase.from("research_people").select("id,canonical_name").eq("organization_id", organizationId).is("archived_at", null),
      supabase
        .from("case_reports")
        .select("id,titulo")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null),
    ]);

    return {
      podeEditar: PAPEIS_EDITA.includes(papel),
      vinculos: (linhas ?? []) as Record<string, any>[],
      alvos: {
        evidencia: ((evidencias.data ?? []) as any[]).map((e) => ({ id: String(e.id), rotulo: String(e.title ?? "Evidência") })),
        // Rótulo de linha histórica; não é opção oferecida para vínculo novo.
        evidenciaLegado: ((evidenciasLegado.data ?? []) as any[]).map((e) => ({
          id: String(e.id),
          rotulo: String(e.title_internal ?? "Evidência (registro histórico)"),
        })),
        solicitacao: ((solicitacoes.data ?? []) as any[]).map((s) => ({
          id: String(s.id),
          rotulo: `${s.document_type ?? "Solicitação"}${s.full_name_text ? ` — ${s.full_name_text}` : ""}`,
        })),
        pessoa: ((pessoas.data ?? []) as any[]).map((p) => ({ id: String(p.id), rotulo: String(p.canonical_name ?? "Pessoa") })),
        relatorio: ((relatorios.data ?? []) as any[]).map((r) => ({ id: String(r.id), rotulo: String(r.titulo ?? "Relatório") })),
      },
    };
  });

/** Vincula um documento-fonte a exatamente um alvo já existente. Ato humano. */
export const vincularFonteA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      caseId: string;
      sourceDocumentId: string;
      tipoAlvo: TipoAlvo;
      alvoId: string;
      tipoVinculo: string;
      observacaoInterna?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDoCaso(supabase, context.userId as string, data.caseId);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode vincular documentos de pesquisa.");

    const limpo = payloadLimpo(data as unknown as Record<string, unknown>);
    if (!limpo.ok) throw new Error(limpo.erros.join(", "));

    const doc = await supabase
      .from("case_source_documents")
      .select("id,case_id,organization_id")
      .eq("id", data.sourceDocumentId)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .maybeSingle();
    if (!doc.data) throw new Error("DOCUMENTO_NAO_ENCONTRADO");

    const alvo = await lerAlvo(supabase, organizationId, data.tipoAlvo, data.alvoId);
    if (!alvo) throw new Error("ALVO_NAO_ENCONTRADO");

    const check = validarVinculo({
      tipoVinculo: data.tipoVinculo,
      tipoAlvo: data.tipoAlvo,
      alvoId: data.alvoId,
      documentoCaseId: data.caseId,
      documentoOrganizationId: organizationId,
      alvoCaseId: (alvo.case_id ?? null) as string | null,
      alvoOrganizationId: (alvo.organization_id ?? null) as string | null,
      observacaoInterna: data.observacaoInterna ?? null,
      papel,
    });
    if (!check.ok) throw new Error(check.erros.join(", "));

    const linha: Record<string, unknown> = {
      organization_id: organizationId,
      case_id: data.caseId,
      source_document_id: data.sourceDocumentId,
      tipo_vinculo: data.tipoVinculo,
      observacao_interna: data.observacaoInterna?.trim() || null,
    };
    linha[COLUNA_ALVO[data.tipoAlvo]] = data.alvoId;

    const r = await supabase.from("case_source_document_links").insert(linha).select("id").maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão do caso.");
    return { id: r.data.id as string };
  });

/**
 * Cria uma evidência em rascunho a partir do documento e já registra o vínculo.
 * Não avança estado do caso, não cria pessoa, relação, evento, linhagem,
 * achado, relatório, projeção, contrato, cobrança nem comunicação.
 */
export const criarEvidenciaRascunhoDeFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; sourceDocumentId: string }) => d)
  .handler(async ({ data, context }) => {
    // Corte 0 (01/10/2026): deixa de ter escritor próprio. A evidência nasce no
    // módulo canônico e o vínculo aponta para a coluna canônica nova.
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDoCaso(supabase, context.userId as string, data.caseId);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode criar evidências.");

    const doc = await (supabase as any)
      .from("case_source_documents")
      .select(
        "id,case_id,organization_id,titulo_interno,nome_arquivo,tipo_documento,data_documento,cidade,estado_provincia,pais,pessoa_ref_id,confidencialidade",
      )
      .eq("id", data.sourceDocumentId)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();
    if (!doc.data) throw new Error("DOCUMENTO_NAO_ENCONTRADO");

    const rascunho = rascunhoEvidenciaDeDocumento(doc.data as any);
    // Pessoa só entra se de fato for pessoa da pesquisa; caso contrário fica vazia.
    let pessoaId = rascunho.research_person_id as string | null;
    if (pessoaId) {
      const p = await (supabase as any)
        .from("research_people")
        .select("id")
        .eq("id", pessoaId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (!p.data) pessoaId = null;
    }

    const ev = await gravarEvidenciaCanonica(supabase as any, context.userId as string, organizationId, {
      caseId: data.caseId,
      titulo: String(rascunho.title_internal),
      // `tipo_documento` fala os 28 TIPOS_DOCUMENTO; o de-para canônico traduz
      // para um dos 10 valores do CHECK. Documento sem tradução conhecida vira
      // "document" — honesto, porque é de um documento que a evidência nasceu.
      tipo: tipoEvidenciaCanonico(rascunho.evidence_type) ?? "document",
      pessoaId,
      origem: "documento_do_acervo",
    });
    if (!ev.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão do caso.");

    const v = await (supabase as any)
      .from("case_source_document_links")
      .insert({
        organization_id: organizationId,
        case_id: data.caseId,
        source_document_id: data.sourceDocumentId,
        research_evidence_item_id: ev.id,
        tipo_vinculo: "comprova",
      })
      .select("id")
      .maybeSingle();
    if (v.error) throw new Error(v.error.message);

    return { evidenceId: ev.id as string, vinculoId: (v.data?.id ?? null) as string | null };
  });

/** Desvínculo é sempre lógico e exige motivo. Não existe exclusão física. */
export const desvincularFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; vinculoId: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoDoCaso(supabase, context.userId as string, data.caseId);
    const check = validarDesvinculo(data.motivo ?? "", papel);
    if (!check.ok) throw new Error(check.erros.join(", "));
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode desvincular documentos.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";

    const r = await supabase
      .from("case_source_document_links")
      .update({ archived_at: new Date().toISOString(), archive_motivo: motivo })
      .eq("id", data.vinculoId)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { ok: true };
  });
