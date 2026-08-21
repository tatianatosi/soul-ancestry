import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Leitura da camada de referência do catálogo.
 * Somente leitura: nenhuma cobrança, link, produto ou preço é criado ou alterado.
 */
export const painelCatalogoHomologacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
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
      .map((r: any) => ({
        sku: r.code as string,
        nome_produto: (r.nome_comercial ?? r.code) as string,
        status_produto: (r.status_produto ?? "ativo") as string,
        status_homologacao: (r.status_homologacao ?? "em_revisao") as string,
        preco_comercial_vigente: r.preco_comercial_vigente as number | null,
        condicao_comercial_vigente: (r.condicao_comercial_padrao ?? null) as string | null,
        versao_vigencia: r.versao_vigencia as string | null,
        data_ultima_validacao: r.data_ultima_validacao as string | null,
        responsavel_homologacao: r.responsavel_homologacao as string | null,
        link_asaas_validado: r.link_asaas_validado as string | null,
        status_link_asaas: (r.status_link_asaas ?? "pendente") as string,
        escopo_aprovado: r.escopo_aprovado as string | null,
        observacao_de_governanca: r.observacao_de_governanca as string | null,
        elegivel_para_proposta: !!r.elegivel_para_proposta,
      }));

    const ativosSemHomologacao = itens.filter(
      (i) => i.status_produto === "ativo" && i.status_homologacao !== "homologado",
    );
    const linkPendente = itens.filter(
      (i) => i.status_produto === "ativo" && (i.status_link_asaas === "pendente" || i.status_link_asaas === "desatualizado"),
    );
    const bloqueados = itens.filter((i) => i.status_homologacao === "bloqueado");
    const emRevisao = itens.filter((i) => i.status_homologacao === "em_revisao");
    const liberados = itens.filter((i) => i.elegivel_para_proposta);

    // Casos/propostas travados por SKU não homologado (leitura, sem efeito colateral).
    const skusLiberados = new Set(liberados.map((i) => i.sku));
    const { data: casos } = await supabase
      .from("crm_casos")
      .select("id,codigo,nome,sku_recomendado,estagio")
      .is("archived_at", null)
      .limit(300);

    const casosBloqueados = (casos ?? [])
      .filter((c: any) => c.sku_recomendado && !skusLiberados.has(c.sku_recomendado))
      .map((c: any) => ({
        id: c.id as string,
        codigo: (c.codigo ?? "") as string,
        nome: (c.nome ?? "Caso") as string,
        sku: c.sku_recomendado as string,
        estagio: (c.estagio ?? "") as string,
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
