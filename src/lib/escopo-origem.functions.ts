import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { montarOrigemEscopo, resumirOrigem } from "@/lib/escopo-origem";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Leitura auditável da origem de cada contract_scope_item. Somente SELECT:
 * não cria, não vincula, não corrige e não dispara nada externo.
 */
export const origemEscopoContratual = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;

    const [itens, contratos, propostas, condicoes, ordens, produtos, casos] = await Promise.all([
      supabase
        .from("contract_scope_items")
        .select(
          "id,contract_id,category,title,status,source_type,source_reference,scope_version,proposal_id,commercial_condition_id,service_order_id,created_at",
        )
        .is("archived_at", null)
        .order("created_at", { ascending: true })
        .limit(2000),
      supabase.from("contracts").select("id,contract_number,case_id,proposal_id,status,demo").is("archived_at", null).limit(2000),
      supabase.from("proposals").select("id,versao,status,case_id,product_catalog_id,dados_teste").is("archived_at", null).limit(2000),
      supabase
        .from("commercial_conditions")
        .select("id,codigo,status,case_id,proposal_id,product_catalog_id,dados_teste")
        .is("archived_at", null)
        .limit(2000),
      supabase
        .from("service_orders")
        .select("id,service_order_number,status,case_id,contract_id,commercial_condition_id,dados_teste")
        .is("archived_at", null)
        .limit(2000),
      supabase.from("product_catalog").select("id,code,nome_comercial").limit(2000),
      supabase.from("crm_casos").select("id,codigo,titulo,demo,dados_teste").is("archived_at", null).limit(2000),
    ]);

    const erro = [itens, contratos, propostas, condicoes, ordens, produtos, casos].find((r: any) => r.error);
    if (erro) throw new Error(erro.error.message);

    const linhas = montarOrigemEscopo({
      itens: itens.data ?? [],
      contratos: contratos.data ?? [],
      propostas: propostas.data ?? [],
      condicoes: condicoes.data ?? [],
      ordens: ordens.data ?? [],
      produtos: produtos.data ?? [],
      casos: casos.data ?? [],
    });

    return { linhas, resumo: resumirOrigem(linhas.filter((l) => !l.fixture)) };
  });
