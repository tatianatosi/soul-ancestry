/**
 * CRM Journey — fases do ciclo de vida mapeadas ao schema real.
 *
 * Não cria `crm_calls` / `whatsapp_automations`. Call = `leads`.
 * WhatsApp = rascunho em `communication_queue` (awaiting_approval) ou
 * cópia manual (`alertas-whatsapp.ts`) — nunca envio automático sem gate.
 */

export type FaseJourneyId =
  | "lead_bruto"
  | "lead_qualificado"
  | "oportunidade"
  | "proposta_aceita"
  | "cliente_ativo"
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

/** Matriz §5 do CRM Journey — endereços reais do Desk. */
export const FASES_CRM_JOURNEY: readonly FaseCrmJourney[] = [
  {
    id: "lead_bruto",
    rotulo: "Lead Bruto",
    ritual: "Call de Discovery (agendada)",
    rotaDesk: "/calls",
    whatsapp: {
      template: "template_lembrete_call",
      canal: "communication_queue",
      detalhe: "Lembrete 24h: rascunho na fila, aprovação humana antes de qualquer envio.",
    },
    microEntregaApp: null,
    statusPiloto: "mvp",
  },
  {
    id: "lead_qualificado",
    rotulo: "Lead Qualificado",
    ritual: "Reunião de Alinhamento (SPIN)",
    rotaDesk: "/calls",
    whatsapp: {
      template: "template_followup_proposta",
      canal: "communication_queue",
      detalhe: "Follow-up 48h pós-call: fila interna, sem webhook automático.",
    },
    microEntregaApp: "Relatório de elegibilidade (sanitizado) quando publicado",
    statusPiloto: "mvp",
  },
  {
    id: "oportunidade",
    rotulo: "Oportunidade",
    ritual: "Envio / registro de proposta",
    rotaDesk: "/propostas",
    whatsapp: {
      template: "template_followup_proposta",
      canal: "communication_queue",
      detalhe: "Follow-up 48h sem resposta: rascunho aguardando aprovação.",
    },
    microEntregaApp: "Checklist de documentos (App) quando liberado",
    statusPiloto: "mvp",
  },
  {
    id: "proposta_aceita",
    rotulo: "Proposta Aceita",
    ritual: "Contrato / pagamento",
    rotaDesk: "/contratos",
    whatsapp: {
      template: "template_boas_vindas_d0",
      canal: "communication_queue",
      detalhe: "D0 boas-vindas + link App: só após aprovação; magic link pelo fluxo oficial.",
    },
    microEntregaApp: "Plano de ação / planejador (projeção autorizada)",
    statusPiloto: "mvp",
  },
  {
    id: "cliente_ativo",
    rotulo: "Cliente Ativo (Onboarding)",
    ritual: "Primeiro acesso ao App",
    rotaDesk: "/acessos-portal",
    whatsapp: {
      template: "template_tutorial_d1",
      canal: "communication_queue",
      detalhe: "D1 tutorial: fila; App = 7 abas canônicas.",
    },
    microEntregaApp: "Home / Jornada (progresso)",
    statusPiloto: "mvp",
  },
  {
    id: "cliente_pesquisa",
    rotulo: "Cliente em Pesquisa",
    ritual: "SLA / achado genealógico",
    rotaDesk: "/achados",
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
    rotaDesk: "/conversao",
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
