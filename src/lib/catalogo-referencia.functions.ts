/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Leitura da camada de referência de catálogo (somente leitura).
 *
 * Nenhum SKU, preço, condição, link Asaas, proposta, contrato, cobrança,
 * assinatura ou cliente Asaas é criado ou alterado aqui, e nenhuma integração
 * externa é chamada.
 */
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg } from "@/lib/pesquisa-modulo.server";
import {
  bloqueiosDeSelecao,
  filasDeReferencia,
  referenciaDeProduto,
  statusEfetivo,
  visivelNoSeletorDeOfertaNova,
  type ReferenciaSku,
} from "@/lib/catalogo-referencia";

const PAPEIS_CATALOGO = new Set(["admin", "operacoes", "comercial", "financeiro"]);

const COLUNAS =
  "id,code,nome_comercial,status_produto,status_homologacao,preco_comercial_vigente,preco_atual_fonte,preco_sugerido_fonte,condicao_comercial_vigente,condicao_comercial_padrao,versao_vigencia,versao_catalogo,data_ultima_validacao,responsavel_homologacao,homologado_por,link_asaas_validado,link_asaas_fonte,status_link_asaas,escopo_aprovado,escopo_aplicavel,observacao_de_governanca,moeda,dados_teste";

/** Catálogo de referência + filas de governança + seletor de oferta nova. */
export const lerReferenciaCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { incluirTeste?: boolean }) => ({ incluirTeste: d?.incluirTeste === true }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_CATALOGO.has(papel)) {
      throw new Error("Referência de catálogo restrita a perfis Desk/Governança autorizados.");
    }

    const { data: rows, error } = await supabase
      .from("product_catalog")
      .select(COLUNAS)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("code");
    if (error) throw new Error(error.message);

    const refs: ReferenciaSku[] = (rows ?? []).map((r: Record<string, unknown>) => referenciaDeProduto(r));
    const visiveis = refs.filter((r) => (data.incluirTeste ? true : !r.dados_teste));

    return {
      itens: visiveis.map((r) => ({
        ...r,
        status_efetivo: statusEfetivo(r),
        bloqueios: bloqueiosDeSelecao(r),
        selecionavel: bloqueiosDeSelecao(r).length === 0,
        no_seletor: visivelNoSeletorDeOfertaNova(r),
      })),
      filas: filasDeReferencia(refs, { incluirTeste: data.incluirTeste }),
      total: visiveis.length,
    };
  });

/**
 * Casos com condição comercial cujo SKU/preço/condição não estão homologados.
 * Devolve apenas a exceção operacional (sem preço, sem link, sem escopo) para o
 * Painel Hoje, que encaminha à Governança de Catálogo.
 */
export const casosBloqueadosPorCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { incluirTeste?: boolean }) => ({ incluirTeste: d?.incluirTeste === true }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_CATALOGO.has(papel)) return { itens: [] as { case_id: string; rotulo: string }[] };

    const [{ data: condicoes }, { data: produtos }] = await Promise.all([
      supabase
        .from("commercial_conditions")
        .select("id,case_id,product_catalog_id,status,dados_teste")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .limit(1000),
      supabase.from("product_catalog").select(COLUNAS).eq("organization_id", organizationId).is("archived_at", null),
    ]);

    const porId = new Map<string, ReferenciaSku>();
    for (const p of produtos ?? []) porId.set(String((p as any).id), referenciaDeProduto(p as any));

    const casos = new Map<string, string>();
    for (const c of (condicoes ?? []) as any[]) {
      if (!data.incluirTeste && c.dados_teste === true) continue;
      if (!c.case_id) continue;
      const ref = c.product_catalog_id ? porId.get(String(c.product_catalog_id)) : undefined;
      const motivo = !ref
        ? "Condição comercial sem SKU da fonte canônica"
        : (bloqueiosDeSelecao(ref)[0] ?? null);
      if (motivo) casos.set(String(c.case_id), motivo);
    }

    if (!casos.size) return { itens: [] as { case_id: string; rotulo: string }[] };
    const { data: crm } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo")
      .is("archived_at", null)
      .in("id", [...casos.keys()]);
    const nome = new Map((crm ?? []).map((c: any) => [String(c.id), `${c.codigo ?? "caso"} · ${c.titulo ?? "sem título"}`]));

    return {
      itens: [...casos.entries()].map(([case_id, motivo]) => ({
        case_id,
        rotulo: nome.get(case_id) ?? "caso",
        motivo,
      })),
    };
  });
