/**
 * Desk operacional diário — CRM de leads/oportunidades.
 *
 * Listas controladas da aba LISTAS_BASE (CA 04 CRM Discovery Handoff v1.1).
 * Todo campo classificatório é select fechado: entrada livre é rejeitada.
 * Texto livre só existe para resumo da call, observação, narrativa familiar e
 * links internos. Preço, SKU, link Asaas e despesa de terceiro NUNCA são campo
 * livre aqui — o CRM guarda apenas referência de proposta/documento.
 */

export type Opcao = { valor: string; rotulo: string };

export const AREAS_RESPONSAVEIS: Opcao[] = [
  { valor: "comercial", rotulo: "Comercial" },
  { valor: "pesquisa", rotulo: "Pesquisa genealógica" },
  { valor: "operacoes", rotulo: "Operações" },
  { valor: "juridico_interno", rotulo: "Jurídico interno" },
  { valor: "financeiro", rotulo: "Financeiro" },
  { valor: "atendimento", rotulo: "Atendimento/Relacionamento" },
];

export const ORIGENS_LEAD: Opcao[] = [
  { valor: "indicacao", rotulo: "Indicação" },
  { valor: "formulario", rotulo: "Formulário" },
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "instagram", rotulo: "Instagram" },
  { valor: "meta_ads", rotulo: "Meta Ads" },
  { valor: "google", rotulo: "Google" },
  { valor: "site", rotulo: "Site" },
  { valor: "evento", rotulo: "Evento" },
  { valor: "parceria", rotulo: "Parceria" },
  { valor: "base_legada", rotulo: "Base legada/importação" },
  { valor: "outra_origem", rotulo: "Outra origem declarada" },
];

export const OBJETIVOS: Opcao[] = [
  { valor: "cidadania", rotulo: "Cidadania" },
  { valor: "pesquisa_genealogica", rotulo: "Pesquisa genealógica" },
  { valor: "documentacao", rotulo: "Documentação/retificação" },
  { valor: "consultoria_pontual", rotulo: "Consultoria pontual" },
  { valor: "objetivo_a_definir", rotulo: "Objetivo a definir" },
];

export const NACIONALIDADES: Opcao[] = [
  { valor: "portuguesa", rotulo: "Portuguesa" },
  { valor: "italiana", rotulo: "Italiana" },
  { valor: "espanhola", rotulo: "Espanhola" },
  { valor: "austriaca", rotulo: "Austríaca" },
  { valor: "alema", rotulo: "Alemã" },
  { valor: "polonesa", rotulo: "Polonesa" },
  { valor: "outra_nacionalidade", rotulo: "Outra nacionalidade" },
  { valor: "nacionalidade_a_confirmar", rotulo: "A confirmar" },
];

export const VIAS_JURIDICAS: Opcao[] = [
  { valor: "descendencia", rotulo: "Descendência" },
  { valor: "casamento", rotulo: "Casamento/união" },
  { valor: "naturalizacao_residencia", rotulo: "Naturalização/residência" },
  { valor: "reparacao_historica", rotulo: "Reparação histórica" },
  { valor: "via_a_confirmar", rotulo: "Via a confirmar" },
];

export const STATUS_VIA: Opcao[] = [
  { valor: "em_confirmacao_juridica", rotulo: "Em confirmação jurídica" },
  { valor: "triagem_preliminar", rotulo: "Triagem preliminar" },
  { valor: "confirmada_internamente", rotulo: "Confirmada internamente" },
  { valor: "inviavel_preliminar", rotulo: "Inviável em triagem preliminar" },
];

export const EIXO_COMERCIAL: Opcao[] = [
  { valor: "novo_lead", rotulo: "Novo lead" },
  { valor: "triagem", rotulo: "Triagem" },
  { valor: "discovery_agendada", rotulo: "Discovery agendada" },
  { valor: "discovery_realizada", rotulo: "Discovery realizada" },
  { valor: "diagnostico_em_elaboracao", rotulo: "Diagnóstico em elaboração" },
  { valor: "proposta_enviada", rotulo: "Proposta enviada" },
  { valor: "negociacao", rotulo: "Negociação" },
  { valor: "nutricao", rotulo: "Nutrição" },
  { valor: "perdido", rotulo: "Perdido" },
  { valor: "encerrado_sem_aderencia", rotulo: "Encerrado sem aderência" },
];

