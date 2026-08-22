/**
 * Persistência versionada dos anexos contratuais e da ligação
 * proposta/OS aprovada → condição comercial.
 *
 * Regras:
 * - Cada anexo vira uma INSTÂNCIA versionada por caso (annex_version).
 * - Conteúdo idêntico não cria versão nova.
 * - Nada é assinado, cobrado, enviado ou pesquisado aqui.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { hashConteudo } from "@/lib/contrato-parametros.server";
import { MODELO_VERSAO_ANEXO, type AnexoInterno } from "@/lib/contrato-corpo.server";
import { ACOES_BLOQUEADAS_SEM_ANEXO_III, type AnexoGovernado } from "@/lib/anexos-i-v";

type Sb = any;

export const TITULO_ANEXO_INTERNO_PADRAO = "Anexo interno derivado da regra de produto/escopo";

function statusPersistido(a: { aplicavel: boolean; pendencias: string[]; estado: string }) {
  if (!a.aplicavel) return "not_applicable";
  if (a.pendencias.length) return "pending";
  if (["aprovado", "em_revisao"].includes(a.estado)) return a.estado === "aprovado" ? "approved" : "in_review";
  return "prepared";
}

/** Domínio aceito pelo banco (contract_annexes.annex_type). */
export type TipoAnexoPersistido =
  | "scope"
  | "service_order"
  | "financial_schedule"
  | "external_expenses"
  | "privacy_data"
  | "family_structure"
  | "document_list"
  | "authorization"
  | "other";

const TIPO_POR_CODIGO: Record<string, TipoAnexoPersistido> = {
  ANEXO_I_ORDEM_SERVICO: "service_order",
  ANEXO_II_DESPESAS_EXTERNAS: "external_expenses",
  ANEXO_III_AUTORIZACAO_PESQUISA: "authorization",
  ANEXO_IV_PROCURACAO: "authorization",
  ANEXO_V_ALTERACAO_ESCOPO: "scope",
  "ANX-ESCOPO": "scope",
  "ANX-COMERCIAL": "financial_schedule",
  "ANX-INDIVIDUAL": "family_structure",
  "ANX-PRIVACIDADE": "privacy_data",
  "ANX-REPRESENTACAO": "authorization",
  "ANX-DOCUMENTOS": "document_list",
};

export function tipoAnexoPersistido(codigo: string): TipoAnexoPersistido {
  return TIPO_POR_CODIGO[codigo] ?? "other";
}

export type InstanciaAnexo = {
  annex_code: string;
  title: string;
  annex_type: TipoAnexoPersistido;
  /** Natureza da instância: anexo governado I–V ou anexo interno por regra de produto. */
  natureza: "governado" | "interno";
  applicability_rule: string;
  source: string;
  model_version: string;
  required_for_contract: boolean;
  status: string;
  structured_data: Record<string, unknown>;
  rendered_html: string;
  reason_not_applicable: string | null;
};

/** Converte anexos governados I–V + anexos internos em instâncias persistíveis. */
export function instanciasDeAnexos(input: {
  anexos: AnexoGovernado[];
  internos: AnexoInterno[];
}): InstanciaAnexo[] {
  const governados: InstanciaAnexo[] = input.anexos.map((a) => ({
    annex_code: a.codigo,
    title: a.titulo,
    annex_type: tipoAnexoPersistido(a.codigo),
    natureza: "governado",
    applicability_rule: a.regra,
    source: "contrato-base + ficha do caso",

    model_version: MODELO_VERSAO_ANEXO[a.codigo] ?? "modelo versionado",
    required_for_contract: a.aplicavel && a.obrigatorio,
    status: statusPersistido(a),
    structured_data: {
      finalidade: a.finalidade,
      condicional: a.condicional,
      aplicavel: a.aplicavel,
      obrigatorio: a.obrigatorio,
      estado: a.estado,
      motivo: a.motivo,
      campos: a.campos,
      pendencias: a.pendencias,
      impactoAusencia: a.impactoAusencia,
      gatesBloqueados: a.gatesBloqueados,
    },
    rendered_html: `<h3>${a.codigo} — ${a.titulo}</h3><p>${a.finalidade}</p><p>${a.regra}</p>`,
    reason_not_applicable: a.aplicavel ? null : a.motivo,
  }));

  const internos: InstanciaAnexo[] = input.internos.map((i) => ({
    annex_code: i.codigo,
    title: i.titulo,
    annex_type: "interno",
    applicability_rule: i.motivo,
    source: "regra de produto/escopo",
    model_version: "ANX-INTERNO-v1.0",
    required_for_contract: true,
    status: "prepared",
    structured_data: { motivo: i.motivo },
    rendered_html: `<h3>${i.codigo} — ${i.titulo}</h3><p>${i.motivo}</p>`,
    reason_not_applicable: null,
  }));

  return [...governados, ...internos];
}

