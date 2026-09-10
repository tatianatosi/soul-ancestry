/**
 * Painel de Calls — registro da chamada, qualificação do lead e handoff.
 *
 * Camada derivada e somente interna: lê o próprio lead (fonte canônica no CRM)
 * e calcula estado da call, pendências de qualificação e bloqueios de handoff.
 * Não conclui elegibilidade jurídica, não cria segunda ficha, não dispara
 * proposta, contrato, cobrança, mensagem, publicação nem qualquer ação externa.
 */

import { handoffLead, type LeadDesk } from "@/lib/crm-desk";
import { pendenciasDicionarioDoLead } from "@/lib/dicionario-calls-crm";

export type EstadoCall =
  | "sem_agenda"
  | "agendada"
  | "confirmada"
  | "realizada"
  | "remarcada"
  | "no_show"
  | "cancelada";

export const ROTULO_ESTADO_CALL: Record<EstadoCall, string> = {
  sem_agenda: "Sem agenda",
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  remarcada: "Remarcada",
  no_show: "No-show",
  cancelada: "Cancelada",
};

const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

/** Estado da call derivado do status registrado e das datas da ficha. */
export function estadoCall(l: LeadDesk): EstadoCall {
  const s = String(l.status_call ?? "");
  if (s === "cancelada_lead" || s === "cancelada_clube") return "cancelada";
  if (s === "realizada") return "realizada";
  if (s === "no_show") return "no_show";
  if (s === "remarcada") return "remarcada";
  if (s === "confirmada") return "confirmada";
  if (s === "agendada") return "agendada";
  if (!vazio(l.call_realizada_em)) return "realizada";
  if (!vazio(l.call_agendada_em)) return "agendada";
  return "sem_agenda";
}

export type Pendencia = { campo: string; motivo: string };

/**
 * Bloqueios do registro da call: só é possível dar a chamada por registrada
 * quando data, resumo, resultado e próxima ação datada existem.
 */
export function bloqueiosRegistroCall(l: LeadDesk): Pendencia[] {
  const p: Pendencia[] = [];
  const estado = estadoCall(l);

  if (estado === "realizada") {
    if (vazio(l.call_realizada_em)) p.push({ campo: "call_realizada_em", motivo: "Call realizada exige data e hora do atendimento." });
    if (vazio(l.resumo_call)) p.push({ campo: "resumo_call", motivo: "Call realizada exige resumo interno da conversa." });
    if (!l.resumo_validado) p.push({ campo: "resumo_validado", motivo: "Resumo da call precisa ser validado por quem atendeu." });
    if (vazio(l.discovery_resultado)) p.push({ campo: "discovery_resultado", motivo: "Call realizada exige resultado da Discovery." });
    if (vazio(l.proxima_acao) || vazio(l.proxima_acao_em)) {
      p.push({ campo: "proxima_acao", motivo: "Call realizada exige próxima ação com prazo." });
    }
  }

  if ((estado === "agendada" || estado === "confirmada") && vazio(l.call_agendada_em)) {
    p.push({ campo: "call_agendada_em", motivo: "Call agendada exige data e hora previstas." });
  }

  if (estado === "no_show" && (vazio(l.proxima_acao) || vazio(l.proxima_acao_em))) {
    p.push({ campo: "proxima_acao", motivo: "No-show exige próxima ação datada (reagendar ou nutrir)." });
  }

  if (String(l.consentimento_status) === "concedido") {
    if (vazio(l.consentimento_em)) p.push({ campo: "consentimento_em", motivo: "Consentimento concedido exige data/hora do registro." });
    if (vazio(l.consentimento_canal)) p.push({ campo: "consentimento_canal", motivo: "Consentimento concedido exige canal do registro." });
  }
  if (String(l.consentimento_status) !== "concedido" && !vazio(l.gravacao_link_interno)) {
    p.push({ campo: "gravacao_link_interno", motivo: "Gravação registrada sem consentimento concedido: remova o link ou registre o consentimento." });
  }

  return p;
}

/** Bloqueios da qualificação preliminar da Discovery (sinal interno, nunca parecer). */
export function bloqueiosQualificacao(l: LeadDesk): Pendencia[] {
  const p: Pendencia[] = [];
  if (estadoCall(l) !== "realizada") {
    p.push({ campo: "status_call", motivo: "Qualificação só é registrada após a call realizada." });
    return p;
  }
  if (vazio(l.elegibilidade_preliminar)) p.push({ campo: "elegibilidade_preliminar", motivo: "Registre o sinal preliminar de elegibilidade." });
  if (vazio(l.confianca_triagem)) p.push({ campo: "confianca_triagem", motivo: "Registre a confiança da triagem." });
  if (vazio(l.nivel_intencao)) p.push({ campo: "nivel_intencao", motivo: "Registre o nível de intenção do lead." });
  if (vazio(l.objecao_predominante)) p.push({ campo: "objecao_predominante", motivo: "Registre a objeção predominante (ou 'Não houve')." });
  if (vazio(l.estado_documental_inicial)) p.push({ campo: "estado_documental_inicial", motivo: "Registre o estado documental inicial." });

  if (["forte", "provavel"].includes(String(l.elegibilidade_preliminar))) {
    if (vazio(l.via_juridica_preliminar)) p.push({ campo: "via_juridica_preliminar", motivo: "Sinal Forte/Provável exige via jurídica preliminar." });
    if (vazio(l.geracao_ascendente)) p.push({ campo: "geracao_ascendente", motivo: "Sinal Forte/Provável exige geração do ascendente." });
    if (vazio(l.linha_transmissao)) p.push({ campo: "linha_transmissao", motivo: "Sinal Forte/Provável exige linha de transmissão informada." });
  }
  return p;
}

