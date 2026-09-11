import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CAMPOS_SOLICITACAO = [
  "case_id",
  "family_id",
  "research_person_id",
  "source_id",
  "evidence_id",
  "generation",
  "full_name_text",
  "document_type",
  "institution_or_archive",
  "requested_at",
  "status",
  "received_at",
  "observation_internal",
  "request_type",
  "responsible_user_id",
  "next_action",
  "next_action_due",
  "priority",
  "estimated_external_cost",
  "client_approval_status",
  "internal_link",
  "access_level",
  "data_origin",
  "archived_at",
  "archived_reason",
];

function filtrar(entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const c of CAMPOS_SOLICITACAO) if (c in entrada) out[c] = entrada[c] === "" ? null : entrada[c];
  return out;
}

function recusarNaoMapeado(entrada: Record<string, unknown>) {
  const sobra = Object.keys(entrada).filter((k) => !CAMPOS_SOLICITACAO.includes(k));
  if (sobra.length) throw new Error(`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: ${sobra.join(", ")}`);
}

/** Painel da área Pesquisa Genealógica e Evidências (foco Documentos e Solicitações). */
export const painelPesquisaEvidencias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa a área de pesquisa e evidências.");

    const [caso, solicitacoes, evidencias, fontes, pessoas, alertas, comunicacoes, equipe] = await Promise.all([
      supabase.from("crm_casos").select("id,codigo,titulo,pais,cliente_id").eq("id", data.caseId).maybeSingle(),
      supabase
        .from("document_requests")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("evidences")
        .select("id,title_internal,workflow_status,confidence_level,evidence_nature")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("research_sources")
        .select("id,title,source_type")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("research_people")
        .select("id,canonical_name")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("case_alerts")
        .select("id,tipo,titulo,detalhe,criticidade,status,due_at,created_at")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("communication_queue")
        .select("id,assunto,corpo_rascunho,status,suggested_channel,requires_human_approval,sent_at,created_at")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("id,nome").limit(200),
    ]);

    return {
      papel,
      podeEditar: PAPEIS_EDITA.includes(papel),
      caso: (caso.data ?? null) as any,
      solicitacoes: (solicitacoes.data ?? []) as any[],
      evidencias: (evidencias.data ?? []) as any[],
      fontes: (fontes.data ?? []) as any[],
      pessoas: (pessoas.data ?? []) as any[],
      alertas: (alertas.data ?? []) as any[],
      comunicacoes: (comunicacoes.data ?? []) as any[],
      equipe: (equipe.data ?? []) as any[],
    };
  });

/**
 * Grava a solicitação documental. Nenhuma ação externa: o banco só registra
 * estado, alerta interno e, no máximo, rascunho de comunicação sem envio.
 */
export const salvarSolicitacaoDocumental = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode registrar solicitações documentais.");

    recusarNaoMapeado(data.valores);
    const valores = filtrar(data.valores);

    const r = data.id
      ? await supabase.from("document_requests").update(valores).eq("id", data.id).select("*").maybeSingle()
      : await supabase
          .from("document_requests")
          .insert({ ...valores, organization_id: organizationId })
          .select("*")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");

    // Verificação enviado x gravado
    const divergentes = Object.keys(valores).filter((k) => {
      const enviado = valores[k];
      const gravado = (r.data as any)[k];
      if (enviado === null || enviado === undefined) return false;
      return String(enviado) !== String(gravado ?? "");
    });

    return { id: r.data.id as string, registro: r.data as any, divergentes };
  });

/** Arquivamento com motivo — não existe exclusão física. */
export const arquivarSolicitacaoDocumental = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode arquivar solicitações.");
    const motivo = data.motivo?.trim() || "Motivo não informado.";

    const r = await supabase
      .from("document_requests")
      .update({ archived_at: new Date().toISOString(), archived_reason: motivo })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { ok: true };
  });
