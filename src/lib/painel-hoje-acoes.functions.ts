/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Ações rápidas do Painel Hoje: leitura de acesso e correção auditada da
 * fila canônica (responsável, prazo, próxima ação) ou superação de um gate
 * interno específico. Papel admin/owner é checado via `contextoInterno`
 * (RLS real). Auditoria é gravada em toda gravação, nunca é pré-requisito.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { contextoInterno } from "@/lib/comercial.server";
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

/** Papel efetivo da sessão — única leitura que decide se as ações rápidas aparecem. */
export const estadoAcessoPainel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { papel } = await contextoInterno(supabase, context.userId as string);
    return { ativo: ehPapelProprietaria(papel), papel };
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
      motivo?: string;
      fonte?: string;
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
    const motivo = (data.motivo ?? "").trim() || "Correção rápida — Painel Hoje";
    const fonte = (data.fonte ?? "").trim() || "painel_hoje";

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

    const { data: linhaAtualizada, error } = await supabase
      .from(mapa.tabela)
      .update(patch)
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linhaAtualizada?.id) {
      return { ok: false as const, erros: ["Nada foi gravado: registro arquivado ou fora da organização."] };
    }

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
        motivo,
        fonte,
        acao_externa: false,
        irreversivel: false,
        confirmacao_manual: true,
        executado: false,
      })
      .select(COLUNAS)
      .single();

    return { ok: true as const, erros: [] as string[], evento: evento as EventoOverride };
  });

/**
 * Ação canônica de override interno auditado: supera um gate específico
 * mantendo a pendência original visível. Nenhuma ação externa é executada.
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
      motivo?: string;
      fonte?: string;
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
    const motivo = (data.motivo ?? "").trim() || "Decisão rápida — Painel Hoje";
    const fonte = (data.fonte ?? "").trim() || "painel_hoje";

    const validacao = validarOverrideInterno({
      organization_id: organizationId,
      entidade: data.entidade,
      entidade_id: data.entidade_id,
      gate: data.gate,
      valor_anterior: data.valor_anterior,
      valor_novo: data.valor_novo,
      motivo,
      fonte,
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
        motivo,
        fonte,
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
        motivo,
        fonte,
        autora: context.userId as string,
        em,
        event_id: (row as any).id as string,
        avanco_interno: avanco,
      },
    });

    return { ok: true as const, erros: [] as string[], gate, avanco_interno: avanco, evento: row as EventoOverride };
  });
