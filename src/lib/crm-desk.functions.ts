import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calcularMetricasCrm, montarFilasHoje, validarLead, type LeadDesk } from "@/lib/crm-desk";
import { sincronizarParametroDependentes } from "@/lib/dependentes.server";
import { TEMAS_JURIDICOS, type LinhaMatriz } from "@/lib/matriz-juridica";
import type { Dependente } from "@/lib/dependentes";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;
const exigirUuid = (v: unknown, campo: string) => {
  if (!UUID.test(String(v ?? ""))) throw new Error(`${campo} inválido.`);
  return String(v);
};

const CAMPOS_LEAD = [
  "nome",
  "email",
  "telefone",
  "origem",
  "area_responsavel",
  "responsavel_nome",
  "proxima_acao",
  "proxima_acao_em",
  "eixo_comercial",
  "eixo_formalizacao",
  "objetivo",
  "nacionalidade",
  "via_juridica_preliminar",
  "status_via",
  "marco_preliminar",
  "discovery_resultado",
  "resumo_call",
  "resumo_validado",
  "call_agendada_em",
  "call_realizada_em",
  "proposta_link_interno",
  "proposta_referencia_interna",
  "contrato_link_interno",
  "asaas_evento_referencia",
  "motivo_perda",
  "servico_inicial_aprovado",
  "pagamento_previsto_em",
  "dados_teste",
  "narrativa_familiar",
  "observacoes",
  "ultimo_followup_em",
  "pais_interesse",
] as const;

function limpar(entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const campo of CAMPOS_LEAD) {
    if (!(campo in entrada)) continue;
    const v = entrada[campo];
    out[campo] = typeof v === "string" && v.trim() === "" ? null : v;
  }
  return out;
}

async function orgDoUsuario(supabase: any, userId: string) {
  const { data } = await supabase.from("organization_members").select("organization_id").eq("user_id", userId).limit(1).maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/** Lista de leads do Desk com validação espelhada e resultado derivado. */
export const listarLeadsDesk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    const leads = (data ?? []) as LeadDesk[];
    return leads.map((l) => ({ ...l, pendencias: validarLead(l) }));
  });

/** Cria ou atualiza um lead. Rejeita valores fora das listas controladas. */
export const salvarLeadDesk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const patch = limpar(data.valores ?? {});

    let atual: LeadDesk | null = null;
    if (data.id) {
      exigirUuid(data.id, "id");
      const { data: row } = await supabase.from("leads").select("*").eq("id", data.id).maybeSingle();
      if (!row) throw new Error("Lead não encontrado nesta organização.");
      if (row.archived_at) throw new Error("Lead arquivado: edição bloqueada.");
      atual = row as LeadDesk;
    }

    const candidato = { ...(atual ?? { nome: "" }), ...patch } as LeadDesk;
    const erros = validarLead(candidato);
    if (erros.length) {
      return { ok: false as const, erros, lead: atual };
    }

    if (data.id) {
      const { data: row, error } = await supabase
        .from("leads")
        .update({ ...patch, updated_by: userId })
        .eq("id", data.id)
        .select("*")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return { ok: true as const, erros: [], lead: row as LeadDesk };
    }

    const organization_id = await orgDoUsuario(supabase, userId);
    const { data: row, error } = await supabase
      .from("leads")
      .insert({ ...patch, organization_id, created_by: userId, updated_by: userId })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ok: true as const, erros: [], lead: row as LeadDesk };
  });

/** Arquiva um lead. Nunca há exclusão física. */
export const arquivarLeadDesk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => {
    exigirUuid(d?.id, "id");
    if (!d?.motivo?.trim()) throw new Error("Motivo do arquivamento é obrigatório.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const { error } = await supabase
      .from("leads")
      .update({ archived_at: new Date().toISOString(), archived_by: userId, archive_motivo: data.motivo, updated_by: userId })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Painel Hoje + métricas comerciais e operacionais. */
export const painelHojeDesk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const [{ data: leads }, { data: casos }] = await Promise.all([
      supabase.from("leads").select("*").limit(1000),
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,pais,via,documentos_minimos_ok,prazo_proxima_acao,responsavel_principal,ativo")
        .is("archived_at", null)
        .limit(1000),
    ]);
    const listaLeads = (leads ?? []) as LeadDesk[];
    const listaCasos = (casos ?? []) as any[];
    return {
      filas: montarFilasHoje({ leads: listaLeads, casos: listaCasos }),
      metricas: calcularMetricasCrm({ leads: listaLeads, casos: listaCasos }),
    };
  });

/* ---------------- Dependentes ---------------- */

export const listarDependentes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: exigirUuid(d?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { data: rows, error } = await supabase
      .from("case_dependents")
      .select("*")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at");
    if (error) throw new Error(error.message);
    return (rows ?? []) as Dependente[];
  });

export const salvarDependente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; caseId: string; valores: Record<string, unknown> }) => {
    exigirUuid(d?.caseId, "caseId");
    if (d.id) exigirUuid(d.id, "id");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const campos = [
      "nome_completo",
      "vinculo_com_titular",
      "titular_responsavel_legal_nome",
      "status_representacao",
      "documento_representacao_referencia_interna",
      "participa_do_contrato",
      "possui_acesso_app",
      "anexo_individual_aplicavel",
      "observacao_interna",
    ];
    const patch: Record<string, unknown> = {};
    for (const c of campos) if (c in data.valores) patch[c] = data.valores[c] === "" ? null : data.valores[c];

    if (data.id) {
      const { error } = await supabase.from("case_dependents").update({ ...patch, updated_by: userId }).eq("id", data.id);
      if (error) throw new Error(error.message);
      await sincronizarParametroDependentes(supabase, data.caseId);
      return { ok: true };
    }
    const { data: caso } = await supabase.from("crm_casos").select("organization_id").eq("id", data.caseId).maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");
    const { error } = await supabase.from("case_dependents").insert({
      ...patch,
      case_id: data.caseId,
      organization_id: caso.organization_id,
      created_by: userId,
      updated_by: userId,
    });
    if (error) throw new Error(error.message);
    await sincronizarParametroDependentes(supabase, data.caseId);
    return { ok: true };
  });

