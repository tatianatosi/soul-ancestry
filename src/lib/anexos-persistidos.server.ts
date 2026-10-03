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
import { corpoRenderizadoDoAnexo } from "@/lib/anexos-conteudo";

type Sb = any;

export const TITULO_ANEXO_INTERNO_PADRAO = "Anexo interno derivado da regra de produto/escopo";

/** Domínio aceito pelo banco (contract_annexes.status). */
export type StatusAnexoPersistido =
  | "missing"
  | "drafting"
  | "ready_for_review"
  | "approved"
  | "attached"
  | "signed_with_contract"
  | "not_applicable"
  | "archived";

function statusPersistido(a: { aplicavel: boolean; pendencias: string[]; estado: string }): StatusAnexoPersistido {
  if (!a.aplicavel) return "not_applicable";
  if (a.pendencias.length) return "missing";
  if (a.estado === "aprovado") return "approved";
  if (a.estado === "em_revisao") return "ready_for_review";
  return "drafting";
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

/**
 * Um anexo dispensado à mão (`dispensarAnexoManualmente`) fica marcado com
 * `structured_data.overrideManual`. Enquanto essa marca existir, a
 * ressincronização/auto-cura preserva a decisão humana em vez de recalcular
 * o estado pela regra — mesma lógica de "valor já registrado não é
 * sobrescrito sozinho" usada na reconciliação de CPF.
 */
export function anexoDispensadoManualmente(row: { status?: string | null; structured_data?: unknown } | null | undefined): boolean {
  if (!row) return false;
  const dados = (row.structured_data ?? {}) as Record<string, unknown>;
  return row.status === "not_applicable" && dados.overrideManual === true;
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
  status: StatusAnexoPersistido;
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
    // O conteúdo salvo precisa mostrar o que está sendo aprovado: os campos
    // do anexo, com fonte e pendência nomeada. Antes de 03/10/2026 isto era
    // só código/título/finalidade/regra e a equipe não via o conteúdo.
    rendered_html: corpoRenderizadoDoAnexo({
      codigo: a.codigo,
      titulo: a.titulo,
      finalidade: a.finalidade,
      regra: a.regra,
      motivo: a.motivo,
      campos: a.campos,
      pendencias: a.pendencias,
      impactoAusencia: a.impactoAusencia,
    }),
    reason_not_applicable: a.aplicavel ? null : a.motivo,
  }));

  const internos: InstanciaAnexo[] = input.internos.map((i) => ({
    annex_code: i.codigo,
    title: i.titulo,
    annex_type: tipoAnexoPersistido(i.codigo),
    natureza: "interno",
    applicability_rule: i.motivo,
    source: "regra de produto/escopo",
    model_version: "ANX-INTERNO-v1.0",
    required_for_contract: true,
    status: "drafting",
    structured_data: { motivo: i.motivo, natureza: "interno" },

    rendered_html: corpoRenderizadoDoAnexo({
      codigo: i.codigo,
      titulo: i.titulo,
      motivo: i.motivo,
    }),
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
  opcoes?: { ignorarOverrideParaCodigos?: string[] },
) {
  const { data: existentes } = await supabase
    .from("contract_annexes")
    .select("id,annex_code,annex_version,file_hash,status,structured_data")
    .eq("organization_id", ctx.organizationId)
    .eq("case_id", ctx.caseId)
    .is("archived_at", null);

  const vigentePorCodigo = new Map<string, any>();
  for (const linha of (existentes ?? []) as any[]) {
    const atual = vigentePorCodigo.get(linha.annex_code);
    if (!atual || linha.annex_version > atual.annex_version) vigentePorCodigo.set(linha.annex_code, linha);
  }

  const ignorarOverride = new Set(opcoes?.ignorarOverrideParaCodigos ?? []);
  let novas = 0;
  let mantidas = 0;
  let dispensadosPreservados = 0;

  for (const inst of instancias) {
    const vigente = vigentePorCodigo.get(inst.annex_code);
    if (vigente && anexoDispensadoManualmente(vigente) && !ignorarOverride.has(inst.annex_code)) {
      dispensadosPreservados += 1;
      continue;
    }
    const hash = hashConteudo({ d: inst.structured_data, s: inst.status, m: inst.model_version });
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

  return { novas, mantidas, total: instancias.length, dispensadosPreservados };
}

const STATUS_ANEXO_CONGELADO = ["attached", "signed_with_contract", "archived"];

/**
 * Dispensa manual de um anexo (governado ou interno) com motivo humano —
 * decisão operacional, não jurídica: nunca reescreve cláusula, nunca toca
 * instância já anexada/assinada/arquivada. Sempre nasce como versão nova
 * (a vigente nunca é editada em lugar), marcada como override manual para a
 * auto-cura (`sincronizarAnexosPersistidos`) preservar a decisão em vez de
 * recalcular pela regra a cada resync.
 */
export async function dispensarAnexoManualmente(
  supabase: Sb,
  ctx: {
    organizationId: string;
    caseId: string;
    parametersId: string;
    contractId: string | null;
    userId: string;
    annexCode: string;
    motivo: string;
  },
) {
  const motivo = ctx.motivo.trim();
  if (!motivo) throw new Error("Descreva o motivo da dispensa.");
  if (motivo.length > 500) throw new Error("O motivo da dispensa excede 500 caracteres.");

  const { data: vigente } = await supabase
    .from("contract_annexes")
    .select("*")
    .eq("organization_id", ctx.organizationId)
    .eq("case_id", ctx.caseId)
    .eq("annex_code", ctx.annexCode)
    .is("archived_at", null)
    .order("annex_version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!vigente) throw new Error("Anexo ainda não sincronizado para este caso — sincronize antes de dispensar.");
  if (STATUS_ANEXO_CONGELADO.includes(String(vigente.status)))
    throw new Error(`Anexo em estado "${vigente.status}" não pode ser dispensado.`);

  const structuredData = {
    ...((vigente.structured_data as Record<string, unknown>) ?? {}),
    overrideManual: true,
    overrideMotivo: motivo,
    overrideUserId: ctx.userId,
    overrideAt: new Date().toISOString(),
  };
  const hash = hashConteudo({ d: structuredData, s: "not_applicable", m: vigente.model_version });

  const { error } = await supabase.from("contract_annexes").insert({
    organization_id: ctx.organizationId,
    case_id: ctx.caseId,
    parameters_id: ctx.parametersId,
    preview_id: vigente.preview_id ?? null,
    contract_id: ctx.contractId,
    annex_code: vigente.annex_code,
    title: vigente.title,
    annex_type: vigente.annex_type,
    applicability_rule: vigente.applicability_rule,
    source: vigente.source,
    source_reference: vigente.source_reference,
    model_version: vigente.model_version,
    annex_version: Number(vigente.annex_version ?? 0) + 1,
    required_for_contract: false,
    status: "not_applicable",
    structured_data: structuredData,
    rendered_html: vigente.rendered_html,
    reason_not_applicable: motivo,
    file_hash: hash,
    is_test: Boolean(vigente.is_test),
    prepared_by: ctx.userId,
    created_by: ctx.userId,
    updated_by: ctx.userId,
  });
  if (error) throw new Error(`Falha ao dispensar ${ctx.annexCode}: ${error.message}`);

  return { ok: true as const, annexCode: ctx.annexCode, annexVersion: Number(vigente.annex_version ?? 0) + 1 };
}

/**
 * Reverte uma dispensa manual, recalculando o anexo pela regra vigente
 * (sempre cria versão nova). Não-op se o anexo não estiver dispensado.
 */
export async function reativarAnexoManual(
  supabase: Sb,
  ctx: {
    organizationId: string;
    caseId: string;
    parametersId: string;
    previaId: string | null;
    contractId: string | null;
    userId: string;
  },
  instanciaAtual: InstanciaAnexo,
) {
  const { data: vigente } = await supabase
    .from("contract_annexes")
    .select("status,structured_data")
    .eq("organization_id", ctx.organizationId)
    .eq("case_id", ctx.caseId)
    .eq("annex_code", instanciaAtual.annex_code)
    .is("archived_at", null)
    .order("annex_version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!anexoDispensadoManualmente(vigente)) {
    return { ok: true as const, jaAtivo: true, annexCode: instanciaAtual.annex_code, versoesNovas: 0 };
  }

  const resultado = await sincronizarAnexosPersistidos(
    supabase,
    {
      organizationId: ctx.organizationId,
      caseId: ctx.caseId,
      parametersId: ctx.parametersId,
      previaId: ctx.previaId,
      contractId: ctx.contractId,
      userId: ctx.userId,
    },
    [instanciaAtual],
    { ignorarOverrideParaCodigos: [instanciaAtual.annex_code] },
  );

  return { ok: true as const, jaAtivo: false, annexCode: instanciaAtual.annex_code, versoesNovas: resultado.novas };
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
    const { data: atualizada, error } = await supabase
      .from("commercial_conditions")
      .update(payload)
      .eq("id", existente.id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!atualizada?.id) throw new Error("Nenhuma linha afetada ao sincronizar condição comercial da proposta.");
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
