/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Modo Proprietária Administradora — leitura de estado e registro auditado de
 * decisões humanas.
 *
 * Nenhuma função aqui envia contrato, assinatura, cobrança, pagamento,
 * mensagem, pesquisa externa, procuração, publicação ou exclusão. Ações
 * externas apenas geram o registro da confirmação manual solicitada pela
 * proprietária; a execução continua fora deste módulo.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoInterno } from "@/lib/comercial.server";
import {
  capacidadesDe,
  ehProprietariaAdministradora,
  exigeConfirmacaoFinal,
  montarConfirmacao,
  validarDecisao,
} from "@/lib/modo-proprietaria";

export type EventoOverride = {
  id: string;
  categoria: string;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  campo: string | null;
  motivo: string;
  fonte: string | null;
  impacto: string | null;
  destinatario: string | null;
  valor_financeiro: number | null;
  acao_externa: boolean;
  irreversivel: boolean;
  confirmacao_manual: boolean;
  executado: boolean;
  dados_teste: boolean;
  actor_papel: string;
  created_at: string;
};

const COLUNAS =
  "id,categoria,acao,entidade,entidade_id,campo,motivo,fonte,impacto,destinatario,valor_financeiro,acao_externa,irreversivel,confirmacao_manual,executado,dados_teste,actor_papel,created_at";

/** Estado do modo, capacidades e últimas decisões registradas. */
export const estadoModoProprietaria = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    const ativo = ehProprietariaAdministradora(papel);

    const { data: eventos } = await supabase
      .from("owner_override_events")
      .select(COLUNAS)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50);

    return {
      ativo,
      papel,
      organizationId,
      capacidades: capacidadesDe(papel),
      eventos: (eventos ?? []) as EventoOverride[],
    };
  });

/**
 * Registra uma decisão administrativa (override interno) com autora, data,
 * valor anterior, valor novo, fonte/justificativa e entidade afetada.
 */
export const registrarDecisaoProprietaria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      acao: string;
      entidade: string;
      entidade_id?: string | null;
      campo?: string | null;
      valor_anterior?: unknown;
      valor_novo?: unknown;
      motivo: string;
      fonte?: string | null;
      impacto?: string | null;
      pendencias_assumidas?: string[];
      dados_teste?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);

    const erros = validarDecisao(papel, data);
    if (erros.length) throw new Error(erros.join(" "));
    if (exigeConfirmacaoFinal(data.acao)) {
      throw new Error(
        "Ação externa ou irreversível exige a janela final de confirmação explícita da proprietária.",
      );
    }

    const { data: row, error } = await supabase
      .from("owner_override_events")
      .insert({
        organization_id: organizationId,
        actor_user_id: context.userId,
        actor_papel: papel,
        categoria: "override_interno",
        acao: data.acao,
        entidade: data.entidade,
        entidade_id: data.entidade_id ?? null,
        campo: data.campo ?? null,
        valor_anterior: data.valor_anterior === undefined ? null : (data.valor_anterior as any),
        valor_novo: data.valor_novo === undefined ? null : (data.valor_novo as any),
        motivo: data.motivo.trim(),
        fonte: data.fonte ?? null,
        impacto: data.impacto ?? null,
        pendencias_assumidas: data.pendencias_assumidas ?? [],
        dados_teste: data.dados_teste === true,
        acao_externa: false,
        irreversivel: false,
        confirmacao_manual: true,
        executado: false,
      })
      .select(COLUNAS)
      .single();
    if (error) throw new Error(error.message);
    return { registrado: true, evento: row as EventoOverride };
  });

/**
 * Registra a confirmação final explícita de uma ação externa/irreversível.
 * Não executa a ação: apenas documenta o que a proprietária confirmou.
 */
export const confirmarAcaoExterna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      acao: string;
      entidade: string;
      entidade_id?: string | null;
      destinatario?: string | null;
      conteudo?: string | null;
      valor?: number | string | null;
      caso?: string | null;
      anexos?: string[] | null;
      impacto?: string | null;
      dados_enviados?: Record<string, unknown> | null;
      motivo: string;
      confirmacao_manual: boolean;
      dados_teste?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);

    const erros = validarDecisao(papel, {
      acao: data.acao,
      entidade: data.entidade,
      motivo: data.motivo,
    });
    if (erros.length) throw new Error(erros.join(" "));
    if (!exigeConfirmacaoFinal(data.acao)) {
      throw new Error("Ação informada não é externa; use o registro de decisão interna.");
    }
    if (data.confirmacao_manual !== true) {
      throw new Error("Confirmação manual explícita da proprietária é obrigatória.");
    }

    const confirmacao = montarConfirmacao({ ...data, irreversivel: true });
    if (!confirmacao.pronta) {
      throw new Error(
        `Janela de confirmação incompleta: ${confirmacao.faltantes.join(", ")}.`,
      );
    }

    const { data: row, error } = await supabase
      .from("owner_override_events")
      .insert({
        organization_id: organizationId,
        actor_user_id: context.userId,
        actor_papel: papel,
        categoria: "confirmacao_externa",
        acao: data.acao,
        entidade: data.entidade,
        entidade_id: data.entidade_id ?? null,
        motivo: data.motivo.trim(),
        impacto: data.impacto ?? null,
        destinatario: data.destinatario ?? null,
        conteudo_resumo: data.conteudo ?? null,
        valor_financeiro: typeof data.valor === "number" ? data.valor : null,
        anexos: data.anexos ?? [],
        dados_enviados: (data.dados_enviados ?? null) as any,
        acao_externa: true,
        irreversivel: true,
        confirmacao_manual: true,
        // A execução externa permanece fora deste módulo.
        executado: false,
        dados_teste: data.dados_teste === true,
      })
      .select(COLUNAS)
      .single();
    if (error) throw new Error(error.message);

    return { confirmada: true, executada: false, confirmacao, evento: row as EventoOverride };
  });
