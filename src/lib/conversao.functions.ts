import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { semFixtures, ehFixtureLinha } from "@/lib/fixtures";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, type Linha } from "@/lib/caso-canonico.server";
import { EVENTO_DO_ESTADO, validarTransicaoAceite, type EstadoAceite } from "@/lib/conversao";
import { validarTransicaoEvento } from "@/lib/conversao-funil";
import { gravarComVerificacao } from "@/lib/persistencia.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Conversão, marketing e Painel Hoje. Nenhuma ação externa é disparada aqui. */

const seguro = async (p: any) => {
  try {
    const r = await p;
    return (r?.data ?? []) as Linha[];
  } catch {
    return [] as Linha[];
  }
};

export const carregarConversao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data?: { incluirDemo?: boolean }) => ({ incluirDemo: data?.incluirDemo === true }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [eventosBrutos, investimentos, campanhas, fontes, atribuicoes, leads, casos] = await Promise.all([
      seguro(eq("conversion_events").order("occurred_at", { ascending: false }).limit(2000)),
      seguro(eq("marketing_investments").is("archived_at", null).order("competencia", { ascending: false })),
      seguro(eq("marketing_campaigns").is("archived_at", null).order("nome")),
      seguro(eq("lead_sources").is("archived_at", null).order("nome")),
      seguro(eq("attribution_records").is("archived_at", null).limit(500)),
      seguro(eq("leads").is("archived_at", null).limit(1000)),
      seguro(eq("crm_casos").is("archived_at", null).limit(1000)),
    ]);

    // Demonstração fica fora do recorte padrão; só entra com inclusão explícita.
    const leadsDemo = new Set(leads.filter((l: any) => ehFixtureLinha(l as never)).map((l: any) => String(l.id)));
    const casosDemo = new Set(casos.filter((c: any) => ehFixtureLinha(c as never)).map((c: any) => String(c.id)));
    const eventoEhDemo = (e: any) =>
      e.is_demo === true ||
      (e.lead_id ? leadsDemo.has(String(e.lead_id)) : false) ||
      (e.case_id ? casosDemo.has(String(e.case_id)) : false);

    const eventos = (eventosBrutos as any[]).map((e) => ({
      id: e.id,
      event_type: e.event_type,
      lead_id: e.lead_id ?? null,
      case_id: e.case_id ?? null,
      cliente_id: e.cliente_id ?? null,
      occurred_at: e.occurred_at,
      recorded_at: e.recorded_at ?? e.created_at ?? null,
      recorded_by: e.recorded_by ?? e.created_by ?? null,
      responsavel: e.responsavel ?? null,
      responsavel_id: e.responsavel_id ?? null,
      origem: e.origem ?? null,
      canal: e.canal ?? null,
      evidencia_referencia: e.evidencia_referencia ?? null,
      observacao: e.observacao ?? null,
      is_demo: eventoEhDemo(e),
    }));

    const rotulos = {
      leads: (leads as any[]).map((l) => ({
        id: String(l.id),
        rotulo: (l.nome as string) || (l.codigo as string) || String(l.id),
        origem: l.origem ?? null,
        canal: l.canal ?? null,
        estagio: l.estagio ?? null,
        proxima_acao: l.proxima_acao ?? null,
        proxima_acao_em: l.proxima_acao_em ?? null,
        responsavel: l.responsavel ?? l.responsavel_nome ?? null,
        is_demo: leadsDemo.has(String(l.id)),
      })),
      casos: (casos as any[]).map((c) => ({
        id: String(c.id),
        rotulo: (c.titulo as string) || (c.codigo as string) || String(c.id),
        responsavel: c.responsavel_principal ?? null,
        proxima_acao: c.proxima_acao_codigo ?? c.proxima_acao ?? null,
        proxima_acao_em: c.prazo_proxima_acao ?? null,
        is_demo: casosDemo.has(String(c.id)),
      })),
    };

    const eventosVisiveis = data.incluirDemo ? eventos : eventos.filter((e) => !e.is_demo);
    return {
      incluirDemo: data.incluirDemo,
      eventos: eventosVisiveis,
      eventosOcultos: eventos.length - eventosVisiveis.length,
      rotulos,
      leadsDemoRotulos: rotulos.leads.filter((l) => l.is_demo).map((l) => l.rotulo),
      investimentos,
      campanhas,
      fontes,
      atribuicoes,
      leads: semFixtures(leads as never),
      leadsTodos: leads,
      casos: semFixtures(casos as never),
    };
  });


