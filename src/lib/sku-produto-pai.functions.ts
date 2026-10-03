/**
 * De-para SKU → Produto-Pai: leitor do alimento (03/10/2026).
 *
 * "ser usado como alimento e não tela estática": o de-para é **regra**
 * (`sku-produto-pai.ts`), lida em tempo de uso pelo Planejador (o SKU do
 * plano passa a dizer qual produto-pai implica) e por `/catalogo`.
 *
 * ## Achado que corrigiu o plano, registrado aqui para ninguém repetir
 *
 * O plano desta sessão dizia "`product_catalog.produto_pai_id` vazio nos
 * SKUs — falta o de-para SKU→PP-01..09". Errado, e o banco provou na hora de
 * gravar: essa coluna é **uuid com FK para `product_catalog(id)`** — é a
 * hierarquia de SKU pai→filho, nada a ver com a taxonomia PP-01–09, que é
 * texto com CHECK em `case_plans.produto_pai_id`. Gravar "PP-07" ali seria
 * inventar uma entidade paralela em cima de uma coluna existente, o que o
 * AGENTS.md proíbe.
 *
 * Por isso o de-para **não persiste** nada: ele é derivado na leitura, com
 * fonte única na regra. Não há segunda cópia para divergir, e SKU novo entra
 * classificado sozinho — é o que "alimento" significa.
 */
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { alimentoDeParaSku, type SkuDoCatalogo } from "@/lib/sku-produto-pai";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Alimento do de-para: SKUs agrupados por produto-pai + pendências. */
export const alimentoSkuProdutoPai = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa o catálogo de produtos.");

    const { data } = await (supabase as any)
      .from("product_catalog")
      .select("id,code,nome_comercial")
      .eq("organization_id", organizationId)
      .is("archived_at", null);

    return alimentoDeParaSku((data ?? []) as SkuDoCatalogo[]);
  });