/**
 * Grava as instâncias versionadas. Retorna quantas versões novas nasceram.
 * Conteúdo idêntico ao da versão vigente não cria versão.
 */
export async function sincronizarAnexosPersistidos(
  supabase: Sb,
  ctx: {
    organizationId: string;
    caseId: string;
    parametersId: string;
    previaId: string | null;
    contractId: string | null;
    userId: string;
    isTest?: boolean;
  },
  instancias: InstanciaAnexo[],
) {
  const { data: existentes } = await supabase
    .from("contract_annexes")
    .select("id,annex_code,annex_version,file_hash,status")
    .eq("organization_id", ctx.organizationId)
    .eq("case_id", ctx.caseId)
    .is("archived_at", null);

  const vigentePorCodigo = new Map<string, any>();
  for (const linha of (existentes ?? []) as any[]) {
    const atual = vigentePorCodigo.get(linha.annex_code);
    if (!atual || linha.annex_version > atual.annex_version) vigentePorCodigo.set(linha.annex_code, linha);
  }

  let novas = 0;
  let mantidas = 0;

  for (const inst of instancias) {
    const hash = hashConteudo({ d: inst.structured_data, s: inst.status, m: inst.model_version });
    const vigente = vigentePorCodigo.get(inst.annex_code);
    if (vigente && vigente.file_hash === hash) {
      mantidas += 1;
      continue;
    }
    const { error } = await supabase.from("contract_annexes").insert({
      organization_id: ctx.organizationId,
      case_id: ctx.caseId,
      parameters_id: ctx.parametersId,
      preview_id: ctx.previaId,
      contract_id: ctx.contractId,
      annex_code: inst.annex_code,
      title: inst.title,
      annex_type: inst.annex_type,
      applicability_rule: inst.applicability_rule,
      source: inst.source,
      source_reference: `parametros:${ctx.parametersId}`,
      model_version: inst.model_version,
      annex_version: (vigente?.annex_version ?? 0) + 1,
      required_for_contract: inst.required_for_contract,
      status: inst.status,
      structured_data: inst.structured_data,
      rendered_html: inst.rendered_html,
      reason_not_applicable: inst.reason_not_applicable,
      file_hash: hash,
      is_test: Boolean(ctx.isTest),
      prepared_by: ctx.userId,
      created_by: ctx.userId,
      updated_by: ctx.userId,
    });
    if (error) throw new Error(`Falha ao versionar ${inst.annex_code}: ${error.message}`);
    novas += 1;
  }

  return { novas, mantidas, total: instancias.length };
}

/* ---------------- proposta/OS aprovada → condição comercial ---------------- */

export const ESTADOS_PROPOSTA_APROVADA = ["aprovada", "aceita"];

/**
 * Deriva a condição comercial formal da proposta aprovada do caso.
 * Nunca cobra, nunca infere vencimento a partir do número de parcelas.
 */
