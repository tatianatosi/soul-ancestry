import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { auditoriaSanitizada } from "@/lib/escopo-conferencia";
import { montarConferencia } from "@/lib/escopo-conferencia.server";

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
    const { resultado, dados } = await montarConferencia(supabase, { caseId: data.caseId });
    return {
      resultado,
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