/* ---------------- Matriz jurídica ---------------- */

/** Lê a matriz garantindo que todo tema normativo apareça, mesmo sem decisão. */
export const listarMatrizJuridica = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const { data: rows } = await supabase.from("legal_clause_matrix").select("*").is("archived_at", null);
    const linhas: LinhaMatriz[] = TEMAS_JURIDICOS.map((t) => {
      const l = ((rows ?? []) as any[]).find((r) => r.tema_codigo === t.tema_codigo);
      return {
        tema_codigo: t.tema_codigo,
        tema: t.tema,
        status: l?.status ?? "pendente_revisao_juridica",
        versao_juridica_aplicavel: l?.versao_juridica_aplicavel ?? null,
        responsavel_revisao: l?.responsavel_revisao ?? null,
        decisao: l?.decisao ?? null,
        justificativa: l?.justificativa ?? null,
        decidido_em: l?.decidido_em ?? null,
        referencia_versao: l?.referencia_versao ?? null,
        impacto_templates: l?.impacto_templates ?? t.impacto_templates,
        bloqueia_assinatura: l?.bloqueia_assinatura ?? t.bloqueia_assinatura,
      };
    });
    return linhas;
  });

/** Registra decisão de um tema. Nunca grava texto de cláusula. */
export const registrarDecisaoTema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tema_codigo: string;
      status: string;
      decisao?: string | null;
      justificativa?: string | null;
      responsavel_revisao?: string | null;
      versao_juridica_aplicavel?: string | null;
      referencia_versao?: string | null;
    }) => {
      const tema = TEMAS_JURIDICOS.find((t) => t.tema_codigo === d?.tema_codigo);
      if (!tema) throw new Error("Tema fora da matriz normativa.");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const tema = TEMAS_JURIDICOS.find((t) => t.tema_codigo === data.tema_codigo)!;
    const registro = {
      organization_id,
      tema_codigo: tema.tema_codigo,
      tema: tema.tema,
      status: data.status,
      decisao: data.decisao ?? null,
      justificativa: data.justificativa ?? null,
      responsavel_revisao: data.responsavel_revisao ?? null,
      versao_juridica_aplicavel: data.versao_juridica_aplicavel ?? null,
      referencia_versao: data.referencia_versao ?? null,
      impacto_templates: tema.impacto_templates,
      bloqueia_assinatura: tema.bloqueia_assinatura,
      decidido_em: data.status === "pendente_revisao_juridica" ? null : new Date().toISOString(),
      updated_by: userId,
    };
    const { data: existente } = await supabase
      .from("legal_clause_matrix")
      .select("id")
      .eq("tema_codigo", tema.tema_codigo)
      .is("archived_at", null)
      .maybeSingle();
    if (existente?.id) {
      const { error } = await supabase.from("legal_clause_matrix").update(registro).eq("id", existente.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("legal_clause_matrix").insert({ ...registro, created_by: userId });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/* ---------------- Páginas da proposta Canva ---------------- */

export const listarPaginasCanva = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string }) => ({ proposalId: exigirUuid(d?.proposalId, "proposalId") }))
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { data: rows } = await supabase
      .from("proposal_canva_pages")
      .select("*")
      .eq("proposal_id", data.proposalId)
      .is("archived_at", null)
      .order("page_number");
    return (rows ?? []) as any[];
  });

/** Registra a extração de uma página 1–7 da proposta Canva. */
export const salvarPaginaCanva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      proposalId: string;
      caseId: string;
      page_number: number;
      extracao_status: string;
      page_content_structured?: Record<string, unknown> | null;
      campos_nao_localizados?: string[] | null;
      observacao_interna?: string | null;
    }) => {
      exigirUuid(d?.proposalId, "proposalId");
      exigirUuid(d?.caseId, "caseId");
      if (![1, 2, 3, 4, 5, 6, 7].includes(Number(d?.page_number))) throw new Error("Somente páginas 1 a 7 são fonte de escopo.");
      if (!["pendente", "em_extracao", "extraida", "nao_aplicavel"].includes(d?.extracao_status))
        throw new Error("Status de extração inválido.");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const { data: caso } = await supabase.from("crm_casos").select("organization_id").eq("id", data.caseId).maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");
    const registro = {
      organization_id: caso.organization_id,
      proposal_id: data.proposalId,
      case_id: data.caseId,
      page_number: data.page_number,
      extracao_status: data.extracao_status,
      page_content_structured: data.page_content_structured ?? {},
      campos_nao_localizados: data.campos_nao_localizados ?? [],
      observacao_interna: data.observacao_interna ?? null,
      extraido_por: userId,
      extraido_em: new Date().toISOString(),
      updated_by: userId,
    };
    const { data: existente } = await supabase
      .from("proposal_canva_pages")
      .select("id")
      .eq("proposal_id", data.proposalId)
      .eq("page_number", data.page_number)
      .is("archived_at", null)
      .maybeSingle();
    if (existente?.id) {
      const { error } = await supabase.from("proposal_canva_pages").update(registro).eq("id", existente.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("proposal_canva_pages").insert({ ...registro, created_by: userId });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
