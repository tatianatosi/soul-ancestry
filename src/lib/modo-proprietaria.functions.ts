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
import { semCache } from "@/lib/no-store";
import { contextoInterno } from "@/lib/comercial.server";
import {
  capacidadesDe,
  ehProprietariaAdministradora,
  exigeConfirmacaoFinal,
  montarConfirmacao,
  validarDecisao,
} from "@/lib/modo-proprietaria";
import { resumoCobertura, validarOperacaoModulo } from "@/lib/modo-proprietaria-cobertura";
import { avancoPermitido, derivarEstadoGate, ehPapelProprietaria, validarOverrideInterno } from "@/lib/gates-override";

export type EventoOverride = {
  id: string;
  categoria: string;
  acao: string;
  modulo: string | null;
  operacao: string | null;
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
  "id,categoria,acao,modulo,operacao,entidade,entidade_id,campo,motivo,fonte,impacto,destinatario,valor_financeiro,acao_externa,irreversivel,confirmacao_manual,executado,dados_teste,actor_papel,created_at";


/** Estado do modo, capacidades e últimas decisões registradas. */
export const estadoModoProprietaria = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
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
      cobertura: resumoCobertura(),
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
      modulo?: string | null;
      operacao?: string | null;
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
    if (data.modulo) {
      const v = validarOperacaoModulo(papel, {
        modulo: data.modulo,
        operacao: data.operacao ?? data.acao,
        dados_teste: data.dados_teste === true,
      });
      if (!v.valida) throw new Error(v.erros.join(" "));
    }

    const { data: row, error } = await supabase
      .from("owner_override_events")
      .insert({
        organization_id: organizationId,
        actor_user_id: context.userId,
        actor_papel: papel,
        categoria: "override_interno",
        acao: data.acao,
        modulo: data.modulo ?? null,
        operacao: data.operacao ?? null,
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
      modulo?: string | null;
      entidade: string;
      entidade_id?: string | null;
      destinatario?: string | null;
      conteudo?: string | null;
      valor?: number | string | null;
      moeda?: string | null;
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
    if (data.dados_teste === true && data.acao === "publicar_no_app_cliente") {
      throw new Error("Dados TESTE/DEMO não podem ser publicados no App Cliente.");
    }


    const confirmacao = montarConfirmacao({
      ...data,
      organizacao: organizationId,
      irreversivel: true,
    });
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
        modulo: data.modulo ?? null,
        operacao: data.acao,
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

/**
 * Ação canônica de override interno auditado.
 *
 * Um único caminho de domínio para todos os módulos: valida papel, motivo,
 * fonte, organização e escopo interno; grava evento append-only; devolve o
 * gate derivado com a pendência preservada. Nenhuma ação externa é executada.
 */
export const registrarOverrideProprietaria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      entidade: string;
      entidade_id: string;
      gate: string;
      valor_anterior: unknown;
      valor_novo: unknown;
      motivo: string;
      fonte: string;
      avanco_interno: string;
      modulo?: string | null;
      pendencia?: { chave: string; rotulo: string; motivo: string } | null;
      dados_teste?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    const em = new Date().toISOString();

    const validacao = validarOverrideInterno({
      organization_id: organizationId,
      entidade: data.entidade,
      entidade_id: data.entidade_id,
      gate: data.gate,
      valor_anterior: data.valor_anterior,
      valor_novo: data.valor_novo,
      motivo: data.motivo,
      fonte: data.fonte,
      autora: context.userId as string,
      em,
      avanco_interno: data.avanco_interno,
      papel,
    });
    if (!validacao.valida) return { ok: false as const, erros: validacao.erros };

    const avanco = avancoPermitido(data.gate, data.avanco_interno);

    const { data: row, error } = await supabase
      .from("owner_override_events")
      .insert({
        organization_id: organizationId,
        actor_user_id: context.userId,
        actor_papel: papel,
        categoria: "override_gate_interno",
        acao: `superar_gate:${data.gate}`,
        modulo: data.modulo ?? null,
        operacao: avanco,
        entidade: data.entidade,
        entidade_id: data.entidade_id,
        campo: data.gate,
        valor_anterior: (data.valor_anterior ?? null) as any,
        valor_novo: (data.valor_novo ?? null) as any,
        motivo: data.motivo.trim(),
        fonte: data.fonte.trim(),
        pendencias_assumidas: data.pendencia ? [data.pendencia.chave] : [],
        dados_teste: data.dados_teste === true,
        acao_externa: false,
        irreversivel: false,
        confirmacao_manual: true,
        executado: false,
      })
      .select(COLUNAS)
      .single();
    if (error) throw new Error(error.message);

    const gate = derivarEstadoGate({
      gate: data.gate,
      pendencia: data.pendencia ?? null,
      override: {
        motivo: data.motivo.trim(),
        fonte: data.fonte.trim(),
        autora: context.userId as string,
        em,
        event_id: (row as any).id as string,
        avanco_interno: avanco,
      },
    });

    return { ok: true as const, erros: [] as string[], gate, avanco_interno: avanco, evento: row as EventoOverride };
  });

/**
 * Ações rápidas do Painel Hoje: responsável, prazo e próxima ação gravados na
 * entidade canônica, com auditoria. Não cria registro novo nem dispara nada.
 */
const CAMPOS_FILA: Record<string, { tabela: string; responsavel: string; prazo: string | null; proxima: string | null }> = {
  lead: { tabela: "leads", responsavel: "responsavel_user_id", prazo: null, proxima: "proxima_acao" },
  oportunidade: { tabela: "opportunities", responsavel: "responsavel_user_id", prazo: "prazo_proxima_acao", proxima: "proxima_acao" },
  caso: { tabela: "crm_casos", responsavel: "responsavel_id", prazo: "prazo_proxima_acao", proxima: "proxima_acao" },
  tarefa: { tabela: "tarefas", responsavel: "responsavel_id", prazo: "prazo", proxima: null },
};

export const corrigirFilaCanonica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tipo: "lead" | "oportunidade" | "caso" | "tarefa";
      id: string;
      responsavel_user_id?: string | null;
      prazo?: string | null;
      proxima_acao?: string | null;
      motivo: string;
      fonte: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    if (!ehPapelProprietaria(papel)) {
      return { ok: false as const, erros: ["Somente a proprietária administradora pode corrigir a fila por decisão auditada."] };
    }
    const mapa = CAMPOS_FILA[data.tipo];
    if (!mapa) return { ok: false as const, erros: ["Tipo de registro não reconhecido."] };
    if ((data.motivo ?? "").trim().length < 10) return { ok: false as const, erros: ["Motivo obrigatório com pelo menos 10 caracteres."] };
    if (!(data.fonte ?? "").trim()) return { ok: false as const, erros: ["Fonte ou justificativa obrigatória."] };

    const { data: atual } = await supabase
      .from(mapa.tabela)
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual) return { ok: false as const, erros: ["Registro não encontrado nesta organização."] };

    const patch: Record<string, unknown> = { updated_by: context.userId };
    const anterior: Record<string, unknown> = {};
    if (data.responsavel_user_id !== undefined) {
      anterior[mapa.responsavel] = (atual as any)[mapa.responsavel] ?? null;
      patch[mapa.responsavel] = data.responsavel_user_id;
    }
    if (data.prazo !== undefined && mapa.prazo) {
      anterior[mapa.prazo] = (atual as any)[mapa.prazo] ?? null;
      patch[mapa.prazo] = data.prazo;
    }
    if (data.proxima_acao !== undefined && mapa.proxima) {
      anterior[mapa.proxima] = (atual as any)[mapa.proxima] ?? null;
      patch[mapa.proxima] = data.proxima_acao;
    }
    if (Object.keys(patch).length === 1) return { ok: false as const, erros: ["Nada a corrigir neste registro."] };

    const { error } = await supabase
      .from(mapa.tabela)
      .update(patch)
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    if (error) throw new Error(error.message);

    const { data: evento } = await supabase
      .from("owner_override_events")
      .insert({
        organization_id: organizationId,
        actor_user_id: context.userId,
        actor_papel: papel,
        categoria: "override_interno",
        acao: "corrigir_fila_canonica",
        modulo: "painel_hoje",
        operacao: "correcao_responsavel_prazo_proxima_acao",
        entidade: mapa.tabela,
        entidade_id: data.id,
        campo: Object.keys(anterior).join(","),
        valor_anterior: anterior as any,
        valor_novo: patch as any,
        motivo: data.motivo.trim(),
        fonte: data.fonte.trim(),
        acao_externa: false,
        irreversivel: false,
        confirmacao_manual: true,
        executado: false,
      })
      .select(COLUNAS)
      .single();

    return { ok: true as const, erros: [] as string[], evento: evento as EventoOverride };
  });
