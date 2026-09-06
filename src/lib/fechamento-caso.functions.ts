import { semCache } from "@/lib/no-store";
import { linhas } from "@/lib/linhas";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoOps, exigirEscrita, type Sb } from "@/lib/ops.server";
import { avaliarFechamento, DEFINICOES_FECHAMENTO, type GateFechamento } from "@/lib/fechamento-caso";
import { calcularCadencia } from "@/lib/jornada-cliente";
import { perfilInstitucionalRenderizado } from "@/lib/perfil-institucional";

/* eslint-disable @typescript-eslint/no-explicit-any */

const hojeISO = () => new Date().toISOString();
const DIA = 86_400_000;

/** Tela de fechamento: nove gates derivados do banco, com bloqueios e próxima ação. */
export const carregarFechamentoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);

    const { data: caso, error } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.casoId)
      .eq("organization_id", ctx.organizationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!caso) throw new Error("Caso não encontrado.");
    const c = caso as any;

    const [checklist, contratos, faturas, nucleos, consentimentos, planos, tarefasAbertas, servicos, entregas, alertasCriticos] =
      await Promise.all([
        supabase.from("checklist_cadastral").select("status,obrigatorio").eq("case_id", data.casoId).is("archived_at", null),
        supabase.from("contracts").select("id,status,signed_at,signature_reference").eq("case_id", data.casoId).is("archived_at", null),
        supabase.from("invoices").select("id,status,paga_em,valor_pago,referencia_externa").eq("case_id", data.casoId).is("archived_at", null),
        supabase.from("nucleos_familiares").select("id,ambiente,nivel_acesso,dossie_mae").eq("case_id", data.casoId).is("archived_at", null),
        supabase.from("consent_records").select("id,status,tipo_consentimento,escopo_compartilhamento").eq("case_id", data.casoId).is("archived_at", null),
        supabase.from("onboarding_planos").select("id,estado,checklist_inicial,plano_acao,touchpoints").eq("case_id", data.casoId).is("archived_at", null),
        supabase.from("tarefas").select("id,titulo,status,tipo,prazo").eq("caso_id", data.casoId).is("archived_at", null).neq("status", "concluida").limit(50),
        supabase
          .from("case_services")
          .select("id,product_catalog_id,product_catalog:product_catalog_id(estado_catalogo)")
          .eq("case_id", data.casoId)
          .is("archived_at", null),
        supabase.from("client_deliverables").select("approval_status").eq("case_id", data.casoId).is("archived_at", null),
        supabase
          .from("case_alerts")
          .select("id", { count: "exact", head: true })
          .eq("case_id", data.casoId)
          .eq("criticidade", "critico")
          .eq("status", "pending"),
      ]);

    const itens = linhas<any>(checklist, "checklist de cadastro do caso");
    const obrigatorios = itens.filter((i) => i.obrigatorio !== false);
    const pendentesCadastro = obrigatorios.filter((i) => i.status !== "validado" && i.status !== "conferido").length;

    const contratosLista = linhas<any>(contratos, "contratos do caso");
    const faturasLista = linhas<any>(faturas, "faturas do caso");
    const contratoAssinado = !!c.contrato_assinado || contratosLista.some((k: any) => !!k.signed_at || k.status === "assinado");
    const contratoPreparado = contratosLista.length > 0;
    const contratoEnviado =
      contratoPreparado && ["enviado", "aguardando_assinatura", "assinado"].includes(String(contratosLista[0]?.status ?? ""));

    const cobrancaCriada = faturasLista.length > 0;
    const pagamentoConfirmado =
      !!c.pagamento_confirmado || faturasLista.some((f: any) => !!f.paga_em || f.status === "paga");

    const nucleosLista = linhas<any>(nucleos, "núcleos familiares do caso");
    const nucleoId = nucleosLista[0]?.id ?? null;
    let requerentes = false;
    if (nucleoId) {
      const { count } = await supabase
        .from("nucleo_membros")
        .select("id", { count: "exact", head: true })
        .eq("nucleo_id", nucleoId)
        .is("archived_at", null);
      requerentes = (count ?? 0) > 0;
    }

    const dossieMae = !!c.dossie_mae_referencia || nucleosLista.some((n) => !!n.dossie_mae);
    const ambienteDossie = nucleosLista.some((n) => !!n.ambiente && !!n.nivel_acesso) || !!c.link_origem_interna;

    const consentimentosLista = linhas<any>(consentimentos, "consentimentos do caso");
    const autorizacaoPesquisa = consentimentosLista.some(
      (k: any) => k.status === "ativo" && !!String(k.escopo_compartilhamento ?? "").trim(),
    );

    const plano = linhas<any>(planos, "planos de onboarding do caso")[0] as any | undefined;
    const onboardingIniciado = !!plano && plano.estado !== "bloqueado" && plano.estado !== "nao_iniciado";
    const onboardingMinimoConcluido =
      !!plano && ["concluido", "ativo", "em_execucao"].includes(String(plano.estado ?? "")) && !!plano.plano_acao;

    const servicosLista = linhas<any>(servicos, "serviços do caso");
    const produtoServicoReconciliado = servicosLista.some(
      (s) => !!s.product_catalog_id && s.product_catalog?.estado_catalogo === "homologado_ativo",
    );
    const entregasLista = linhas<any>(entregas, "entregas ao cliente do caso");
    const conteudoPortalPreparado = entregasLista.some(
      (d) => d.approval_status === "aprovado" || d.approval_status === "publicado",
    );
    const portalAcessoLiberado = c.app_access_status === "liberado";
    const semBloqueioCritico = (alertasCriticos.count ?? 0) === 0;

    const estado = {
      aceiteComercial: !!c.aceite_comercial_em || c.eixo_comercial === "proposta_aceita" || c.eixo_comercial === "formalizacao",
      cadastroCompleto: obrigatorios.length > 0 && pendentesCadastro === 0,
      contratoPreparado,
      contratoEnviado,
      contratoAssinado,
      cobrancaCriada,
      pagamentoInicialConfirmado: pagamentoConfirmado,
      dossieMae,
      ambienteDossie,
      nucleoFamiliar: nucleosLista.length > 0,
      requerentes,
      autorizacaoPesquisa,
      despesasTerceirosAprovadas: true,
      onboardingIniciado,
      onboardingMinimoConcluido,
      casoAtivo: c.ativacao_operacional === "ativo" || !!c.ativado_em,
      produtoServicoReconciliado,
      perfilInstitucionalVigente: perfilInstitucionalRenderizado().vigente,
      portalAcessoLiberado,
      conteudoPortalPreparado,
      semBloqueioCritico,
    };

    const fechamento = avaliarFechamento(estado);
    const cadencia = calcularCadencia({
      hoje: hojeISO(),
      ultimoTouchpointEm: c.ultimo_touchpoint_em ?? null,
      aguardandoInstituicaoExterna: !!c.aguardando_instituicao_externa,
      motivoEsperaExterna: c.motivo_espera_externa ?? null,
    });

    return {
      caso: {
        id: c.id,
        codigo: c.codigo,
        titulo: c.titulo,
        eixo_comercial: c.eixo_comercial,
        eixo_formalizacao: c.eixo_formalizacao,
        responsavel: c.responsavel_principal,
      },
      estado,
      fechamento,
      cadencia,
      evidencias: {
        cadastroPendentes: pendentesCadastro,
        cadastroTotal: obrigatorios.length,
        contratos: contratosLista.length,
        faturas: faturasLista.length,
        nucleos: nucleosLista.length,
        consentimentos: consentimentosLista.length,
      },
      tarefasAbertas: linhas<any>(tarefasAbertas, "tarefas abertas do caso"),
      podeEscrever: ctx.podeEscrever,
    };
  });

