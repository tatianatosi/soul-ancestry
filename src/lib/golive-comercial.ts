/**
 * Cálculos de apresentação do Comercial / CRM vivo.
 *
 * Só agregam o que o lead já tem gravado (etapa, origem, responsável,
 * próximo passo, call, proposta). Não inventam dado, não gravam nada e não
 * filtram por texto livre: a exclusão de registros de teste acontece na
 * leitura, por sinalizador do próprio registro.
 */
import { dataHumana } from "@/lib/rotulos-golive";

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

/* ------------------------------------------------------------------ *
 * Atendimento: Discovery + call em um registro só
 * ------------------------------------------------------------------ */

/** Listas fechadas do atendimento. Nada de texto livre em situação/resultado. */
export const SITUACOES_CALL = [
  { valor: "agendada", rotulo: "Marcada" },
  { valor: "confirmada", rotulo: "Confirmada" },
  { valor: "realizada", rotulo: "Realizada" },
  { valor: "remarcada", rotulo: "Remarcada" },
  { valor: "no_show", rotulo: "Não compareceu" },
  { valor: "cancelada_lead", rotulo: "Cancelada pela pessoa" },
  { valor: "cancelada_clube", rotulo: "Cancelada pelo Clube" },
] as const;

export const RESULTADOS_DISCOVERY = [
  { valor: "segue_para_proposta", rotulo: "Segue para proposta" },
  { valor: "precisa_mais_informacao", rotulo: "Precisa de mais informação" },
  { valor: "fora_de_perfil", rotulo: "Fora de perfil" },
  { valor: "sem_resposta", rotulo: "Sem resposta" },
] as const;

/** Etapa gravável no lead a partir do resultado do Discovery. Sem resultado, nada muda. */
export function etapaDoResultado(resultado: string | null | undefined): string | null {
  switch (String(resultado ?? "").trim()) {
    case "segue_para_proposta":
      return "proposta_em_preparo";
    case "precisa_mais_informacao":
      return "qualificado";
    case "fora_de_perfil":
      return "perdido";
    case "sem_resposta":
      return "novo";
    default:
      return null;
  }
}

/** Espelho da máquina de estados do banco (transicao_permitida, entidade 'lead'). */
export const TRANSICOES_LEAD: Record<string, readonly string[]> = {
  novo: ["qualificado", "perdido", "arquivado"],
  qualificado: ["proposta_em_preparo", "perdido", "arquivado"],
  proposta_em_preparo: ["proposta_enviada", "perdido", "arquivado"],
  proposta_enviada: ["ganho", "perdido", "arquivado"],
  ganho: ["arquivado"],
  perdido: ["novo", "qualificado", "arquivado"],
};

/**
 * Próxima etapa gravável rumo ao alvo, respeitando a máquina de estados.
 * Devolve o alvo quando é transição direta, um passo intermediário válido
 * quando o alvo está a dois passos, e null quando nada pode ser gravado.
 */
export function passoDeEtapa(atual: string | null | undefined, alvo: string | null | undefined): string | null {
  const de = String(atual ?? "").trim();
  const para = String(alvo ?? "").trim();
  if (!para || !de || de === para) return null;
  const diretos = TRANSICOES_LEAD[de] ?? [];
  if (diretos.includes(para)) return para;
  for (const meio of diretos) {
    if ((TRANSICOES_LEAD[meio] ?? []).includes(para)) return meio;
  }
  return null;
}

const ROTULO_CALL = new Map<string, string>([
  ...SITUACOES_CALL.map((s) => [s.valor, s.rotulo] as [string, string]),
  ["sem_agenda", "Sem call marcada"],
  ["cancelada", "Cancelada"],
]);

export function rotuloDaCall(estado: string): string {
  return ROTULO_CALL.get(estado) ?? "Sem registro";
}

/** Distribuição das calls pelo estado gravado, do maior para o menor. */
export function porSituacaoDaCall(leads: LeadComercial[]): { rotulo: string; valor: number }[] {
  const contagem = new Map<string, number>();
  for (const lead of leads) {
    const chave = rotuloDaCall(estadoDaCall(lead));
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }
  return [...contagem.entries()].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor);
}

/** Resultado do Discovery gravado. Valor fora da lista vira "Outros/sem classificação". */
export function porResultadoDiscovery(leads: LeadComercial[]): { rotulo: string; valor: number }[] {
  const conhecidos = new Map<string, string>(RESULTADOS_DISCOVERY.map((r) => [r.valor, r.rotulo]));
  const contagem = new Map<string, number>();
  for (const lead of leads) {
    const bruto = String(lead.discoveryResultado ?? "").trim();
    const chave = !bruto
      ? "Sem Discovery registrado"
      : (conhecidos.get(bruto) ?? "Outros/sem classificação");
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }
  return [...contagem.entries()].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor);
}

export type PrazoProximaAcao = "vencida" | "hoje" | "proximos_7" | "depois" | "sem_prazo";

export const COLUNAS_PRAZO: { chave: PrazoProximaAcao; rotulo: string }[] = [
  { chave: "vencida", rotulo: "Vencida" },
  { chave: "hoje", rotulo: "Hoje" },
  { chave: "proximos_7", rotulo: "Próximos 7 dias" },
  { chave: "sem_prazo", rotulo: "Sem prazo" },
];

const DIA = 24 * 60 * 60 * 1000;
const soDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Prazo da próxima ação em dia local: vencida, hoje, próximos 7 dias, depois ou sem prazo. */
export function prazoDaProximaAcao(lead: LeadComercial, hoje = new Date()): PrazoProximaAcao {
  const prazo = lerData(lead.proximoPassoEm);
  if (!prazo) return "sem_prazo";
  const diff = Math.round((soDia(prazo) - soDia(hoje)) / DIA);
  if (diff < 0) return "vencida";
  if (diff === 0) return "hoje";
  if (diff <= 7) return "proximos_7";
  return "depois";
}