export const EIXO_FORMALIZACAO: Opcao[] = [
  { valor: "nao_iniciado", rotulo: "Não iniciado" },
  { valor: "contrato_enviado", rotulo: "Contrato enviado" },
  { valor: "contrato_assinado", rotulo: "Contrato assinado" },
  { valor: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado" },
  { valor: "cliente_ativo", rotulo: "Cliente ativo" },
  { valor: "onboarding_iniciado", rotulo: "Onboarding iniciado" },
  { valor: "caso_ativo", rotulo: "Caso ativo" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

export const RESULTADOS_DISCOVERY: Opcao[] = [
  { valor: "aderente", rotulo: "Aderente ao serviço" },
  { valor: "aderente_com_ressalva", rotulo: "Aderente com ressalva" },
  { valor: "sem_aderencia", rotulo: "Sem aderência" },
  { valor: "reagendar", rotulo: "Reagendar" },
  { valor: "no_show", rotulo: "No-show" },
];

export const MOTIVOS_PERDA: Opcao[] = [
  { valor: "preco", rotulo: "Preço" },
  { valor: "timing", rotulo: "Timing" },
  { valor: "sem_aderencia_tecnica", rotulo: "Sem aderência técnica" },
  { valor: "concorrencia", rotulo: "Concorrência" },
  { valor: "sem_resposta", rotulo: "Sem resposta" },
  { valor: "desistencia", rotulo: "Desistência declarada" },
];

export const PROXIMAS_ACOES: Opcao[] = [
  { valor: "agendar_call", rotulo: "Agendar call" },
  { valor: "confirmar_call", rotulo: "Confirmar call" },
  { valor: "realizar_discovery", rotulo: "Realizar Discovery" },
  { valor: "enviar_checklist", rotulo: "Enviar checklist" },
  { valor: "elaborar_diagnostico", rotulo: "Elaborar diagnóstico" },
  { valor: "enviar_proposta", rotulo: "Enviar proposta" },
  { valor: "follow_up_proposta", rotulo: "Follow-up de proposta" },
  { valor: "enviar_contrato", rotulo: "Enviar contrato" },
  { valor: "confirmar_pagamento", rotulo: "Confirmar pagamento" },
  { valor: "iniciar_onboarding", rotulo: "Iniciar onboarding" },
  { valor: "solicitar_documentos", rotulo: "Solicitar documentos" },
  { valor: "nutrir_relacionamento", rotulo: "Nutrir relacionamento" },
];

export const SERVICOS_INICIAIS: Opcao[] = [
  { valor: "diagnostico_por_etapas", rotulo: "Diagnóstico por etapas" },
  { valor: "estudo_genealogico", rotulo: "Estudo genealógico" },
  { valor: "consultoria_documental", rotulo: "Consultoria documental" },
  { valor: "servico_a_definir", rotulo: "Serviço a definir" },
];

/** Todos os catálogos classificatórios por campo. Entrada fora da lista é rejeitada. */
export const CATALOGOS: Record<string, Opcao[]> = {
  area_responsavel: AREAS_RESPONSAVEIS,
  origem: ORIGENS_LEAD,
  objetivo: OBJETIVOS,
  nacionalidade: NACIONALIDADES,
  via_juridica_preliminar: VIAS_JURIDICAS,
  status_via: STATUS_VIA,
  eixo_comercial: EIXO_COMERCIAL,
  eixo_formalizacao: EIXO_FORMALIZACAO,
  discovery_resultado: RESULTADOS_DISCOVERY,
  motivo_perda: MOTIVOS_PERDA,
  proxima_acao: PROXIMAS_ACOES,
  servico_inicial_aprovado: SERVICOS_INICIAIS,
};

export const CAMPOS_TEXTO_LIVRE = [
  "nome",
  "email",
  "telefone",
  "responsavel_nome",
  "indicado_por",
  "resumo_call",
  "observacoes",
  "narrativa_familiar",
  "proposta_link_interno",
  "proposta_referencia_interna",
  "contrato_link_interno",
  "asaas_evento_referencia",
] as const;

/** Campos que o CRM nunca aceita como entrada livre. */
export const CAMPOS_PROIBIDOS_NO_CRM = ["preco", "valor", "valor_total", "sku", "link_asaas", "link_pagamento", "despesa_terceiro"];

export function rotulo(campo: string, valor: string | null | undefined): string {
  if (!valor) return "—";
  return CATALOGOS[campo]?.find((o) => o.valor === valor)?.rotulo ?? valor;
}

export type LeadDesk = {
  id?: string;
  codigo?: string | null;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  origem?: string | null;
  area_responsavel?: string | null;
  responsavel_nome?: string | null;
  indicado_por?: string | null;
  proxima_acao?: string | null;
  proxima_acao_em?: string | null;
  eixo_comercial?: string | null;
  eixo_formalizacao?: string | null;
  objetivo?: string | null;
  nacionalidade?: string | null;
  via_juridica_preliminar?: string | null;
  status_via?: string | null;
  discovery_resultado?: string | null;
  resumo_call?: string | null;
  resumo_validado?: boolean | null;
  call_agendada_em?: string | null;
  call_realizada_em?: string | null;
  proposta_link_interno?: string | null;
  proposta_referencia_interna?: string | null;
  contrato_link_interno?: string | null;
  asaas_evento_referencia?: string | null;
  motivo_perda?: string | null;
  servico_inicial_aprovado?: string | null;
  pagamento_previsto_em?: string | null;
  dados_teste?: boolean | null;
  case_id?: string | null;
  nucleo_id?: string | null;
  ultimo_followup_em?: string | null;
  archived_at?: string | null;
  created_at?: string | null;
};

/** Resultado comercial é DERIVADO: nunca substitui os dois eixos. */
export function resultadoComercialDerivado(l: LeadDesk): string {
  if (l.eixo_comercial === "perdido") return "Perdido";
  if (l.eixo_comercial === "encerrado_sem_aderencia") return "Encerrado sem aderência";
  if (l.eixo_formalizacao === "caso_ativo") return "Ganho — caso ativo";
  if (l.eixo_formalizacao === "onboarding_iniciado" || l.eixo_formalizacao === "cliente_ativo") return "Ganho — em onboarding";
  if (l.eixo_formalizacao === "pagamento_inicial_confirmado") return "Ganho — pagamento confirmado";
  if (l.eixo_formalizacao === "contrato_assinado") return "Ganho — contrato assinado";
  if (l.eixo_formalizacao === "contrato_enviado") return "Em formalização";
  if (l.eixo_comercial === "nutricao") return "Em nutrição";
  return "Em andamento comercial";
}

export type ErroValidacao = { campo: string; motivo: string };

/** Espelha as travas do banco para dar feedback imediato antes de gravar. */
export function validarLead(l: LeadDesk): ErroValidacao[] {
  const erros: ErroValidacao[] = [];
  const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

  for (const [campo, opcoes] of Object.entries(CATALOGOS)) {
    const v = (l as Record<string, unknown>)[campo];
    if (!vazio(v) && !opcoes.some((o) => o.valor === v)) {
      erros.push({ campo, motivo: `Valor fora da lista controlada de ${campo}.` });
    }
  }

  if (vazio(l.nome)) erros.push({ campo: "nome", motivo: "Nome é obrigatório." });

  const ativo = !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial));
  if (ativo) {
    if (vazio(l.area_responsavel)) erros.push({ campo: "area_responsavel", motivo: "Lead ativo exige área responsável." });
    if (vazio(l.responsavel_nome)) erros.push({ campo: "responsavel_nome", motivo: "Lead ativo exige responsável nominal." });
    if (vazio(l.proxima_acao)) erros.push({ campo: "proxima_acao", motivo: "Lead ativo exige próxima ação." });
    if (vazio(l.proxima_acao_em)) erros.push({ campo: "proxima_acao_em", motivo: "Lead ativo exige data da próxima ação." });
  }

  if (["discovery_realizada", "diagnostico_em_elaboracao", "proposta_enviada", "negociacao"].includes(String(l.eixo_comercial))) {
    if (vazio(l.discovery_resultado)) erros.push({ campo: "discovery_resultado", motivo: "Call realizada exige resultado da Discovery." });
    if (!l.resumo_validado) erros.push({ campo: "resumo_validado", motivo: "Call realizada exige resumo validado." });
    if (vazio(l.proxima_acao_em)) erros.push({ campo: "proxima_acao_em", motivo: "Call realizada exige próxima ação datada." });
  }

  if (["proposta_enviada", "negociacao"].includes(String(l.eixo_comercial))) {
    if (vazio(l.proposta_link_interno)) erros.push({ campo: "proposta_link_interno", motivo: "Proposta enviada exige link interno da proposta." });
    if (vazio(l.responsavel_nome)) erros.push({ campo: "responsavel_nome", motivo: "Proposta enviada exige responsável nominal." });
  }

  if (l.eixo_comercial === "perdido" && vazio(l.motivo_perda)) {
    erros.push({ campo: "motivo_perda", motivo: "Perdido exige motivo de perda." });
  }

  const formalizados = ["contrato_assinado", "pagamento_inicial_confirmado", "cliente_ativo", "onboarding_iniciado", "caso_ativo"];
  if (formalizados.includes(String(l.eixo_formalizacao)) && vazio(l.contrato_link_interno)) {
    erros.push({ campo: "contrato_link_interno", motivo: "Contrato assinado exige link interno do contrato." });
  }

  const pagos = ["pagamento_inicial_confirmado", "cliente_ativo", "onboarding_iniciado", "caso_ativo"];
  if (pagos.includes(String(l.eixo_formalizacao)) && vazio(l.asaas_evento_referencia)) {
    erros.push({
      campo: "asaas_evento_referencia",
      motivo: "Pagamento inicial confirmado exige referência ao evento transacional do Asaas.",
    });
  }

  if (String(l.eixo_formalizacao) === "onboarding_iniciado" && vazio(l.asaas_evento_referencia)) {
    erros.push({ campo: "eixo_formalizacao", motivo: "Onboarding não inicia sem pagamento inicial confirmado." });
  }

  if (String(l.eixo_formalizacao) === "caso_ativo" && vazio(l.case_id)) {
    erros.push({ campo: "eixo_formalizacao", motivo: "Caso ativo exige caso operacional vinculado: Discovery ou proposta não abrem caso." });
  }

  return erros;
}

/* ------------------------------------------------------------------ *
 * Painel “Hoje” — filas ordenadas por criticidade e data
 * ------------------------------------------------------------------ */

export const CRITICIDADE_FILA: Record<string, number> = {
  acoes_vencidas: 1,
  pagamentos_aguardados: 2,
  contratos_enviados_pendentes: 3,
  onboardings_pendentes: 4,
  acoes_hoje: 5,
  leads_sem_responsavel: 6,
  leads_sem_proxima_acao: 7,
  propostas_sem_followup: 8,
  calls_hoje: 9,
  casos_pendencia_documental: 10,
};

export const ROTULO_FILA: Record<string, string> = {
  acoes_vencidas: "Ações vencidas",
  acoes_hoje: "Ações de hoje",
  leads_sem_responsavel: "Leads ativos sem responsável",
  leads_sem_proxima_acao: "Leads ativos sem próxima ação",
  calls_hoje: "Calls de hoje",
  propostas_sem_followup: "Propostas sem follow-up",
  contratos_enviados_pendentes: "Contratos enviados pendentes",
  pagamentos_aguardados: "Pagamentos iniciais aguardados",
  onboardings_pendentes: "Onboardings pendentes",
  casos_pendencia_documental: "Casos com pendência documental",
};

export type ItemFila = {
  id: string;
  rotulo: string;
  detalhe: string;
  data: string | null;
  tipo: "lead" | "caso";
  /** Filtros operacionais do Painel Hoje. */
  area: string | null;
  responsavel: string | null;
  etapa: string | null;
};
export type Fila = { chave: string; rotulo: string; criticidade: number; itens: ItemFila[] };

const dia = (d: string | Date) => new Date(d).toISOString().slice(0, 10);

export function montarFilasHoje(input: {
  leads: LeadDesk[];
  casos: { id: string; codigo: string | null; titulo: string | null; documentos_minimos_ok: boolean | null; prazo_proxima_acao: string | null }[];
  hoje?: Date;
}): Fila[] {
  const hojeStr = dia(input.hoje ?? new Date());
  const ativos = input.leads.filter(
    (l) => !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial)),
  );
  const itemLead = (l: LeadDesk, detalhe: string, data: string | null): ItemFila => ({
    id: String(l.id),
    rotulo: `${l.codigo ?? "sem código"} · ${l.nome}`,
    detalhe,
    data,
    tipo: "lead",
    area: l.area_responsavel ?? null,
    responsavel: l.responsavel_nome ?? null,
    etapa: l.eixo_comercial ?? null,
  });


  const filas: Fila[] = [
    {
      chave: "acoes_vencidas",
      itens: ativos
        .filter((l) => l.proxima_acao_em && dia(l.proxima_acao_em) < hojeStr)
        .map((l) => itemLead(l, rotulo("proxima_acao", l.proxima_acao), l.proxima_acao_em ?? null)),
    },
    {
      chave: "acoes_hoje",
      itens: ativos
        .filter((l) => l.proxima_acao_em && dia(l.proxima_acao_em) === hojeStr)
        .map((l) => itemLead(l, rotulo("proxima_acao", l.proxima_acao), l.proxima_acao_em ?? null)),
    },
    {
      chave: "leads_sem_responsavel",
      itens: ativos.filter((l) => !l.responsavel_nome).map((l) => itemLead(l, "Sem responsável nominal", null)),
    },
    {
      chave: "leads_sem_proxima_acao",
      itens: ativos.filter((l) => !l.proxima_acao || !l.proxima_acao_em).map((l) => itemLead(l, "Sem próxima ação datada", null)),
    },
    {
      chave: "calls_hoje",
      itens: ativos
        .filter((l) => l.call_agendada_em && dia(l.call_agendada_em) === hojeStr)
        .map((l) => itemLead(l, "Call agendada", l.call_agendada_em ?? null)),
    },
    {
      chave: "propostas_sem_followup",
      itens: ativos
        .filter((l) => ["proposta_enviada", "negociacao"].includes(String(l.eixo_comercial)) && !l.ultimo_followup_em)
        .map((l) => itemLead(l, "Proposta enviada sem follow-up registrado", l.proxima_acao_em ?? null)),
    },
    {
      chave: "contratos_enviados_pendentes",
      itens: ativos
        .filter((l) => l.eixo_formalizacao === "contrato_enviado")
        .map((l) => itemLead(l, "Contrato enviado aguardando assinatura", l.proxima_acao_em ?? null)),
    },
    {
      chave: "pagamentos_aguardados",
      itens: ativos
        .filter((l) => l.eixo_formalizacao === "contrato_assinado")
        .map((l) => itemLead(l, "Pagamento inicial aguardado", l.pagamento_previsto_em ?? null)),
    },
    {
      chave: "onboardings_pendentes",
      itens: ativos
        .filter((l) => l.eixo_formalizacao === "pagamento_inicial_confirmado" || l.eixo_formalizacao === "cliente_ativo")
        .map((l) => itemLead(l, "Onboarding pendente de início", l.proxima_acao_em ?? null)),
    },
    {
      chave: "casos_pendencia_documental",
      itens: input.casos
        .filter((c) => c.documentos_minimos_ok === false)
        .map((c) => ({
          id: c.id,
          rotulo: `${c.codigo ?? "caso"} · ${c.titulo ?? "sem título"}`,
          detalhe: "Documentos aguardados — pendência documental",
          data: c.prazo_proxima_acao,
          tipo: "caso" as const,
          area: "operacoes",
          responsavel: null,
          etapa: "caso_ativo",
        })),
    },
  ].map((f) => ({
    ...f,
    rotulo: ROTULO_FILA[f.chave],
    criticidade: CRITICIDADE_FILA[f.chave],
    itens: [...f.itens].sort((a, b) => (a.data ?? "9999").localeCompare(b.data ?? "9999")),
  }));

  return filas.sort((a, b) => a.criticidade - b.criticidade);
}

