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
    .select("id,case_id,organization_id,versao,status,escopo_estruturado,product_catalog_id,valor_total,forma_pagamento,origem_preco")
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
        : proposta.valor_total !== null && proposta.valor_total !== undefined
          ? Number(proposta.valor_total)
          : null,
    condicaoObservada: condicao?.forma_pagamento ?? proposta.forma_pagamento ?? null,
    origemPreco: condicao?.origem ?? proposta.origem_preco ?? null,
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

  const atuais = new Map<string, any>();
  for (const row of (abertas ?? []) as any[]) atuais.set(`${row.sku}::${row.tipo}`, row);

  const desejadas = new Set<string>();
  let registradas = 0;

  for (const d of r.divergencias) {
    const k = `${d.sku}::${d.codigo}`;
    desejadas.add(k);
    const detalhe = `${d.severidade === "bloqueante" ? "[BLOQUEANTE] " : ""}${d.descricao}`;
    const existente = atuais.get(k);
    if (existente) {
      if (existente.detalhe !== detalhe || existente.resolvido) {
        await supabase
          .from("catalog_source_divergences")
          .update({ detalhe, resolvido: false })
          .eq("id", existente.id);
      }
    } else {
      await supabase.from("catalog_source_divergences").insert({
        organization_id: input.org,
        sku: d.sku,
        tipo: d.codigo,
        detalhe,
        fonte_referencia: `conciliacao:${input.proposalId}`,
        resolvido: false,
      });
      registradas += 1;
    }
  }

  let resolvidas = 0;
  for (const [k, row] of atuais) {
    if (!desejadas.has(k) && !row.resolvido) {
      await supabase.from("catalog_source_divergences").update({ resolvido: true }).eq("id", row.id);
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
