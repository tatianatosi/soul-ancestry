/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Leitor e escritor da condição comercial versionada do caso (04/10/2026).
 *
 * A proposta e o contrato passam a ler DAQUI. Nunca de Planilha Mestre,
 * PARAMETROS, SKUS_REFERENCIA ou `product_catalog` — regra do Prompt Canônico
 * v2.1, escrita desde 04/09 e nunca ligada.
 *
 * Versão aprovada é snapshot: alterar cria versão nova. Nada aqui envia,
 * assina, cobra ou cria link.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { inserirComVerificacao, exigirLinhaGravada } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import {
  condicaoVigente,
  conferirCondicao,
  instanciasDeCobertura,
  lacunasDeCobertura,
  type CondicaoComercialCaso,
} from "@/lib/condicao-comercial-caso";
import { ANEXOS_CANONICOS, DE_PARA_ANEXOS_DUPLICADOS } from "@/lib/anexos-de-para-duplicidade";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

const COLUNAS =
  "id,case_id,proposal_id,proposal_reference,versao,approved_items,fees,third_party_costs,official_fees," +
  "payment_terms,responsaveis_financeiros,parcelas,valor_parcela,moeda,validity,approval_status,origem,observacao_interna";

function paraCondicao(r: any): CondicaoComercialCaso {
  const itens = Array.isArray(r.approved_items) ? r.approved_items : [];
  const resp = Array.isArray(r.responsaveis_financeiros) ? r.responsaveis_financeiros : [];
  return {
    id: String(r.id),
    caseId: String(r.case_id),
    propostaId: (r.proposal_id as string | null) ?? null,
    propostaReferencia: (r.proposal_reference as string | null) ?? null,
    versao: Number(r.versao ?? 1),
    itens: itens.map((i: any) => ({
      parte: String(i.parte ?? ""),
      valor: Number(i.valor ?? 0),
      escopo: String(i.escopo ?? ""),
    })),
    total: r.fees === null || r.fees === undefined ? null : Number(r.fees),
    despesasTerceiros: (r.third_party_costs as string | null) ?? null,
    taxasOficiais: (r.official_fees as string | null) ?? null,
    formaPagamento: (r.payment_terms as string | null) ?? null,
    responsaveisFinanceiros: resp.map((x: any) => String(x)),
    parcelas: r.parcelas === null || r.parcelas === undefined ? null : Number(r.parcelas),
    valorParcela: r.valor_parcela === null || r.valor_parcela === undefined ? null : Number(r.valor_parcela),
    moeda: String(r.moeda ?? "BRL"),
    validade: (r.validity as string | null) ?? null,
    estado: String(r.approval_status ?? "rascunho"),
    origem: String(r.origem ?? ""),
  };
}

/**
 * Condição vigente do caso + conferência aritmética + os anexos que a
 * composição exige, com as lacunas nomeadas.
 */
export const condicaoComercialDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso é obrigatório.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const [{ data: linhas, error }, { data: dependentes }, { data: contratos }] = await Promise.all([
      supabase
        .from("case_commercial_condition")
        .select(COLUNAS)
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("versao", { ascending: false }),
      supabase
        .from("case_dependents")
        // `titular_responsavel_legal_nome` é a coluna real; `anexo_individual_aplicavel`
        // já existia e diz se o dependente teria anexo próprio.
        .select("nome_completo,titular_responsavel_legal_nome,anexo_individual_aplicavel")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId),
      supabase
        .from("contracts")
        .select("id,status,signed_at")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
    ]);
    if (error) throw new Error(error.message);

    const condicoes = ((linhas ?? []) as any[]).map(paraCondicao);
    const vigente = condicaoVigente(condicoes);

    // Anexos já registrados no contrato mais recente do caso.
    const contratoId = ((contratos ?? []) as any[])[0]?.id as string | undefined;
    let anexosRegistrados: string[] = [];
    if (contratoId) {
      const { data: anexos } = await supabase
        .from("contract_annexes")
        .select("annex_code,status")
        .eq("organization_id", organizationId)
        .eq("contract_id", contratoId);
      anexosRegistrados = ((anexos ?? []) as any[]).map((a) => String(a.annex_code ?? ""));
    }

    const deps = ((dependentes ?? []) as any[]).map((d) => ({
      nome: String(d.nome_completo ?? ""),
      representadoPor: (d.titular_responsavel_legal_nome as string | null) ?? null,
    }));

    const instancias = vigente ? instanciasDeCobertura(vigente, deps) : [];
    return {
      condicoes,
      vigente,
      conferencia: vigente ? conferirCondicao(vigente) : null,
      /** Família canônica: Anexo I a V, e só ela (decisão de 04/10/2026). */
      anexosCanonicos: ANEXOS_CANONICOS.map((a) => ({ ...a })),
      /** O que foi retirado por duplicidade, com o que já cobre cada um. */
      duplicidadesRetiradas: DE_PARA_ANEXOS_DUPLICADOS.map((l) => ({
        codigo: l.codigo,
        titulo: l.titulo,
        veredicto: l.veredicto,
        clausulas: l.clausulasQueCobrem,
        anexos: l.anexosQueCobrem,
        fonteNaProposta: l.fonteNaProposta,
      })),
      instancias,
      anexosRegistrados,
      lacunasDeCobertura: vigente ? lacunasDeCobertura(anexosRegistrados, instancias) : [],
      contratoId: contratoId ?? null,
    };
  });