/**
 * Lista única priorizada do Painel Hoje: ordenada pela DATA DA PRÓXIMA AÇÃO
 * (mais antiga primeiro) e, em empate, pela criticidade da fila.
 * Itens sem data ficam ao final, nunca ordenados por data de criação.
 */
export function listaPrioritaria(
  filas: Fila[],
  filtro?: { area?: string; responsavel?: string; etapa?: string },
): (ItemFila & { fila: string; criticidade: number })[] {
  const linhas = filas.flatMap((f) =>
    f.itens.map((i) => ({ ...i, fila: f.rotulo, criticidade: f.criticidade })),
  );
  const visiveis = linhas.filter((i) => {
    if (filtro?.area && i.area !== filtro.area) return false;
    if (filtro?.responsavel && i.responsavel !== filtro.responsavel) return false;
    if (filtro?.etapa && i.etapa !== filtro.etapa) return false;
    return true;
  });
  return visiveis.sort((a, b) => {
    const da = a.data ? String(a.data).slice(0, 10) : "9999-12-31";
    const db = b.data ? String(b.data).slice(0, 10) : "9999-12-31";
    if (da !== db) return da.localeCompare(db);
    return a.criticidade - b.criticidade;
  });
}

/** Classifica o prazo da próxima ação: atraso, hoje ou futuro. Nunca usa data de criação. */
export function classificarPrazo(
  data: string | null | undefined,
  hoje: string,
): { chave: "atrasado" | "hoje" | "futuro" | "sem_data"; rotulo: string } {
  if (!data) return { chave: "sem_data", rotulo: "Sem prazo definido" };
  const d = String(data).slice(0, 10);
  if (d < hoje) return { chave: "atrasado", rotulo: "Em atraso" };
  if (d === hoje) return { chave: "hoje", rotulo: "Para hoje" };
  return { chave: "futuro", rotulo: "Próxima ação futura" };
}

