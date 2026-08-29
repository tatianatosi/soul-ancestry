/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Confirma a homologação em lote dos SKUs previamente revisados item a item.
 * Somente perfis admin/operações. Nenhuma ação externa é executada: apenas o
 * estado interno do catálogo muda, com auditoria por item.
 */
export const confirmarHomologacaoLote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[]; motivo?: string }) => ({
    ids: Array.from(new Set((d.ids ?? []).map((i) => String(i)))).slice(0, 200),
    motivo:
      String(d.motivo ?? "").trim().slice(0, 600) || "Homologação em lote confirmada pela proprietária",
  }))
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const { contextoRg } = await import("@/lib/pesquisa-modulo.server");
    const { pendenciasBloqueantes } = await import("@/lib/homologacao-revisao");
    const { organizationId, papel } = await contextoRg(supabase, userId);

    if (!["admin", "operacoes"].includes(papel)) {
      throw new Error("Homologação de catálogo restrita a admin e operações.");
    }
    if (!data.ids.length) throw new Error("Nenhum SKU selecionado para homologação.");

    const { lerSaneamentoCatalogo } = await import("@/lib/catalogo-canonico.functions");
    const leitura: any = await (lerSaneamentoCatalogo as any)({ data: { incluirTeste: false } });
    const porId = new Map<string, any>((leitura.skus ?? []).map((s: any) => [s.id, s]));

    const agora = new Date().toISOString();
    const homologados: string[] = [];
    const recusados: { id: string; sku: string; motivo: string }[] = [];

    for (const id of data.ids) {
      const sku = porId.get(id);
      if (!sku) {
        recusados.push({ id, sku: id, motivo: "SKU fora do catálogo ativo da organização" });
        continue;
      }
      const pendencias = pendenciasBloqueantes(sku);
      if (pendencias.length) {
        recusados.push({ id, sku: sku.sku_codigo, motivo: pendencias[0] });
        continue;
      }

      const { error } = await supabase
        .from("product_catalog")
        .update({
          estado_catalogo: "homologado_ativo",
          preco_estado_homologacao: "homologado",
          homologado_por: userId,
          homologado_em: agora,
        })
        .eq("id", id)
        .eq("organization_id", organizationId)
        .is("archived_at", null);

      if (error) {
        recusados.push({ id, sku: sku.sku_codigo, motivo: error.message });
        continue;
      }

      await supabase.from("audit_logs").insert({
        organization_id: organizationId,
        user_id: userId,
        acao: "sku_homologado_em_lote",
        entidade: "product_catalog",
        entidade_id: id,
        metadados: {
          sku: sku.sku_codigo,
          estado_anterior: sku.estado_catalogo,
          estado_novo: "homologado_ativo",
          preco: sku.preco,
          moeda: sku.moeda,
          preco_fonte: sku.preco_fonte,
          motivo: data.motivo,
          fonte: "revisao_item_a_item_homologacao",
          acao_externa_executada: false,
        },
      });

      homologados.push(sku.sku_codigo);
    }

    return { homologados, recusados, confirmado_em: agora };
  });
