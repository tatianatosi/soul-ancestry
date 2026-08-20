import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  condicaoReferenciaInterna,
  consolidarCaseService,
  resumoCriterios,
  semearCriterios,
  type ItemCriterio,
} from "@/lib/case-service-consolidacao";
import { montarConferencia } from "@/lib/escopo-conferencia.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;
const exigirUuid = (v: unknown, campo: string) => {
  if (!UUID.test(String(v ?? ""))) throw new Error(`${campo} inválido.`);
  return String(v);
};

async function caso(supabase: any, caseId: string) {
  const { data } = await supabase
    .from("crm_casos")
    .select("id,codigo,titulo,organization_id")
    .eq("id", caseId)
    .maybeSingle();
  if (!data) throw new Error("Caso não encontrado.");
  return data;
}

/** Consolidação de leitura: case service + catálogo + escopo + núcleo + critérios. */
export const carregarConsolidacaoCaseService = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => ({ caseId: exigirUuid(data?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const c = await caso(supabase, data.caseId);

    const { data: servicos } = await supabase
      .from("case_services")
      .select("*")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at");
    const servico = servicos?.[0] ?? null;

    const { data: catalogo } = servico?.product_catalog_id
      ? await supabase
          .from("product_catalog")
          .select("id,code,nome_comercial,status_homologacao,preco_comercial_vigente,condicao_comercial_padrao")
          .eq("id", servico.product_catalog_id)
          .maybeSingle()
      : { data: null };

    const { data: trilha } = servico?.citizenship_track_id
      ? await supabase.from("citizenship_tracks").select("id,code,pais").eq("id", servico.citizenship_track_id).maybeSingle()
      : { data: null };

    const { data: proposta } = await supabase
      .from("proposals")
      .select("id,valor,escopo,extracao_status,status")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const conferencia = await montarConferencia(supabase, { caseId: data.caseId }).then((r) => r.resultado).catch(() => null);

    const { data: membros } = await supabase
      .from("case_members")
      .select("nome,papel_no_caso,dependente")
      .eq("case_id", data.caseId)
      .is("archived_at", null);

    const { data: dependentes } = await supabase
      .from("case_dependents")
      .select("nome_completo,status_representacao")
      .eq("case_id", data.caseId)
      .is("archived_at", null);

    const { data: criterios } = await supabase
      .from("case_service_criterios")
      .select("*")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("entrega_codigo")
      .order("ordem");

    const consolidado = consolidarCaseService({
      servico,
      catalogo: catalogo ?? null,
      propostaValor: proposta?.valor ?? null,
      escopoConferido: conferencia
        ? {
            status: conferencia.status,
            camposAusentes: conferencia.campos_ausentes.length,
            conflitos: conferencia.conflitos.length,
          }
        : null,
      planejadorValor: null,
      nucleo: {
        titulares: (membros ?? []).filter((m: any) => !m.dependente).map((m: any) => m.nome),
        dependentes: (dependentes ?? []).map((d: any) => d.nome_completo),
        representacaoPendente: (dependentes ?? []).some((d: any) => d.status_representacao !== "confirmada"),
      },
    });

    const itens = (criterios ?? []) as ItemCriterio[];
    return {
      caso: c,
      servico,
      catalogo: catalogo ?? null,
      trilha: trilha ?? null,
      proposta: proposta ?? null,
      conferencia,
      consolidado,
      condicaoSugerida: condicaoReferenciaInterna(consolidado.precoReferenciaInterna),
      criterios: itens,
      resumoCriterios: resumoCriterios(itens),
    };
  });

/** Cria os critérios de aceite por entrega, todos pendentes de decisão humana. */
export const semearCriteriosAceite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => ({ caseId: exigirUuid(data?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const c = await caso(supabase, data.caseId);

    const { data: servicos } = await supabase
      .from("case_services")
      .select("id")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .limit(1);

    const linhas = semearCriterios().map((i, idx) => ({
      ...i,
      ordem: idx,
      case_id: data.caseId,
      case_service_id: servicos?.[0]?.id ?? null,
      organization_id: c.organization_id,
      created_by: (context as any).userId,
      updated_by: (context as any).userId,
    }));

    const { error } = await supabase
      .from("case_service_criterios")
      .upsert(linhas, { onConflict: "case_id,entrega_codigo,criterio_codigo", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { criados: linhas.length };
  });

/** Registra a decisão humana sobre um critério. Nunca aceita em lote automático. */
export const decidirCriterioAceite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { id: string; status: string; decididoPor?: string; observacao?: string }) => ({
      id: exigirUuid(data?.id, "id"),
      status: String(data?.status ?? ""),
      decididoPor: data?.decididoPor?.trim() || "",
      observacao: data?.observacao ?? "",
    }),
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const permitidos = ["pendente_decisao_humana", "aceito", "recusado", "nao_aplicavel"];
    if (!permitidos.includes(data.status)) throw new Error("Status de critério inválido.");
    if ((data.status === "aceito" || data.status === "recusado") && !data.decididoPor)
      throw new Error("Informe quem decidiu — critério não pode ser aceito ou recusado sem responsável humano.");

    const decidido = data.status === "aceito" || data.status === "recusado";
    const { data: linhas, error } = await supabase
      .from("case_service_criterios")
      .update({
        status: data.status,
        decidido_por: decidido ? data.decididoPor : null,
        decidido_em: decidido ? new Date().toISOString() : null,
        observacao_interna: data.observacao || null,
        updated_by: (context as any).userId,
      })
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhas?.length) throw new Error("Nada foi gravado: seu papel não permite decidir este critério.");
    return { id: data.id, salvoEm: new Date().toISOString() };
  });
