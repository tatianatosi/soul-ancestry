import { semCache } from "@/lib/no-store";
import { linhas } from "@/lib/linhas";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, payloadServico, rascunhoDaAcao, type Linha } from "@/lib/caso-canonico.server";
import { mapaDaAcao } from "@/lib/caso-ficha";
import { construirMapaProdutoPaiPorCodigo, produtoPaiDoCodigo } from "@/lib/planejador-produtos-pai";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Catálogos, serviços, etiquetas, alertas, comunicação e onboarding do caso. */
import { exigirGate } from "@/lib/escopo-conferencia.server";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { recusaTickManualD7 } from "@/lib/d7-microentrega";
import { tratarTickManualD7 } from "@/lib/d7-microentrega.server";
import {
  CAMPOS_CIVIS_RECONCILIAVEIS,
  COLUNA_CLIENTE_CIVIL,
  COLUNA_MEMBRO_CIVIL,
  ROTULO_CAMPO_CIVIL,
  estadoCampoCivilMembroCaso,
  estadoCepMembroCaso,
  estadoCpfMembroCaso,
  estadoTelefoneMembroCaso,
  type CampoCivilReconciliavel,
} from "@/lib/pessoa-vinculo";
import { exigirProximaAcaoOperavel } from "@/lib/proxima-acao-startup";
import { proprietariaOperando } from "@/lib/autoridade.server";
import { nomeResponsavelSessao } from "@/lib/cadeia-operacional.server";
import { nomeResponsavelPadrao } from "@/lib/responsavel-padrao";


export const carregarCanonico = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);

    const [produtos, catalogoPlanejador, trilhas, servicos, taxonomia, etiquetas, alertas, comunicacoes, onboarding, nucleos, entregas, aliases, proximaAcao] =
      await Promise.all([
        eq("product_catalog").is("archived_at", null).order("nome_comercial"),
        eq("planner_catalog_feed").is("archived_at", null),
        eq("citizenship_tracks").is("archived_at", null).order("pais"),
        eq("case_services").eq("case_id", data.caseId).is("archived_at", null).order("created_at"),
        eq("label_taxonomy").eq("active", true).order("sort_order"),
        eq("entity_labels").eq("entity_id", data.caseId).is("removed_at", null),
        eq("case_alerts").eq("case_id", data.caseId).order("triggered_at", { ascending: false }),
        eq("communication_queue").eq("case_id", data.caseId).order("created_at", { ascending: false }),
        eq("onboarding_checklist").eq("case_id", data.caseId).order("ordem"),
        eq("nucleos_familiares").eq("case_id", data.caseId).is("archived_at", null),
        eq("client_deliverables").eq("case_id", data.caseId).is("archived_at", null).order("created_at"),
        // Aliases históricos: visíveis apenas no detalhe interno, nunca como chave.
        eq("case_aliases").eq("case_id", data.caseId).order("created_at"),
        // CRM Vivo — próxima ação prioritária única (PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md, seção 3.4).
        supabase.rpc("proxima_acao_prioritaria", { _case: data.caseId }),
      ]);


    const listaNucleos = linhas<Linha>(nucleos, "núcleos familiares do caso");
    const nucleoIds = listaNucleos.map((n) => n.id);
    const membrosNucleo = nucleoIds.length
      ? await supabase.from("nucleo_membros").select("*").in("nucleo_id", nucleoIds).is("archived_at", null)
      : { data: [] };

    // 07/09/2026 — a Selecao de produto-pai mostrava a lista crua do
    // product_catalog (SKU a SKU, sem agrupar), enquanto a reconciliação
    // canônica de 04/09 (planner_catalog_feed) que dá o produto-pai real de
    // cada SKU e sinaliza os que ainda pedem reconciliação (LEGADO_RECONCILIAR,
    // NAO_USAR_NO_MOTOR etc.) nunca chegava a esta tela — motor construído,
    // nunca ligado ao formulário que vende o produto.
    // 09/09/2026 (CA09-CATALOGO-PRODUTOS-PAI) — enriquecimento extraído para
    // planejador-produtos-pai.ts, reusado também pela leitura do Catálogo.
    const mapaProdutoPai = construirMapaProdutoPaiPorCodigo(linhas<Linha>(catalogoPlanejador, "catálogo do planejador") as any);
    const produtosComProdutoPai = linhas<Linha>(produtos, "catálogo de produtos").map((p) => ({
      ...p,
      ...produtoPaiDoCodigo(p.code, mapaProdutoPai),
    }));

    return {
      produtos: produtosComProdutoPai,
      trilhas: linhas<Linha>(trilhas, "trilhas de cidadania"),
      servicos: linhas<Linha>(servicos, "serviços do caso"),
      taxonomia: linhas<Linha>(taxonomia, "taxonomia de etiquetas"),
      etiquetas: linhas<Linha>(etiquetas, "etiquetas aplicadas ao caso"),
      alertas: linhas<Linha>(alertas, "alertas do caso"),
      comunicacoes: linhas<Linha>(comunicacoes, "fila de comunicações do caso"),
      onboarding: linhas<Linha>(onboarding, "checklist de onboarding do caso"),
      nucleos: listaNucleos,
      membrosNucleo: linhas<Linha>(membrosNucleo as any, "membros do núcleo familiar"),
      entregas: linhas<Linha>(entregas, "entregas ao cliente do caso"),
      aliases: linhas<Linha>(aliases, "aliases históricos do caso"),
      proximaAcaoPrioritaria: (proximaAcao.data?.[0] ?? null) as {
        nivel: number;
        motivo: string;
        origem_tabela: string | null;
        origem_id: string | null;
        prazo: string | null;
      } | null,
    };
  });


