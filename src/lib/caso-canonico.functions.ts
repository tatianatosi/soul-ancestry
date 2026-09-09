import { semCache } from "@/lib/no-store";
import { linhas } from "@/lib/linhas";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, payloadServico, rascunhoDaAcao, type Linha } from "@/lib/caso-canonico.server";
import { mapaDaAcao } from "@/lib/caso-ficha";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Catálogos, serviços, etiquetas, alertas, comunicação e onboarding do caso. */
import { exigirGate } from "@/lib/escopo-conferencia.server";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { exigirProximaAcaoCompleta } from "@/lib/proxima-acao-regras";


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
    const feedPorCodigo = new Map<string, Linha>();
    for (const f of linhas<Linha>(catalogoPlanejador, "catálogo do planejador")) {
      feedPorCodigo.set(String(f.item_id), f);
      for (const alias of (f.legacy_aliases as string[] | null) ?? []) feedPorCodigo.set(String(alias), f);
    }
    const produtosComProdutoPai = linhas<Linha>(produtos, "catálogo de produtos").map((p) => {
      const f = feedPorCodigo.get(String(p.code));
      return {
        ...p,
        produto_pai: f?.product_parent ?? null,
        status_reconciliacao: f?.status_dictionary ?? null,
      };
    });

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
      return { id: data.id, salvoEm: r.salvoEm };
    }

    const r = await inserirComVerificacao({
      supabase,
      tabela: "case_services",
      organizationId,
      userId: context.userId as string,
      payload: { ...payload, case_id: data.caseId },
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
    const c = caso.data as Linha;
    // Completude obrigatória: responsável, prazo, público, visibilidade, canal
    // e aprovação humana quando o canal é externo (códigos específicos de erro).
    exigirProximaAcaoCompleta(c as Record<string, unknown>);


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
      await supabase.from("case_alerts").update(alertaPayload).eq("id", alertaExistente.id);
    } else {
      await supabase.from("case_alerts").insert(alertaPayload);
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
    return { ok: true };
  });

export const atualizarAlerta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "acknowledged") {
      patch["acknowledged_at"] = new Date().toISOString();
      patch["acknowledged_by"] = context.userId;
    }
    if (data.status === "completed") patch["completed_at"] = new Date().toISOString();
    const r = await gravarComVerificacao({
      supabase,
      tabela: "case_alerts",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { status: data.status },
      derivados: patch,
    });
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

    return { simulado: false, plano, criados };
  });

/** Taxonomia completa + mapa de equivalência com o Meta Agent (sem sincronizar). */
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
