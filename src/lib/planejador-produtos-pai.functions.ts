import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ItemPlannerCatalogFeed = {
  item_id: string;
  prefix: string;
  name: string;
  status_dictionary: string | null;
  product_parent: string | null;
  journey_phase_default: string | null;
  country_scope: string[] | null;
  commercial_model: string | null;
  price_status: string | null;
  reconciliation_note: string | null;
};

/**
 * Leitura do Planejador Universal — produtos-pai e catálogo multipaís.
 *
 * 07/09/2026 — achado de auditoria, confirmado pela proprietária: a tabela
 * `planner_catalog_feed` já tinha, desde 04/09, os 9 produtos-pai canônicos
 * (PP-01 a PP-09) ligados a SKUs reais de 11 países/vias (docs/arquitetura/
 * 2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md), mas nenhuma
 * tela lia essa tabela — motor pronto, ninguém via. Esta função fecha essa
 * lacuna. Taxonomia confirmada pela proprietária: PP-01–09 (não PP-01–08).
 *
 * Somente leitura: nada aqui cria, corrige ou homologa preço/SKU. É a
 * lista-alimento aditiva, não o catálogo comercial ativo (`product_catalog`).
 */
export const listarPlanejadorProdutosPai = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data, error } = await supabase
      .from("planner_catalog_feed")
      .select(
        "item_id,prefix,name,status_dictionary,product_parent,journey_phase_default,country_scope,commercial_model,price_status,reconciliation_note",
      )
      .is("archived_at", null)
      .order("product_parent", { ascending: true, nullsFirst: false })
      .order("item_id", { ascending: true });
    if (error) throw new Error(error.message);

    return { itens: (data ?? []) as ItemPlannerCatalogFeed[] };
  });