export const registrarEventoConversao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      event_type: string;
      lead_id?: string | null;
      case_id?: string | null;
      cliente_id?: string | null;
      occurred_at?: string;
      responsavel?: string | null;
      origem?: string | null;
      canal?: string | null;
      campaign_id?: string | null;
      lead_source_id?: string | null;
      evidencia_referencia?: string | null;
      observacao?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    // Máquina de estados no servidor: nenhuma chamada direta salta etapa obrigatória.
    if (!data.lead_id && !data.case_id) throw new Error("Evento exige vínculo com lead ou caso.");
    const anteriores = await seguro(
      supabase
        .from("conversion_events")
        .select("event_type")
        .eq("organization_id", organizationId)
        .or(data.case_id ? `case_id.eq.${data.case_id}` : `lead_id.eq.${data.lead_id}`),
    );
    const transicao = validarTransicaoEvento(
      data.event_type,
      anteriores.map((e: any) => String(e.event_type)),
    );
    if (!transicao.permitido) throw new Error(transicao.motivos.join(" "));

    const { error } = await supabase.from("conversion_events").insert({
      event_type: data.event_type,
      responsavel: data.responsavel ?? null,
      origem: data.origem ?? null,
      canal: data.canal ?? null,
      evidencia_referencia: data.evidencia_referencia ?? null,
      observacao: data.observacao ?? null,
      lead_id: data.lead_id || null,
      case_id: data.case_id || null,
      cliente_id: data.cliente_id || null,
      campaign_id: data.campaign_id || null,
      lead_source_id: data.lead_source_id || null,
      occurred_at: data.occurred_at ? new Date(data.occurred_at).toISOString() : new Date().toISOString(),
      organization_id: organizationId,
      responsavel_id: context.userId,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Avança o estado de aceite do caso aplicando a regra padrão e gerando evento imutável. */
export const avancarEstadoAceite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; destino: EstadoAceite; observacao?: string; evidencia?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: caso, error: erroCaso } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (erroCaso || !caso) throw new Error("Caso não encontrado nesta organização.");

    const [nucleos, onboarding] = await Promise.all([
      seguro(supabase.from("nucleos_familiares").select("id").eq("case_id", data.caseId).is("archived_at", null)),
      seguro(supabase.from("onboarding_checklist").select("*").eq("case_id", data.caseId)),
    ]);
    const obrigatorios = onboarding.filter((o) => o.obrigatorio !== false);
    const validacao = validarTransicaoAceite(data.destino, {
      confirmacaoFormalRecebida:
        Boolean(caso.data_confirmacao_formal_proposta) ||
        ["confirmacao_formal_recebida", "formalizacao_em_preparacao", "contrato_enviado", "contrato_assinado", "pagamento_inicial_confirmado", "onboarding_iniciado", "caso_ativo"].includes(
          String(caso.eixo_comercial ?? caso.eixo_formalizacao ?? ""),
        ),
      contratoAssinado: Boolean(caso.contrato_assinado),
      pagamentoInicialConfirmado: Boolean(caso.pagamento_confirmado),
      onboardingMinimoConcluido: obrigatorios.length > 0 && obrigatorios.every((o) => Boolean(o.concluido_em ?? o.concluido)),
      temNucleoOuDossie: nucleos.length > 0,
      temResponsavel: Boolean(caso.responsavel_principal || caso.responsavel_id),
    });
    if (!validacao.permitido) {
      throw new Error(validacao.motivos.join(" "));
    }

    const campo = ["proposta_enviada", "aceite_verbal_confirmado", "confirmacao_formal_pendente", "confirmacao_formal_recebida"].includes(data.destino)
      ? "eixo_comercial"
      : "eixo_formalizacao";
    await gravarComVerificacao({
      supabase,
      tabela: "crm_casos",
      id: data.caseId,
      organizationId,
      userId: context.userId as string,
      payload: { [campo]: data.destino },
    });

    const evento = EVENTO_DO_ESTADO[data.destino];
    if (evento) {
      await supabase.from("conversion_events").insert({
        organization_id: organizationId,
        event_type: evento,
        case_id: data.caseId,
        cliente_id: caso.cliente_id ?? null,
        occurred_at: new Date().toISOString(),
        responsavel: caso.responsavel_principal ?? null,
        responsavel_id: context.userId,
        evidencia_referencia: data.evidencia ?? null,
        observacao: data.observacao ?? null,
        created_by: context.userId,
      });
    }
    return { ok: true, estado: data.destino };
  });