/* ------------------------------------------------------------------ *
 * Escada de conversão e handoff Discovery → oportunidade → operação
 * ------------------------------------------------------------------ */

export type DegrauEscada = {
  chave: "aceite_verbal" | "confirmacao_formal" | "contrato_cobranca" | "onboarding";
  rotulo: string;
  estado: "concluido" | "em_andamento" | "bloqueado";
  nota: string;
};

/**
 * Escada canônica: aceite verbal → confirmação formal → contrato e cobrança → onboarding.
 * Aceite verbal NÃO cria cliente nem libera contrato, cobrança, onboarding,
 * pesquisa externa ou App Cliente. Nenhum estado é avançado automaticamente aqui.
 */
export function escadaConversao(l: LeadDesk): DegrauEscada[] {
  const f = String(l.eixo_formalizacao ?? "");
  const c = String(l.eixo_comercial ?? "");
  const ordemFormal = EIXO_FORMALIZACAO.map((o) => o.valor);
  const idx = (v: string) => ordemFormal.indexOf(v);
  const atingiu = (v: string) => idx(f) >= 0 && idx(v) >= 0 && idx(f) >= idx(v);

  const aceiteVerbal = c === "negociacao" || c === "proposta_enviada" || idx(f) > 0 || atingiu("confirmacao_formal_recebida");
  const confirmacao = atingiu("confirmacao_formal_recebida");
  const contratoOk = atingiu("contrato_assinado");
  const pagamentoOk = atingiu("pagamento_inicial_confirmado");
  const onboardingOk = atingiu("onboarding_iniciado");

  return [
    {
      chave: "aceite_verbal",
      rotulo: "Aceite verbal",
      estado: aceiteVerbal ? "concluido" : "em_andamento",
      nota: "Não cria cliente e não libera contrato, cobrança, assinatura, onboarding, pesquisa externa nem App Cliente.",
    },
    {
      chave: "confirmacao_formal",
      rotulo: "Confirmação formal",
      estado: confirmacao ? "concluido" : aceiteVerbal ? "em_andamento" : "bloqueado",
      nota: "Libera apenas a preparação da formalização.",
    },
    {
      chave: "contrato_cobranca",
      rotulo: "Contrato e cobrança",
      estado: contratoOk && pagamentoOk ? "concluido" : confirmacao ? "em_andamento" : "bloqueado",
      nota: contratoOk
        ? pagamentoOk
          ? "Contrato assinado e pagamento inicial confirmado."
          : "Contrato assinado; pagamento inicial ainda não confirmado."
        : "Bloqueado até confirmação formal registrada.",
    },
    {
      chave: "onboarding",
      rotulo: "Onboarding",
      estado: onboardingOk ? "concluido" : contratoOk && pagamentoOk ? "em_andamento" : "bloqueado",
      nota: "Exige contrato assinado, pagamento inicial confirmado e demais gates do caso.",
    },
  ];
}