export async function sincronizarComercialDaProposta(
  supabase: Sb,
  ctx: { organizationId: string; caseId: string; userId: string },
) {
  const { data: proposta } = await supabase
    .from("proposals")
    .select("*")
    .eq("case_id", ctx.caseId)
    .is("archived_at", null)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!proposta) return { vinculada: false, motivo: "Nenhuma proposta vinculada ao caso." };
  if (!ESTADOS_PROPOSTA_APROVADA.includes(String(proposta.status))) {
    return { vinculada: false, motivo: `Proposta em estado "${proposta.status}" não formaliza condição comercial.` };
  }

  const codigo = `CC-${String(proposta.id).slice(0, 8)}-v${proposta.versao ?? 1}`;
  const { data: existente } = await supabase
    .from("commercial_conditions")
    .select("id")
    .eq("organization_id", ctx.organizationId)
    .eq("case_id", ctx.caseId)
    .eq("codigo", codigo)
    .is("archived_at", null)
    .maybeSingle();

  const payload = {
    organization_id: ctx.organizationId,
    case_id: ctx.caseId,
    codigo,
    forma_pagamento: proposta.forma_pagamento ?? null,
    parcelas: proposta.parcelas ?? null,
    valor_total_referencia: proposta.valor ?? null,
    primeiro_vencimento: proposta.primeiro_vencimento ?? null,
    condicao_aplicavel: "Derivada da proposta/OS aprovada vinculada ao caso.",
    status: "rascunho",
    origem: "proposta",
    observacao_interna: "Gerada pelo motor contratual. Sem cobrança, sem inferência de vencimento.",
    updated_by: ctx.userId,
  };

  if (existente) {
    const { error } = await supabase.from("commercial_conditions").update(payload).eq("id", existente.id);
    if (error) throw new Error(error.message);
    return { vinculada: true, id: existente.id as string, criada: false, propostaId: proposta.id as string };
  }

  const { data: nova, error } = await supabase
    .from("commercial_conditions")
    .insert({ ...payload, created_by: ctx.userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { vinculada: true, id: nova.id as string, criada: true, propostaId: proposta.id as string };
}

/* ---------------- gates server-side de ação externa ---------------- */

function anexoVigente(anexos: any[], codigo: string) {
  return anexos
    .filter((a) => a.annex_code === codigo)
    .sort((a, b) => (b.annex_version ?? 0) - (a.annex_version ?? 0))[0];
}

/**
 * Bloqueio server-side de pesquisa externa/pedido institucional sem Anexo III
 * válido e de ato externo em nome do cliente sem Anexo IV assinado.
 */
export async function exigirAnexosDeAcaoExterna(
  supabase: Sb,
  ctx: { organizationId: string; caseId: string; acao: "pesquisa_externa" | "pedido_institucional" | "ato_em_nome_do_cliente" },
) {
  const { data: anexos } = await supabase
    .from("contract_annexes")
    .select("annex_code,annex_version,status,structured_data")
    .eq("organization_id", ctx.organizationId)
    .eq("case_id", ctx.caseId)
    .is("archived_at", null);

  const lista = (anexos ?? []) as any[];
  const iii = anexoVigente(lista, "ANEXO_III_AUTORIZACAO_PESQUISA");
  const iv = anexoVigente(lista, "ANEXO_IV_PROCURACAO");

  const iiiOk = iii && iii.status === "approved" && iii.structured_data?.aplicavel === true;
  if (!iiiOk) {
    throw new Error(
      `Ação bloqueada sem Anexo III válido (autorização específica de pesquisa). Bloqueadas: ${ACOES_BLOQUEADAS_SEM_ANEXO_III.join(
        "; ",
      )}.`,
    );
  }

  if (ctx.acao === "ato_em_nome_do_cliente") {
    const ivOk = iv && iv.status === "approved" && iv.structured_data?.aplicavel === true;
    if (!ivOk) throw new Error("Ato externo em nome do cliente bloqueado: Anexo IV (procuração específica) não vigente.");
  }

  return { ok: true };
}
