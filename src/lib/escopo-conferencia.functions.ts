import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoInterno } from "@/lib/comercial.server";
import { auditoriaSanitizada } from "@/lib/escopo-conferencia";
import { montarConferencia } from "@/lib/escopo-conferencia.server";
import { CAMPOS_ESCOPO_PROPOSTA } from "@/lib/escopo-proposta";
import { ACOES_GATEADAS_INTERNAS, type AcaoGateada } from "@/lib/gates-formalizacao";
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
    semCache();
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

/**
 * 06/09/2026 — achado real: não existia NENHUM caminho de escrita para
 * `proposals.escopo_paginas` em todo o repositório — só leitura. A proprietária
 * tinha que "readequar" o mesmo anexo repetidamente porque a extração das
 * páginas 3-7 do Canva nunca tinha uma tela para acontecer, só a das páginas
 * 1-2 (gravada direto no banco, alguma vez). Este é o formulário que faltava:
 * registra o texto exato de um campo da proposta aprovada, citando a página —
 * transcrição humana do documento real, nunca inferência (a regra de
 * escopo-proposta.ts de nunca substituir por Planejador/CRM continua intacta).
 */
export const registrarCampoEscopoProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; campo: string; texto: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const actorId = context.userId as string;

    const definicao = CAMPOS_ESCOPO_PROPOSTA.find((c) => c.campo === data.campo);
    if (!definicao) throw new Error(`"${data.campo}" não é um campo de escopo da proposta reconhecido.`);
    const texto = data.texto.trim();
    if (texto.length < 3) throw new Error("Escreva o texto exato da proposta para este campo antes de registrar.");

    const { dados } = await montarConferencia(supabase, { caseId: data.caseId });
    if (!dados.proposta?.id) throw new Error("Nenhuma proposta vinculada a este caso para registrar escopo.");

    const escopoAtual = ((dados.proposta as any).escopo_paginas ?? {}) as Record<string, unknown>;
    const paginasAtuais = new Set<number>(((dados.proposta as any).paginas_registradas ?? []) as number[]);
    for (const p of definicao.paginas) paginasAtuais.add(p);

    const { error } = await supabase
      .from("proposals")
      .update({
        escopo_paginas: { ...escopoAtual, [data.campo]: texto },
        paginas_registradas: Array.from(paginasAtuais).sort((a, b) => a - b),
      })
      .eq("id", dados.proposta.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      organization_id: dados.caso.organization_id,
      user_id: actorId,
      acao: "escopo_proposta_campo_registrado",
      entidade: "proposals",
      entidade_id: dados.proposta.id,
      metadados: { campo: data.campo, paginas: definicao.paginas, tamanho_texto: texto.length },
    });

    return { registrado: true, campo: data.campo };
  });

/**
 * 04/09/2026 — a Proprietária pediu execução do pedido histórico de remoção
 * de barreiras operacionais (docs/politicas/PROMPT-REMOCAO-TOTAL-BARREIRAS-OPERACIONAIS-REJEITADO.md),
 * que continua registrado como rejeitado por conflitar com a fronteira de
 * segurança desta operação (RLS, sessão, permissões, auditoria e confirmação
 * de ações externas irreversíveis — nunca removidas). O gate de formalização
 * (gates-formalizacao.ts) já foi desenhado com exatamente essa fronteira:
 * ações INTERNAS (ACOES_GATEADAS_INTERNAS) já são superáveis por decisão
 * auditada da Proprietária Administradora (exigirGate,
 * escopo-conferencia.server.ts:281-322) — só faltava uma tela chamar essa
 * função. Ações EXTERNAS/irreversíveis (assinatura, envio, pagamento)
 * continuam fora do alcance desta função, por desenho.
 */
export const registrarOverrideGateInterno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; acao: AcaoGateada; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const actorId = context.userId as string;
    if (!(ACOES_GATEADAS_INTERNAS as readonly string[]).includes(data.acao)) {
      throw new Error(`"${data.acao}" não é uma ação interna superável por decisão da Proprietária.`);
    }
    const motivo = data.motivo?.trim();
    if (!motivo || motivo.length < 10) throw new Error("Motivo da decisão precisa ter ao menos 10 caracteres.");

    const { organizationId, papel } = await contextoInterno(supabase, actorId);
    const { data: row, error } = await supabase
      .from("owner_override_events")
      .insert({
        organization_id: organizationId,
        actor_user_id: actorId,
        actor_papel: papel,
        categoria: "override_interno",
        acao: data.acao,
        entidade: "crm_casos",
        entidade_id: data.caseId,
        campo: data.acao,
        motivo,
        acao_externa: false,
        irreversivel: false,
        confirmacao_manual: false,
        executado: true,
      })
      .select("id,created_at")
      .single();
    if (error) throw new Error(error.message);

    return { registrado: true, eventoId: row.id as string, criadoEm: row.created_at as string };
  });