/** Cria ou atualiza o case service (produto-pai + trilha + escopo + condição comercial). */
export const salvarCaseService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; id?: string; dados: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const payload = payloadServico(data.dados);

    // Preço vem sempre do catálogo homologado, nunca da tela.
    if (payload["product_catalog_id"]) {
      const prod = await supabase
        .from("product_catalog")
        .select("preco_comercial_vigente, condicao_comercial_padrao")
        .eq("id", payload["product_catalog_id"])
        .eq("organization_id", organizationId)
        .maybeSingle();
      payload["preco_acordado"] = prod.data?.preco_comercial_vigente ?? null;
      payload["preco_somente_leitura"] = true;
    }

    if (data.id) {
      const r = await gravarComVerificacao({
        supabase,
        tabela: "case_services",
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload,
      });
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: "Serviço do caso atualizado",
        summaryInternal: `Produto-pai/trilha atualizados`,
        sourceEntityType: "case_services",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
      return { id: data.id, salvoEm: r.salvoEm };
    }

    const r = await inserirComVerificacao({
      supabase,
      tabela: "case_services",
      organizationId,
      userId: context.userId as string,
      payload: { ...payload, case_id: data.caseId },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Serviço do caso criado",
      sourceEntityType: "case_services",
      sourceEntityId: r.id,
      userId: context.userId as string,
    });
    return { id: r.id, salvoEm: r.salvoEm };
  });


/** Aplica etiqueta canônica (nunca cria etiqueta livre fora da taxonomia). */
export const aplicarEtiqueta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entityType: string; entityId: string; labelId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const existe = await supabase
      .from("label_taxonomy")
      .select("id")
      .eq("id", data.labelId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!existe.data) throw new Error("Etiqueta fora da taxonomia canônica.");
    const r = await inserirComVerificacao({
      supabase,
      tabela: "entity_labels",
      organizationId,
      userId: context.userId as string,
      payload: {
        label_id: data.labelId,
        entity_type: data.entityType,
        entity_id: data.entityId,
        applied_by: context.userId,
        source: "desk_manual",
      },
    });
    if (data.entityType === "case") {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.entityId,
        eventType: "caso",
        title: "Etiqueta aplicada ao caso",
        sourceEntityType: "entity_labels",
        sourceEntityId: r.id,
        userId: context.userId as string,
      });
    }
    return { ok: true, id: r.id, salvoEm: r.salvoEm };
  });

export const removerEtiqueta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const removidoEm = new Date().toISOString();
    const r = await gravarComVerificacao({
      supabase,
      tabela: "entity_labels",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {},
      derivados: { removed_at: removidoEm, removed_by: context.userId },
    });
    if (r.registro["entity_type"] === "case") {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["entity_id"] as string,
        eventType: "caso",
        title: "Etiqueta removida do caso",
        sourceEntityType: "entity_labels",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true, salvoEm: r.salvoEm };
  });


/**
 * Registra a próxima ação: alerta interno sempre; rascunho de comunicação
 * quando o público é externo. Nenhum envio externo é executado.
 */
export const registrarProximaAcao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const caso = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");
    const cBruto = caso.data as Linha;
    const livre = await proprietariaOperando(supabase, context.userId as string);
    const responsavelNome = nomeResponsavelPadrao(
      await nomeResponsavelSessao(supabase, organizationId, context.userId as string),
    );
    const { estado: preenchido, pendenciasAssumidas } = exigirProximaAcaoOperavel(
      cBruto as Record<string, unknown>,
      { livreProprietaria: livre, responsavelPreferido: responsavelNome },
    );
    const c = { ...cBruto, ...preenchido } as Linha;
    if (pendenciasAssumidas.length || c.responsavel_principal !== cBruto.responsavel_principal) {
      await gravarComVerificacao({
        supabase,
        tabela: "crm_casos",
        id: data.caseId,
        organizationId,
        userId: context.userId as string,
        payload: {
          responsavel_principal: c.responsavel_principal,
          responsavel_id: cBruto.responsavel_id || context.userId,
          prazo_proxima_acao: c.prazo_proxima_acao,
          target_audience: c.target_audience,
          visibility: c.visibility,
          suggested_channel: c.suggested_channel,
        },
      });
    }

    const mapa = mapaDaAcao(c.proxima_acao_codigo);
    const externo = c.target_audience && c.target_audience !== "interno_tatiana";

    // 09/09/2026 — "próxima ação: apenas uma por caso". Antes, cada clique em
    // "registrar" empilhava um novo case_alerts pending, mesmo com um já
    // aberto para o mesmo caso. Reaproveita o alerta pending existente
    // (atualiza título/detalhe/prazo) em vez de duplicar.
    const alertaPayload = {
      organization_id: organizationId,
      case_id: data.caseId,
      tipo: "proxima_acao",
      criticidade: "atencao",
      titulo: `Próxima ação: ${c.proxima_acao ?? c.proxima_acao_codigo}`,
      detalhe: `Responsável: ${c.responsavel_principal}. Público: ${c.target_audience}. Canal sugerido: ${c.suggested_channel}.`,
      status: "pending",
      due_at: new Date(`${c.prazo_proxima_acao}T12:00:00-03:00`).toISOString(),
    };
    const { data: alertaExistente } = await supabase
      .from("case_alerts")
      .select("id")
      .eq("case_id", data.caseId)
      .eq("tipo", "proxima_acao")
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();
    if (alertaExistente?.id) {
      const r = await supabase.from("case_alerts").update(alertaPayload).eq("id", alertaExistente.id).select("id");
      if (r.error) throw new Error(r.error.message);
      if (!r.data?.length) throw new Error("NENHUMA_LINHA_AFETADA: alerta de próxima ação não foi atualizado.");
    } else {
      const r = await supabase.from("case_alerts").insert(alertaPayload).select("id");
      if (r.error) throw new Error(r.error.message);
      if (!r.data?.length) throw new Error("NENHUMA_LINHA_AFETADA: alerta de próxima ação não foi criado.");
    }

    let comunicacaoId: string | null = null;
    if (externo && mapa.rascunhoWhatsapp) {
      const modelo = rascunhoDaAcao(String(c.proxima_acao_codigo));
      const { data: q, error } = await supabase
        .from("communication_queue")
        .insert({
          organization_id: organizationId,
          case_id: data.caseId,
          acao_codigo: c.proxima_acao_codigo,
          target_audience: c.target_audience,
          visibility: c.visibility,
          suggested_channel: c.suggested_channel,
          assunto: modelo.assunto,
          corpo_rascunho: modelo.corpo,
          status: "awaiting_approval",
          requires_human_approval: true,
          created_by: context.userId,
          observacao_interna: "Rascunho criado pelo Desk. Envio externo depende de aprovação humana.",
        })
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      comunicacaoId = (q?.id as string) ?? null;
    }

    await gravarComVerificacao({
      supabase,
      tabela: "crm_casos",
      id: data.caseId,
      organizationId,
      userId: context.userId as string,
      payload: {
        // 09/09/2026 — achado real: crm_casos.proxima_acao (lido pela RPC
        // proxima_acao_prioritaria, nível 8, e por Lista de Casos) nunca era
        // sincronizado com proxima_acao_codigo (escrito pela aba da Ficha
        // 360) — casos ficavam com os dois campos divergindo de verdade
        // (confirmado no caso da Ana: "validar_representacao_menor" vs.
        // "solicitar_dados_cadastrais"). Esta é a causa raiz do "duas
        // próximas ações", não duas fontes de decisão.
        proxima_acao: c.proxima_acao_codigo,
        // Decisão 2 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — mesma lógica:
        // proxima_acao_responsavel (lido pela Lista de Casos) nunca era
        // sincronizado com responsavel_principal (escrito por esta aba).
        // Sincroniza a partir daqui; não apaga nem sobrescreve o histórico
        // de linhas já gravadas, só converge as próximas gravações.
        proxima_acao_responsavel: c.responsavel_principal,
        alert_status: "alerted",
        alert_triggered_at: new Date().toISOString(),
        communication_status: comunicacaoId ? "awaiting_approval" : "not_applicable",
        communication_queue_id: comunicacaoId,
      },
    });

    return { ok: true, comunicacaoId, rascunhoCriado: Boolean(comunicacaoId) };
  });

