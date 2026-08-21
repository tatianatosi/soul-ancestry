/**
 * Modelo canônico de conversão: estados de aceite, eventos imutáveis e métricas.
 * Puro: não cria cobrança, contrato, mensagem externa nem pesquisa externa.
 */

export type EventoConversao =
  | "lead_criado"
  | "lead_qualificado"
  | "discovery_agendada"
  | "discovery_realizada"
  | "proposta_enviada"
  | "aceite_verbal_confirmado"
  | "confirmacao_formal_recebida"
  | "contrato_enviado"
  | "contrato_assinado"
  | "pagamento_inicial_confirmado"
  | "onboarding_iniciado"
  | "caso_ativo"
  | "perdido";

export const EVENTOS_CONVERSAO: { codigo: EventoConversao; rotulo: string; etapa: string }[] = [
  { codigo: "lead_criado", rotulo: "Lead criado", etapa: "entrada" },
  { codigo: "lead_qualificado", rotulo: "Lead qualificado", etapa: "entrada" },
  { codigo: "discovery_agendada", rotulo: "Discovery agendada", etapa: "descoberta" },
  { codigo: "discovery_realizada", rotulo: "Discovery realizada", etapa: "descoberta" },
  { codigo: "proposta_enviada", rotulo: "Proposta enviada", etapa: "comercial" },
  { codigo: "aceite_verbal_confirmado", rotulo: "Aceite verbal confirmado", etapa: "comercial" },
  { codigo: "confirmacao_formal_recebida", rotulo: "Confirmação formal recebida", etapa: "comercial" },
  { codigo: "contrato_enviado", rotulo: "Contrato enviado", etapa: "formalização" },
  { codigo: "contrato_assinado", rotulo: "Contrato assinado", etapa: "formalização" },
  { codigo: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado", etapa: "financeiro" },
  { codigo: "onboarding_iniciado", rotulo: "Onboarding iniciado", etapa: "onboarding" },
  { codigo: "caso_ativo", rotulo: "Caso ativo", etapa: "operação" },
  { codigo: "perdido", rotulo: "Perdido", etapa: "encerramento" },
];

export type EstadoAceite =
  | "proposta_enviada"
  | "aceite_verbal_confirmado"
  | "confirmacao_formal_pendente"
  | "confirmacao_formal_recebida"
  | "formalizacao_em_preparacao"
  | "contrato_enviado"
  | "contrato_assinado"
  | "pagamento_inicial_confirmado"
  | "onboarding_iniciado"
  | "caso_ativo";

export const ESTADOS_ACEITE: { codigo: EstadoAceite; rotulo: string; libera: string }[] = [
  { codigo: "proposta_enviada", rotulo: "Proposta enviada", libera: "Acompanhamento comercial." },
  { codigo: "aceite_verbal_confirmado", rotulo: "Aceite verbal confirmado", libera: "Nada além de registro — não cria cliente ativo." },
  { codigo: "confirmacao_formal_pendente", rotulo: "Confirmação formal pendente", libera: "Cobrança de evidência escrita." },
  { codigo: "confirmacao_formal_recebida", rotulo: "Confirmação formal recebida", libera: "Preparação de contrato — sem cobrança." },
  { codigo: "formalizacao_em_preparacao", rotulo: "Formalização em preparação", libera: "Ficha, prévia e conferência de escopo." },
  { codigo: "contrato_enviado", rotulo: "Contrato enviado", libera: "Aguardo de assinatura." },
  { codigo: "contrato_assinado", rotulo: "Contrato assinado", libera: "Cobrança autorizada por decisão humana." },
  { codigo: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado", libera: "Onboarding." },
  { codigo: "onboarding_iniciado", rotulo: "Onboarding iniciado", libera: "Primeira micro-entrega até D7." },
  { codigo: "caso_ativo", rotulo: "Caso ativo", libera: "Operação plena." },
];

export type ContextoTransicao = {
  onboardingMinimoConcluido?: boolean;
  temNucleoOuDossie?: boolean;
  temResponsavel?: boolean;
  contratoAssinado?: boolean;
  pagamentoInicialConfirmado?: boolean;
  confirmacaoFormalRecebida?: boolean;
};

/** Regra de aceite padrão: cada estado só avança com a evidência exigida. */
export function validarTransicaoAceite(destino: EstadoAceite, ctx: ContextoTransicao): { permitido: boolean; motivos: string[] } {
  const motivos: string[] = [];
  if (["formalizacao_em_preparacao", "contrato_enviado"].includes(destino) && !ctx.confirmacaoFormalRecebida) {
    motivos.push("Confirmação formal registrada é obrigatória antes de preparar ou enviar contrato. Aceite verbal não basta.");
  }
  if (destino === "pagamento_inicial_confirmado" && !ctx.contratoAssinado) {
    motivos.push("Pagamento inicial só é registrado após contrato assinado.");
  }
  if (destino === "onboarding_iniciado" && !(ctx.contratoAssinado && ctx.pagamentoInicialConfirmado)) {
    motivos.push("Onboarding exige contrato assinado e pagamento inicial confirmado.");
  }
  if (destino === "caso_ativo") {
    if (!ctx.onboardingMinimoConcluido) motivos.push("Caso ativo exige onboarding mínimo concluído.");
    if (!ctx.temNucleoOuDossie) motivos.push("Caso ativo exige núcleo familiar e dossiê-mãe registrados.");
    if (!ctx.temResponsavel) motivos.push("Caso ativo exige responsável definido.");
  }
  return { permitido: motivos.length === 0, motivos };
}

/** Evento imutável correspondente a cada mudança de estado. */
export const EVENTO_DO_ESTADO: Partial<Record<EstadoAceite, EventoConversao>> = {
  proposta_enviada: "proposta_enviada",
  aceite_verbal_confirmado: "aceite_verbal_confirmado",
  confirmacao_formal_recebida: "confirmacao_formal_recebida",
  contrato_enviado: "contrato_enviado",
  contrato_assinado: "contrato_assinado",
  pagamento_inicial_confirmado: "pagamento_inicial_confirmado",
  onboarding_iniciado: "onboarding_iniciado",
  caso_ativo: "caso_ativo",
};

export type EventoLinha = {
  event_type: string;
  occurred_at: string;
  lead_id?: string | null;
  case_id?: string | null;
  cliente_id?: string | null;
  canal?: string | null;
  origem?: string | null;
  campaign_id?: string | null;
};

export type InvestimentoLinha = { valor: number | string; canal?: string | null; campaign_id?: string | null };

export type MetricasConversao = {
  investimentoTotal: number;
  porCanal: { canal: string; investimento: number; leads: number; qualificados: number; cpl: number | null; cplq: number | null }[];
  porCampanha: { campanha: string; investimento: number; leads: number; convertidos: number; cac: number | null }[];
  contagem: Record<string, number>;
  conversaoEtapa: { de: string; para: string; taxa: number | null }[];
  cac: number | null;
  tempoMedioEntradaPagamentoDias: number | null;
};

const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0) || 0);