export type Handoff = {
  confirmado: string[];
  falta: string[];
  responsavel: string | null;
  area: string | null;
  proximaAcao: string | null;
  prazo: string | null;
  bloqueios: { alvo: "proposta" | "formalizacao" | "onboarding"; motivo: string }[];
  operavel: boolean;
};

/**
 * Leitura de handoff Discovery → oportunidade → operação.
 * Somente deriva do registro existente: não cria segunda ficha nem avança estados.
 */
export function handoffLead(l: LeadDesk): Handoff {
  const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";
  const confirmado: string[] = [];
  const falta: string[] = [];

  const marcar = (ok: boolean, texto: string) => (ok ? confirmado : falta).push(texto);
  marcar(!vazio(l.objetivo), "Interesse inicial declarado");
  marcar(!vazio(l.nacionalidade), "Nacionalidade de interesse");
  marcar(!vazio(l.via_juridica_preliminar), "Via jurídica preliminar (sinal interno, não é parecer)");
  marcar(!vazio(l.call_realizada_em), "Call de Discovery realizada");
  marcar(!vazio(l.discovery_resultado), "Resultado da Discovery registrado");
  marcar(Boolean(l.resumo_validado), "Resumo da call validado");
  marcar(!vazio(l.responsavel_nome), "Responsável nominal definido");
  marcar(!vazio(l.proxima_acao) && !vazio(l.proxima_acao_em), "Próxima ação com prazo");

  const bloqueios: Handoff["bloqueios"] = [];
  if (vazio(l.discovery_resultado) || !l.resumo_validado) {
    bloqueios.push({ alvo: "proposta", motivo: "Proposta exige Discovery com resultado e resumo validado." });
  }
  if (vazio(l.responsavel_nome) || vazio(l.proxima_acao) || vazio(l.proxima_acao_em)) {
    bloqueios.push({ alvo: "proposta", motivo: "Oportunidade sem responsável, próxima ação ou prazo não é operável." });
  }
  const escada = escadaConversao(l);
  const confirmacaoOk = escada[1]?.estado === "concluido";
  if (!confirmacaoOk) {
    bloqueios.push({ alvo: "formalizacao", motivo: "Formalização só é preparada após confirmação formal registrada." });
  }
  if (escada[2]?.estado !== "concluido") {
    bloqueios.push({ alvo: "onboarding", motivo: "Onboarding bloqueado até contrato assinado e pagamento inicial confirmado." });
  }

  return {
    confirmado,
    falta,
    responsavel: l.responsavel_nome ?? null,
    area: l.area_responsavel ?? null,
    proximaAcao: l.proxima_acao ?? null,
    prazo: l.proxima_acao_em ? String(l.proxima_acao_em).slice(0, 10) : null,
    bloqueios,
    operavel: !vazio(l.responsavel_nome) && !vazio(l.proxima_acao) && !vazio(l.proxima_acao_em),
  };
}