/**
 * Volta ao cálculo automático: limpa o override manual (proxima_acao e
 * proxima_acao_codigo), sem exigir a completude de responsável/público/canal
 * que registrarProximaAcao pede — reverter não é registrar ação nova.
 */
export const voltarProximaAcaoAoAutomatico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    await gravarComVerificacao({
      supabase,
      tabela: "crm_casos",
      id: data.caseId,
      organizationId,
      userId: context.userId as string,
      payload: {
        proxima_acao: null,
        proxima_acao_codigo: null,
        proxima_acao_justificativa: null,
      },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Próxima ação revertida ao cálculo automático",
      sourceEntityType: "crm_casos",
      sourceEntityId: data.caseId,
      userId: context.userId as string,
    });
    return { ok: true };
  });

/**
 * Marca explicitamente que não há nova ação necessária agora — estado
 * terminal distinto de "sem ação definida" (null). Continua sujeito à RPC:
 * se surgir um sinal automático mais urgente (níveis 1–6), ele prevalece.
 */
export const marcarSemNovaAcaoNecessaria = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    await gravarComVerificacao({
      supabase,
      tabela: "crm_casos",
      id: data.caseId,
      organizationId,
      userId: context.userId as string,
      payload: {
        proxima_acao: "sem_nova_acao_necessaria",
        proxima_acao_codigo: "sem_nova_acao_necessaria",
        proxima_acao_justificativa: null,
      },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Marcado: sem nova ação necessária",
      sourceEntityType: "crm_casos",
      sourceEntityId: data.caseId,
      userId: context.userId as string,
    });
    return { ok: true };
  });

export const atualizarAlerta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string; dueAt?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const payload: Record<string, unknown> = { status: data.status };
    // Reprogramar (CA-CORTE-ALERTAS-ROTA-CANONICA, 09/09/2026): mesmo escritor,
    // sem criar segunda tabela nem segundo escritor — só um campo a mais no
    // mesmo update, quando a tela de Alertas pede nova data.
    if (data.dueAt !== undefined) payload["due_at"] = data.dueAt;
    const patch: Record<string, unknown> = {};
    if (data.status === "acknowledged") {
      patch["acknowledged_at"] = new Date().toISOString();
      patch["acknowledged_by"] = context.userId;
    }
    if (data.status === "completed") patch["completed_at"] = new Date().toISOString();

    // MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA (Lote 1): reconhecer/reprogramar
    // gravava com gravarComVerificacao (erro/linha afetada já cobertos), mas
    // nunca deixava evento no histórico do caso — mesmo padrão já usado em
    // moverTarefa.
    const atual = await supabase
      .from("case_alerts")
      .select("case_id,titulo")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (atual.error) throw new Error(atual.error.message);

    const r = await gravarComVerificacao({
      supabase,
      tabela: "case_alerts",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload,
      derivados: patch,
    });

    if (atual.data?.case_id) {
      const reprogramada = data.dueAt !== undefined;
      const titulo =
        data.status === "acknowledged"
          ? "Alerta reconhecido"
          : data.status === "completed"
            ? "Alerta concluído"
            : reprogramada
              ? "Alerta reprogramado"
              : "Alerta atualizado";
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: atual.data.case_id as string,
        eventType: "caso",
        title: titulo,
        summaryInternal: String(atual.data.titulo ?? ""),
        sourceEntityType: "case_alerts",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }

    return { ok: true, salvoEm: r.salvoEm };
  });

