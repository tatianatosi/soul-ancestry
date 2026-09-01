/**
 * Persistência da rotina de conciliação de catálogo.
 *
 * Lê apenas entidades canônicas (crm_casos, proposals, commercial_conditions,
 * product_catalog), registra divergências em catalog_source_divergences e
 * grava auditoria. Não cria produto, preço, cobrança nem comunicação.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  conciliarCatalogo,
  type EscopoObservado,
  type ProdutoHomologado,
  type ResultadoConciliacao,
} from "@/lib/conciliacao-catalogo";

type Sb = any;

const lista = (v: any): string[] =>
  Array.isArray(v)
    ? v.map((x) => String(x).trim()).filter(Boolean)
    : String(v ?? "")
        .split(/\r?\n|;/)
        .map((t) => t.trim())
        .filter(Boolean);

const SELECT_PRODUTO =
  "id,code,nome_comercial,ativo,archived_at,status_homologacao,elegivel_para_proposta,preco_comercial_vigente,condicao_comercial_padrao,moeda,vigencia_inicio,vigencia_fim,inclusoes,exclusoes,entregaveis,escopo_aprovado";

export function produtoHomologado(row: any | null): ProdutoHomologado | null {
  if (!row) return null;
  const preco = row.preco_comercial_vigente;
  return {
    id: row.id,
    code: row.code ?? null,
    nome: row.nome_comercial ?? null,
    ativo: row.ativo !== false,
    archived_at: row.archived_at ?? null,
    status_homologacao: row.status_homologacao ?? null,
    elegivel_para_proposta: row.elegivel_para_proposta !== false,
    preco_comercial_vigente: preco === null || preco === undefined ? null : Number(preco),
    condicao_comercial_padrao: row.condicao_comercial_padrao ?? null,
    moeda: row.moeda ?? "BRL",
    vigencia_inicio: row.vigencia_inicio ?? null,
    vigencia_fim: row.vigencia_fim ?? null,
    inclusoes: lista(row.inclusoes),
    exclusoes: lista(row.exclusoes),
    entregaveis: lista(row.entregaveis),
    escopo_aprovado: row.escopo_aprovado ?? null,
  };
}

function escopoDaProposta(proposta: any): EscopoObservado {
  const e = proposta?.escopo_estruturado ?? {};
  return {
    objetivo: e.objetivo ?? null,
    servicos: lista(e.servicos_incluidos),
    inclusoes: lista(e.inclusoes),
    exclusoes: lista(e.exclusoes),
    entregas: lista(e.entregas),
    pessoas: Array.isArray(e.pessoas) ? e.pessoas.length : 0,
  };
}

/** Conciliação somente leitura da proposta aprovada contra o catálogo. */
export async function conciliarPropostaComCatalogo(
  supabase: Sb,
  input: { org: string; proposalId: string; hoje?: Date },
): Promise<ResultadoConciliacao & { proposalId: string; produtoId: string | null }> {
  const { data: proposta } = await supabase
    .from("proposals")
    .select("id,case_id,organization_id,versao,status,escopo_estruturado,product_catalog_id,valor,forma_pagamento,preco_fonte_referencia")
    .eq("id", input.proposalId)
    .maybeSingle();
  if (!proposta || proposta.organization_id !== input.org)
    throw new Error("Proposta não encontrada nesta organização.");

  const escopo = escopoDaProposta(proposta);
  const skuObservado =
    (proposta.escopo_estruturado as any)?.origem?.sku_codigo ?? null;

  let produtoRow: any = null;
  if (proposta.product_catalog_id) {
    const { data } = await supabase
      .from("product_catalog")
      .select(SELECT_PRODUTO)
      .eq("id", proposta.product_catalog_id)
      .maybeSingle();
    produtoRow = data;
  } else if (skuObservado) {
    const { data } = await supabase
      .from("product_catalog")
      .select(SELECT_PRODUTO)
      .eq("organization_id", input.org)
      .eq("code", String(skuObservado).toUpperCase())
      .maybeSingle();
    produtoRow = data;
  }
  const produto = produtoHomologado(produtoRow);

  const { data: condicao } = await supabase
    .from("commercial_conditions")
    .select("id,valor_total_referencia,forma_pagamento,origem")
    .eq("proposal_id", proposta.id)
    .is("archived_at", null)
    .maybeSingle();

  const resultado = conciliarCatalogo({
    caseId: proposta.case_id,
    skuObservado: skuObservado ?? produto?.code ?? null,
    produto,
    precoObservado:
      condicao?.valor_total_referencia !== undefined && condicao?.valor_total_referencia !== null
        ? Number(condicao.valor_total_referencia)
        : proposta.valor !== null && proposta.valor !== undefined
          ? Number(proposta.valor)
          : null,
    condicaoObservada: condicao?.forma_pagamento ?? proposta.forma_pagamento ?? null,
    origemPreco: condicao?.origem ?? proposta.preco_fonte_referencia ?? null,
    escopo,
    condicaoComercialPersistida: !!condicao?.id,
    hoje: input.hoje,
  });

  return { ...resultado, proposalId: proposta.id, produtoId: produto?.id ?? null };
}