/** Abre a tarefa operacional correspondente ao gate pendente. Não avança o gate. */
export const abrirTarefaGate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; gate: GateFechamento; prazo?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);

    const def = DEFINICOES_FECHAMENTO.find((d) => d.chave === data.gate);
    if (!def) throw new Error("Gate desconhecido.");

    const { data: criada, error } = await supabase
      .from("tarefas")
      .insert({
        organization_id: ctx.organizationId,
        caso_id: data.casoId,
        titulo: `Fechamento — ${def.rotulo}`,
        descricao: `${def.acaoDesk}. Condição de avanço: ${def.condicaoAvanco}.`,
        tipo: data.gate === "cobranca" ? "financeiro" : data.gate === "pesquisa" ? "pesquisa" : "geral",
        status: "nao_iniciada",
        prioridade: "alta",
        prazo: data.prazo ?? null,
        responsavel_id: context.userId as string,
        created_by: context.userId as string,
        data_origin: "registro_humano",
      })
      .select("id,titulo,status")
      .single();
    if (error) throw new Error(error.message);
    return criada as Record<string, any>;
  });

/** Métricas diárias da jornada — uso interno do Desk. */
export const metricasJornada = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    const org = ctx.organizationId;

    const [casos, entregas, docs, tarefas] = await Promise.all([
      supabase
        .from("crm_casos")
        .select(
          "id,codigo,fase,responsavel_principal,ativado_em,app_access_status,pagamento_confirmado,ultimo_touchpoint_em,aguardando_instituicao_externa,motivo_espera_externa,created_at",
        )
        .eq("organization_id", org)
        .is("archived_at", null)
        .limit(500),
      supabase
        .from("client_deliverables")
        .select("id,case_id,approval_status,available_at,viewed_at,journey_phase,created_at")
        .eq("organization_id", org)
        .is("archived_at", null)
        .limit(1000),
      supabase
        .from("document_requests")
        .select("id,case_id,status,request_type,received_at")
        .eq("organization_id", org)
        .is("archived_at", null)
        .limit(1000),
      supabase
        .from("tarefas")
        .select("id,caso_id,status,responsavel_id,bloqueio,prazo")
        .eq("organization_id", org)
        .is("archived_at", null)
        .neq("status", "concluida")
        .limit(1000),
    ]);

    const listaCasos = linhas<any>(casos, "casos do painel de fechamento");
    const listaEntregas = linhas<any>(entregas, "entregas ao cliente do painel de fechamento");
    const hoje = hojeISO();

    const cadencias = listaCasos.map((c) => ({
      caso: c,
      cadencia: calcularCadencia({
        hoje,
        ultimoTouchpointEm: c.ultimo_touchpoint_em ?? c.created_at ?? null,
        aguardandoInstituicaoExterna: !!c.aguardando_instituicao_externa,
        motivoEsperaExterna: c.motivo_espera_externa ?? null,
      }),
    }));

    // Tempo entre pagamento/ativação e primeira micro-entrega visualizada.
    const temposPrimeiraEntrega: number[] = [];
    for (const c of listaCasos) {
      const base = c.ativado_em ?? null;
      if (!base) continue;
      const vistas = listaEntregas
        .filter((e) => e.case_id === c.id && !!e.viewed_at)
        .map((e) => Date.parse(e.viewed_at))
        .sort((a, b) => a - b);
      if (vistas.length && vistas[0] !== undefined) temposPrimeiraEntrega.push((vistas[0] - Date.parse(base)) / DIA);
    }
    const mediaDias = (v: number[]) => (v.length ? Number((v.reduce((s, n) => s + n, 0) / v.length).toFixed(1)) : null);

    const ativadosEm48h = listaCasos.filter(
      (c) => c.app_access_status === "ativo" && c.ativado_em && Date.now() - Date.parse(c.ativado_em) >= 0,
    ).length;

    const porFase: Record<string, number> = {};
    for (const c of listaCasos) porFase[String(c.fase ?? "sem_fase")] = (porFase[String(c.fase ?? "sem_fase")] ?? 0) + 1;

    const porResponsavel: Record<string, number> = {};
    const listaTarefas = linhas<any>(tarefas, "tarefas abertas do painel de fechamento");
    for (const t of listaTarefas) {
      const k = String(t.responsavel_id ?? "sem_responsavel");
      porResponsavel[k] = (porResponsavel[k] ?? 0) + 1;
    }

    return {
      atualizadoEm: hoje,
      casos: listaCasos.length,
      ativadosNoApp: ativadosEm48h,
      mediaDiasAtivacaoAteEntregaVisualizada: mediaDias(temposPrimeiraEntrega),
      mediaDiasSemTouchpoint: mediaDias(cadencias.map((c) => c.cadencia.diasSemTouchpoint)),
      casosAcimaDe14Dias: cadencias.filter((c) => c.cadencia.diasSemTouchpoint >= 14 && c.cadencia.status !== "regular").length,
      cadencia: {
        regular: cadencias.filter((c) => c.cadencia.status === "regular").length,
        atencao: cadencias.filter((c) => c.cadencia.status === "atencao").length,
        critico: cadencias.filter((c) => c.cadencia.status === "critico").length,
      },
      entregas: {
        aprovadas: listaEntregas.filter((e) => e.approval_status === "aprovado").length,
        publicadas: listaEntregas.filter((e) => e.approval_status === "publicado").length,
        visualizadas: listaEntregas.filter((e) => !!e.viewed_at).length,
      },
      documentosAguardandoCliente: linhas<any>(docs, "solicitações de documento do painel de fechamento").filter(
        (d) => !d.received_at && ["solicitado", "aguardando_cliente", "pendente"].includes(String(d.status ?? "")),
      ).length,
      bloqueiosInternos: listaTarefas.filter((t) => !!t.bloqueio).length,
      bloqueiosExternos: listaCasos.filter((c) => !!c.aguardando_instituicao_externa).length,
      casosPorFase: porFase,
      pendenciasPorResponsavel: porResponsavel,
    };
  });