/** Aprova o rascunho — aprovação é registro interno; não há envio nesta entrega. */
export const aprovarRascunho = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; corpo?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const r = await gravarComVerificacao({
      supabase,
      tabela: "communication_queue",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: data.corpo === undefined ? { status: "approved" } : { corpo_rascunho: data.corpo, status: "approved" },
      derivados: { approved_at: new Date().toISOString(), approved_by: context.userId },
    });
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: "Rascunho de comunicação aprovado",
        sourceEntityType: "communication_queue",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true, enviado: false, salvoEm: r.salvoEm };
  });

export const atualizarItemOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string; observacao?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const { data: item } = await supabase
      .from("onboarding_checklist")
      .select("id,case_id,item_code")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!item) throw new Error("Item de onboarding não encontrado.");
    // P3 (25/09/2026): o D7 não é caixinha — segue a micro-entrega real.
    if (recusaTickManualD7(String(item.item_code ?? ""), data.status)) {
      const r = await tratarTickManualD7(supabase, {
        organizationId,
        caseId: item.case_id as string,
        userId: context.userId as string,
        status: data.status,
      });
      if (!r.ok) throw new Error(r.erro);
      return { ok: true, salvoEm: new Date().toISOString() };
    }
    if (data.status === "concluido" && ["liberacao_onboarding", "onboarding_liberado"].includes(String(item.item_code))) {
      await exigirGate(supabase, {
        caseId: item.case_id,
        acao: "liberar_onboarding",
        userId: context.userId as string,
        organizationId,
      });
    }

    const r = await gravarComVerificacao({
      supabase,
      tabela: "onboarding_checklist",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { status: data.status, observacao: data.observacao ?? null },
      derivados: {
        concluido_em: data.status === "concluido" ? new Date().toISOString() : null,
        concluido_por: data.status === "concluido" ? context.userId : null,
      },
    });
    if (item.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: item.case_id as string,
        eventType: "caso",
        title: `Item de onboarding atualizado: ${data.status}`,
        summaryInternal: String(item.item_code ?? ""),
        sourceEntityType: "onboarding_checklist",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true, salvoEm: r.salvoEm };
  });


/**
 * Verifica/sincroniza `case_members` a partir de `nucleo_membros` do mesmo
 * caso. Achado real (Ana Luiza, 06/09): o núcleo familiar já tinha os 4
 * membros corretos com `cliente_id` vinculado, mas `case_members` — a tabela
 * que carrega CPF/RG/endereço para contrato e anexos — estava vazia para o
 * caso dela. As duas tabelas nunca se falavam. Nunca sobrescreve um membro
 * já registrado; apenas cria o que falta. Funciona para qualquer `caseId`,
 * não só o da Ana.
 */
export const sincronizarMembrosDoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; confirmar?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: nucleos } = await supabase
      .from("nucleos_familiares")
      .select("id")
      .eq("case_id", data.caseId)
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    const nucleoIds = ((nucleos ?? []) as Linha[]).map((n) => n.id);
    if (!nucleoIds.length) return { simulado: !data.confirmar, plano: [], criados: 0 };

    const { data: membrosNucleo } = await supabase
      .from("nucleo_membros")
      .select("id,cliente_id,nome,papel,vinculo")
      .in("nucleo_id", nucleoIds)
      .is("archived_at", null);

    const { data: membrosCaso } = await supabase
      .from("case_members")
      .select("cliente_id")
      .eq("case_id", data.caseId)
      .is("archived_at", null);
    const jaVinculados = new Set(((membrosCaso ?? []) as Linha[]).map((m) => m.cliente_id).filter(Boolean));

    const faltantes = ((membrosNucleo ?? []) as Linha[]).filter((m) => m.cliente_id && !jaVinculados.has(m.cliente_id));

    const clienteIds = Array.from(new Set(faltantes.map((m) => m.cliente_id)));
    const { data: clientesRaw } = clienteIds.length
      ? await supabase.from("clientes").select("id,cpf").in("id", clienteIds)
      : { data: [] };
    const clientePorId = new Map(((clientesRaw ?? []) as Linha[]).map((c) => [c.id, c]));

    const plano = faltantes.map((m) => {
      const texto = `${m.papel ?? ""} ${m.vinculo ?? ""}`.toLowerCase();
      const dependente = texto.includes("dependente");
      const cliente = clientePorId.get(m.cliente_id as string);
      const titular = texto.includes("titular");
      /*
       * Achado real (Felipe, caso Ana Luiza): um dependente menor sem
       * cadastro próprio tem `cliente_id` apontando para o responsável.
       * Sem esta guarda, o CPF da mãe seria copiado para o registro do
       * filho só porque os dois compartilham o mesmo `cliente_id` —
       * mesmo bug já corrigido em `sincronizarPessoaDoCaso`.
       */
      const cpf = dependente ? null : ((cliente?.cpf as string | null) ?? null);
      return {
        nucleoMembroId: m.id,
        clienteId: m.cliente_id,
        nome: m.nome,
        parentesco: String(m.vinculo ?? m.papel ?? "não informado"),
        dependente,
        contratante: texto.includes("contratante"),
        titular,
        requerente: titular,
        cpf,
        temCpf: Boolean(cpf),
      };
    });

    if (!data.confirmar) return { simulado: true, plano };

    let criados = 0;
    for (const item of plano) {
      const { error } = await supabase.from("case_members").insert({
        organization_id: organizationId,
        case_id: data.caseId,
        cliente_id: item.clienteId,
        nome: item.nome,
        parentesco: item.parentesco,
        dependente: item.dependente,
        contratante: item.contratante,
        titular: item.titular,
        requerente: item.requerente,
        cpf: item.cpf,
        status_cadastral: item.temCpf ? "completo" : "pendente",
        fonte_origem_dado: "sincronizado_de_nucleo_membros",
      });
      if (error) throw new Error(`Membro do caso (${item.nome}): ${error.message}`);
      criados++;
    }

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "case_members",
      entidade_id: data.caseId,
      acao: "membros_sincronizados_de_nucleo",
      user_id: context.userId as string,
      metadados: { case_id: data.caseId, plano, criados },
    });

    if (criados > 0) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: "Membros do caso sincronizados a partir do núcleo",
        summaryInternal: `${criados} membro(s) criado(s) em case_members a partir de nucleo_membros.`,
        sourceEntityType: "case_members",
        sourceEntityId: data.caseId,
        userId: context.userId as string,
      });
    }

    return { simulado: false, plano, criados };
  });

