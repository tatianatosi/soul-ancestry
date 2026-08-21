import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Base comercial Top 30 + planejador nativo de casos.
 * Somente leitura: nenhum preço, link, cobrança ou comunicação é criado aqui.
 */
export const painelTop30Planejador = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;

    const [{ data: catalogo, error: e1 }, { data: planos }, { data: casos }, { data: entregas }] = await Promise.all([
      supabase
        .from("product_catalog")
        .select(
          "id,code,nome_comercial,familia_comercial,tipo_oferta,prioridade_catalogo,faixa_prioridade,papel_comercial,status_homologacao,elegivel_para_proposta,permite_recorrencia,preco_comercial_vigente,preco_historico_legado,condicao_comercial_padrao,observacao_de_governanca",
        )
        .is("archived_at", null)
        .order("code"),
      supabase
        .from("case_plans")
        .select(
          "id,case_id,fase_jornada,marco_atual,responsavel_user_id,proxima_acao,prazo_proxima_acao,proxima_microentrega,dias_sem_touchpoint,status_saude,status,case_service_id,product_catalog_id",
        )
        .is("archived_at", null)
        .limit(500),

      supabase.from("crm_casos").select("id,codigo,titulo,status,ultimo_touchpoint_em").limit(500),
      supabase
        .from("client_deliverables")
        .select("id,case_id,title_client,approval_status,journey_phase")
        .is("archived_at", null)
        .limit(300),
    ]);
    if (e1) throw new Error(e1.message);

    const vistos = new Set<string>();
    const itens = (catalogo ?? [])
      .filter((r: any) => (vistos.has(r.code) ? false : (vistos.add(r.code), true)))
      .map((r: any) => ({
        sku: r.code as string,
        nome: (r.nome_comercial ?? r.code) as string,
        familia: (r.familia_comercial ?? "—") as string,
        tipo: (r.tipo_oferta ?? "—") as string,
        faixa: (r.prioridade_catalogo ?? r.faixa_prioridade ?? "HISTORICO") as "TOP_10" | "TOP_30" | "HISTORICO",
        papel: (r.papel_comercial ?? "") as string,
        status_homologacao: (r.status_homologacao ?? "em_revisao") as string,
        elegivel: !!r.elegivel_para_proposta && r.status_homologacao === "homologado",
        recorrente: !!r.permite_recorrencia,
        preco_vigente: (r.preco_comercial_vigente ?? null) as number | null,
        preco_legado: (r.preco_historico_legado ?? null) as number | null,
        condicao: (r.condicao_comercial_padrao ?? null) as string | null,
      }));

    type Item = (typeof itens)[number];
    const top10 = itens.filter((i: Item) => i.faixa === "TOP_10");
    const top30 = itens.filter((i: Item) => i.faixa === "TOP_30");
    const historico = itens.filter((i: Item) => i.faixa === "HISTORICO");
    const emRevisaoTop = [...top10, ...top30].filter((i: Item) => i.status_homologacao !== "homologado");
    const homologados = [...top10, ...top30].filter((i: Item) => i.elegivel);

    const planosPorCaso = new Map<string, any>();
    for (const p of planos ?? []) if (p.case_id) planosPorCaso.set(p.case_id, p);

    const listaCasos = (casos ?? []).map((c: any) => {
      const plano = planosPorCaso.get(c.id);
      const dias = plano?.dias_sem_touchpoint ?? diasDesde(c.ultimo_touchpoint_em);
      return {
        id: c.id as string,
        codigo: (c.codigo ?? "") as string,
        titulo: (c.titulo ?? "Caso") as string,
        status: (c.status ?? "") as string,
        temPlano: !!plano,
        temProduto: !!(plano?.product_catalog_id ?? plano?.case_service_id),
        fase: (plano?.fase_jornada ?? null) as string | null,
        proximaMicroentrega: (plano?.proxima_microentrega ?? null) as string | null,
        responsavel: (plano?.responsavel_user_id ?? null) as string | null,
        proximaAcao: (plano?.proxima_acao ?? null) as string | null,
        prazoProximaAcao: (plano?.prazo_proxima_acao ?? null) as string | null,
        dias_sem_touchpoint: dias,

      };
    });

    type Caso = (typeof listaCasos)[number];
    const filas = {
      top30EmRevisao: emRevisaoTop,
      homologadosParaProposta: homologados,
      semProduto: listaCasos.filter((c: Caso) => c.temPlano && !c.temProduto),
      semPlano: listaCasos.filter((c: Caso) => !c.temPlano),
      semMicroentrega: listaCasos.filter((c: Caso) => c.temPlano && !c.proximaMicroentrega),
      atencao10: listaCasos.filter((c: Caso) => c.dias_sem_touchpoint >= 10 && c.dias_sem_touchpoint < 14),
      critico14: listaCasos.filter((c: Caso) => c.dias_sem_touchpoint >= 14),
      entregasPendentes: (entregas ?? [])
        .filter((d: any) => (d.approval_status ?? "rascunho") !== "aprovado" && d.approval_status !== "publicado")
        .map((d: any) => ({
          id: d.id as string,
          titulo: (d.title_client ?? "Entrega") as string,
          fase: (d.journey_phase ?? "") as string,
          status: (d.approval_status ?? "rascunho") as string,
        })),
    };

    const fases = agrupar(listaCasos.filter((c: Caso) => c.fase).map((c: Caso) => c.fase as string));

    const porResponsavel = new Map<string, { responsavel: string; casos: number; pendencias: number }>();
    for (const c of listaCasos as Caso[]) {
      const chave = c.responsavel ?? "sem-responsavel";
      const atual = porResponsavel.get(chave) ?? { responsavel: chave, casos: 0, pendencias: 0 };
      atual.casos += 1;
      if (!c.temProduto || !c.temPlano || !c.proximaMicroentrega || c.dias_sem_touchpoint >= 10) atual.pendencias += 1;
      porResponsavel.set(chave, atual);
    }
    const pendenciasPorResponsavel = [...porResponsavel.values()].sort((a, b) => b.pendencias - a.pendencias);

    return {
      resumo: {
        top10: top10.length,
        top30: top30.length,
        historico: historico.length,
        emRevisao: emRevisaoTop.length,
        homologados: homologados.length,
      },
      top10,
      top30,
      filas,
      fases,
      pendenciasPorResponsavel,
    };

  });

function diasDesde(iso: string | null): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function agrupar(valores: string[]): { fase: string; total: number }[] {
  const mapa = new Map<string, number>();
  for (const v of valores) mapa.set(v, (mapa.get(v) ?? 0) + 1);
  return [...mapa.entries()].map(([fase, total]) => ({ fase, total })).sort((a, b) => b.total - a.total);
}