/* ------------------------------------------------------------------ *
 * Métricas comerciais e operacionais
 * ------------------------------------------------------------------ */

export type MetricasCrm = {
  porOrigem: { origem: string; total: number }[];
  entradaSemanal: { periodo: string; total: number }[];
  entradaMensal: { periodo: string; total: number }[];
  calls: { agendadas: number; realizadas: number; noShow: number; conversao: number | null };
  funil: { etapa: string; taxa: number | null; de: number; para: number }[];
  semProximaAcao: number;
  followupsVencidos: number;
  casosPorNacionalidadeVia: { chave: string; total: number }[];
  pendenciasDocumentais: { chave: string; total: number }[];
};

function semanaDe(iso: string): string {
  const d = new Date(iso);
  const alvo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (alvo.getUTCDay() + 6) % 7;
  alvo.setUTCDate(alvo.getUTCDate() - dow + 3);
  const primeira = new Date(Date.UTC(alvo.getUTCFullYear(), 0, 4));
  const semana = 1 + Math.round(((alvo.getTime() - primeira.getTime()) / 86400000 - 3 + ((primeira.getUTCDay() + 6) % 7)) / 7);
  return `${alvo.getUTCFullYear()}-S${String(semana).padStart(2, "0")}`;
}

function contar<T>(itens: T[], chave: (t: T) => string | null): { chave: string; total: number }[] {
  const m = new Map<string, number>();
  for (const i of itens) {
    const k = chave(i);
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([chave, total]) => ({ chave, total })).sort((a, b) => b.total - a.total);
}