/**
 * Corte R2 (de-para-pessoa-unificada.md / auditoria de reconciliação,
 * 21/09/2026): `sincronizarMembrosDoCaso` (acima) só cria membros que
 * faltam em `case_members` — nunca revisita um membro já vinculado a
 * `cliente_id` para conferir se o CPF ainda bate com o cadastro canônico
 * (`clientes.cpf`). Mesmo padrão de `sincronizarPessoaDoCaso`
 * (contratos.functions.ts): só preenche o que está vazio; um CPF já
 * gravado que diverge nunca é sobrescrito automaticamente — vira
 * `conflito`, para decisão humana. Mesma guarda "dependente nunca herda
 * documento do responsável" (achado real do Felipe, caso Ana Luiza).
 */
export const conferirDivergenciaCpfMembrosCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { caseId: string; confirmar?: boolean; resolverMembroId?: string; motivo?: string }) => {
      // Resolver um conflito é sobrescrever um CPF já gravado: só com motivo
      // explícito de quem decidiu (confirmação humana, nunca automática).
      if (data.resolverMembroId && !(data.motivo ?? "").trim()) {
        throw new Error("Resolver conflito de CPF exige o motivo da decisão.");
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: membros } = await supabase
      .from("case_members")
      .select("id,nome,cpf,cliente_id,dependente")
      .eq("case_id", data.caseId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .not("cliente_id", "is", null);

    const membrosLinha = (membros ?? []) as Linha[];
    const clienteIds = Array.from(new Set(membrosLinha.map((m) => m.cliente_id).filter(Boolean)));
    const { data: clientesRaw } = clienteIds.length
      ? await supabase.from("clientes").select("id,cpf").eq("organization_id", organizationId).in("id", clienteIds)
      : { data: [] };
    const clientePorId = new Map(((clientesRaw ?? []) as Linha[]).map((c) => [c.id, c]));

    // Regra única (pessoa-vinculo.ts) — a mesma que o sinal da Pessoa 360 usa.
    const plano = membrosLinha.map((m) => {
      const cliente = clientePorId.get(m.cliente_id as string);
      const acao = estadoCpfMembroCaso(m, cliente?.cpf ?? null);
      if (acao === "conflito") {
        return { membroId: m.id, nome: m.nome, acao, atual: m.cpf, canonico: cliente?.cpf as string };
      }
      if (acao === "preencher") return { membroId: m.id, nome: m.nome, acao, cpf: cliente?.cpf as string };
      return { membroId: m.id, nome: m.nome, acao };
    });

    if (data.resolverMembroId) {
      const alvo = plano.find((p) => p.membroId === data.resolverMembroId);
      if (!alvo || alvo.acao !== "conflito") {
        throw new Error("Este membro não está em conflito de CPF com o cadastro canônico — nada a resolver.");
      }
      const canonico = (alvo as { canonico: string }).canonico;
      const r = await gravarComVerificacao({
        supabase,
        tabela: "case_members",
        id: alvo.membroId,
        organizationId,
        userId,
        payload: { cpf: canonico },
      });
      await supabase.from("audit_logs").insert({
        organization_id: organizationId,
        entidade: "case_members",
        entidade_id: alvo.membroId,
        acao: "cpf_conflito_resolvido_pelo_canonico",
        user_id: userId,
        valores_anteriores: { cpf: (alvo as { atual: string }).atual },
        valores_posteriores: { cpf: canonico },
        metadados: { case_id: data.caseId, motivo: data.motivo?.trim() },
      });
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: `CPF de ${alvo.nome} alinhado ao cadastro canônico`,
        summaryInternal: `Conflito resolvido por decisão humana — ${data.motivo?.trim()}`,
        sourceEntityType: "case_members",
        sourceEntityId: alvo.membroId,
        userId,
      });
      return { simulado: false, plano, atualizados: 1, resolvido: alvo.membroId, salvoEm: r.salvoEm };
    }

    if (!data.confirmar) return { simulado: true, plano };

    let atualizados = 0;
    for (const item of plano) {
      if (item.acao !== "preencher") continue;
      // Grava, relê e compara — nunca devolve sucesso sem confirmar a linha.
      await gravarComVerificacao({
        supabase,
        tabela: "case_members",
        id: item.membroId,
        organizationId,
        userId,
        payload: { cpf: (item as { cpf: string }).cpf, status_cadastral: "completo" },
      });
      atualizados++;
    }

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "case_members",
      entidade_id: data.caseId,
      acao: "cpf_conferido_contra_cadastro_canonico",
      user_id: userId,
      metadados: { case_id: data.caseId, plano, atualizados },
    });

    if (atualizados > 0) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: "CPF de membro(s) do caso preenchido a partir do cadastro canônico",
        summaryInternal: `${atualizados} membro(s) tiveram CPF preenchido a partir de clientes.cpf.`,
        sourceEntityType: "case_members",
        sourceEntityId: data.caseId,
        userId,
      });
    }

    return { simulado: false, plano, atualizados };
  });