export type HandoffCall = {
  registro: Pendencia[];
  qualificacao: Pendencia[];
  handoff: Pendencia[];
  /** Regras do dicionário CA-04 no lead vivo. Informam; não entram em `liberado`. */
  dicionario: Pendencia[];
  bloqueios: Pendencia[];
  liberado: boolean;
  destino: "proposta" | "nutricao" | "encerrar_sem_aderencia" | "indefinido";
};

/**
 * Handoff Discovery → oportunidade. Só libera com registro completo,
 * qualificação registrada e responsável/próxima ação/prazo definidos.
 */
export function avaliarHandoffCall(l: LeadDesk): HandoffCall {
  const registro = bloqueiosRegistroCall(l);
  const qualificacao = bloqueiosQualificacao(l);
  const h = handoffLead(l);
  const handoff = h.bloqueios.filter((b) => b.alvo === "proposta").map((b) => ({ campo: "handoff", motivo: b.motivo }));

  const resultado = String(l.discovery_resultado);
  const destino: HandoffCall["destino"] =
    resultado === "aderente" || resultado === "aderente_com_ressalva"
      ? "proposta"
      : resultado === "sem_aderencia"
        ? "encerrar_sem_aderencia"
        : resultado === "reagendar" || resultado === "no_show"
          ? "nutricao"
          : "indefinido";

  const dicionario = pendenciasDicionarioDoLead(l);
  const bloqueios = [...registro, ...qualificacao, ...handoff];
  return {
    registro,
    qualificacao,
    handoff,
    dicionario,
    bloqueios,
    liberado: bloqueios.length === 0,
    destino,
  };
}

export type FilaCalls = {
  chave: "hoje" | "aguardando_registro" | "qualificacao_pendente" | "pronto_handoff" | "sem_agenda";
  rotulo: string;
  leads: LeadDesk[];
};

/** Filas do Painel de Calls. Cada lead aparece uma única vez, na fila mais crítica. */
export function filasCalls(leads: LeadDesk[], hojeIso: string): FilaCalls[] {
  const dia = hojeIso.slice(0, 10);
  const filas: Record<FilaCalls["chave"], LeadDesk[]> = {
    aguardando_registro: [],
    qualificacao_pendente: [],
    hoje: [],
    pronto_handoff: [],
    sem_agenda: [],
  };

  for (const l of leads) {
    if (l.archived_at) continue;
    const estado = estadoCall(l);
    const av = avaliarHandoffCall(l);
    if (estado === "realizada" && av.registro.length) filas.aguardando_registro.push(l);
    else if (estado === "realizada" && av.qualificacao.length) filas.qualificacao_pendente.push(l);
    else if (estado === "realizada" && av.liberado) filas.pronto_handoff.push(l);
    else if (["agendada", "confirmada", "remarcada"].includes(estado) && String(l.call_agendada_em ?? "").slice(0, 10) <= dia)
      filas.hoje.push(l);
    else filas.sem_agenda.push(l);
  }

  return [
    { chave: "hoje", rotulo: "Calls de hoje e atrasadas", leads: filas.hoje },
    { chave: "aguardando_registro", rotulo: "Aguardando registro da call", leads: filas.aguardando_registro },
    { chave: "qualificacao_pendente", rotulo: "Qualificação pendente", leads: filas.qualificacao_pendente },
    { chave: "pronto_handoff", rotulo: "Pronto para handoff", leads: filas.pronto_handoff },
    { chave: "sem_agenda", rotulo: "Sem call agendada", leads: filas.sem_agenda },
  ];
}

export type SinalCor = "verde" | "amarelo" | "vermelho" | "laranja" | "neutro";

/**
 * Cor de sinal da elegibilidade preliminar (seção 5 — formatação condicional —
 * da especificação v1.0 do Painel de Calls, nunca implementada em tela até
 * hoje). Sinal interno de triagem, não é parecer jurídico.
 */
export function corElegibilidade(elegibilidade: string | null | undefined): SinalCor {
  const v = String(elegibilidade ?? "");
  if (v === "forte" || v === "provavel") return "verde";
  if (v === "inconclusiva" || v === "possivel_com_pesquisa") return "amarelo";
  if (v === "baixa" || v === "sem_aderencia_atual") return "vermelho";
  return "neutro";
}

/** Cor de sinal da complexidade documental — mesma seção 5. */
export function corComplexidade(complexidade: string | null | undefined): SinalCor {
  const v = String(complexidade ?? "");
  if (v === "alta" || v === "muito_alta") return "laranja";
  return "neutro";
}

/** Próxima ação com prazo já vencido (tem data e ela já passou). */
export function acaoVencida(l: LeadDesk, hojeIso: string): boolean {
  const prazo = l.proxima_acao_em ? String(l.proxima_acao_em).slice(0, 10) : "";
  return Boolean(prazo) && prazo < hojeIso.slice(0, 10);
}

/** Contagens do cabeçalho do painel. */
export function resumoCalls(leads: LeadDesk[], hojeIso: string) {
  const filas = filasCalls(leads, hojeIso);
  const por = (c: FilaCalls["chave"]) => filas.find((f) => f.chave === c)?.leads.length ?? 0;
  return {
    hoje: por("hoje"),
    aguardandoRegistro: por("aguardando_registro"),
    qualificacaoPendente: por("qualificacao_pendente"),
    prontoHandoff: por("pronto_handoff"),
    semAgenda: por("sem_agenda"),
  };
}