export function calcularMetricas(
  eventos: EventoLinha[],
  investimentos: InvestimentoLinha[],
  nomeCampanha: (id: string | null | undefined) => string,
): MetricasConversao {
  const contagem: Record<string, number> = {};
  for (const e of EVENTOS_CONVERSAO) contagem[e.codigo] = 0;
  for (const ev of eventos) contagem[ev.event_type] = (contagem[ev.event_type] ?? 0) + 1;

  const investimentoTotal = investimentos.reduce((s, i) => s + num(i.valor), 0);

  const canais = new Map<string, { investimento: number; leads: number; qualificados: number }>();
  const garanteCanal = (c: string) => canais.get(c) ?? canais.set(c, { investimento: 0, leads: 0, qualificados: 0 }).get(c)!;
  for (const i of investimentos) garanteCanal(i.canal ?? "não informado").investimento += num(i.valor);
  for (const ev of eventos) {
    const c = garanteCanal(ev.canal ?? ev.origem ?? "não informado");
    if (ev.event_type === "lead_criado") c.leads += 1;
    if (ev.event_type === "lead_qualificado") c.qualificados += 1;
  }

  const campanhas = new Map<string, { investimento: number; leads: number; convertidos: number }>();
  const garanteCampanha = (c: string) => campanhas.get(c) ?? campanhas.set(c, { investimento: 0, leads: 0, convertidos: 0 }).get(c)!;
  for (const i of investimentos) garanteCampanha(nomeCampanha(i.campaign_id)).investimento += num(i.valor);
  for (const ev of eventos) {
    const c = garanteCampanha(nomeCampanha(ev.campaign_id));
    if (ev.event_type === "lead_criado") c.leads += 1;
    if (ev.event_type === "pagamento_inicial_confirmado") c.convertidos += 1;
  }

  const etapas: [EventoConversao, EventoConversao][] = [
    ["lead_criado", "lead_qualificado"],
    ["lead_qualificado", "discovery_agendada"],
    ["discovery_agendada", "discovery_realizada"],
    ["discovery_realizada", "proposta_enviada"],
    ["proposta_enviada", "aceite_verbal_confirmado"],
    ["aceite_verbal_confirmado", "confirmacao_formal_recebida"],
    ["confirmacao_formal_recebida", "contrato_assinado"],
    ["contrato_assinado", "pagamento_inicial_confirmado"],
    ["pagamento_inicial_confirmado", "caso_ativo"],
  ];

  // tempo entre entrada e pagamento, por lead/caso
  const entradas = new Map<string, number>();
  const pagamentos: number[] = [];
  for (const ev of eventos) {
    const chave = ev.case_id ?? ev.lead_id ?? ev.cliente_id;
    if (!chave) continue;
    const t = new Date(ev.occurred_at).getTime();
    if (ev.event_type === "lead_criado") entradas.set(chave, Math.min(entradas.get(chave) ?? t, t));
    if (ev.event_type === "pagamento_inicial_confirmado" && entradas.has(chave)) {
      pagamentos.push((t - entradas.get(chave)!) / 86400000);
    }
  }

  const convertidos = contagem["pagamento_inicial_confirmado"] ?? 0;

  return {
    investimentoTotal,
    porCanal: [...canais.entries()].map(([canal, v]) => ({
      canal,
      investimento: v.investimento,
      leads: v.leads,
      qualificados: v.qualificados,
      cpl: v.leads ? v.investimento / v.leads : null,
      cplq: v.qualificados ? v.investimento / v.qualificados : null,
    })),
    porCampanha: [...campanhas.entries()].map(([campanha, v]) => ({
      campanha,
      investimento: v.investimento,
      leads: v.leads,
      convertidos: v.convertidos,
      cac: v.convertidos ? v.investimento / v.convertidos : null,
    })),
    contagem,
    conversaoEtapa: etapas.map(([de, para]) => ({
      de,
      para,
      taxa: contagem[de] ? (contagem[para] ?? 0) / contagem[de] : null,
    })),
    cac: convertidos ? investimentoTotal / convertidos : null,
    tempoMedioEntradaPagamentoDias: pagamentos.length ? pagamentos.reduce((a, b) => a + b, 0) / pagamentos.length : null,
  };
}

