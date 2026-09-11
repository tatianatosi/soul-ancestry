/**
 * CRM Journey — ciclo de vida mapeado ao schema real.
 *
 * Cadeia comercial canônica (proprietária):
 * Lead → Call/Discovery → oportunidade → proposta → confirmação →
 * handoff → pessoa e caso canônicos → Planejador Universal
 *
 * Não cria `crm_calls` / `whatsapp_automations`. Call = superfície sobre `leads`.
 * WhatsApp = rascunho em `communication_queue` ou cópia manual — sem envio automático.
 */

export type PassoComercialId =
  | "lead"
  | "call_discovery"
  | "oportunidade"
  | "proposta"
  | "confirmacao"
  | "handoff"
  | "pessoa_caso"
  | "planejador_universal";

export type PassoComercialCrm = {
  id: PassoComercialId;
  passo: number;
  rotulo: string;
  ritual: string;
  rotaDesk: string;
  rotaHash?: string;
};

/**
 * Cadeia comercial viva — ordem obrigatória.
 * Handoff só depois da confirmação da proposta; pessoa/caso e Planejador vêm a seguir.
 */
export const SEQUENCIA_COMERCIAL_CRM_VIVO: readonly PassoComercialCrm[] = [
  {
    id: "lead",
    passo: 1,
    rotulo: "Lead",
    ritual: "Captura e triagem — existe antes de qualquer call",
    rotaDesk: "/leads",
  },
  {
    id: "call_discovery",
    passo: 2,
    rotulo: "Call / Discovery",
    ritual: "Call de diagnóstico (SPIN) — CRM vivo",
    rotaDesk: "/calls",
  },
  {
    id: "oportunidade",
    passo: 3,
    rotulo: "Oportunidade",
    ritual: "Qualificação comercial pós-Discovery (ainda sem proposta formal)",
    rotaDesk: "/conversao",
  },
  {
    id: "proposta",
    passo: 4,
    rotulo: "Proposta",
    ritual: "Idealmente call de apresentação + registro do artefato",
    rotaDesk: "/propostas",
  },
  {
    id: "confirmacao",
    passo: 5,
    rotulo: "Confirmação",
    ritual: "Aceite da proposta (verbal/formal) — ainda sem handoff",
    rotaDesk: "/propostas",
  },
  {
    id: "handoff",
    passo: 6,
    rotulo: "Handoff",
    ritual: "Após confirmação: executar handoff (grava pessoa + caso)",
    rotaDesk: "/calls",
  },
  {
    id: "pessoa_caso",
    passo: 7,
    rotulo: "Pessoa e caso canônicos",
    ritual: "clientes + crm_casos — eixo operacional do Desk",
    rotaDesk: "/casos",
  },
  {
    id: "planejador_universal",
    passo: 8,
    rotulo: "Planejador Universal",
    ritual: "Plano operacional do caso (fonte do que vem a seguir)",
    rotaDesk: "/casos",
  },
] as const;

export type FaseJourneyId =
  | "lead_bruto"
  | "lead_qualificado"
  | "oportunidade"
  | "proposta"
  | "confirmacao"
  | "handoff_pessoa_caso"
  | "planejador_universal"
  | "cliente_pesquisa"
  | "cliente_pesquisa_documento"
  | "pos_reconhecimento"
  | "cliente_recorrente";

export type StatusFaseJourney = "mvp" | "backlog" | "piloto";

export type FaseCrmJourney = {
  id: FaseJourneyId;
  rotulo: string;
  ritual: string;
  rotaDesk: string;
  rotaHash?: string;
  whatsapp: {
    template: string;
    canal: "communication_queue" | "copia_manual" | "bloqueado_auto";
    detalhe: string;
  };
  microEntregaApp: string | null;
  statusPiloto: StatusFaseJourney;
};