/** Painel Hoje: filas operacionais e sinais de risco, sem juízo de mérito. */
export const painelHoje = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);

    const [casos, entregas, nucleos, lotes, excecoes, eventos, investimentos, campanhas] = await Promise.all([
      seguro(eq("crm_casos").is("archived_at", null)),
      seguro(eq("client_deliverables").is("archived_at", null)),
      seguro(eq("nucleos_familiares").is("archived_at", null)),
      seguro(eq("import_batches").order("started_at", { ascending: false }).limit(30)),
      seguro(eq("migration_exceptions").eq("status", "aberta")),
      seguro(eq("conversion_events").order("occurred_at", { ascending: false }).limit(2000)),
      seguro(eq("marketing_investments").is("archived_at", null)),
      seguro(eq("marketing_campaigns").is("archived_at", null)),
    ]);

    const ultimaEntrega = new Map<string, number>();
    for (const e of entregas) {
      const t = new Date(e.updated_at ?? e.created_at).getTime();
      const atual = ultimaEntrega.get(e.case_id) ?? 0;
      if (t > atual) ultimaEntrega.set(e.case_id, t);
    }
    const comNucleo = new Set(nucleos.map((n) => n.case_id));
    const dias = (t?: number) => (t ? Math.floor((Date.now() - t) / 86400000) : null);

    // Fixtures de demonstração não entram em Painel Hoje, filas nem métricas.
    const casosOperacionais = semFixtures(casos as never);
    const resumo = casosOperacionais.map((c: any) => ({
      id: c.id as string,
      codigo: (c.codigo ?? c.id) as string,
      titulo: (c.titulo ?? c.codigo ?? "Caso") as string,
      eixo_comercial: c.eixo_comercial ?? null,
      eixo_formalizacao: c.eixo_formalizacao ?? null,
      responsavel: c.responsavel_principal ?? null,
      proxima_acao: c.proxima_acao_codigo ?? c.proxima_acao ?? null,
      prazo_proxima_acao: c.prazo_proxima_acao ?? null,
      diasSemAtualizacaoCliente: dias(ultimaEntrega.get(c.id)),
      temNucleoOuDossie: comNucleo.has(c.id),
    }));

    const filtro = (fn: (c: (typeof resumo)[number]) => boolean) => resumo.filter(fn);
    const hoje = Date.now();

    return {
      filas: {
        aceite_verbal_aguardando_formal: filtro((c) => c.eixo_comercial === "aceite_verbal_confirmado"),
        formal_aguardando_contrato: filtro(
          (c) => c.eixo_comercial === "confirmacao_formal_recebida" && !["contrato_enviado", "contrato_assinado", "pagamento_inicial_confirmado", "onboarding_iniciado", "caso_ativo"].includes(String(c.eixo_formalizacao)),
        ),
        contratos_aguardando_assinatura: filtro((c) => c.eixo_formalizacao === "contrato_enviado"),
        pagamentos_aguardados: filtro((c) => c.eixo_formalizacao === "contrato_assinado"),
        onboardings_bloqueados: filtro((c) => c.eixo_formalizacao === "onboarding_iniciado" && !c.temNucleoOuDossie),
        casos_sem_responsavel: filtro((c) => !c.responsavel),
        casos_sem_proxima_acao: filtro((c) => !c.proxima_acao),
        casos_sem_dossie: filtro((c) => !c.temNucleoOuDossie),
        sem_atualizacao_10: filtro((c) => (c.diasSemAtualizacaoCliente ?? 999) >= 10 && (c.diasSemAtualizacaoCliente ?? 999) < 14),
        sem_atualizacao_14: filtro((c) => (c.diasSemAtualizacaoCliente ?? 999) >= 14),
        followups_vencidos: filtro((c) => Boolean(c.prazo_proxima_acao) && new Date(c.prazo_proxima_acao).getTime() < hoje),
      },
      importacoes: {
        comErro: lotes.filter((l) => (l.rejected_records ?? 0) > 0 || l.status === "concluido_com_erros"),
        duplicidades: lotes.filter((l) => (l.duplicated_records ?? 0) > 0),
        excecoesAbertas: excecoes.length,
      },
      eventos,
      investimentos,
      campanhas,
      totalCasos: casosOperacionais.length,
    };
  });

/** Materializa o template padrão de onboarding (reutilizável por todos os casos). */
export const garantirTemplateOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { CHECKLIST_ONBOARDING, TEMPLATE_ONBOARDING_CODIGO, TEMPLATE_ONBOARDING_VERSAO } = await import("@/lib/onboarding-padrao");
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: existente } = await supabase
      .from("onboarding_templates")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("codigo", TEMPLATE_ONBOARDING_CODIGO)
      .eq("versao", TEMPLATE_ONBOARDING_VERSAO)
      .maybeSingle();

    let templateId = existente?.id as string | undefined;
    if (!templateId) {
      const { data, error } = await supabase
        .from("onboarding_templates")
        .insert({
          organization_id: organizationId,
          codigo: TEMPLATE_ONBOARDING_CODIGO,
          versao: TEMPLATE_ONBOARDING_VERSAO,
          nome: "Onboarding padrão Clube Ancestral",
          descricao: "Seis fases, checklist obrigatório e regra de valor percebido (D7 e 14 dias).",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      templateId = data.id as string;
    }

    const { data: itens } = await supabase.from("onboarding_template_items").select("item").eq("template_id", templateId);
    const existentes = new Set(((itens ?? []) as Linha[]).map((i) => String(i.item)));
    const novos = CHECKLIST_ONBOARDING.filter((i) => !existentes.has(i.item)).map((i) => ({
      organization_id: organizationId,
      template_id: templateId,
      fase: i.fase,
      ordem: i.ordem,
      item: i.item,
      descricao: i.descricao,
      obrigatorio: i.obrigatorio,
      prazo_dias: i.prazo_dias,
    }));
    if (novos.length) {
      const { error } = await supabase.from("onboarding_template_items").insert(novos);
      if (error) throw new Error(error.message);
    }
    return { templateId, itensCriados: novos.length };
  });