/** Kanban por prazo da próxima ação: quatro colunas fixas, sempre na mesma ordem. */
export function kanbanPorPrazo(
  leads: LeadComercial[],
  hoje = new Date(),
): { chave: PrazoProximaAcao; rotulo: string; leads: LeadComercial[] }[] {
  return COLUNAS_PRAZO.map((coluna) => ({
    ...coluna,
    leads: leads.filter((l) => prazoDaProximaAcao(l, hoje) === coluna.chave),
  }));
}

export type PassoRoteiro = {
  pergunta: string;
  resposta: string | null;
  fonte: string;
  estado: "respondida" | "pendente";
};

/**
 * Roteiro progressivo do atendimento: uma pergunta por vez, com a fonte da
 * resposta e o estado. Pergunta sem dado gravado fica pendente — nunca é
 * preenchida por dedução.
 */
export function roteiroDiscovery(lead: LeadComercial | null): PassoRoteiro[] {
  const passo = (pergunta: string, resposta: string | null, fonte: string): PassoRoteiro => ({
    pergunta,
    resposta: resposta && String(resposta).trim() ? String(resposta).trim() : null,
    fonte,
    estado: resposta && String(resposta).trim() ? "respondida" : "pendente",
  });
  const consentimento = lead?.consentimento
    ? [lead.consentimento, lead.consentimentoCanal, lead.consentimentoEm].filter(Boolean).join(" · ")
    : null;
  return [
    passo("Qual é o objetivo da família?", lead?.objetivo ?? null, "Entrada do lead"),
    passo("Por onde essa pessoa chegou?", lead?.origem ?? null, "Origem registrada no lead"),
    passo("Consentimento foi registrado?", consentimento, "Consentimento do lead"),
    passo(
      "Qual é a situação da call?",
      lead ? rotuloDaCall(estadoDaCall(lead)) : null,
      "Registro de call do lead",
    ),
    passo("Qual foi o resultado do Discovery?", lead?.discoveryResultado ?? null, "Mesa de Discovery"),
    passo(
      "Qual é a próxima ação?",
      lead?.proximoPasso
        ? [lead.proximoPasso, lead.proximoPassoEm ? dataHumana(lead.proximoPassoEm, "") : null]
            .filter(Boolean)
            .join(" · ")
        : null,
      "Próxima ação gravada no lead",
    ),
  ];
}

/** Leads sem próxima ação e calls vencidas, os dois contadores de atenção. */
export function contadoresDeAtencao(
  leads: LeadComercial[],
  agora = new Date(),
): { semProximaAcao: number; callVencida: number } {
  return {
    semProximaAcao: leads.filter((l) => !l.proximoPasso).length,
    callVencida: leads.filter((l) => callVencidaDoLead(l, agora)).length,
  };
}


/* ------------------------------------------------------------------ *
 * Roteiro progressivo e agenda do lead
 * ------------------------------------------------------------------ */

export type ProgressoRoteiro = {
  respondidas: number;
  total: number;
  percentual: number;
  /** Primeira pergunta ainda sem resposta gravada; `null` quando completo. */
  proxima: PassoRoteiro | null;
};

/**
 * Roteiro progressivo: quanto do Discovery já está gravado e qual é a próxima
 * pergunta a fazer. Nada é inferido — só conta resposta que existe no lead.
 */
export function progressoRoteiro(lead: LeadComercial | null): ProgressoRoteiro {
  const passos = roteiroDiscovery(lead);
  const respondidas = passos.filter((p) => p.estado === "respondida").length;
  return {
    respondidas,
    total: passos.length,
    percentual: passos.length ? Math.round((respondidas / passos.length) * 100) : 0,
    proxima: passos.find((p) => p.estado === "pendente") ?? null,
  };
}

export type AgendaLead = {
  estado: EstadoCallLead;
  rotulo: string;
  /** Data gravada da call: realizada quando houver, senão agendada. */
  quando: string | null;
  vencida: boolean;
  proximaAcao: string | null;
  proximaAcaoEm: string | null;
  prazo: PrazoProximaAcao;
};

/** Agenda do lead: situação da call gravada, data e próxima ação com prazo. */
export function agendaDoLead(lead: LeadComercial | null, agora = new Date()): AgendaLead | null {
  if (!lead) return null;
  const estado = estadoDaCall(lead);
  return {
    estado,
    rotulo: rotuloDaCall(estado),
    quando: lead.callRealizada ?? lead.callAgendada ?? null,
    vencida: callVencidaDoLead(lead, agora),
    proximaAcao: lead.proximoPasso ?? null,
    proximaAcaoEm: lead.proximoPassoEm ?? null,
    prazo: prazoDaProximaAcao(lead, agora),
  };
}

/**
 * A etapa comercial de uma linha crua de `leads`, como o Desk a lê.
 *
 * 22/09/2026: extraída de `golive.functions.ts`, onde vivia inline dentro do
 * normalizador de `leadsComerciais`. Duas superfícies precisam da mesma
 * definição — o funil do /golive/comercial e o pipeline do Comercial/CRM Vivo
 * (§12 do De-Para) — e duas cópias divergiriam no primeiro ajuste. A regra é a
 * que já estava lá: vale a etapa gravada pela máquina de estados do lead
 * (`estagio`); o eixo comercial é só reserva.
 */
export function etapaComercialDoLead(linha: Record<string, unknown>): string | null {
  const estagio = linha["estagio"];
  if (typeof estagio === "string" && estagio.trim()) return estagio;
  const eixo = linha["eixo_comercial"];
  if (typeof eixo === "string" && eixo.trim()) return eixo;
  return null;
}
