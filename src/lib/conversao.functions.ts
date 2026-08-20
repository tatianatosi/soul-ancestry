import { createServerFn } from "@tanstack/react-start";
import { semFixtures } from "@/lib/fixtures";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, type Linha } from "@/lib/caso-canonico.server";
import { EVENTO_DO_ESTADO, validarTransicaoAceite, type EstadoAceite } from "@/lib/conversao";

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
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [eventos, investimentos, campanhas, fontes, atribuicoes] = await Promise.all([
      seguro(eq("conversion_events").order("occurred_at", { ascending: false }).limit(2000)),
      seguro(eq("marketing_investments").is("archived_at", null).order("competencia", { ascending: false })),
      seguro(eq("marketing_campaigns").is("archived_at", null).order("nome")),
      seguro(eq("lead_sources").is("archived_at", null).order("nome")),
      seguro(eq("attribution_records").is("archived_at", null).limit(500)),
    ]);
    return { eventos, investimentos, campanhas, fontes, atribuicoes };
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
    const organizationId = await organizacaoDo(supabase);
    const { error } = await supabase.from("conversion_events").insert({
      ...data,
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
    const organizationId = await organizacaoDo(supabase);

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
    const { error } = await supabase
      .from("crm_casos")
      .update({ [campo]: data.destino })
      .eq("id", data.caseId)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);

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
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
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
    const organizationId = await organizacaoDo(supabase);

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
