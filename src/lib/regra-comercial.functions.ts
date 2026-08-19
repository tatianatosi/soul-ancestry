import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

    return {
      despesas: despesasRaw ?? [],
      sku: codigo,
      skuOrigem: origemSku,
      preco,
      excecoes: excecoes ?? [],
    };
  });
