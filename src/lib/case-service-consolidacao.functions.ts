import { semCache } from "@/lib/no-store";
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
import { onboardingLiberadoDoCaso } from "@/lib/onboarding-plano";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";
import {
  avaliarCondicao,
  avaliarCriterios,
  avaliarElegibilidadePreco,
  avaliarPlanoInicial,
  avaliarPromocaoCaseService,
  divergenciasDeValor,
  validarGravacaoPreco,
  type CondicaoComercial,
  type CriterioRegistro,
} from "@/lib/condicao-comercial";

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
    semCache();
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
          .select(
            "id,code,nome_comercial,status_homologacao,preco_comercial_vigente,condicao_comercial_padrao,homologado_por,homologado_em,vigencia_inicio,vigencia_fim,ativo",
          )
          .eq("id", servico.product_catalog_id)
          .maybeSingle()
      : { data: null };

    const { data: trilha } = servico?.citizenship_track_id
      ? await supabase
          .from("citizenship_tracks")
          .select("id,code,pais")
          .eq("id", servico.citizenship_track_id)
          .maybeSingle()
      : { data: null };

    const { data: proposta } = await supabase
      .from("proposals")
      .select("id,valor,escopo,extracao_status,status")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const conferencia = await montarConferencia(supabase, { caseId: data.caseId })
      .then((r) => r.resultado)
      .catch(() => null);

    const membros = await pessoasDoCasoComFallbackNucleo(supabase, data.caseId);

    const { data: dependentes } = await supabase
      .from("case_dependents")
      .select("nome_completo,status_representacao,participa_do_contrato,possui_acesso_app,anexo_individual_aplicavel")
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
        // 07/09/2026 — bug real corrigido: comparava com "confirmada", valor que nunca
        // existe no enum (pendente | documentada | nao_aplicavel), então TODO dependente
        // disparava bloqueio aqui, mesmo já documentado ou sem nenhuma participação em
        // contrato/App/anexo. Alinhado à regra canônica de src/lib/dependentes.ts
        // (bloqueiosDependentes): a existência do dependente nunca bloqueia sozinha, só
        // participação em contrato, App ou anexo individual sem representação documentada.
        representacaoPendente: (dependentes ?? []).some(
          (d: any) =>
            Boolean(d.participa_do_contrato || d.possui_acesso_app || d.anexo_individual_aplicavel) &&
            d.status_representacao !== "documentada",
        ),
      },
    });

    const itens = (criterios ?? []) as ItemCriterio[];

    // ANA-C-01 — elegibilidade do preço, condição estruturada, divergências e plano inicial.
    const { data: condicoes } = await supabase
      .from("commercial_conditions")
      .select("*")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    const condicao = (condicoes?.[0] ?? null) as CondicaoComercial | null;

    const elegibilidade = avaliarElegibilidadePreco(catalogo ?? null);
    const avaliacaoCondicao = avaliarCondicao(condicao, elegibilidade);
    const divergencias = divergenciasDeValor(
      [
        { origem: "proposta_canva", valor: proposta?.valor ?? null },
        { origem: "case_service", valor: servico?.preco_acordado ?? null },
        { origem: "condicao_comercial", valor: condicao?.valor_total_referencia ?? null },
      ],
      catalogo?.preco_comercial_vigente ?? null,
    );

    const criteriosAvaliados = avaliarCriterios(itens as unknown as CriterioRegistro[]);
    const promocao = avaliarPromocaoCaseService({
      criterios: itens as unknown as CriterioRegistro[],
      condicao: avaliacaoCondicao,
      referenciaContratualInterna:
        servico?.referencia_contratual_interna ?? servico?.contract_id ?? null,
      divergencias,
    });

    const { data: casoFicha } = await supabase
      .from("crm_casos")
      .select("responsavel_id,responsavel_principal,proxima_acao,prazo_proxima_acao")
      .eq("id", data.caseId)
      .maybeSingle();
    const { count: checklistItens } = await supabase
      .from("case_checklist_items")
      .select("id", { count: "exact", head: true })
      .eq("case_id", data.caseId)
      .is("archived_at", null);
    const { data: plano } = await supabase
      .from("onboarding_planos")
      .select("estado,inicio_previsto,primeira_microentrega_descricao,checklist_inicial")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();
    const { data: planoCasePlans } = await supabase
      .from("case_plans")
      .select("motivos_bloqueio")
      .eq("case_id", data.caseId)
      .eq("fase_jornada", "onboarding")
      .is("archived_at", null)
      .maybeSingle();

    const onboardingLiberado = onboardingLiberadoDoCaso({
      motivosBloqueioCasePlans: (planoCasePlans as any)?.motivos_bloqueio,
      estadoOnboardingPlanos: plano?.estado ?? null,
    });
    const planoInicial = avaliarPlanoInicial({
      responsavelUserId: casoFicha?.responsavel_id ?? servico?.responsavel_id ?? null,
      caseServiceStatusPermitido: promocao.statusPermitido,
      proximaAcao: {
        descricao: casoFicha?.proxima_acao ?? null,
        data: casoFicha?.prazo_proxima_acao ?? null,
      },
      checklistItens:
        (checklistItens ?? 0) ||
        (Array.isArray(plano?.checklist_inicial) ? plano!.checklist_inicial.length : 0),
      onboardingLiberado,
      primeiraEntrega: {
        titulo: plano?.primeira_microentrega_descricao ?? null,
        data: plano?.inicio_previsto ?? null,
      },
    });

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
      elegibilidade,
      condicao,
      avaliacaoCondicao,
      divergenciasValor: divergencias,
      criteriosAvaliados,
      promocao,
      planoInicial,
      onboardingLiberado,
    };
  });

