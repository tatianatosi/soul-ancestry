/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Servidor — override auditável da Proprietária (PROMPT 02/03/04).
 *
 * Só grava em `owner_override_events` (append-only, nunca update/delete).
 * Nunca escreve em `crm_casos.ativo`, `pagamento_confirmado`,
 * `contrato_assinado` nem em qualquer coluna financeira ou de assinatura —
 * a ativação real do caso continua decidida pelo gate no banco
 * (trg_caso_ativacao_gates_guard). Nenhuma função aqui envia mensagem,
 * cria cobrança, assina, publica ou executa pesquisa externa.
 */
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoInterno } from "@/lib/comercial.server";
import {
  estadoOverride,
  montarEventoOverride,
  TIPOS_OVERRIDE,
  validarSolicitacaoOverride,
  type EstadoOverride,
  type GatePendenteOverride,
  type SolicitacaoOverride,
  type TipoOverride,
} from "@/lib/override-proprietaria-comercial";

/*
 * 05/09/2026 — `owner_override_events.categoria` só aceita 'override_interno'/
 * 'confirmacao_externa' (CHECK da migration 20260822185358). As duas
 * categorias abaixo nunca bateram com isso: todo registrar/revogar sempre
 * violou o CHECK e sempre falhou, para ninguém, em nenhuma sessão. `acao`
 * (TipoOverride ou a string fixa de revogação, abaixo) é quem de fato
 * distingue este módulo dos demais eventos internos na mesma categoria.
 */
const CATEGORIA = "override_interno";
const ACAO_REVOGACAO = "revogar_override_comercial";

export type OverrideComercialLido = {
  id: string;
  casoId: string;
  tipo: TipoOverride;
  objetoAfetado: string | null;
  condicaoOriginal: string | null;
  gatesPendentes: GatePendenteOverride[];
  escopoLiberado: string[];
  justificativa: string;
  autorUserId: string;
  autorPapel: string;
  dataRevisao: string | null;
  criadoEm: string;
  revogadoEm: string | null;
  estado: EstadoOverride;
};

/**
 * Registra a decisão de override comercial/operacional. Nunca efetiva a
 * exceção sobre dado real: apenas grava o registro auditado. A leitura das
 * telas é quem decide, a partir deste registro, se mostra "liberado por
 * exceção" para o escopo interno específico.
 */
export const registrarOverrideComercial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tipo: TipoOverride;
      casoId: string;
      objetoAfetado: string;
      condicaoOriginal: string;
      gatesPendentes: GatePendenteOverride[];
      escopoLiberado: string[];
      justificativa: string;
      dataRevisao: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);

    const solicitacao: SolicitacaoOverride = {
      ...data,
      autorPapel: papel,
      autorUserId: context.userId as string,
    };
    const validacao = validarSolicitacaoOverride(solicitacao);
    if (!validacao.valida) throw new Error(validacao.erros.join(" "));

    const payload = montarEventoOverride(solicitacao, organizationId);
    const { data: row, error } = await supabase
      .from("owner_override_events")
      .insert(payload)
      .select("id,created_at")
      .single();
    if (error) throw new Error(error.message);

    return { registrado: true, eventoId: row.id as string, criadoEm: row.created_at as string };
  });

/**
 * Revoga um override registrado antes da data de revisão. Grava um novo
 * evento de auditoria referenciando o original — nunca atualiza ou apaga o
 * registro anterior.
 */
export const revogarOverrideComercial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { eventoOriginalId: string; casoId: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);

    if (papel !== "admin" && papel !== "proprietaria_administradora") {
      throw new Error("Somente a Proprietária administradora autenticada pode revogar um override.");
    }
    const motivoRevogacao = data.motivo?.trim() || "Motivo não informado.";

    const { data: row, error } = await supabase
      .from("owner_override_events")
      .insert({
        organization_id: organizationId,
        actor_user_id: context.userId,
        actor_papel: papel,
        categoria: CATEGORIA,
        acao: ACAO_REVOGACAO,
        entidade: "crm_casos",
        entidade_id: data.casoId,
        campo: data.eventoOriginalId,
        motivo: motivoRevogacao,
        pendencias_assumidas: [],
        acao_externa: false,
        irreversivel: false,
        confirmacao_manual: false,
        executado: true,
        dados_teste: false,
      })
      .select("id,created_at")
      .single();
    if (error) throw new Error(error.message);

    return { revogado: true, eventoId: row.id as string, criadoEm: row.created_at as string };
  });

/**
 * Lista os overrides comerciais do caso, já cruzados com eventuais
 * revogações e com o estado derivado (nunca infere pagamento).
 */
export const listarOverridesComerciais = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { casoId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);

    const { data: eventos, error } = await supabase
      .from("owner_override_events")
      .select(
        "id,categoria,acao,entidade_id,campo,motivo,fonte,pendencias_assumidas,valor_anterior,valor_novo,actor_user_id,actor_papel,created_at",
      )
      .eq("organization_id", organizationId)
      .eq("entidade_id", data.casoId)
      .eq("categoria", CATEGORIA)
      // `categoria: 'override_interno'` também é usada por outros módulos
      // (ex.: gates de formalização) para o mesmo caso — `acao` é o que
      // isola só os eventos deste módulo de override comercial.
      .in("acao", [...TIPOS_OVERRIDE, ACAO_REVOGACAO])
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const linhas = (eventos ?? []) as any[];
    const revogacoesPorOriginal = new Map<string, string>();
    for (const e of linhas) {
      if (e.acao === ACAO_REVOGACAO && e.campo) revogacoesPorOriginal.set(e.campo, e.created_at);
    }

    const resultado: OverrideComercialLido[] = linhas
      .filter((e) => e.acao !== ACAO_REVOGACAO)
      .map((e) => {
        const valorNovo = (e.valor_novo ?? {}) as any;
        const valorAnterior = (e.valor_anterior ?? {}) as any;
        const revogadoEm = revogacoesPorOriginal.get(e.id) ?? null;
        return {
          id: e.id,
          casoId: e.entidade_id,
          tipo: e.acao as TipoOverride,
          objetoAfetado: e.campo ?? null,
          condicaoOriginal: valorAnterior.condicao_original ?? e.fonte ?? null,
          gatesPendentes: (e.pendencias_assumidas ?? []) as GatePendenteOverride[],
          escopoLiberado: (valorNovo.escopo_liberado ?? []) as string[],
          justificativa: e.motivo as string,
          autorUserId: e.actor_user_id as string,
          autorPapel: e.actor_papel as string,
          dataRevisao: valorNovo.data_revisao ?? null,
          criadoEm: e.created_at as string,
          revogadoEm,
          estado: estadoOverride({ dataRevisao: valorNovo.data_revisao ?? "", revogadoEm }),
        };
      });

    return resultado;
  });
