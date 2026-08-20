import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { avaliarPreparacaoInstrumentos, type EntradaPreparacao } from "@/lib/instrumentos-preparacao";
import { TEMAS_JURIDICOS, canonicalizarTemaCodigo } from "@/lib/matriz-juridica";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * ANA-D-01 — leitura agregada da preparação interna de instrumentos.
 * Somente leitura, sob RLS. Não gera contrato, OS, anexo, cláusula, assinatura,
 * cobrança, link, pasta, documento externo, mensagem ou publicação.
 */
export const lerPreparacaoInstrumentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => {
    if (!UUID.test(String(d?.caseId ?? ""))) throw new Error("caseId inválido.");
    return { caseId: String(d.caseId) };
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const caseId = data.caseId;

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id, organization_id, case_id_canonico")
      .eq("id", caseId)
      .maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    const [propRes, checkRes, depRes, servRes, condRes, critRes, matrizRes, despRes, nucleoRes] = await Promise.all([
      supabase
        .from("proposals")
        .select("id, status, validade, paginas_registradas, extracao_status, substituida_por_id")
        .eq("case_id", caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase.from("checklist_cadastral").select("status, obrigatorio, pessoa_nome, pessoa_ref_id").eq("case_id", caseId).is("archived_at", null),
      supabase
        .from("case_dependents")
        .select("nome_completo, participa_do_contrato, status_representacao, anexo_individual_aplicavel")
        .eq("case_id", caseId)
        .is("archived_at", null),
      supabase
        .from("case_services")
        .select("id, status, escopo_aprovado, preco_acordado, product_catalog_id, condicao_comercial_aprovada")
        .eq("case_id", caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("commercial_conditions")
        .select("status, homologado_por, homologado_em, forma_pagamento, parcelas, valor_parcela, valor_total_referencia, vencimento_dia, primeiro_vencimento, condicao_aplicavel")
        .eq("case_id", caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase.from("case_service_criterios").select("criterio_codigo, status, obrigatorio").eq("case_id", caseId).is("archived_at", null),
      supabase.from("legal_clause_matrix").select("*").eq("organization_id", caso.organization_id).is("archived_at", null),
      supabase.from("third_party_expenses").select("descricao, estado").eq("case_id", caseId).is("archived_at", null),
      supabase.rpc("nucleo_completude", { _case: caseId }),
    ]);

    const proposta = ((propRes.data ?? []) as any[])[0] ?? null;
    const paginas = ((proposta?.paginas_registradas ?? []) as any[]).length;
    const { data: paginasRows } = await supabase
      .from("proposal_canva_pages")
      .select("page_number, extracao_status, campos_nao_localizados")
      .eq("case_id", caseId)
      .is("archived_at", null);
    const extraidas = ((paginasRows ?? []) as any[]).filter((p) => p.extracao_status === "extraida").length;
    const camposNaoLocalizados = [
      ...new Set(((paginasRows ?? []) as any[]).flatMap((p) => (p.campos_nao_localizados ?? []) as string[])),
    ];

    const hoje = new Date();
    const validade_estado: EntradaPreparacao["proposta"]["validade_estado"] = !proposta
      ? "sem_proposta"
      : proposta.substituida_por_id
        ? "substituida"
        : !proposta.validade
          ? "sem_validade_registrada"
          : new Date(proposta.validade) < hoje
            ? "vencida"
            : "vigente";

    const checklist = (checkRes.data ?? []) as any[];
    const obrigatorios = checklist.filter((c) => c.obrigatorio !== false);
    const nucleo = (nucleoRes as any)?.data ?? null;
    const nucleoPendentes = Array.isArray(nucleo?.pendencias)
      ? (nucleo.pendencias as any[]).map((p) => String(p?.rotulo ?? p?.criterio ?? p))
      : Array.isArray(nucleo)
        ? (nucleo as any[]).filter((c) => !c.ok).map((c) => String(c.rotulo ?? c.criterio))
        : [];

    const servico = ((servRes.data ?? []) as any[])[0] ?? null;
    let precoHomologado = false;
    if (servico?.product_catalog_id) {
      const { data: prod } = await supabase
        .from("product_catalog")
        .select("preco_comercial_vigente, status_homologacao, homologado_por, homologado_em, vigencia_inicio, vigencia_fim")
        .eq("id", servico.product_catalog_id)
        .maybeSingle();
      const vigente =
        prod &&
        prod.status_homologacao === "homologado" &&
        prod.homologado_por &&
        prod.homologado_em &&
        (!prod.vigencia_inicio || new Date(prod.vigencia_inicio) <= hoje) &&
        (!prod.vigencia_fim || new Date(prod.vigencia_fim) >= hoje);
      precoHomologado = Boolean(
        vigente && (servico.preco_acordado == null || Number(servico.preco_acordado) === Number(prod!.preco_comercial_vigente)),
      );
    }
    if (!precoHomologado && servico) {
      const { data: excecao } = await supabase
        .from("sku_price_exceptions")
        .select("status, aprovado_por, valido_ate, preco_total")
        .eq("case_id", caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1);
      const ex = ((excecao ?? []) as any[])[0];
      precoHomologado = Boolean(ex && ex.status === "aprovada" && ex.aprovado_por && (!ex.valido_ate || new Date(ex.valido_ate) >= hoje));
    }

    const cond = ((condRes.data ?? []) as any[])[0] ?? null;
    const camposCondicao = ["forma_pagamento", "parcelas", "valor_total_referencia", "condicao_aplicavel"] as const;
    const condFaltantes = cond ? camposCondicao.filter((c) => cond[c] === null || cond[c] === undefined || cond[c] === "") : [...camposCondicao];

    const matrizRows = (matrizRes.data ?? []) as any[];
    const matriz = TEMAS_JURIDICOS.map((t) => {
      const l = matrizRows.find((r) => canonicalizarTemaCodigo(r.tema_codigo) === t.tema_codigo);
      return {
        tema_codigo: t.tema_codigo,
        tema: t.tema,
        status: l?.status ?? "pendente_revisao_juridica",
        bloqueia_assinatura: l?.bloqueia_assinatura ?? t.bloqueia_assinatura,
        versao_juridica_aplicavel: l?.versao_juridica_aplicavel ?? null,
      };
    });

    const conflitos: EntradaPreparacao["conflitos"] = [];
    if (cond && servico && cond.valor_total_referencia != null && servico.preco_acordado != null) {
      if (Number(cond.valor_total_referencia) !== Number(servico.preco_acordado)) {
        conflitos.push({ origem: "condicao_comercial x case_service", detalhe: "Valor de referência divergente — requer decisão humana." });
      }
    }

    const entrada: EntradaPreparacao = {
      proposta: {
        existe: Boolean(proposta),
        validade_estado,
        paginas_extraidas: extraidas || paginas,
        campos_nao_localizados: camposNaoLocalizados,
      },
      cadastro: {
        itens_obrigatorios: obrigatorios.length,
        itens_completos: obrigatorios.filter((c) => String(c.status ?? "") === "completo").length,
        pessoas_sem_referencia: [...new Set(checklist.filter((c) => !c.pessoa_ref_id).map((c) => String(c.pessoa_nome ?? "—")))],
        nucleo_criterios_pendentes: nucleoPendentes,
      },
      dependentes: ((depRes.data ?? []) as any[]).map((d) => ({
        nome: String(d.nome_completo ?? "—"),
        participa_do_contrato: Boolean(d.participa_do_contrato),
        status_representacao: d.status_representacao ?? null,
        anexo_individual_aplicavel: Boolean(d.anexo_individual_aplicavel),
      })),
      caseService: {
        existe: Boolean(servico),
        status: servico?.status ?? null,
        escopo_aprovado: Boolean(servico?.escopo_aprovado),
        preco_fonte_homologada: precoHomologado,
      },
      condicao: {
        existe: Boolean(cond),
        status: cond?.status ?? null,
        homologado_por: cond?.homologado_por ?? null,
        homologado_em: cond?.homologado_em ?? null,
        campos_faltantes: condFaltantes as string[],
      },
      criterios: ((critRes.data ?? []) as any[]).map((c) => ({
        criterio_codigo: String(c.criterio_codigo),
        status: c.status ?? null,
        obrigatorio: c.obrigatorio !== false,
      })),
      matriz,
      despesas: ((despRes.data ?? []) as any[]).map((d) => ({
        descricao: String(d.descricao ?? "—"),
        estado: d.estado ?? null,
        aplicavel: true,
      })),
      conflitos,
    };

    const resultado = avaliarPreparacaoInstrumentos(entrada);

    // Auditoria sanitizada: só contadores e códigos, sem dados pessoais ou valores.
    await supabase.from("audit_logs").insert({
      organization_id: caso.organization_id,
      user_id: userId,
      acao: "consulta_preparacao_instrumentos",
      entidade: "crm_casos",
      entidade_id: caseId,
      metadados: {
        status: resultado.status,
        codigos_bloqueio: resultado.codigos_bloqueio,
        requisitos_pendentes: resultado.requisitos.filter((r) => r.estado === "pendente").map((r) => r.codigo),
        conflitos: resultado.conflitos.length,
        somente_leitura: true,
      },
    });

    return { caso: { id: caso.id, codigo: caso.case_id_canonico ?? null }, entrada, resultado };
  });
