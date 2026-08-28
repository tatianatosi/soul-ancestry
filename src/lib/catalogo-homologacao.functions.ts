import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DECISOES_INICIAIS } from "@/lib/catalogo-homologacao";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Leitura da camada de referência do catálogo.
 * Somente leitura: nenhuma cobrança, link, produto ou preço é criado ou alterado.
 */
export const painelCatalogoHomologacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data, error } = await supabase
      .from("product_catalog")
      .select(
        "code,nome_comercial,status_produto,status_homologacao,preco_comercial_vigente,condicao_comercial_padrao,versao_vigencia,data_ultima_validacao,responsavel_homologacao,link_asaas_validado,status_link_asaas,escopo_aprovado,observacao_de_governanca,elegivel_para_proposta",
      )
      .is("archived_at", null)
      .order("code");
    if (error) throw new Error(error.message);

    const vistos = new Set<string>();
    const itens = (data ?? [])
      .filter((r: any) => (vistos.has(r.code) ? false : (vistos.add(r.code), true)))
      .map((r: any) => {
        const decisao = DECISOES_INICIAIS[r.code as string];
        const status_homologacao = (decisao?.status_homologacao ?? r.status_homologacao ?? "em_revisao") as string;
        return {
          sku: r.code as string,
          nome_produto: (r.nome_comercial ?? r.code) as string,
          status_produto: (r.status_produto ?? "ativo") as string,
          status_homologacao,
          preco_comercial_vigente: (r.preco_comercial_vigente ?? decisao?.preco_referencia ?? null) as number | null,
          condicao_comercial_vigente: (r.condicao_comercial_padrao ?? null) as string | null,
          versao_vigencia: r.versao_vigencia as string | null,
          data_ultima_validacao: r.data_ultima_validacao as string | null,
          responsavel_homologacao: r.responsavel_homologacao as string | null,
          link_asaas_validado: r.link_asaas_validado as string | null,
          status_link_asaas: (r.status_link_asaas ?? "pendente") as string,
          escopo_aprovado: r.escopo_aprovado as string | null,
          observacao_de_governanca: (decisao?.observacao ?? r.observacao_de_governanca ?? null) as string | null,
          elegivel_para_proposta: !!r.elegivel_para_proposta && status_homologacao === "homologado",
        };
      });

    type Item = (typeof itens)[number];

    const ativosSemHomologacao = itens.filter(
      (i: Item) => i.status_produto === "ativo" && i.status_homologacao !== "homologado",
    );
    const linkPendente = itens.filter(
      (i: Item) => i.status_produto === "ativo" && (i.status_link_asaas === "pendente" || i.status_link_asaas === "desatualizado"),
    );
    const bloqueados = itens.filter((i: Item) => i.status_homologacao === "bloqueado");
    const emRevisao = itens.filter((i: Item) => i.status_homologacao === "em_revisao");
    const liberados = itens.filter((i: Item) => i.elegivel_para_proposta);

    // Casos travados por SKU não homologado (leitura, sem efeito colateral).
    const skusLiberados = new Set(liberados.map((i: Item) => i.sku));
    const { data: casos } = await supabase
      .from("casos")
      .select("id,case_id,case_nome,produto_sku,status")
      .limit(300);

    const casosBloqueados = (casos ?? [])
      .filter((c: any) => c.produto_sku && !skusLiberados.has(c.produto_sku))
      .map((c: any) => ({
        id: c.id as string,
        codigo: (c.case_id ?? "") as string,
        nome: (c.case_nome ?? "Caso") as string,
        sku: c.produto_sku as string,
        estagio: (c.status ?? "") as string,
      }));

    return {
      itens,
      filas: {
        ativosSemHomologacao,
        linkPendente,
        bloqueados,
        emRevisao,
        casosBloqueados,
      },
      resumo: {
        total: itens.length,
        liberados: liberados.length,
        emRevisao: emRevisao.length,
        bloqueados: bloqueados.length,
      },
    };
  });