export const moeda = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const percentual = (v: number | null | undefined) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);

/* ─────────── Quadro normativo de métricas (fórmulas operacionais) ─────────── */

export type LinhaQuadro = {
  metrica: string;
  formula: string;
  valor: string;
  detalhe?: string;
};

const razao = (a: number, b: number) => (b ? a / b : null);

/** Quadro de 11 métricas comerciais derivadas da sequência de eventos. */
export function calcularQuadroMetricas(m: MetricasConversao): LinhaQuadro[] {
  const c = m.contagem;
  const qualificados = c["lead_qualificado"] ?? 0;
  const propostas = c["proposta_enviada"] ?? 0;
  const pagamentos = c["pagamento_inicial_confirmado"] ?? 0;
  return [
    {
      metrica: "Leads por origem",
      formula: "Leads únicos por canal / campanha / período",
      valor: String(c["lead_criado"] ?? 0),
      detalhe: `${m.porCanal.length} canal(is) e ${m.porCampanha.length} campanha(s) com registro`,
    },
    {
      metrica: "Custo por lead",
      formula: "Investimento ÷ leads qualificados",
      valor: moeda(razao(m.investimentoTotal, qualificados)),
      detalhe: `${qualificados} lead(s) qualificado(s)`,
    },
    {
      metrica: "Taxa de Discovery",
      formula: "Discoveries realizadas ÷ leads qualificados",
      valor: percentual(razao(c["discovery_realizada"] ?? 0, qualificados)),
    },
    {
      metrica: "Taxa proposta",
      formula: "Propostas enviadas ÷ Discoveries realizadas",
      valor: percentual(razao(propostas, c["discovery_realizada"] ?? 0)),
    },
    {
      metrica: "Aceite verbal",
      formula: "Aceites verbais ÷ propostas enviadas",
      valor: percentual(razao(c["aceite_verbal_confirmado"] ?? 0, propostas)),
    },
    {
      metrica: "Confirmação formal",
      formula: "Aceites formalmente registrados ÷ aceites verbais",
      valor: percentual(razao(c["confirmacao_formal_recebida"] ?? 0, c["aceite_verbal_confirmado"] ?? 0)),
      detalhe: `${Math.max(0, (c["aceite_verbal_confirmado"] ?? 0) - (c["confirmacao_formal_recebida"] ?? 0))} aceite(s) verbal(is) sem formalização`,
    },
    {
      metrica: "Conversão em contrato",
      formula: "Contratos assinados ÷ propostas enviadas",
      valor: percentual(razao(c["contrato_assinado"] ?? 0, propostas)),
    },
    {
      metrica: "Conversão em pagamento",
      formula: "Pagamentos confirmados ÷ contratos assinados",
      valor: percentual(razao(pagamentos, c["contrato_assinado"] ?? 0)),
    },
    {
      metrica: "CAC",
      formula: "Investimento atribuível ÷ clientes com pagamento inicial confirmado",
      valor: moeda(m.cac),
      detalhe: `${pagamentos} pagamento(s) inicial(is)`,
    },
    {
      metrica: "Tempo de conversão",
      formula: "Dias entre entrada do lead e pagamento inicial",
      valor: m.tempoMedioEntradaPagamentoDias == null ? "—" : `${m.tempoMedioEntradaPagamentoDias.toFixed(1)} dias`,
    },
  ];
}

