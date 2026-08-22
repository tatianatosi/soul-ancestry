/**
 * Leitura e persistência da cadeia de formalização.
 * Só grava o que a proposta aprovada declara. Nada assina, cobra ou comunica.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { extrairEscopoDaProposta, validarPropostaCanva } from "@/lib/escopo-proposta";
import {
  avaliarCadeia,
  derivarItensDaProposta,
  type ItemDerivado,
  type ResultadoCadeia,
} from "@/lib/cadeia-formalizacao";
import { anexosIaV, entradaDeValores, gatesBloqueados, pendenciasDosAnexos } from "@/lib/anexos-i-v";
import { CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";
import { perfilInstitucionalRenderizado } from "@/lib/perfil-institucional";

type Sb = any;

export async function orgDoUsuario(supabase: Sb, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();
  const org = data?.organization_id as string | undefined;
  if (!org) throw new Error("Usuário sem organização.");
  return org;
}

export async function contextoDaCadeia(supabase: Sb, org: string, caseId: string) {
  const { data: caso } = await supabase
    .from("crm_casos")
    .select("id,codigo,titulo,pais,via,demo,archived_at,organization_id,cliente_id,citizenship_track_id")
    .eq("id", caseId)
    .maybeSingle();
  if (!caso || caso.organization_id !== org) throw new Error("Caso não encontrado nesta organização.");
  if (caso.archived_at) throw new Error("Caso arquivado: cadeia de formalização bloqueada.");
  if (caso.demo) throw new Error("Caso de demonstração não alimenta a cadeia de formalização.");

  const [{ data: proposta }, { data: contrato }, { data: os }, { data: condicao }, { data: regras }, { data: registro }] =
    await Promise.all([
      supabase
        .from("proposals")
        .select(
          "id,case_id,versao,status,valor,moeda,forma_pagamento,escopo,exclusoes,validade,archived_at,substituida_em,substituida_por_id,recusada_em,origem,origem_referencia,paginas_registradas,escopo_paginas",
        )
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("versao", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("contracts")
        .select("id,contract_number,status,signed_at,signature_reference,case_id")
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("service_orders")
        .select("id,case_id,status,scope_summary,deliverable_summary,service_order_number,archived_at,contract_id")
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("commercial_conditions")
        .select(
          "id,status,origem,forma_pagamento,parcelas,valor_parcela,valor_total_referencia,vencimento_dia,primeiro_vencimento,product_catalog_id,homologado_por,homologado_em",
        )
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      caso.citizenship_track_id
        ? supabase
            .from("versioned_legal_rules")
            .select("tema,versao,status,vigencia_inicio,vigencia_fim,fonte_referencia,archived_at")
            .eq("track_id", caso.citizenship_track_id)
        : supabase
            .from("versioned_legal_rules")
            .select("tema,versao,status,vigencia_inicio,vigencia_fim,fonte_referencia,archived_at")
            .eq("organization_id", org),
      supabase
        .from("contract_case_parameters")
        .select("id,status,revisao_humana_em,aprovado_em")
        .eq("case_id", caso.id)
        .is("archived_at", null)
        .maybeSingle(),
    ]);

  const [{ data: itensEscopo }, { data: valores }, { data: previaFinal }] = await Promise.all([
    contrato?.id
      ? supabase
          .from("contract_scope_items")
          .select("id,category,title,description,status,source_type,source_reference")
          .eq("contract_id", contrato.id)
          .is("archived_at", null)
          .order("display_order", { ascending: true })
      : Promise.resolve({ data: [] as any[] }),
    registro?.id
      ? supabase
          .from("contract_parameter_values")
          .select("campo,grupo,valor,origem,status")
          .eq("parameters_id", registro.id)
          .is("archived_at", null)
      : Promise.resolve({ data: [] as any[] }),
    registro?.id
      ? supabase
          .from("contract_parameter_previews")
          .select("id,tipo,aprovado_em,aprovado_por")
          .eq("parameters_id", registro.id)
          .eq("tipo", "final")
          .not("aprovado_em", "is", null)
          .order("aprovado_em", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    caso,
    proposta: proposta ?? null,
    contrato: contrato ?? null,
    ordemServico: os ?? null,
    condicao: condicao ?? null,
    regras: (regras ?? []) as any[],
    registro: registro ?? null,
    itensEscopo: (itensEscopo ?? []) as any[],
    valores: (valores ?? []) as any[],
    previaFinal: previaFinal ?? null,
  };
}

export function avaliarContexto(ctx: Awaited<ReturnType<typeof contextoDaCadeia>>): ResultadoCadeia & {
  proposta: any;
  ordemServico: any;
  condicao: any;
  contrato: any;
  itensEscopo: any[];
} {
  const validade = validarPropostaCanva(ctx.proposta, ctx.caso.id);
  const extraidos = extrairEscopoDaProposta(ctx.proposta);
  const perfil = perfilInstitucionalRenderizado();

  const entradaAnexos = entradaDeValores({
    caseId: ctx.caso.codigo,
    clienteNome: null,
    responsavel: null,
    contratoBaseVersao: CONTRATO_BASE_VERSAO,
    modelo: "MODELO-ESTUDO",
    valores: ctx.valores as any[],
  });
  const anexos = anexosIaV(entradaAnexos);
  const pendencias = pendenciasDosAnexos(anexos).map((p) => ({ titulo: p.motivo }));
  const gates = gatesBloqueados({
    anexos,
    modelo: "MODELO-ESTUDO",
    perfilInstitucionalAtivo: perfil.vigente,
    metodoAssinaturaConfigurado: Boolean(ctx.valores.find((v: any) => v.campo === "forma_assinatura")?.valor),
    revisorHumanoAprovado: Boolean(ctx.previaFinal?.aprovado_em),
    conflitos: [],
  }).map((g: any) => ({ gate: String(g.gate ?? g.chave ?? "gate"), motivo: String(g.motivo ?? "") }));

  const resultado = avaliarCadeia({
    validadeProposta: validade,
    extraidos,
    exclusoesTexto: ctx.proposta?.exclusoes ?? null,
    ordemServico: ctx.ordemServico,
    itensPersistidos: ctx.itensEscopo.length,
    condicao: ctx.condicao,
    perfilVigente: perfil.vigente,
    perfilPendencias: perfil.pendencias,
    regras: ctx.regras as any[],
    pendenciasAnexos: pendencias,
    gatesAnexos: gates,
    revisaoHumanaAprovadaEm: ctx.previaFinal?.aprovado_em ?? null,
    assinaturaRegistradaEm: ctx.contrato?.signed_at ?? null,
  });

  return {
    ...resultado,
    proposta: ctx.proposta,
    ordemServico: ctx.ordemServico,
    condicao: ctx.condicao,
    contrato: ctx.contrato,
    itensEscopo: ctx.itensEscopo,
  };
}

const CATEGORIA: Record<ItemDerivado["tipo"], { category: string; status: string }> = {
  inclusao: { category: "contracted_scope", status: "included" },
  exclusao: { category: "exclusion", status: "excluded" },
  entrega: { category: "deliverable", status: "included" },
};

/** Persiste Anexo I (OS + itens) exclusivamente a partir da proposta aprovada. */
export async function persistirAnexoI(
  supabase: Sb,
  input: { org: string; userId: string; caseId: string },
) {
  const ctx = await contextoDaCadeia(supabase, input.org, input.caseId);
  const validade = validarPropostaCanva(ctx.proposta, ctx.caso.id);
  if (!validade.valida) throw new Error(`Proposta não habilita o Anexo I: ${validade.motivos[0]}`);
  if (!ctx.contrato?.id) throw new Error("Nenhum instrumento contratual do caso para receber o Anexo I.");

  const extraidos = extrairEscopoDaProposta(ctx.proposta);
  const { itens, faltantes } = derivarItensDaProposta({
    extraidos,
    exclusoesTexto: ctx.proposta?.exclusoes ?? null,
  });
  if (faltantes.length)
    throw new Error(
      `Proposta não declara ${faltantes.length} campo(s) obrigatório(s): ${faltantes.map((f) => f.label).join(", ")}. O motor não infere escopo.`,
    );
  if (!itens.length) throw new Error("Nenhum item derivável da proposta aprovada.");

  const inclusoes = itens.filter((i) => i.tipo === "inclusao");
  const entregas = itens.filter((i) => i.tipo === "entrega");

  const payloadOS = {
    organization_id: input.org,
    case_id: ctx.caso.id,
    contract_id: ctx.contrato.id,
    status: "draft",
    start_condition_status: "pending",
    scope_summary: inclusoes.map((i) => `• ${i.texto}`).join("\n"),
    deliverable_summary: entregas.map((i) => `• ${i.texto}`).join("\n"),
    internal_notes: `Derivado da proposta v${ctx.proposta?.versao} (${ctx.proposta?.origem_referencia ?? "referência não registrada"}).`,
    updated_by: input.userId,
  };

  let osId = ctx.ordemServico?.id as string | undefined;
  if (osId) {
    const { error } = await supabase.from("service_orders").update(payloadOS).eq("id", osId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("service_orders")
      .insert({ ...payloadOS, created_by: input.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    osId = data.id as string;
  }

  // Reescreve os itens derivados desta origem: arquiva os anteriores (sem exclusão física).
  const anteriores = ctx.itensEscopo.filter((i: any) => i.source_type === "proposal");
  if (anteriores.length) {
    await supabase
      .from("contract_scope_items")
      .update({
        archived_at: new Date().toISOString(),
        archived_by: input.userId,
        archive_reason: "Substituído por nova derivação da proposta aprovada.",
      })
      .in(
        "id",
        anteriores.map((i: any) => i.id),
      );
  }

  const linhas = itens.map((i, idx) => ({
    organization_id: input.org,
    contract_id: ctx.contrato.id,
    category: CATEGORIA[i.tipo].category,
    status: CATEGORIA[i.tipo].status,
    title: i.texto.slice(0, 180),
    description: i.texto,
    source_type: "proposal",
    source_reference: `proposta v${ctx.proposta?.versao} · ${i.campo} · páginas ${i.paginas.join(", ")}`,
    display_order: idx + 1,
    requires_human_validation: true,
    created_by: input.userId,
    updated_by: input.userId,
  }));
  const { error: erroItens } = await supabase.from("contract_scope_items").insert(linhas);
  if (erroItens) throw new Error(erroItens.message);

  await supabase.from("audit_logs").insert({
    organization_id: input.org,
    user_id: input.userId,
    acao: "anexo_i_derivado_da_proposta",
    entidade: "service_orders",
    entidade_id: osId,
    metadados: {
      case_id: ctx.caso.id,
      proposta_id: ctx.proposta?.id,
      proposta_versao: ctx.proposta?.versao,
      inclusoes: inclusoes.length,
      exclusoes: itens.filter((i) => i.tipo === "exclusao").length,
      entregas: entregas.length,
    },
  });

  return { osId, itens: itens.length };
}