/**
 * Executa a conciliação e registra as divergências encontradas.
 * Divergências antigas do mesmo SKU/caso deixam de ser reabertas: o registro é
 * idempotente por (sku, tipo, detalhe) não resolvido.
 */
export async function registrarConciliacao(
  supabase: Sb,
  input: { org: string; userId: string; proposalId: string; hoje?: Date },
) {
  const r = await conciliarPropostaComCatalogo(supabase, { org: input.org, proposalId: input.proposalId, hoje: input.hoje });

  const { data: abertas } = await supabase
    .from("catalog_source_divergences")
    .select("id,sku,tipo,detalhe,resolvido")
    .eq("organization_id", input.org)
    .eq("fonte_referencia", `conciliacao:${input.proposalId}`);

  // Vínculos de rastreabilidade (contrato e OS do caso), somente leitura.
  let contractId: string | null = null;
  let serviceOrderId: string | null = null;
  if (r.caseId) {
    const { data: ct } = await supabase
      .from("contracts")
      .select("id")
      .eq("organization_id", input.org)
      .eq("case_id", r.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1);
    contractId = ((ct ?? []) as any[])[0]?.id ?? null;
    const { data: os } = await supabase
      .from("service_orders")
      .select("id")
      .eq("organization_id", input.org)
      .eq("case_id", r.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1);
    serviceOrderId = ((os ?? []) as any[])[0]?.id ?? null;
  }

  const atuais = new Map<string, any>();
  for (const row of (abertas ?? []) as any[]) atuais.set(`${row.sku}::${row.tipo}`, row);

  const desejadas = new Set<string>();
  let registradas = 0;

  for (const d of r.divergencias) {
    const k = `${d.sku}::${d.codigo}`;
    desejadas.add(k);
    const detalhe = `${d.severidade === "bloqueante" ? "[BLOQUEANTE] " : ""}${d.descricao}`;
    const severidade = d.severidade === "bloqueante" ? "bloqueio" : "atencao";
    const existente = atuais.get(k);
    if (existente) {
      if (existente.detalhe !== detalhe || existente.resolvido) {
        const { data: atualizada, error: erroUpdate } = await supabase
          .from("catalog_source_divergences")
          .update({
            detalhe,
            resolvido: false,
            severidade,
            case_id: r.caseId ?? null,
            contract_id: contractId,
            service_order_id: serviceOrderId,
          })
          .eq("id", existente.id)
          .select("id")
          .maybeSingle();
        if (erroUpdate) throw new Error(erroUpdate.message);
        if (!atualizada?.id) throw new Error(`Nenhuma linha afetada ao atualizar divergência ${existente.id}.`);
      }
    } else {
      const { data: inserida, error: erroInsert } = await supabase
        .from("catalog_source_divergences")
        .insert({
          organization_id: input.org,
          sku: d.sku,
          tipo: d.codigo,
          detalhe,
          severidade,
          case_id: r.caseId ?? null,
          contract_id: contractId,
          service_order_id: serviceOrderId,
          fonte_referencia: `conciliacao:${input.proposalId}`,
          resolvido: false,
        })
        .select("id")
        .maybeSingle();
      if (erroInsert) throw new Error(erroInsert.message);
      if (!inserida?.id) throw new Error(`Falha ao registrar divergência ${d.sku}/${d.codigo}.`);
      registradas += 1;
    }
  }


  let resolvidas = 0;
  for (const [k, row] of atuais) {
    if (!desejadas.has(k) && !row.resolvido) {
      const { data: resolvida, error: erroResolver } = await supabase
        .from("catalog_source_divergences")
        .update({ resolvido: true })
        .eq("id", row.id)
        .select("id")
        .maybeSingle();
      if (erroResolver) throw new Error(erroResolver.message);
      if (!resolvida?.id) throw new Error(`Nenhuma linha afetada ao resolver divergência ${row.id}.`);
      resolvidas += 1;
    }
  }

  await supabase.from("audit_logs").insert({
    organization_id: input.org,
    user_id: input.userId,
    acao: "conciliacao_catalogo_executada",
    entidade: "proposals",
    entidade_id: input.proposalId,
    metadados: {
      case_id: r.caseId,
      sku: r.sku,
      pode_gerar_os: r.pode_gerar_os,
      divergencias: r.divergencias.map((d) => ({ codigo: d.codigo, severidade: d.severidade })),
      registradas,
      resolvidas,
    },
  });

  return { ...r, registradas, resolvidas };
}