/* ─────────── Saúde comercial ─────────── */

export type CasoSaude = {
  id: string;
  codigo?: string | null;
  titulo?: string | null;
  responsavel_principal?: string | null;
  proxima_acao_codigo?: string | null;
  proxima_acao?: string | null;
  prazo_proxima_acao?: string | null;
  eixo_comercial?: string | null;
  eixo_formalizacao?: string | null;
  updated_at?: string | null;
};

export type LeadSaude = {
  id: string;
  codigo?: string | null;
  nome?: string | null;
  status?: string | null;
  proxima_acao?: string | null;
  prazo_proxima_acao?: string | null;
};

export type SaudeComercial = {
  leadsSemProximaAcao: { id: string; rotulo: string }[];
  followupsVencidos: { id: string; rotulo: string; prazo: string }[];
  propostasSemResposta: { id: string; rotulo: string }[];
  aceiteVerbalSemFormalizacao: { id: string; rotulo: string }[];
};

const ATIVO_ENCERRADO = ["perdido", "descartado", "arquivado", "convertido", "ganho"];

export function calcularSaudeComercial(leads: LeadSaude[], casos: CasoSaude[], agora = Date.now()): SaudeComercial {
  const rotuloCaso = (c: CasoSaude) => c.titulo || c.codigo || c.id;
  const ativos = leads.filter((l) => !ATIVO_ENCERRADO.includes(String(l.status ?? "").toLowerCase()));

  const followupsVencidos = [
    ...ativos
      .filter((l) => l.prazo_proxima_acao && new Date(l.prazo_proxima_acao).getTime() < agora)
      .map((l) => ({ id: l.id, rotulo: l.nome || l.codigo || l.id, prazo: l.prazo_proxima_acao as string })),
    ...casos
      .filter((c) => c.prazo_proxima_acao && new Date(c.prazo_proxima_acao).getTime() < agora)
      .map((c) => ({ id: c.id, rotulo: rotuloCaso(c), prazo: c.prazo_proxima_acao as string })),
  ];

  return {
    leadsSemProximaAcao: ativos
      .filter((l) => !l.proxima_acao)
      .map((l) => ({ id: l.id, rotulo: l.nome || l.codigo || l.id })),
    followupsVencidos,
    propostasSemResposta: casos
      .filter((c) => c.eixo_comercial === "proposta_enviada")
      .map((c) => ({ id: c.id, rotulo: rotuloCaso(c) })),
    aceiteVerbalSemFormalizacao: casos
      .filter((c) => c.eixo_comercial === "aceite_verbal_confirmado")
      .map((c) => ({ id: c.id, rotulo: rotuloCaso(c) })),
  };
}

/* ------------------------------------------------------------------ *
 * Padrão de aceite em quatro momentos (Ana e João seguem o mesmo fluxo).
 * Puro: apenas leitura de eventos já registrados. Nada é disparado aqui.
 * ------------------------------------------------------------------ */

export type MomentoAceite = "aceite_verbal" | "confirmacao_formal" | "contrato_cobranca" | "onboarding";

