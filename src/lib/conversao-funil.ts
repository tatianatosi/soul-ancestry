/**
 * Leitura interna do funil comercial a partir de eventos imutáveis.
 * Puro: não dispara cobrança, comunicação, contrato nem automação.
 */

import type { EventoConversao } from "@/lib/conversao";

export type EventoBruto = {
  id?: string;
  event_type: string;
  lead_id?: string | null;
  case_id?: string | null;
  cliente_id?: string | null;
  occurred_at: string;
  recorded_at?: string | null;
  recorded_by?: string | null;
  responsavel?: string | null;
  origem?: string | null;
  canal?: string | null;
  evidencia_referencia?: string | null;
  observacao?: string | null;
  is_demo?: boolean | null;
};

/** Escada canônica de etapas (perdido é desfecho, fora da escada). */
export const ESCADA: { codigo: EventoConversao; rotulo: string; momento: string }[] = [
  { codigo: "lead_criado", rotulo: "Lead criado", momento: "entrada" },
  { codigo: "lead_qualificado", rotulo: "Lead qualificado", momento: "entrada" },
  { codigo: "discovery_agendada", rotulo: "Discovery agendada", momento: "descoberta" },
  { codigo: "discovery_realizada", rotulo: "Discovery realizada", momento: "descoberta" },
  { codigo: "proposta_enviada", rotulo: "Proposta enviada", momento: "comercial" },
  { codigo: "aceite_verbal_confirmado", rotulo: "Aceite verbal confirmado", momento: "1. aceite verbal" },
  { codigo: "confirmacao_formal_recebida", rotulo: "Confirmação formal recebida", momento: "2. confirmação formal" },
  { codigo: "contrato_enviado", rotulo: "Contrato enviado", momento: "3. contrato e cobrança" },
  { codigo: "contrato_assinado", rotulo: "Contrato assinado", momento: "3. contrato e cobrança" },
  { codigo: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado", momento: "3. contrato e cobrança" },
  { codigo: "onboarding_iniciado", rotulo: "Onboarding iniciado", momento: "4. onboarding" },
  { codigo: "caso_ativo", rotulo: "Caso ativo", momento: "operação" },
];

export const PROXIMA_ACAO: Record<string, string> = {
  nenhum: "Registrar entrada do lead (evento lead_criado) com origem e responsável.",
  lead_criado: "Qualificar o lead e registrar o evento de qualificação.",
  lead_qualificado: "Agendar discovery.",
  discovery_agendada: "Realizar discovery e registrar o evento.",
  discovery_realizada: "Preparar e enviar proposta a partir do catálogo homologado.",
  proposta_enviada: "Acompanhar resposta da proposta. Nenhuma cobrança é liberada.",
  aceite_verbal_confirmado: "Solicitar confirmação escrita simples (print, WhatsApp, e-mail) e registrá-la.",
  confirmacao_formal_recebida:
    "Reconhecer a proposta ativa ou criar versão para ajuste; reconciliar SKU, preço, escopo, parcelamento e vencimento; preencher dados rastreáveis de partes e participantes; gerar prévia interna única de contrato, Anexo I e OS; submeter à revisão humana. Não libera contrato final, assinatura nem cobrança.",
  contrato_enviado: "Aguardar assinatura com referência externa verificável.",
  contrato_assinado: "Decidir cobrança manualmente e registrar pagamento inicial pela fonte financeira.",
  pagamento_inicial_confirmado: "Iniciar onboarding (núcleo, dossiê-mãe, checklist, plano de ação).",
  onboarding_iniciado: "Concluir onboarding mínimo e publicar a primeira micro-entrega.",
  caso_ativo: "Operação plena — acompanhar cadência de valor.",
  perdido: "Registrar motivo da perda. Nenhuma ação comercial pendente.",
};

export type EstadoEntidade = {
  chave: string;
  tipo: "lead" | "caso";
  leadId: string | null;
  caseId: string | null;
  rotulo: string;
  alcancados: Record<string, { occurred_at: string; evidencia?: string | null; origem?: string | null }>;
  etapaAtual: EventoConversao | null;
  rotuloEtapa: string;
  perdido: boolean;
  responsavel: string | null;
  proximaAcao: string;
  bloqueios: string[];
  inconsistencias: string[];
  isDemo: boolean;
  ultimoEvento: string | null;
};

const ordem = ESCADA.map((e) => e.codigo);

/** Bloqueios executáveis por estado — o que ainda NÃO está liberado. */
function bloqueiosDe(alc: Set<string>): string[] {
  const b: string[] = [];
  if (alc.has("aceite_verbal_confirmado") && !alc.has("confirmacao_formal_recebida")) {
    b.push("Aceite verbal registrado: não cria cliente ativo, contrato, fatura, pagamento, portal ou onboarding. Falta confirmação formal escrita.");
  }
  if (alc.has("confirmacao_formal_recebida") && !alc.has("contrato_assinado")) {
    b.push("Confirmação formal libera apenas preparação de ficha, escopo e prévia contratual. Cobrança e portal seguem bloqueados.");
  }
  if (alc.has("contrato_assinado") && !alc.has("pagamento_inicial_confirmado")) {
    b.push("Cobrança depende de decisão humana; pagamento inicial exige valor, data e referência transacional da fonte financeira.");
  }
  if (!(alc.has("contrato_assinado") && alc.has("pagamento_inicial_confirmado")) && !alc.has("onboarding_iniciado")) {
    b.push("Onboarding bloqueado: exige contrato assinado e pagamento inicial confirmado.");
  }
  return b;
}

export function montarEstados(
  eventos: EventoBruto[],
  rotulos: { leads?: Map<string, string>; casos?: Map<string, string> } = {},
): EstadoEntidade[] {
  const grupos = new Map<string, EventoBruto[]>();
  for (const ev of eventos) {
    const chave = ev.lead_id ? `lead:${ev.lead_id}` : ev.case_id ? `caso:${ev.case_id}` : null;
    if (!chave) continue;
    const lista = grupos.get(chave) ?? [];
    lista.push(ev);
    grupos.set(chave, lista);
  }

  return [...grupos.entries()]
    .map(([chave, lista]) => {
      const ordenados = [...lista].sort((a, b) => +new Date(a.occurred_at) - +new Date(b.occurred_at));
      const alcancados: EstadoEntidade["alcancados"] = {};
      for (const ev of ordenados) {
        alcancados[ev.event_type] = {
          occurred_at: ev.occurred_at,
          evidencia: ev.evidencia_referencia ?? null,
          origem: ev.origem ?? null,
        };
      }
      const set = new Set(Object.keys(alcancados));
      const perdido = set.has("perdido");
      let etapaAtual: EventoConversao | null = null;
      for (const c of ordem) if (set.has(c)) etapaAtual = c;

      const inconsistencias: string[] = [];
      const temPosterior = ordem.slice(1).some((c) => set.has(c));
      if (!set.has("lead_criado") && temPosterior) {
        inconsistencias.push("Evento inicial ausente ou fora do filtro: há eventos posteriores sem “lead criado”.");
      }
      for (let i = 1; i < ordem.length; i++) {
        if (set.has(ordem[i]!) && !set.has(ordem[i - 1]!) && ordem[i] !== "lead_criado") {
          inconsistencias.push(`Sequência incompleta: “${ESCADA[i]!.rotulo}” sem “${ESCADA[i - 1]!.rotulo}”.`);
          break;
        }
      }

      const leadId = ordenados.find((e) => e.lead_id)?.lead_id ?? null;
      const caseId = ordenados.find((e) => e.case_id)?.case_id ?? null;
      const rotulo =
        (leadId && rotulos.leads?.get(leadId)) ||
        (caseId && rotulos.casos?.get(caseId)) ||
        chave.replace("lead:", "Lead ").replace("caso:", "Caso ").slice(0, 20);

      const ultimo = ordenados[ordenados.length - 1];
      return {
        chave,
        tipo: chave.startsWith("lead") ? ("lead" as const) : ("caso" as const),
        leadId,
        caseId,
        rotulo,
        alcancados,
        etapaAtual,
        rotuloEtapa: perdido
          ? "Perdido"
          : (ESCADA.find((e) => e.codigo === etapaAtual)?.rotulo ?? "Sem etapa registrada"),
        perdido,
        responsavel: ultimo?.responsavel ?? null,
        proximaAcao: perdido ? PROXIMA_ACAO["perdido"]! : (PROXIMA_ACAO[etapaAtual ?? "nenhum"] ?? "—"),
        bloqueios: perdido ? [] : bloqueiosDe(set),
        inconsistencias,
        isDemo: ordenados.some((e) => e.is_demo === true),
        ultimoEvento: ultimo?.occurred_at ?? null,
      } as EstadoEntidade;
    })
    .sort((a, b) => (b.ultimoEvento ?? "").localeCompare(a.ultimoEvento ?? ""));
}


/* ─────────── Máquina de estados (espelha o guard do banco) ─────────── */

/** Pré-requisitos obrigatórios de cada evento. Nenhum salto de etapa é aceito. */
export const PRE_REQUISITOS: Record<string, string[]> = {
  lead_qualificado: ["lead_criado"],
  discovery_agendada: ["lead_qualificado"],
  discovery_realizada: ["discovery_agendada"],
  proposta_enviada: ["discovery_realizada"],
  aceite_verbal_confirmado: ["proposta_enviada"],
  confirmacao_formal_pendente: ["aceite_verbal_confirmado"],
  confirmacao_formal_recebida: ["aceite_verbal_confirmado"],
  formalizacao_em_preparacao: ["confirmacao_formal_recebida"],
  contrato_enviado: ["confirmacao_formal_recebida"],
  contrato_assinado: ["contrato_enviado"],
  pagamento_inicial_confirmado: ["contrato_assinado"],
  onboarding_iniciado: ["contrato_assinado", "pagamento_inicial_confirmado"],
  caso_ativo: ["onboarding_iniciado"],
};

const ROTULO_EVENTO: Record<string, string> = Object.fromEntries(ESCADA.map((e) => [e.codigo, e.rotulo]));

/** Valida o avanço a partir dos eventos já registrados da mesma entidade. */
export function validarTransicaoEvento(
  destino: string,
  alcancados: Iterable<string>,
): { permitido: boolean; motivos: string[] } {
  const set = new Set(alcancados);
  const motivos: string[] = [];
  for (const req of PRE_REQUISITOS[destino] ?? []) {
    if (!set.has(req)) {
      motivos.push(
        `Transição bloqueada: “${ROTULO_EVENTO[destino] ?? destino}” exige “${ROTULO_EVENTO[req] ?? req}” registrado antes. O evento anterior não é criado automaticamente.`,
      );
    }
  }
  return { permitido: motivos.length === 0, motivos };
}

/* ─────────── Funil de eventos ─────────── */

export type LinhaFunil = {
  codigo: EventoConversao;
  rotulo: string;
  momento: string;
  eventos: number;
  entidades: number;
  taxa: number | null;
  denominador: number;
};

export function montarFunil(eventos: EventoBruto[], estados: EstadoEntidade[]): LinhaFunil[] {
  const contagem = new Map<string, number>();
  for (const ev of eventos) contagem.set(ev.event_type, (contagem.get(ev.event_type) ?? 0) + 1);

  const entidadesCom = (c: string) => estados.filter((e) => e.alcancados[c]).length;

  return ESCADA.map((e, i) => {
    const anterior = i === 0 ? null : ESCADA[i - 1]!.codigo;
    const denominador = anterior ? entidadesCom(anterior) : 0;
    const atual = entidadesCom(e.codigo);
    return {
      codigo: e.codigo,
      rotulo: e.rotulo,
      momento: e.momento,
      eventos: contagem.get(e.codigo) ?? 0,
      entidades: atual,
      denominador,
      taxa: denominador > 0 ? atual / denominador : null,
    };
  });
}

/* ─────────── Saúde comercial ─────────── */

export type ItemSaude = { id: string; rotulo: string; detalhe?: string };

export type SaudeFunil = {
  leadsSemProximaAcao: ItemSaude[];
  followupsVencidos: ItemSaude[];
  propostasSemResposta: ItemSaude[];
  aceiteVerbalSemFormalizacao: ItemSaude[];
  inconsistencias: ItemSaude[];
};

export type LeadMinimo = {
  id: string;
  nome?: string | null;
  codigo?: string | null;
  status?: string | null;
  proxima_acao?: string | null;
  prazo_proxima_acao?: string | null;
  is_demo?: boolean | null;
};

const ENCERRADOS = ["perdido", "descartado", "arquivado", "convertido", "ganho"];

/**
 * 07/09/2026 — achado de auditoria: `followupsVencidos` comparava
 * `prazo_proxima_acao` por TIMESTAMP exato aqui, enquanto o mesmo campo
 * (`leads.proxima_acao_em`) era comparado por DIA CALENDÁRIO em
 * `crm-desk.ts` (função `dia()`, usada por /métricas e Painel Hoje). Um
 * prazo marcado para "hoje às 18h" já aparecia vencido aqui a partir das
 * 18h, mas só no dia seguinte nas outras telas — duas contagens diferentes
 * de "follow-ups vencidos" dentro do mesmo dia. Unificado para dia
 * calendário, que é a convenção já usada no resto do produto para prazo.
 */
const soDia = (v: string | number | Date) => new Date(v).toISOString().slice(0, 10);

export function montarSaude(
  estados: EstadoEntidade[],
  leads: LeadMinimo[],
  agora: number = Date.now(),
  /** Universo completo (inclusive demonstração) — usado para não zerar indicadores existentes. */
  estadosTodos: EstadoEntidade[] = estados,
): SaudeFunil {
  const ativos = estados.filter((e) => !e.perdido);
  const chavesVisiveis = new Set(estados.map((e) => e.chave));

  /** Estado pendente de formalização nunca pode aparecer como zero: varre o universo completo. */
  const aceiteVerbalSemFormalizacao = estadosTodos
    .filter((e) => !e.perdido && e.alcancados["aceite_verbal_confirmado"] && !e.alcancados["confirmacao_formal_recebida"])
    .map((e) => {
      const foraDoRecorte = !chavesVisiveis.has(e.chave);
      return {
        id: e.chave,
        rotulo: e.rotulo,
        detalhe: `Aceite verbal em ${new Date(e.alcancados["aceite_verbal_confirmado"]!.occurred_at).toLocaleDateString("pt-BR")} — falta confirmação escrita.${
          foraDoRecorte ? " Registro de demonstração, fora das métricas, mas exibido por existir pendência real de formalização." : ""
        }`,
      };
    });

  const inconsistencias = estadosTodos
    .filter((e) => e.inconsistencias.length > 0)
    .map((e) => ({
      id: e.chave,
      rotulo: e.rotulo,
      detalhe: `${e.inconsistencias.join(" ")}${chavesVisiveis.has(e.chave) ? "" : " (registro de demonstração)"}`,
    }));

  return {
    leadsSemProximaAcao: leads
      .filter((l) => !ENCERRADOS.includes(String(l.status ?? "").toLowerCase()) && !l.proxima_acao)
      .map((l) => ({ id: l.id, rotulo: l.nome || l.codigo || l.id })),
    followupsVencidos: leads
      .filter((l) => l.prazo_proxima_acao && soDia(l.prazo_proxima_acao) < soDia(agora))
      .map((l) => ({ id: l.id, rotulo: l.nome || l.codigo || l.id, detalhe: `Prazo ${new Date(l.prazo_proxima_acao as string).toLocaleDateString("pt-BR")}` })),
    propostasSemResposta: ativos
      .filter((e) => e.etapaAtual === "proposta_enviada")
      .map((e) => ({ id: e.chave, rotulo: e.rotulo, detalhe: "Sem aceite verbal nem perda registrada." })),
    aceiteVerbalSemFormalizacao,
    inconsistencias,
  };
}


export const REFERENCIA_ACEITE: { titulo: string; itens: string[] }[] = [
  {
    titulo: "1. Aceite verbal",
    itens: [
      "Somente registra o evento com evidência interna da conversa.",
      "Próxima ação obrigatória: solicitar confirmação escrita simples.",
      "Não cria cliente ativo, contrato, fatura, pagamento, acesso de portal ou onboarding.",
    ],
  },
  {
    titulo: "2. Confirmação formal",
    itens: [
      "Aceita print, WhatsApp, e-mail ou aceite registrado com referência interna.",
      "Libera apenas preparação de ficha, escopo e prévia contratual.",
      "Não emite contrato, cobrança ou acesso ao portal automaticamente.",
    ],
  },
  {
    titulo: "3. Contrato e cobrança",
    itens: [
      "Contrato específico e Ordem de Serviço com dados e escopo reconciliados.",
      "Assinatura exige versão, data, referência externa, partes qualificadas e aprovação humana.",
      "Cobrança somente após contrato e condições aprovados, por decisão humana.",
      "Pagamento inicial exige valor, data e referência transacional confirmados pela fonte financeira.",
    ],
  },
  {
    titulo: "4. Onboarding",
    itens: [
      "Só após contrato assinado e pagamento inicial confirmado.",
      "Libera núcleo familiar, dossiê-mãe, checklist, plano de ação e primeira micro-entrega.",
    ],
  },
];

export const ONBOARDING_PADRAO_RESUMO = [
  "Mesmo padrão para todos os casos, sem exceção comercial.",
  "Primeira micro-entrega até D7; touchpoint de acompanhamento em D10 e D14.",
  "Nenhuma etapa é disparada por esta tela: registro e leitura apenas.",
];

export const percentualOuTraco = (v: number | null | undefined) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