/**
 * Reprocessa a conciliação após correções no escopo ou no product_catalog.
 *
 * Preserva a versão anterior das decisões: antes de reexecutar, tira um retrato
 * das divergências e observações de resolução vigentes e grava esse retrato,
 * junto do novo resultado, em catalog_reconciliation_runs (append-only).
 */
export async function reprocessarConciliacao(
  supabase: Sb,
  input: { org: string; userId: string; proposalId: string; motivo?: string | null; hoje?: Date },
) {
  const { data: anteriores } = await supabase
    .from("catalog_source_divergences")
    .select(
      "id,sku,tipo,detalhe,severidade,resolvido,observacao_resolucao,resolucao_registrada_em,resolucao_registrada_por,updated_at",
    )
    .eq("organization_id", input.org)
    .eq("fonte_referencia", `conciliacao:${input.proposalId}`);

  const { data: ultima } = await supabase
    .from("catalog_reconciliation_runs")
    .select("versao")
    .eq("proposal_id", input.proposalId)
    .order("versao", { ascending: false })
    .limit(1);
  const versao = Number(((ultima ?? []) as any[])[0]?.versao ?? 0) + 1;

  const r = await registrarConciliacao(supabase, {
    org: input.org,
    userId: input.userId,
    proposalId: input.proposalId,
    hoje: input.hoje,
  });

  let contractId: string | null = null;
  let serviceOrderId: string | null = null;
  if (r.caseId) {
    const { data: ct } = await supabase
      .from("contracts")
      .select("id")
      .eq("organization_id", input.org)
      .eq("case_id", r.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1);
    contractId = ((ct ?? []) as any[])[0]?.id ?? null;
    const { data: os } = await supabase
      .from("service_orders")
      .select("id")
      .eq("organization_id", input.org)
      .eq("case_id", r.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1);
    serviceOrderId = ((os ?? []) as any[])[0]?.id ?? null;
  }

  const { data: run, error } = await supabase
    .from("catalog_reconciliation_runs")
    .insert({
      organization_id: input.org,
      proposal_id: input.proposalId,
      case_id: r.caseId ?? null,
      contract_id: contractId,
      service_order_id: serviceOrderId,
      versao,
      motivo: (input.motivo ?? "").trim() || null,
      origem: versao === 1 ? "primeira_execucao" : "reprocessamento",
      sku: r.sku,
      preco_homologado: r.preco_homologado,
      pode_gerar_os: r.pode_gerar_os,
      pode_gerar_contrato: r.pode_gerar_contrato,
      bloqueios: r.bloqueios,
      divergencias: r.divergencias,
      decisoes_anteriores: anteriores ?? [],
      registradas: r.registradas,
      resolvidas: r.resolvidas,
      executado_por: input.userId,
    })
    .select("id,versao,created_at")
    .maybeSingle();
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    organization_id: input.org,
    user_id: input.userId,
    acao: "conciliacao_catalogo_reprocessada",
    entidade: "proposals",
    entidade_id: input.proposalId,
    metadados: {
      versao,
      motivo: (input.motivo ?? "").trim() || null,
      pode_gerar_os: r.pode_gerar_os,
      decisoes_preservadas: (anteriores ?? []).length,
    },
  });

  return { ...r, versao, runId: (run as any)?.id ?? null, decisoes_preservadas: (anteriores ?? []).length };
}