/**
 * Nova versão da condição. Nunca reescreve a anterior: a vigente continua vigente
 * e a nova nasce em `rascunho`; só a aprovação da nova substitui a anterior.
 */
export const registrarVersaoCondicaoComercial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      motivo: string;
      itens: { parte: string; valor: number; escopo: string }[];
      total: number;
      formaPagamento?: string;
      parcelas?: number;
      valorParcela?: number;
      responsaveis?: string[];
      validade?: string | null;
    }) => {
      if (!data?.caseId) throw new Error("Caso é obrigatório.");
      if (!String(data?.motivo ?? "").trim()) throw new Error("Informe o motivo da nova versão.");
      if (!(Number(data?.total) > 0)) throw new Error("O total da condição precisa ser maior que zero.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const organizationId = await organizacaoDo(supabase, userId);

    const { data: atuais } = await supabase
      .from("case_commercial_condition")
      .select("id,versao,approval_status")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("versao", { ascending: false });

    const proximaVersao = (((atuais ?? []) as any[])[0]?.versao ?? 0) + 1;

    const criada = await inserirComVerificacao({
      supabase,
      tabela: "case_commercial_condition",
      organizationId,
      userId,
      payload: {
        case_id: data.caseId,
        versao: proximaVersao,
        approved_items: data.itens,
        fees: data.total,
        payment_terms: data.formaPagamento ?? null,
        parcelas: data.parcelas ?? null,
        valor_parcela: data.valorParcela ?? null,
        responsaveis_financeiros: data.responsaveis ?? [],
        validity: data.validade ?? null,
        approval_status: "rascunho",
        origem: "condicao_particular",
        observacao_interna: data.motivo,
      },
    });

    // A versão aprovada continua vigente até a nova ser aprovada (`aprovarVersaoCondicaoComercial`).
    // Antes ela virava `substituida` já na criação do rascunho e o caso ficava sem condição vigente.

    await registrarAuditoria(supabase, {
      organization_id: organizationId,
      entidade: "case_commercial_condition",
      entidade_id: (criada as any)?.id ?? null,
      acao: "condicao_comercial_versao_criada",
      user_id: userId,
      valores_posteriores: { versao: proximaVersao, total: data.total },
      metadados: { case_id: data.caseId, motivo: data.motivo },
    });

    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: `Condição comercial versão ${proximaVersao} registrada`,
      summaryInternal: data.motivo,
      sourceEntityType: "case_commercial_condition",
      sourceEntityId: String((criada as any)?.id ?? ""),
      userId,
    });

    return { id: (criada as any)?.id ?? null, versao: proximaVersao };
  });

/**
 * Aprova uma versão em rascunho ou em revisão e só então marca a(s) aprovada(s) anterior(es) do mesmo caso
 * como `substituida`. O banco só deixa admin ativo aprovar (fn_admin_approval_boundary).
 */
export const aprovarVersaoCondicaoComercial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; versaoId: string }) => {
    if (!data?.caseId) throw new Error("Caso é obrigatório.");
    if (!data?.versaoId) throw new Error("Versão é obrigatória.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const organizationId = await organizacaoDo(supabase, userId);

    const { data: alvo, error: erroAlvo } = await supabase
      .from("case_commercial_condition")
      .select("id,versao,approval_status")
      .eq("id", data.versaoId)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();
    if (erroAlvo) throw new Error(erroAlvo.message);
    if (!alvo) throw new Error("Versão da condição não encontrada neste caso.");
    if (!["rascunho", "em_revisao"].includes(String(alvo.approval_status))) {
      throw new Error("Só uma versão em rascunho ou em revisão pode ser aprovada.");
    }

    const agora = new Date().toISOString();
    // A anterior só sai de vigência depois que a nova foi gravada como aprovada.
    exigirLinhaGravada(
      await supabase
        .from("case_commercial_condition")
        .update({ approval_status: "aprovada", aprovado_por: userId, aprovado_em: agora, updated_by: userId, updated_at: agora })
        .eq("id", data.versaoId)
        .eq("organization_id", organizationId)
        .select("id"),
      "case_commercial_condition",
    );

    const { data: anteriores, error: erroAnt } = await supabase
      .from("case_commercial_condition")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .eq("approval_status", "aprovada")
      .neq("id", data.versaoId)
      .is("archived_at", null);
    if (erroAnt) throw new Error(erroAnt.message);
    for (const a of (anteriores ?? []) as any[]) {
      exigirLinhaGravada(
        await supabase
          .from("case_commercial_condition")
          .update({ approval_status: "substituida", updated_by: userId, updated_at: agora })
          .eq("id", a.id)
          .eq("organization_id", organizationId)
          .select("id"),
        "case_commercial_condition",
      );
    }

    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: `Condição comercial versão ${alvo.versao} aprovada`,
      summaryInternal: "Aprovada por admin; a versão anterior passou a substituída.",
      sourceEntityType: "case_commercial_condition",
      sourceEntityId: data.versaoId,
      userId,
    });

    return { id: data.versaoId, versao: Number(alvo.versao) };
  });
