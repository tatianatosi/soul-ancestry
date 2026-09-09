import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ConferenciaPreco } from "@/lib/precos-sku";
import { validarExcecaoComercial } from "@/lib/precos-sku";
import { construirMapaProdutoPaiPorCodigo, produtoPaiDoCodigo } from "@/lib/planejador-produtos-pai";
import { conflitoPlanejadorProposta } from "@/lib/perfil-institucional";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Sb = any;

async function orgDoUsuario(supabase: Sb, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();
  const org = data?.organization_id as string | undefined;
  if (!org) throw new Error("Usuário sem organização.");
  return org;
}

function sku(valor?: string | null): string | null {
  if (!valor) return null;
  const m = valor.match(/CA-[A-Z0-9]+(?:-[A-Z0-9]+)+/i);
  return m ? m[0].toUpperCase() : null;
}

/**
 * Conferência comercial do caso: despesas de terceiros + preço homologado do SKU.
 * Leitura apenas — nenhuma cobrança, checkout ou execução é acionada aqui.
 */
export const conferirRegraComercial = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data?.caseId ?? "")) throw new Error("caseId inválido.");
    return { caseId: data.caseId };
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase as Sb;
    const userId = (context as any).userId as string;
    const org = await orgDoUsuario(supabase, userId);

    const { data: despesasRaw } = await supabase
      .from("third_party_expenses")
      .select(
        "id,descricao,categoria,estado,estimativa_min,estimativa_max,moeda,pagador,comunicado_em,aprovado_pelo_cliente_em,aprovacao_evidencia,executado_em,valor_pago,excecao_id",
      )
      .eq("organization_id", org)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: true });

    const { data: params } = await supabase
      .from("contract_case_parameters")
      .select("id")
      .eq("organization_id", org)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let valorSku: string | null = null;
    let origemSku: string | null = null;
    if (params?.id) {
      const { data: linha } = await supabase
        .from("contract_parameter_values")
        .select("valor,origem")
        .eq("parameters_id", params.id)
        .eq("campo", "produto_sku")
        .is("archived_at", null)
        .maybeSingle();
      valorSku = linha?.valor ?? null;
      origemSku = linha?.origem ?? null;
    }

    const codigo = sku(valorSku);
    let preco: ConferenciaPreco | null = null;
    if (codigo) {
      const { data: rpc } = await supabase.rpc("sku_preco_homologado", { _org: org, _sku: codigo });
      preco = (rpc as ConferenciaPreco) ?? null;
    } else {
      preco = { ok: false, motivo: "SKU do produto não parametrizado no caso." };
    }

    const { data: excecoes } = await supabase
      .from("sku_price_exceptions")
      .select("id,sku,motivo,responsavel,status,valido_ate,preco_total,condicao_pagamento,aprovado_em")
      .eq("organization_id", org)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(10);

    // CA15-COMERCIAL-E-FONTE-VIVA (09/09/2026) — produto-pai (CA09) e
    // conflitoPlanejadorProposta (já existiam, sem nenhum leitor) passam a
    // conciliar preço homologado do SKU × valor declarado na proposta ativa
    // do caso. Nenhum valor é sobrescrito: a divergência só fica visível.
    const { data: catalogoPlanejador } = await supabase
      .from("planner_catalog_feed")
      .select("item_id,product_parent,status_dictionary,legacy_aliases")
      .eq("organization_id", org)
      .is("archived_at", null);
    const mapaProdutoPai = construirMapaProdutoPaiPorCodigo((catalogoPlanejador ?? []) as any);
    const produtoPai = codigo ? produtoPaiDoCodigo(codigo, mapaProdutoPai) : { produto_pai: null, status_reconciliacao: null };

    const { data: propostaAtiva } = await supabase
      .from("proposals")
      .select("id,versao,valor,moeda,forma_pagamento,status")
      .eq("organization_id", org)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("versao", { ascending: false })
      .limit(1)
      .maybeSingle();

    const conflitoValor = conflitoPlanejadorProposta({
      campo: "valor total",
      planejador: preco?.ok ? String(preco.preco_total) : null,
      proposta: propostaAtiva?.valor != null ? String(propostaAtiva.valor) : null,
    });

    return {
      despesas: despesasRaw ?? [],
      sku: codigo,
      skuOrigem: origemSku,
      produtoPai: produtoPai.produto_pai,
      produtoPaiStatusReconciliacao: produtoPai.status_reconciliacao,
      preco,
      excecoes: excecoes ?? [],
      proposta: propostaAtiva ?? null,
      conflitoValor,
    };
  });

/**
 * Assumir exceção comercial (CA-BLOQ-ADMIN-ALL-001, categoria autorizada para
 * afrouxamento controlado): registra e já aprova, no mesmo ato, uma exceção
 * de preço/SKU — RLS (`can_write_financeiro`) só permite admin/financeiro, e
 * o trigger `fn_sku_price_exception_guard` exige motivo, aprovador humano e
 * validade futura antes de aceitar `status = 'aprovada'`. É a mesma tabela e
 * o mesmo RPC (`sku_preco_homologado`) que a Planilha Mestre já usa — não um
 * mecanismo novo, nem um jeito de contornar a regra: só liga ao motivo,
 * permissão e mensagem que já existiam sem nenhuma tela para acioná-los.
 * Nunca altera preço de contrato já assinado nem apaga catálogo/histórico:
 * é sempre uma linha nova, com validade e responsável, na fila de exceções.
 */
export const registrarExcecaoComercial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      sku: string;
      motivo: string;
      precoTotal: number;
      condicaoPagamento: string;
      validoAte: string;
    }) => {
      if (!/^[0-9a-f-]{36}$/i.test(data?.caseId ?? "")) throw new Error("caseId inválido.");
      const validacao = validarExcecaoComercial({
        sku: data.sku,
        caseId: data.caseId,
        motivo: data.motivo,
        precoTotal: data.precoTotal,
        condicaoPagamento: data.condicaoPagamento,
        validoAte: data.validoAte,
      });
      if (!validacao.valida) throw new Error(validacao.erros.join(" "));
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase as Sb;
    const userId = (context as any).userId as string;
    const org = await orgDoUsuario(supabase, userId);

    const { data: responsavel } = await supabase
      .from("staff_access")
      .select("full_name,email")
      .eq("auth_user_id", userId)
      .maybeSingle();
    const nomeResponsavel = responsavel?.full_name?.trim() || responsavel?.email || "Admin autenticado";

    const agora = new Date().toISOString();
    const { data: row, error } = await supabase
      .from("sku_price_exceptions")
      .insert({
        organization_id: org,
        sku: data.sku.toUpperCase(),
        case_id: data.caseId,
        motivo: data.motivo.trim(),
        responsavel: nomeResponsavel,
        preco_total: data.precoTotal,
        condicao_pagamento: data.condicaoPagamento.trim(),
        valido_ate: data.validoAte,
        status: "aprovada",
        aprovado_por: userId,
        aprovado_em: agora,
        created_by: userId,
      })
      .select("id,sku,status,valido_ate")
      .single();
    if (error) throw new Error(error.message);

    return { registrada: true, excecaoId: row.id as string, sku: row.sku as string, validoAte: row.valido_ate as string };
  });
