/**
 * Cálculos de apresentação do Comercial / CRM vivo.
 *
 * Só agregam o que o lead já tem gravado (etapa, origem, responsável,
 * próximo passo, call, proposta). Não inventam dado, não gravam nada e não
 * filtram por texto livre: a exclusão de registros de teste acontece na
 * leitura, por sinalizador do próprio registro.
 */

export type LeadComercial = {
  id: string;
  nome: string;
  etapa: string | null;
  estagio: string | null;
  origem: string | null;
  canal: string | null;
  responsavel: string | null;
  ultimoToque: string | null;
  proximoPasso: string | null;
  proximoPassoEm: string | null;
  criadoEm: string | null;
  callAgendada: string | null;
  callRealizada: string | null;
  statusCall: string | null;
  resumoCall: string | null;
  discoveryResultado: string | null;
  objetivo: string | null;
  consentimento: string | null;
  consentimentoEm: string | null;
  consentimentoCanal: string | null;
  propostaReferencia: string | null;
  /** Data da proposta registrada em interação; `null` = data não registrada. */
  propostaEm: string | null;
  /** Interação mais recente do lead que conta como follow-up. */
  ultimaInteracaoEm: string | null;
  casoId: string | null;
};

export type ColunaFunil = "Lead" | "Discovery" | "Call" | "Proposta" | "Handoff";

export const COLUNAS_FUNIL: ColunaFunil[] = ["Lead", "Discovery", "Call", "Proposta", "Handoff"];

/** Data só-dia é lida como meia-noite local; carimbo com hora mantém o fuso. */
export function lerData(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const apenasDia = /^\d{4}-\d{2}-\d{2}$/.test(valor);
  const d = apenasDia ? new Date(`${valor}T00:00:00`) : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Coluna do funil derivada dos marcos já gravados, do mais avançado ao mais simples. */
export function colunaDoLead(lead: LeadComercial): ColunaFunil {
  if (lead.casoId) return "Handoff";
  if (lead.propostaReferencia) return "Proposta";
  if (lead.callRealizada) return "Call";
  if (lead.discoveryResultado) return "Discovery";
  return "Lead";
}

export function funil(leads: LeadComercial[]): { rotulo: string; valor: number }[] {
  const contagem = new Map<ColunaFunil, number>(COLUNAS_FUNIL.map((c) => [c, 0]));
  for (const lead of leads) {
    const coluna = colunaDoLead(lead);
    contagem.set(coluna, (contagem.get(coluna) ?? 0) + 1);
  }
  return COLUNAS_FUNIL.map((c) => ({ rotulo: c, valor: contagem.get(c) ?? 0 }));
}

/** Barras por canal/origem já gravados. Ausência vira "Sem origem registrada". */
export function porOrigem(
  leads: LeadComercial[],
  campo: "origem" | "canal" = "origem",
): { rotulo: string; valor: number }[] {
  const contagem = new Map<string, number>();
  for (const lead of leads) {
    const chave = lead[campo] ?? (campo === "origem" ? "Sem origem registrada" : "Sem canal registrado");
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor);
}

/**
 * Recorte por período de entrada do lead, em dias. `null` = tudo.
 * Lead sem data de entrada nunca é escondido: fica sempre no recorte e é
 * contado à parte por `semDataDeEntrada`.
 */
export function noPeriodo(leads: LeadComercial[], dias: number | null, agora = new Date()): LeadComercial[] {
  if (dias === null) return leads;
  const limite = agora.getTime() - dias * 24 * 60 * 60 * 1000;
  return leads.filter((l) => {
    const d = lerData(l.criadoEm);
    return d ? d.getTime() >= limite : true;
  });
}

/** Leads sem data de entrada gravada — declarados, nunca omitidos. */
export function semDataDeEntrada(leads: LeadComercial[]): LeadComercial[] {
  return leads.filter((l) => lerData(l.criadoEm) === null);
}

export type EstadoCallLead =
  | "sem_agenda"
  | "agendada"
  | "confirmada"
  | "realizada"
  | "remarcada"
  | "no_show"
  | "cancelada";

/** Estado da call a partir do status gravado; datas só completam o que falta. */
export function estadoDaCall(lead: LeadComercial): EstadoCallLead {
  const s = String(lead.statusCall ?? "").trim();
  if (s === "cancelada_lead" || s === "cancelada_clube") return "cancelada";
  if (s === "realizada") return "realizada";
  if (s === "no_show") return "no_show";
  if (s === "remarcada") return "remarcada";
  if (s === "confirmada") return "confirmada";
  if (s === "agendada") return "agendada";
  if (lead.callRealizada) return "realizada";
  if (lead.callAgendada) return "agendada";
  return "sem_agenda";
}

/**
 * Call vencida só quando continua de pé (agendada/confirmada), não foi
 * realizada e o horário já passou. Data sem hora só vence no fim do dia,
 * nunca pela manhã. Cancelada, remarcada, no-show e realizada não vencem.
 */
export function callVencidaDoLead(lead: LeadComercial, agora = new Date()): boolean {
  const estado = estadoDaCall(lead);
  if (estado !== "agendada" && estado !== "confirmada") return false;
  if (lead.callRealizada) return false;
  const agendada = lerData(lead.callAgendada);
  if (!agendada) return false;
  const apenasDia = /^\d{4}-\d{2}-\d{2}$/.test(String(lead.callAgendada));
  const limite = apenasDia
    ? new Date(agendada.getFullYear(), agendada.getMonth(), agendada.getDate(), 23, 59, 59, 999)
    : agendada;
  return limite.getTime() < agora.getTime();
}

export type SaudeLead = {
  semProximaAcao: LeadComercial[];
  semResponsavel: LeadComercial[];
  callVencida: LeadComercial[];
  propostaSemFollowUp: LeadComercial[];
  /** Proposta registrada sem data: não dá para medir follow-up — lacuna declarada. */
  propostaSemData: LeadComercial[];
};

/**
 * Call vencida conforme `callVencidaDoLead`.
 * Proposta sem follow-up = data da proposta gravada e nenhuma interação
 * elegível posterior a ela (não usa `updated_at`).
 */
export function saudeDosLeads(leads: LeadComercial[], agora = new Date()): SaudeLead {
  const semProximaAcao = leads.filter((l) => !l.proximoPasso);
  const semResponsavel = leads.filter((l) => !l.responsavel);
  const callVencida = leads.filter((l) => callVencidaDoLead(l, agora));
  const comProposta = leads.filter((l) => Boolean(l.propostaReferencia) || Boolean(l.propostaEm));
  const propostaSemData = comProposta.filter((l) => lerData(l.propostaEm) === null);
  const propostaSemFollowUp = comProposta.filter((l) => {
    const proposta = lerData(l.propostaEm);
    if (!proposta) return false;
    const toque = lerData(l.ultimaInteracaoEm);
    return !toque || toque.getTime() <= proposta.getTime();
  });
  return { semProximaAcao, semResponsavel, callVencida, propostaSemFollowUp, propostaSemData };
}

/** Agrupa os cartões por etapa comercial gravada, para o kanban. */
export function kanbanPorEtapa(leads: LeadComercial[]): { etapa: string; leads: LeadComercial[] }[] {
  const grupos = new Map<string, LeadComercial[]>();
  for (const lead of leads) {
    const chave = lead.etapa ?? "sem_etapa";
    grupos.set(chave, [...(grupos.get(chave) ?? []), lead]);
  }
  return [...grupos.entries()]
    .map(([etapa, itens]) => ({ etapa, leads: itens }))
    .sort((a, b) => b.leads.length - a.leads.length);
}