/**
 * P28 (26/09/2026) — mesmo padrão de `conferirDivergenciaCpfMembrosCaso`
 * acima, para telefone (gap declarado em `mascaras-e-validadores.md` §3.2:
 * 5 grafias, "Ação futura: Consolidar em Pessoa"). Só preenche telefone
 * vazio a partir de `clientes.telefone`; um valor já gravado que diverge
 * nunca é sobrescrito — vira conflito, para decisão humana.
 */
export const conferirDivergenciaTelefoneMembrosCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { caseId: string; confirmar?: boolean; resolverMembroId?: string; motivo?: string }) => {
      if (data.resolverMembroId && !(data.motivo ?? "").trim()) {
        throw new Error("Resolver conflito de telefone exige o motivo da decisão.");
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: membros } = await supabase
      .from("case_members")
      .select("id,nome,telefone,cliente_id,dependente")
      .eq("case_id", data.caseId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .not("cliente_id", "is", null);

    const membrosLinha = (membros ?? []) as Linha[];
    const clienteIds = Array.from(new Set(membrosLinha.map((m) => m.cliente_id).filter(Boolean)));
    const { data: clientesRaw } = clienteIds.length
      ? await supabase.from("clientes").select("id,telefone").eq("organization_id", organizationId).in("id", clienteIds)
      : { data: [] };
    const clientePorId = new Map(((clientesRaw ?? []) as Linha[]).map((c) => [c.id, c]));

    const plano = membrosLinha.map((m) => {
      const cliente = clientePorId.get(m.cliente_id as string);
      const acao = estadoTelefoneMembroCaso(m, cliente?.telefone ?? null);
      if (acao === "conflito") {
        return { membroId: m.id, nome: m.nome, acao, atual: m.telefone, canonico: cliente?.telefone as string };
      }
      if (acao === "preencher") return { membroId: m.id, nome: m.nome, acao, telefone: cliente?.telefone as string };
      return { membroId: m.id, nome: m.nome, acao };
    });

    if (data.resolverMembroId) {
      const alvo = plano.find((p) => p.membroId === data.resolverMembroId);
      if (!alvo || alvo.acao !== "conflito") {
        throw new Error("Este membro não está em conflito de telefone com o cadastro canônico — nada a resolver.");
      }
      const canonico = (alvo as { canonico: string }).canonico;
      const r = await gravarComVerificacao({
        supabase,
        tabela: "case_members",
        id: alvo.membroId,
        organizationId,
        userId,
        payload: { telefone: canonico },
      });
      await supabase.from("audit_logs").insert({
        organization_id: organizationId,
        entidade: "case_members",
        entidade_id: alvo.membroId,
        acao: "telefone_conflito_resolvido_pelo_canonico",
        user_id: userId,
        valores_anteriores: { telefone: (alvo as { atual: string }).atual },
        valores_posteriores: { telefone: canonico },
        metadados: { case_id: data.caseId, motivo: data.motivo?.trim() },
      });
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: `Telefone de ${alvo.nome} alinhado ao cadastro canônico`,
        summaryInternal: `Conflito resolvido por decisão humana — ${data.motivo?.trim()}`,
        sourceEntityType: "case_members",
        sourceEntityId: alvo.membroId,
        userId,
      });
      return { simulado: false, plano, atualizados: 1, resolvido: alvo.membroId, salvoEm: r.salvoEm };
    }

    if (!data.confirmar) return { simulado: true, plano };

    let atualizados = 0;
    for (const item of plano) {
      if (item.acao !== "preencher") continue;
      await gravarComVerificacao({
        supabase,
        tabela: "case_members",
        id: item.membroId,
        organizationId,
        userId,
        payload: { telefone: (item as { telefone: string }).telefone },
      });
      atualizados++;
    }

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "case_members",
      entidade_id: data.caseId,
      acao: "telefone_conferido_contra_cadastro_canonico",
      user_id: userId,
      metadados: { case_id: data.caseId, plano, atualizados },
    });

    if (atualizados > 0) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: "Telefone de membro(s) do caso preenchido a partir do cadastro canônico",
        summaryInternal: `${atualizados} membro(s) tiveram telefone preenchido a partir de clientes.telefone.`,
        sourceEntityType: "case_members",
        sourceEntityId: data.caseId,
        userId,
      });
    }

    return { simulado: false, plano, atualizados };
  });

/**
 * P31 (26/09/2026) — mesmo padrão de `conferirDivergenciaCpfMembrosCaso`/
 * `conferirDivergenciaTelefoneMembrosCaso` acima, para CEP (pedido direto
 * da Proprietária: unificar em vez de conferir o mesmo dado em 3 lugares).
 * Só preenche CEP vazio a partir de `clientes.endereco_cep`; um valor já
 * gravado que diverge nunca é sobrescrito — vira conflito, para decisão
 * humana.
 */
export const conferirDivergenciaCepMembrosCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { caseId: string; confirmar?: boolean; resolverMembroId?: string; motivo?: string }) => {
      if (data.resolverMembroId && !(data.motivo ?? "").trim()) {
        throw new Error("Resolver conflito de CEP exige o motivo da decisão.");
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: membros } = await supabase
      .from("case_members")
      .select("id,nome,cep,cliente_id,dependente")
      .eq("case_id", data.caseId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .not("cliente_id", "is", null);

    const membrosLinha = (membros ?? []) as Linha[];
    const clienteIds = Array.from(new Set(membrosLinha.map((m) => m.cliente_id).filter(Boolean)));
    const { data: clientesRaw } = clienteIds.length
      ? await supabase.from("clientes").select("id,endereco_cep").eq("organization_id", organizationId).in("id", clienteIds)
      : { data: [] };
    const clientePorId = new Map(((clientesRaw ?? []) as Linha[]).map((c) => [c.id, c]));

    const plano = membrosLinha.map((m) => {
      const cliente = clientePorId.get(m.cliente_id as string);
      const acao = estadoCepMembroCaso(m, cliente?.endereco_cep ?? null);
      if (acao === "conflito") {
        return { membroId: m.id, nome: m.nome, acao, atual: m.cep, canonico: cliente?.endereco_cep as string };
      }
      if (acao === "preencher") return { membroId: m.id, nome: m.nome, acao, cep: cliente?.endereco_cep as string };
      return { membroId: m.id, nome: m.nome, acao };
    });

    if (data.resolverMembroId) {
      const alvo = plano.find((p) => p.membroId === data.resolverMembroId);
      if (!alvo || alvo.acao !== "conflito") {
        throw new Error("Este membro não está em conflito de CEP com o cadastro canônico — nada a resolver.");
      }
      const canonico = (alvo as { canonico: string }).canonico;
      const r = await gravarComVerificacao({
        supabase,
        tabela: "case_members",
        id: alvo.membroId,
        organizationId,
        userId,
        payload: { cep: canonico },
      });
      await supabase.from("audit_logs").insert({
        organization_id: organizationId,
        entidade: "case_members",
        entidade_id: alvo.membroId,
        acao: "cep_conflito_resolvido_pelo_canonico",
        user_id: userId,
        valores_anteriores: { cep: (alvo as { atual: string }).atual },
        valores_posteriores: { cep: canonico },
        metadados: { case_id: data.caseId, motivo: data.motivo?.trim() },
      });
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: `CEP de ${alvo.nome} alinhado ao cadastro canônico`,
        summaryInternal: `Conflito resolvido por decisão humana — ${data.motivo?.trim()}`,
        sourceEntityType: "case_members",
        sourceEntityId: alvo.membroId,
        userId,
      });
      return { simulado: false, plano, atualizados: 1, resolvido: alvo.membroId, salvoEm: r.salvoEm };
    }

    if (!data.confirmar) return { simulado: true, plano };

    let atualizados = 0;
    for (const item of plano) {
      if (item.acao !== "preencher") continue;
      await gravarComVerificacao({
        supabase,
        tabela: "case_members",
        id: item.membroId,
        organizationId,
        userId,
        payload: { cep: (item as { cep: string }).cep },
      });
      atualizados++;
    }

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "case_members",
      entidade_id: data.caseId,
      acao: "cep_conferido_contra_cadastro_canonico",
      user_id: userId,
      metadados: { case_id: data.caseId, plano, atualizados },
    });

    if (atualizados > 0) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: "CEP de membro(s) do caso preenchido a partir do cadastro canônico",
        summaryInternal: `${atualizados} membro(s) tiveram CEP preenchido a partir de clientes.endereco_cep.`,
        sourceEntityType: "case_members",
        sourceEntityId: data.caseId,
        userId,
      });
    }

    return { simulado: false, plano, atualizados };
  });

/**
 * P32 (26/09/2026) — mesmo padrão de `conferirDivergenciaCpfMembrosCaso`/
 * `conferirDivergenciaTelefoneMembrosCaso`/`conferirDivergenciaCepMembrosCaso`,
 * mas genérico por campo — cobre os 6 campos civis que a auditoria confirmou
 * duplicados sem reconciliação (email, RG, nacionalidade, data de nascimento,
 * profissão, estado civil). Um único escritor em vez de 6 cópias quase
 * idênticas — pedido direto: "algo simples... sem forms infinitos".
 */