/** Histórico append-only das execuções de conciliação de uma proposta. */
export async function historicoConciliacao(
  supabase: Sb,
  input: { org: string; proposalId: string; limite?: number },
) {
  const { data } = await supabase
    .from("catalog_reconciliation_runs")
    .select(
      "id,versao,motivo,origem,sku,preco_homologado,pode_gerar_os,pode_gerar_contrato,bloqueios,divergencias,decisoes_anteriores,registradas,resolvidas,executado_por,created_at",
    )
    .eq("organization_id", input.org)
    .eq("proposal_id", input.proposalId)
    .order("versao", { ascending: false })
    .limit(input.limite ?? 20);
  return (data ?? []) as any[];
}

/**
 * Conciliação do contrato: resolve a proposta canônica do caso e devolve o
 * resultado somente leitura. Se o caso não tem proposta, o escopo é
 * insuficiente por definição — não há fonte homologada para o instrumento.
 */
export async function conciliacaoDoContrato(
  supabase: Sb,
  input: { org: string; contractId: string; hoje?: Date },
): Promise<(ResultadoConciliacao & { proposalId: string | null }) | null> {
  const { data: contrato } = await supabase
    .from("contracts")
    .select("id,organization_id,case_id,proposal_id")
    .eq("id", input.contractId)
    .maybeSingle();
  if (!contrato || contrato.organization_id !== input.org) return null;

  let proposalId: string | null = contrato.proposal_id ?? null;
  if (!proposalId && contrato.case_id) {
    const { data } = await supabase
      .from("proposals")
      .select("id,status,versao")
      .eq("organization_id", input.org)
      .eq("case_id", contrato.case_id)
      .is("archived_at", null)
      .order("versao", { ascending: false })
      .limit(20);
    const linhas = (data ?? []) as any[];
    proposalId = (linhas.find((p) => p.status === "aprovada") ?? linhas[0])?.id ?? null;
  }
  if (!proposalId) return null;

  return conciliarPropostaComCatalogo(supabase, { org: input.org, proposalId, hoje: input.hoje });
}

/** Varredura de todas as propostas vivas contra o catálogo homologado. */
export async function varrerConciliacao(supabase: Sb, input: { org: string; hoje?: Date }) {
  const { data } = await supabase
    .from("proposals")
    .select("id,versao,status,case_id,dados_teste")
    .eq("organization_id", input.org)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(300);

  const propostas = ((data ?? []) as any[]).filter((p) => p.dados_teste !== true);
  const casosIds = [...new Set(propostas.map((p) => p.case_id).filter(Boolean))];
  const { data: casos } = casosIds.length
    ? await supabase.from("crm_casos").select("id,codigo,titulo").in("id", casosIds)
    : { data: [] as any[] };
  const mapaCaso = new Map(((casos ?? []) as any[]).map((c) => [c.id, c]));

  const linhas = [] as {
    proposalId: string;
    versao: number | null;
    status: string | null;
    caso: string;
    sku: string | null;
    preco_homologado: number | null;
    divergencias: ResultadoConciliacao["divergencias"];
    bloqueios: string[];
    pode_gerar_os: boolean;
    pode_gerar_contrato: boolean;
  }[];

  for (const p of propostas) {
    try {
      const r = await conciliarPropostaComCatalogo(supabase, {
        org: input.org,
        proposalId: p.id,
        hoje: input.hoje,
      });
      const caso = mapaCaso.get(p.case_id);
      linhas.push({
        proposalId: p.id,
        versao: p.versao ?? null,
        status: p.status ?? null,
        caso: caso ? `${caso.codigo ?? "—"} · ${caso.titulo ?? ""}`.trim() : "—",
        sku: r.sku,
        preco_homologado: r.preco_homologado,
        divergencias: r.divergencias,
        bloqueios: r.bloqueios,
        pode_gerar_os: r.pode_gerar_os,
        pode_gerar_contrato: r.pode_gerar_contrato,
      });
    } catch {
      /* proposta ilegível para conciliação permanece fora da varredura */
    }
  }

  return {
    linhas,
    resumo: {
      total: linhas.length,
      liberadas: linhas.filter((l) => l.pode_gerar_os).length,
      bloqueadas: linhas.filter((l) => !l.pode_gerar_os).length,
      atencao: linhas.filter((l) => l.pode_gerar_os && l.divergencias.length > 0).length,
    },
  };
}