export const MOMENTOS_ACEITE: {
  codigo: MomentoAceite;
  ordem: 1 | 2 | 3 | 4;
  rotulo: string;
  evidencia: string;
  libera: string;
  naoLibera: string;
  eventos: EventoConversao[];
}[] = [
  {
    codigo: "aceite_verbal",
    ordem: 1,
    rotulo: "Aceite verbal",
    evidencia: "Registro interno da call ou conversa.",
    libera: "Somente o registro. Próxima ação: solicitar confirmação escrita simples.",
    naoLibera: "Não cria cliente ativo, contrato, cobrança ou onboarding.",
    eventos: ["aceite_verbal_confirmado"],
  },
  {
    codigo: "confirmacao_formal",
    ordem: 2,
    rotulo: "Confirmação formal",
    evidencia: "Print, WhatsApp, e-mail ou aceite registrado com referência interna.",
    libera: "Preparação da formalização (ficha, escopo, prévia contratual).",
    naoLibera: "Não libera contrato assinado nem cobrança automática.",
    eventos: ["confirmacao_formal_recebida"],
  },
  {
    codigo: "contrato_cobranca",
    ordem: 3,
    rotulo: "Contrato e cobrança",
    evidencia: "Contrato específico + Ordem de Serviço com dados e escopo resolvidos.",
    libera: "Cobrança apenas após contrato e condições aprovados, por decisão humana.",
    naoLibera: "Nenhuma emissão automática; SKU e preço vêm do catálogo homologado.",
    eventos: ["contrato_enviado", "contrato_assinado", "pagamento_inicial_confirmado"],
  },
  {
    codigo: "onboarding",
    ordem: 4,
    rotulo: "Onboarding",
    evidencia: "Contrato assinado e pagamento inicial confirmado.",
    libera: "Núcleo familiar, dossiê-mãe, checklist, plano de ação e primeira micro-entrega.",
    naoLibera: "Nada client-facing antes de aprovação interna.",
    eventos: ["onboarding_iniciado", "caso_ativo"],
  },
];

export type SituacaoAceite = {
  momentoAtual: MomentoAceite | null;
  rotuloEstado: string;
  proximaAcao: string;
  bloqueios: string[];
  alcancados: Record<MomentoAceite, boolean>;
};

/** Deriva o momento de aceite de um lead/caso a partir da sequência de eventos. */
export function situacaoAceite(eventos: readonly { event_type: string }[]): SituacaoAceite {
  const tipos = new Set(eventos.map((e) => e.event_type));
  const alcancados = MOMENTOS_ACEITE.reduce(
    (acc, m) => ({ ...acc, [m.codigo]: m.eventos.some((e) => tipos.has(e)) }),
    {} as Record<MomentoAceite, boolean>,
  );
  const ultimo = [...MOMENTOS_ACEITE].reverse().find((m) => alcancados[m.codigo]) ?? null;

  if (!ultimo) {
    return {
      momentoAtual: null,
      rotuloEstado: tipos.has("proposta_enviada") ? "Proposta enviada — sem aceite" : "Em triagem comercial",
      proximaAcao: tipos.has("proposta_enviada") ? "Fazer follow-up da proposta." : "Qualificar e agendar Discovery.",
      bloqueios: ["Sem aceite registrado: nada de contrato, cobrança ou onboarding."],
      alcancados,
    };
  }

  if (ultimo.codigo === "aceite_verbal") {
    return {
      momentoAtual: "aceite_verbal",
      rotuloEstado: "Aceite verbal — confirmação formal pendente",
      proximaAcao: "Solicitar confirmação escrita simples (print, WhatsApp ou e-mail).",
      bloqueios: ["Contrato e Ordem de Serviço bloqueados.", "Cobrança bloqueada.", "Não é cliente ativo."],
      alcancados,
    };
  }
  if (ultimo.codigo === "confirmacao_formal") {
    return {
      momentoAtual: "confirmacao_formal",
      rotuloEstado: "Aceite confirmado — formalização pendente",
      proximaAcao: "Preparar contrato e Ordem de Serviço com escopo, SKU e valor reconciliados.",
      bloqueios: ["Cobrança bloqueada até contrato e condições aprovados.", "Onboarding bloqueado."],
      alcancados,
    };
  }
  if (ultimo.codigo === "contrato_cobranca") {
    const assinado = tipos.has("contrato_assinado");
    const pago = tipos.has("pagamento_inicial_confirmado");
    return {
      momentoAtual: "contrato_cobranca",
      rotuloEstado: pago ? "Pagamento inicial confirmado" : assinado ? "Contrato assinado" : "Contrato enviado",
      proximaAcao: pago ? "Abrir onboarding padronizado." : assinado ? "Registrar pagamento inicial." : "Acompanhar assinatura.",
      bloqueios: pago ? [] : ["Onboarding bloqueado até contrato assinado e pagamento inicial confirmado."],
      alcancados,
    };
  }
  return {
    momentoAtual: "onboarding",
    rotuloEstado: tipos.has("caso_ativo") ? "Caso ativo" : "Onboarding iniciado",
    proximaAcao: tipos.has("caso_ativo")
      ? "Manter cadência: micro-entrega até D7 e atualização a cada 14 dias."
      : "Criar núcleo, dossiê-mãe, checklist, plano de ação e primeira micro-entrega até D7.",
    bloqueios: [],
    alcancados,
  };
}