const taxa = (de: number, para: number) => (de > 0 ? Math.round((para / de) * 1000) / 10 : null);

export function calcularMetricasCrm(input: {
  leads: LeadDesk[];
  casos: { pais: string | null; via: string | null; documentos_minimos_ok: boolean | null; responsavel_principal: string | null; ativo: boolean | null }[];
  hoje?: Date;
}): MetricasCrm {
  const hojeStr = dia(input.hoje ?? new Date());
  const leads = input.leads;
  const ordem = EIXO_COMERCIAL.map((o) => o.valor);
  const chegouAte = (l: LeadDesk, etapa: string) => {
    const i = ordem.indexOf(String(l.eixo_comercial));
    const j = ordem.indexOf(etapa);
    return i >= 0 && j >= 0 && i >= j && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial));
  };
  const formalOrdem = EIXO_FORMALIZACAO.map((o) => o.valor);
  const formalAte = (l: LeadDesk, etapa: string) => {
    const i = formalOrdem.indexOf(String(l.eixo_formalizacao));
    const j = formalOrdem.indexOf(etapa);
    return i >= 0 && j >= 0 && i >= j;
  };

  const discovery = leads.filter((l) => l.call_realizada_em).length;
  const agendadas = leads.filter((l) => l.call_agendada_em).length;
  const noShow = leads.filter((l) => l.discovery_resultado === "no_show").length;
  const propostas = leads.filter((l) => chegouAte(l, "proposta_enviada")).length;
  const contratos = leads.filter((l) => formalAte(l, "contrato_assinado")).length;
  const pagos = leads.filter((l) => formalAte(l, "pagamento_inicial_confirmado")).length;
  const onboardings = leads.filter((l) => formalAte(l, "onboarding_iniciado")).length;

  return {
    porOrigem: contar(leads, (l) => l.origem ?? null).map((c) => ({ origem: rotulo("origem", c.chave), total: c.total })),
    entradaSemanal: contar(leads, (l) => (l.created_at ? semanaDe(l.created_at) : null))
      .map((c) => ({ periodo: c.chave, total: c.total }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo)),
    entradaMensal: contar(leads, (l) => (l.created_at ? l.created_at.slice(0, 7) : null))
      .map((c) => ({ periodo: c.chave, total: c.total }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo)),
    calls: { agendadas, realizadas: discovery, noShow, conversao: taxa(agendadas, discovery) },
    funil: [
      { etapa: "Discovery → Proposta", de: discovery, para: propostas, taxa: taxa(discovery, propostas) },
      { etapa: "Proposta → Contrato", de: propostas, para: contratos, taxa: taxa(propostas, contratos) },
      { etapa: "Contrato → Pagamento inicial", de: contratos, para: pagos, taxa: taxa(contratos, pagos) },
      { etapa: "Pagamento → Onboarding", de: pagos, para: onboardings, taxa: taxa(pagos, onboardings) },
    ],
    semProximaAcao: leads.filter(
      (l) => !l.archived_at && !["perdido", "encerrado_sem_aderencia"].includes(String(l.eixo_comercial)) && (!l.proxima_acao || !l.proxima_acao_em),
    ).length,
    followupsVencidos: leads.filter((l) => l.proxima_acao_em && dia(l.proxima_acao_em) < hojeStr && !l.archived_at).length,
    casosPorNacionalidadeVia: contar(
      input.casos.filter((c) => c.ativo !== false),
      (c) => `${c.pais ?? "país não declarado"} · ${c.via ?? "via não declarada"}`,
    ),
    pendenciasDocumentais: contar(
      input.casos.filter((c) => c.documentos_minimos_ok === false),
      (c) => c.responsavel_principal ?? "sem responsável",
    ),
  };
}