export const conferirDivergenciaCampoCivilMembrosCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      campo: CampoCivilReconciliavel;
      confirmar?: boolean;
      resolverMembroId?: string;
      motivo?: string;
    }) => {
      if (!CAMPOS_CIVIS_RECONCILIAVEIS.includes(data.campo)) {
        throw new Error("CAMPO_NAO_RECONCILIAVEL: campo civil desconhecido.");
      }
      if (data.resolverMembroId && !(data.motivo ?? "").trim()) {
        throw new Error(`Resolver conflito de ${ROTULO_CAMPO_CIVIL[data.campo]} exige o motivo da decisão.`);
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const campo = data.campo;
    const colunaMembro = COLUNA_MEMBRO_CIVIL[campo];
    const colunaCliente = COLUNA_CLIENTE_CIVIL[campo];
    const rotulo = ROTULO_CAMPO_CIVIL[campo];

    const { data: membros } = await supabase
      .from("case_members")
      .select(`id,nome,${colunaMembro},cliente_id,dependente`)
      .eq("case_id", data.caseId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .not("cliente_id", "is", null);

    const membrosLinha = (membros ?? []) as Linha[];
    const clienteIds = Array.from(new Set(membrosLinha.map((m) => m.cliente_id).filter(Boolean)));
    const { data: clientesRaw } = clienteIds.length
      ? await supabase.from("clientes").select(`id,${colunaCliente}`).eq("organization_id", organizationId).in("id", clienteIds)
      : { data: [] };
    const clientePorId = new Map(((clientesRaw ?? []) as Linha[]).map((c) => [c.id, c]));

    const plano = membrosLinha.map((m) => {
      const cliente = clientePorId.get(m.cliente_id as string);
      const valorCanonico = cliente?.[colunaCliente] ?? null;
      const acao = estadoCampoCivilMembroCaso(campo, { valor: m[colunaMembro], dependente: m.dependente }, valorCanonico);
      if (acao === "conflito") {
        return { membroId: m.id, nome: m.nome, acao, atual: m[colunaMembro], canonico: valorCanonico as string };
      }
      if (acao === "preencher") return { membroId: m.id, nome: m.nome, acao, valor: valorCanonico as string };
      return { membroId: m.id, nome: m.nome, acao };
    });

    if (data.resolverMembroId) {
      const alvo = plano.find((p) => p.membroId === data.resolverMembroId);
      if (!alvo || alvo.acao !== "conflito") {
        throw new Error(`Este membro não está em conflito de ${rotulo} com o cadastro canônico — nada a resolver.`);
      }
      const canonico = (alvo as { canonico: string }).canonico;
      const r = await gravarComVerificacao({
        supabase,
        tabela: "case_members",
        id: alvo.membroId,
        organizationId,
        userId,
        payload: { [colunaMembro]: canonico },
      });
      await supabase.from("audit_logs").insert({
        organization_id: organizationId,
        entidade: "case_members",
        entidade_id: alvo.membroId,
        acao: `${campo}_conflito_resolvido_pelo_canonico`,
        user_id: userId,
        valores_anteriores: { [colunaMembro]: (alvo as { atual: string }).atual },
        valores_posteriores: { [colunaMembro]: canonico },
        metadados: { case_id: data.caseId, motivo: data.motivo?.trim() },
      });
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: `${rotulo} de ${alvo.nome} alinhado ao cadastro canônico`,
        summaryInternal: `Conflito resolvido por decisão humana — ${data.motivo?.trim()}`,
        sourceEntityType: "case_members",
        sourceEntityId: alvo.membroId,
        userId,
      });
      return { simulado: false, plano, atualizados: 1, resolvido: alvo.membroId, salvoEm: r.salvoEm };
    }

    if (!data.confirmar) return { simulado: true, plano };

    let atualizados = 0;
    for (const item of plano) {
      if (item.acao !== "preencher") continue;
      await gravarComVerificacao({
        supabase,
        tabela: "case_members",
        id: item.membroId,
        organizationId,
        userId,
        payload: { [colunaMembro]: (item as { valor: string }).valor },
      });
      atualizados++;
    }

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "case_members",
      entidade_id: data.caseId,
      acao: `${campo}_conferido_contra_cadastro_canonico`,
      user_id: userId,
      metadados: { case_id: data.caseId, plano, atualizados },
    });

    if (atualizados > 0) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: `${rotulo} de membro(s) do caso preenchido a partir do cadastro canônico`,
        summaryInternal: `${atualizados} membro(s) tiveram ${rotulo.toLowerCase()} preenchido a partir de clientes.${colunaCliente}.`,
        sourceEntityType: "case_members",
        sourceEntityId: data.caseId,
        userId,
      });
    }

    return { simulado: false, plano, atualizados };
  });


export const carregarMapaEtiquetas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const [taxonomia, aplicadas] = await Promise.all([
      supabase.from("label_taxonomy").select("*").eq("organization_id", organizationId).order("sort_order"),
      supabase.from("entity_labels").select("label_id").eq("organization_id", organizationId).is("removed_at", null),
    ]);
    const uso = new Map<string, number>();
    for (const a of linhas<Linha>(aplicadas, "etiquetas aplicadas")) uso.set(a.label_id, (uso.get(a.label_id) ?? 0) + 1);
    return {
      taxonomia: linhas<Linha>(taxonomia, "taxonomia de etiquetas").map((l) => ({ ...l, aplicacoes: uso.get(l.id) ?? 0 })),
    };
  });

/**
 * §5 do "Prompt de Implantação — Política Unificada de Casos Familiares"
 * (21/09/2026): o grupo familiar/WhatsApp é um canal de coordenação
 * humana, não um banco de dados nem uma automação. Estas três funções só
 * REGISTRAM a existência/propósito/status de um grupo no Caso 360 —
 * nunca criam nem integram nada no WhatsApp real. "A criação externa é
 * feita pela proprietária quando decidir" (texto do documento-fonte).
 */
export const listarGruposComunicacaoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const { data: grupos, error } = await supabase
      .from("case_grupos_comunicacao")
      .select("id,canal,nome_grupo,referencia_externa,proposito,status,contato_principal_membro_id,created_at,activated_at,archived_at")
      .eq("case_id", data.caseId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { grupos: linhas<Linha>(grupos, "grupos de comunicação do caso") };
  });

export const registrarGrupoComunicacaoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      canal?: string;
      nomeGrupo?: string;
      proposito: string;
      contatoPrincipalMembroId?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    if (!data.proposito.trim()) throw new Error("Informe o propósito do grupo antes de registrar.");

    const inserido = await inserirComVerificacao({
      supabase,
      tabela: "case_grupos_comunicacao",
      organizationId,
      userId: context.userId as string,
      payload: {
        case_id: data.caseId,
        canal: data.canal ?? "whatsapp",
        nome_grupo: data.nomeGrupo ?? null,
        proposito: data.proposito.trim(),
        contato_principal_membro_id: data.contatoPrincipalMembroId ?? null,
      },
    });

    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Grupo de comunicação registrado",
      summaryInternal: data.proposito.trim(),
      sourceEntityType: "case_grupos_comunicacao",
      sourceEntityId: inserido.id,
      userId: context.userId as string,
    });

    return { ok: true, id: inserido.id };
  });

export const atualizarGrupoComunicacaoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      caseId: string;
      status?: "planejado" | "ativo" | "arquivado";
      referenciaExterna?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const payload: Record<string, unknown> = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.referenciaExterna !== undefined) payload.referencia_externa = data.referenciaExterna;

    const r = await gravarComVerificacao({
      supabase,
      tabela: "case_grupos_comunicacao",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload,
    });

    if (data.status) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: data.caseId,
        eventType: "caso",
        title: `Grupo de comunicação: status atualizado para ${data.status}`,
        sourceEntityType: "case_grupos_comunicacao",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }

    return { ok: true, salvoEm: r.salvoEm };
  });