/**
 * Registra ou atualiza a condição comercial estruturada (rascunho ou homologada).
 * Nunca cria cobrança, parcela financeira, link de pagamento ou contrato.
 */
export const salvarCondicaoComercial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      forma_pagamento?: string;
      parcelas?: number | null;
      valor_parcela?: number | null;
      valor_total_referencia?: number | null;
      vencimento_dia?: number | null;
      primeiro_vencimento?: string | null;
      condicao_aplicavel?: string | null;
      observacao_interna?: string | null;
      homologar?: boolean;
    }) => ({ ...data, caseId: exigirUuid(data?.caseId, "caseId") }),
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const c = await caso(supabase, data.caseId);

    const { data: servicos } = await supabase
      .from("case_services")
      .select("id,product_catalog_id")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .limit(1);
    const servico = servicos?.[0] ?? null;

    const { data: catalogo } = servico?.product_catalog_id
      ? await supabase
          .from("product_catalog")
          .select(
            "id,code,status_homologacao,preco_comercial_vigente,homologado_por,homologado_em,vigencia_inicio,vigencia_fim,ativo",
          )
          .eq("id", servico.product_catalog_id)
          .maybeSingle()
      : { data: null };

    const elegibilidade = avaliarElegibilidadePreco(catalogo ?? null);
    /*
     * 05/09/2026 — achado real: validarGravacaoPreco recusava QUALQUER
     * valor_total_referencia quando o caso não tinha SKU homologado
     * vinculado (elegibilidade.elegivel=false) — inclusive para salvar um
     * rascunho. Isso contradiz a regra definitiva da Proprietária: "Proposta
     * ausente permite condição comercial preliminar 'a confirmar'". A
     * validação estrita (preço deve espelhar o catálogo) só faz sentido no
     * momento de homologar; salvar como rascunho precisa ser sempre
     * permitido, com o valor livre registrado como preliminar.
     */
    if (data.homologar) {
      const gravacao = validarGravacaoPreco({
        campos: { valor_total_referencia: data.valor_total_referencia ?? null },
        precoCatalogo: catalogo?.preco_comercial_vigente ?? null,
        elegibilidade,
        parcelamento: {
          parcelas: data.parcelas ?? null,
          valor_parcela: data.valor_parcela ?? null,
        },
      });
      if (!gravacao.permitido) throw new Error(gravacao.erros.join(" "));
      // Autoridade operacional (05/09/2026): pendência informa, não impede.
      if (!elegibilidade.elegivel) {
        const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
        await assumirOuRecusarComUsuario(
          supabase as never,
          (context as any).userId as string,
          elegibilidade.motivos,
          `Condição não pode ser homologada: ${elegibilidade.motivos.join(" ")}`,
        );
      }
    }

    const { data: existente } = await supabase
      .from("commercial_conditions")
      .select("id,codigo")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const linha = {
      case_id: data.caseId,
      case_service_id: servico?.id ?? null,
      product_catalog_id: servico?.product_catalog_id ?? null,
      organization_id: c.organization_id,
      codigo: existente?.codigo ?? `COND-${String(c.codigo ?? "CASO")}-01`,
      forma_pagamento: data.forma_pagamento?.trim() || null,
      parcelas: data.parcelas ?? null,
      valor_parcela: data.valor_parcela ?? null,
      valor_total_referencia: data.valor_total_referencia ?? null,
      vencimento_dia: data.vencimento_dia ?? null,
      primeiro_vencimento: data.primeiro_vencimento || null,
      condicao_aplicavel: data.condicao_aplicavel?.trim() || null,
      observacao_interna: data.observacao_interna?.trim() || null,
      origem: "decisao_humana_interna",
      data_origin: "decisao_humana_interna",
      status: data.homologar ? "homologada" : "rascunho",
      // Decisão 5 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — quem homologou
      // é sempre resolvido da sessão real, nunca um nome enviado pelo
      // cliente (equivalente a um campo de autoria livre).
      homologado_por: data.homologar
        ? await (async () => {
            const { nomeResponsavelSessao } = await import("@/lib/cadeia-operacional.server");
            return nomeResponsavelSessao(supabase, c.organization_id as string, (context as any).userId as string);
          })()
        : null,
      homologado_em: data.homologar ? new Date().toISOString() : null,
      updated_by: (context as any).userId,
    };

    const query = existente
      ? supabase.from("commercial_conditions").update(linha).eq("id", existente.id).select("id")
      : supabase
          .from("commercial_conditions")
          .insert({ ...linha, created_by: (context as any).userId })
          .select("id");
    const { data: salvo, error } = await query;
    if (error) throw new Error(error.message);
    if (!salvo?.length)
      throw new Error("Nada foi gravado: seu papel não permite alterar a condição comercial.");
    return { id: salvo[0].id, status: linha.status };
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

    const { error } = await supabase.from("case_service_criterios").upsert(linhas, {
      onConflict: "case_id,entrega_codigo,criterio_codigo",
      ignoreDuplicates: true,
    });
    if (error) throw new Error(error.message);
    return { criados: linhas.length };
  });