/** Ciclo completo Desk (cadeia comercial + entrega). */
export const FASES_CRM_JOURNEY: readonly FaseCrmJourney[] = [
  {
    id: "lead_bruto",
    rotulo: "Lead",
    ritual: "Captura e triagem (antes da call)",
    rotaDesk: "/leads",
    whatsapp: {
      template: "template_lembrete_call",
      canal: "communication_queue",
      detalhe: "Após agendar Discovery: lembrete 24h em rascunho na fila (aprovação humana).",
    },
    microEntregaApp: null,
    statusPiloto: "mvp",
  },
  {
    id: "lead_qualificado",
    rotulo: "Call / Discovery",
    ritual: "Call de diagnóstico (SPIN)",
    rotaDesk: "/calls",
    whatsapp: {
      template: "template_followup_proposta",
      canal: "communication_queue",
      detalhe: "Follow-up 48h pós-Discovery: fila interna, sem webhook automático.",
    },
    microEntregaApp: "Relatório de elegibilidade (sanitizado) quando publicado",
    statusPiloto: "mvp",
  },
  {
    id: "oportunidade",
    rotulo: "Oportunidade",
    ritual: "Qualificação comercial pós-Discovery",
    rotaDesk: "/conversao",
    whatsapp: {
      template: "template_followup_proposta",
      canal: "communication_queue",
      detalhe: "Nutrição da oportunidade: rascunho na fila, sem envio automático.",
    },
    microEntregaApp: null,
    statusPiloto: "mvp",
  },
  {
    id: "proposta",
    rotulo: "Proposta",
    ritual: "Call de apresentação (ideal) + registro em /propostas",
    rotaDesk: "/propostas",
    whatsapp: {
      template: "template_followup_proposta",
      canal: "communication_queue",
      detalhe: "Follow-up 48h sem resposta à proposta: rascunho aguardando aprovação.",
    },
    microEntregaApp: "Checklist de documentos (App) quando liberado",
    statusPiloto: "mvp",
  },
  {
    id: "confirmacao",
    rotulo: "Confirmação",
    ritual: "Aceite da proposta — handoff ainda não rodou",
    rotaDesk: "/propostas",
    whatsapp: {
      template: "template_boas_vindas_d0",
      canal: "communication_queue",
      detalhe: "Só após confirmação: preparar boas-vindas em rascunho (aprovação humana).",
    },
    microEntregaApp: null,
    statusPiloto: "mvp",
  },
  {
    id: "handoff_pessoa_caso",
    rotulo: "Handoff → pessoa e caso",
    ritual: "Após confirmação: handoff grava clientes + crm_casos",
    rotaDesk: "/calls",
    whatsapp: {
      template: "template_boas_vindas_d0",
      canal: "communication_queue",
      detalhe: "Pós-handoff: link App só pelo fluxo oficial (magic link), sem auto-envio.",
    },
    microEntregaApp: "Home do App quando acesso liberado",
    statusPiloto: "mvp",
  },
  {
    id: "planejador_universal",
    rotulo: "Planejador Universal",
    ritual: "Plano operacional do caso (fonte do que vem a seguir)",
    rotaDesk: "/casos",
    whatsapp: {
      template: "template_tutorial_d1",
      canal: "communication_queue",
      detalhe: "Comunicados de plano: fila com aprovação — nunca sozinho.",
    },
    microEntregaApp: "Jornada / progresso (projeção autorizada)",
    statusPiloto: "mvp",
  },
  {
    id: "cliente_pesquisa",
    rotulo: "Cliente em Pesquisa",
    ritual: "SLA / achado genealógico",
    rotaDesk: "/pesquisa-modulo",
    whatsapp: {
      template: "template_achado_historico",
      canal: "copia_manual",
      detalhe: "Alerta de achado: template + cópia manual / fila — não envia sozinho.",
    },
    microEntregaApp: "Achado publicado em Jornada/Árvore",
    statusPiloto: "mvp",
  },
  {
    id: "cliente_pesquisa_documento",
    rotulo: "Cliente em Pesquisa (documento)",
    ritual: "Documento validado / liberado",
    rotaDesk: "/atendimento",
    rotaHash: "publicacao",
    whatsapp: {
      template: "template_documento_validado",
      canal: "communication_queue",
      detalhe: "Validação → rascunho WhatsApp + publicação App só com autorização.",
    },
    microEntregaApp: "Documento em Documentos (portal)",
    statusPiloto: "mvp",
  },
  {
    id: "pos_reconhecimento",
    rotulo: "Pós-Reconhecimento",
    ritual: "Cidadania reconhecida",
    rotaDesk: "/casos",
    whatsapp: {
      template: "template_celebracao_legado",
      canal: "bloqueado_auto",
      detalhe: "Backlog piloto — sem automação de envio.",
    },
    microEntregaApp: "Linha do tempo / Legado",
    statusPiloto: "backlog",
  },
  {
    id: "cliente_recorrente",
    rotulo: "Cliente Recorrente",
    ritual: "Check-in D30 / NPS",
    rotaDesk: "/crm-journey",
    whatsapp: {
      template: "template_nps_d30",
      canal: "bloqueado_auto",
      detalhe: "Backlog piloto — sem automação de envio.",
    },
    microEntregaApp: null,
    statusPiloto: "backlog",
  },
] as const;

export function fasesMvp(): FaseCrmJourney[] {
  return FASES_CRM_JOURNEY.filter((f) => f.statusPiloto === "mvp");
}

export function hrefFase(f: FaseCrmJourney): string {
  return f.rotaHash ? `${f.rotaDesk}#${f.rotaHash}` : f.rotaDesk;
}

export function indiceFase(id: string): number {
  return FASES_CRM_JOURNEY.findIndex((f) => f.id === id);
}

export function fasePorId(id: string | undefined | null): FaseCrmJourney {
  const achada = FASES_CRM_JOURNEY.find((f) => f.id === id);
  return achada ?? FASES_CRM_JOURNEY[0]!;
}

export function faseVizinha(id: string, delta: -1 | 1): FaseCrmJourney | null {
  const i = indiceFase(id);
  if (i < 0) return null;
  return FASES_CRM_JOURNEY[i + delta] ?? null;
}

/** Próxima ação concreta da fase (CTA principal no hub). */
export function ctaPrincipalFase(f: FaseCrmJourney): { rotulo: string; to: string; hash?: string } {
  switch (f.id) {
    case "lead_bruto":
      return { rotulo: "Abrir Leads (captura / triagem)", to: "/leads" };
    case "lead_qualificado":
      return { rotulo: "Abrir Call / Discovery (SPIN)", to: "/calls" };
    case "oportunidade":
      return { rotulo: "Ver oportunidade em Conversão", to: "/conversao" };
    case "proposta":
      return { rotulo: "Registrar / abrir proposta", to: "/propostas" };
    case "confirmacao":
      return { rotulo: "Confirmar aceite da proposta", to: "/propostas" };
    case "handoff_pessoa_caso":
      return { rotulo: "Executar handoff (pessoa + caso)", to: "/calls" };
    case "planejador_universal":
      return { rotulo: "Abrir Casos → Planejador Universal", to: "/casos" };
    case "cliente_pesquisa":
      return { rotulo: "Abrir módulo de pesquisa", to: "/pesquisa-modulo" };
    case "cliente_pesquisa_documento":
      return { rotulo: "Atendimento e publicação", to: "/atendimento", hash: "publicacao" };
    case "pos_reconhecimento":
      return { rotulo: "Abrir Casos 360", to: "/casos" };
    case "cliente_recorrente":
      return { rotulo: "Ver hub da jornada", to: "/crm-journey" };
  }
}
