import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { auditoriaSanitizada } from "@/lib/escopo-conferencia";
import { montarConferencia } from "@/lib/escopo-conferencia.server";
import { ACAO_REVALIDAR, detalheAcaoRevalidar } from "@/lib/proposta-saneamento";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Confere o escopo do caso contra a proposta Canva aprovada e grava auditoria
 * sanitizada. Não cria contrato, anexo, cobrança, mensagem ou documento.
 */
export const conferirEscopoProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; proposalId?: string | null; approverId?: string | null }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const actorId = context.userId as string;
    const { resultado, dados } = await montarConferencia(supabase, {
      caseId: data.caseId,
      proposalId: data.proposalId ?? null,
    });

    await supabase.from("audit_logs").insert({
      organization_id: dados.caso.organization_id,
      user_id: actorId,
      acao: "escopo_proposta_conferido",
      entidade: "proposals",
      entidade_id: resultado.proposal_id ?? data.caseId,
      metadados: auditoriaSanitizada({
        caseId: data.caseId,
        resultado,
        actorId,
        approverId: data.approverId ?? null,
      }),
    });

    return resultado;
  });

/** Dados do painel de preparação contratual (somente leitura). */
export const painelPreparacaoContratual = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const { resultado, saneamento, dados } = await montarConferencia(supabase, { caseId: data.caseId });
    return {
      resultado,
      saneamento,
      proposta: dados.proposta
        ? {
            id: dados.proposta.id,
            versao: dados.proposta.versao,
            status: dados.proposta.status,
            aprovada_em: dados.proposta.aprovada_em ?? null,
            origem: dados.proposta.origem,
            origem_referencia: dados.proposta.origem_referencia,
            paginas_registradas: dados.proposta.paginas_registradas ?? [],
          }
        : null,
      produto: dados.produto,
      caseService: dados.caseService,
      preco: dados.preco,
      excecao: dados.excecao
        ? { id: dados.excecao.id, status: dados.excecao.status, preco_total: dados.excecao.preco_total, valido_ate: dados.excecao.valido_ate }
        : null,
      despesas: dados.despesas,
      membros: dados.membros,
      nucleo: dados.nucleo ? { id: dados.nucleo.id, nome: dados.nucleo.nome } : null,
    };
  });

/**
 * Registra a ação interna de revalidação da proposta quando a validade
 * comercial está vencida ou ausente. Não envia mensagem, não cria contrato,
 * OS, anexo, cobrança ou link, e não edita nada no Canva.
 */
export const registrarRevalidacaoProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const actorId = context.userId as string;
    const { saneamento, dados } = await montarConferencia(supabase, { caseId: data.caseId });

    if (!saneamento.validade.bloqueia) {
      throw new Error("Validade comercial vigente: nenhuma revalidação é necessária.");
    }

    const { data: existente } = await supabase
      .from("case_alerts")
      .select("id")
      .eq("case_id", data.caseId)
      .eq("tipo", ACAO_REVALIDAR.tipo)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (existente?.id) return { id: existente.id, criada: false };

    const detalhe = detalheAcaoRevalidar(saneamento.validade);
    const { data: criada, error } = await supabase
      .from("case_alerts")
      .insert({
        organization_id: dados.caso.organization_id,
        case_id: data.caseId,
        tipo: ACAO_REVALIDAR.tipo,
        criticidade: ACAO_REVALIDAR.criticidade,
        titulo: ACAO_REVALIDAR.titulo,
        detalhe,
        status: "pending",
        created_by: actorId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      organization_id: dados.caso.organization_id,
      user_id: actorId,
      acao: "proposta_revalidacao_solicitada",
      entidade: "proposals",
      entidade_id: dados.proposta?.id ?? data.caseId,
      metadados: {
        estado_validade: saneamento.validade.estado,
        validade: saneamento.validade.validade,
        decisoes_humanas: saneamento.validade.decisoes_humanas,
        alerta_id: criada.id,
      },
    });

    return { id: criada.id, criada: true };
  });