/** Registra a decisão humana sobre um critério. Nunca aceita em lote automático. */
export const decidirCriterioAceite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      status: string;
      decididoPor?: string;
      observacao?: string;
      justificativa?: string;
      evidenciaInterna?: string;
    }) => ({
      id: exigirUuid(data?.id, "id"),
      status: String(data?.status ?? ""),
      decididoPor: data?.decididoPor?.trim() || "",
      observacao: data?.observacao ?? "",
      justificativa: data?.justificativa?.trim() || "",
      evidenciaInterna: data?.evidenciaInterna?.trim() || "",
    }),
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const permitidos = ["pendente_decisao_humana", "aceito", "recusado", "nao_aplicavel"];
    if (!permitidos.includes(data.status)) throw new Error("Status de critério inválido.");
    if ((data.status === "aceito" || data.status === "recusado") && !data.decididoPor)
      throw new Error(
        "Informe quem decidiu — critério não pode ser aceito ou recusado sem responsável humano.",
      );
    if (data.status !== "pendente_decisao_humana" && !data.justificativa)
      throw new Error(
        "Informe a justificativa da decisão — nenhum critério muda de estado sem justificativa registrada.",
      );

    const decidido = data.status === "aceito" || data.status === "recusado";
    const { data: linhas, error } = await supabase
      .from("case_service_criterios")
      .update({
        status: data.status,
        decidido_por: decidido ? data.decididoPor : null,
        decidido_em: decidido ? new Date().toISOString() : null,
        observacao_interna: data.observacao || null,
        justificativa: data.justificativa || null,
        evidencia_interna: data.evidenciaInterna || null,
        updated_by: (context as any).userId,
      })
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhas?.length)
      throw new Error("Nada foi gravado: seu papel não permite decidir este critério.");
    return { id: data.id, salvoEm: new Date().toISOString() };
  });
