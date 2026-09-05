/**
 * Corte vertical canônico do Desk Intelligence (CA-LOVABLE-DESK-CANONICO-v1.0).
 * Regras puras — sem acesso a banco, sem efeito externo.
 */

export const TIPOS_CONVERSA = [
  "whatsapp_registrado",
  "call",
  "reuniao",
  "email_registrado",
  "transcricao_resumida",
  "nota_interna",
] as const;
export type TipoConversa = (typeof TIPOS_CONVERSA)[number];

export const ROTULO_CONVERSA: Record<TipoConversa, string> = {
  whatsapp_registrado: "WhatsApp registrado",
  call: "Call",
  reuniao: "Reunião",
  email_registrado: "E-mail registrado",
  transcricao_resumida: "Transcrição resumida",
  nota_interna: "Nota interna",
};

export const DIRECOES_CONVERSA = ["inbound", "outbound", "internal"] as const;
export type DirecaoConversa = (typeof DIRECOES_CONVERSA)[number];

/** Lista fechada dos 16 eventos de funil. Nada fora daqui é aceito. */
export const EVENTOS_FUNIL = [
  "lead_criado",
  "lead_qualificado",
  "discovery_agendada",
  "discovery_realizada",
  "proposta_em_preparacao",
  "proposta_enviada",
  "aceite_verbal_confirmado",
  "confirmacao_formal_pendente",
  "confirmacao_formal_recebida",
  "formalizacao_em_preparacao",
  "contrato_enviado",
  "contrato_assinado",
  "pagamento_inicial_confirmado",
  "onboarding_iniciado",
  "caso_ativo",
  "perdido",
] as const;
export type EventoFunil = (typeof EVENTOS_FUNIL)[number];

/** Eventos que exigem confirmação humana explícita e referência interna verificável. */
export const EVENTOS_SENSIVEIS: readonly EventoFunil[] = [
  "aceite_verbal_confirmado",
  "confirmacao_formal_recebida",
  "contrato_assinado",
  "pagamento_inicial_confirmado",
  "onboarding_iniciado",
  "caso_ativo",
];

export const ROTULO_EVENTO: Record<EventoFunil, string> = {
  lead_criado: "Lead criado",
  lead_qualificado: "Lead qualificado",
  discovery_agendada: "Discovery agendada",
  discovery_realizada: "Discovery realizada",
  proposta_em_preparacao: "Proposta em preparação",
  proposta_enviada: "Proposta enviada",
  aceite_verbal_confirmado: "Aceite verbal confirmado",
  confirmacao_formal_pendente: "Confirmação formal pendente",
  confirmacao_formal_recebida: "Confirmação formal recebida",
  formalizacao_em_preparacao: "Formalização em preparação",
  contrato_enviado: "Contrato enviado",
  contrato_assinado: "Contrato assinado",
  pagamento_inicial_confirmado: "Pagamento inicial confirmado",
  onboarding_iniciado: "Onboarding iniciado",
  caso_ativo: "Caso ativo",
  perdido: "Perdido",
};

export const eventoSensivel = (tipo: string) => (EVENTOS_SENSIVEIS as readonly string[]).includes(tipo);

/** Efeitos que um evento NUNCA produz automaticamente nesta entrega. */
export const EFEITOS_PROIBIDOS = [
  "contrato",
  "cobranca",
  "assinatura",
  "mensagem_externa",
  "onboarding",
  "cliente_ativo",
  "pesquisa_externa",
] as const;

/** Próxima ação padrão derivada do evento registrado. Nunca dispara ato externo. */
export function proximaAcaoPadrao(tipo: EventoFunil): string {
  switch (tipo) {
    case "aceite_verbal_confirmado":
      return "Solicitar confirmação formal por escrito";
    case "confirmacao_formal_recebida":
      return "Iniciar preparação interna de formalização";
    case "formalizacao_em_preparacao":
      return "Consolidar dados, escopo e condição comercial";
    case "contrato_assinado":
      return "Aguardar confirmação do pagamento inicial";
    case "pagamento_inicial_confirmado":
      return "Verificar gates de onboarding";
    case "onboarding_iniciado":
      return "Concluir checklist inicial e plano de ação";
    default:
      return "Definir próxima ação com responsável e prazo";
  }
}

export type ErroCanonico = { campo: string; mensagem: string };

export type EntradaConversa = {
  tipo?: string | null;
  direcao?: string | null;
  ocorreu_em?: string | null;
  resumo_validado?: string | null;
  responsavel_user_id?: string | null;
  proxima_acao?: string | null;
  prazo_proxima_acao?: string | null;
  contact_id?: string | null;
  opportunity_id?: string | null;
  case_id?: string | null;
};

/** Toda conversa exige tipo, data/hora, resumo, responsável, próxima ação, prazo e vínculo. */
export function validarConversa(c: EntradaConversa): ErroCanonico[] {
  const e: ErroCanonico[] = [];
  const vazio = (v?: string | null) => !String(v ?? "").trim();

  if (!c.tipo || !(TIPOS_CONVERSA as readonly string[]).includes(c.tipo)) {
    e.push({ campo: "tipo", mensagem: "Tipo de conversa fora da lista controlada." });
  }
  if (c.direcao && !(DIRECOES_CONVERSA as readonly string[]).includes(c.direcao)) {
    e.push({ campo: "direcao", mensagem: "Direção inválida." });
  }
  if (vazio(c.ocorreu_em)) e.push({ campo: "ocorreu_em", mensagem: "Data e hora do registro são obrigatórias." });
  if (vazio(c.resumo_validado)) e.push({ campo: "resumo_validado", mensagem: "Resumo validado é obrigatório." });
  if (vazio(c.responsavel_user_id)) e.push({ campo: "responsavel_user_id", mensagem: "Responsável nominal é obrigatório." });
  if (vazio(c.proxima_acao)) e.push({ campo: "proxima_acao", mensagem: "Próxima ação é obrigatória." });
  if (vazio(c.prazo_proxima_acao)) e.push({ campo: "prazo_proxima_acao", mensagem: "Prazo da próxima ação é obrigatório." });
  if (vazio(c.contact_id) && vazio(c.opportunity_id) && vazio(c.case_id)) {
    e.push({ campo: "vinculo", mensagem: "Vincule a conversa a um contato, oportunidade ou caso." });
  }
  return e;
}

export type EntradaEvento = {
  tipo_evento?: string | null;
  ocorreu_em?: string | null;
  responsavel_user_id?: string | null;
  evidencia_referencia_interna?: string | null;
  confirmado?: boolean;
};

/** Evento de funil só entra por ação humana: tipo manual, responsável, data e evidência. */
export function validarEvento(ev: EntradaEvento): ErroCanonico[] {
  const e: ErroCanonico[] = [];
  const vazio = (v?: string | null) => !String(v ?? "").trim();

  if (!ev.tipo_evento || !(EVENTOS_FUNIL as readonly string[]).includes(ev.tipo_evento)) {
    e.push({ campo: "tipo_evento", mensagem: "Evento fora da lista controlada de 16 marcos." });
  }
  if (vazio(ev.ocorreu_em)) e.push({ campo: "ocorreu_em", mensagem: "Data e hora do evento são obrigatórias." });
  if (vazio(ev.responsavel_user_id)) e.push({ campo: "responsavel_user_id", mensagem: "Responsável nominal é obrigatório." });
  if (vazio(ev.evidencia_referencia_interna)) {
    e.push({ campo: "evidencia_referencia_interna", mensagem: "Referência à conversa ou evidência interna é obrigatória." });
  }
  if (ev.tipo_evento && eventoSensivel(ev.tipo_evento) && ev.confirmado !== true) {
    e.push({ campo: "confirmado", mensagem: "Evento sensível exige confirmação humana explícita." });
  }
  return e;
}

/** Aceite verbal e confirmação formal nunca liberam ato externo. */
export function efeitosLiberados(tipo: EventoFunil): string[] {
  if (tipo === "aceite_verbal_confirmado") return ["registro_interno", "proxima_acao_confirmacao_formal"];
  if (tipo === "confirmacao_formal_recebida") return ["preparacao_interna_formalizacao"];
  return ["registro_interno"];
}

export type GatesOnboarding = {
  contrato_assinado?: boolean;
  pagamento_inicial_confirmado?: boolean;
  responsavel_principal?: string | null;
  nucleo_validado?: boolean;
  representacao_documentada?: boolean;
  representacao_necessaria?: boolean;
  dossie_mae_referencia_interna?: string | null;
  case_service_id?: string | null;
  checklist_criado?: boolean;
  plano_criado?: boolean;
  acesso_definido?: boolean;
};

export type ResultadoGates = { liberado: boolean; pendencias: string[] };

/** Contrato + pagamento são necessários, nunca suficientes. */
export function avaliarGatesOnboarding(g: GatesOnboarding): ResultadoGates {
  const p: string[] = [];
  if (!g.contrato_assinado) p.push("Contrato assinado não registrado.");
  if (!g.pagamento_inicial_confirmado) p.push("Pagamento inicial não confirmado.");
  if (!String(g.responsavel_principal ?? "").trim()) p.push("Responsável principal não definido.");
  if (!g.nucleo_validado) p.push("Núcleo familiar não validado.");
  if (g.representacao_necessaria && !g.representacao_documentada) p.push("Representação necessária sem documentação.");
  if (!String(g.dossie_mae_referencia_interna ?? "").trim()) p.push("Dossiê-mãe não vinculado.");
  if (!String(g.case_service_id ?? "").trim()) p.push("Produto, escopo e case_service não consolidados.");
  if (!g.checklist_criado) p.push("Checklist inicial não criado.");
  if (!g.plano_criado) p.push("Plano de ação não criado.");
  if (!g.acesso_definido) p.push("Ambiente e nível de acesso não definidos.");
  return { liberado: p.length === 0, pendencias: p };
}

export type StatusCasoDerivado =
  | "prospeccao"
  | "aceite_confirmado_formalizacao_pendente"
  | "pre_onboarding_bloqueado"
  | "onboarding_em_curso"
  | "ativo";

/** Estado do caso é sempre derivado dos eventos e gates — nunca digitado livremente. */
export function derivarStatusCaso(input: {
  eventos: readonly string[];
  gates: GatesOnboarding;
}): StatusCasoDerivado {
  const tem = (t: EventoFunil) => input.eventos.includes(t);
  const gates = avaliarGatesOnboarding(input.gates);

  if (tem("caso_ativo") && gates.liberado) return "ativo";
  if (tem("onboarding_iniciado") && gates.liberado) return "onboarding_em_curso";
  if (tem("confirmacao_formal_recebida") || tem("formalizacao_em_preparacao")) return "pre_onboarding_bloqueado";
  if (tem("aceite_verbal_confirmado")) return "aceite_confirmado_formalizacao_pendente";
  return "prospeccao";
}

export type EstadoCadencia = "regular" | "atencao" | "critico";

/** D7 primeira microentrega, D10 atenção, D14 crítico. Nenhum alerta envia mensagem. */
export function avaliarCadencia(diasSemTouchpoint: number, esperaExternaJustificada = false): {
  estado: EstadoCadencia;
  alerta: string | null;
  envioExterno: false;
} {
  if (esperaExternaJustificada) return { estado: "regular", alerta: null, envioExterno: false };
  if (diasSemTouchpoint >= 14) {
    return { estado: "critico", alerta: "14 dias sem atualização contextualizada: gerar rascunho interno.", envioExterno: false };
  }
  if (diasSemTouchpoint >= 10) {
    return { estado: "atencao", alerta: "10 dias sem touchpoint: alerta interno de atenção.", envioExterno: false };
  }
  if (diasSemTouchpoint >= 7) {
    return { estado: "regular", alerta: "D7: primeira microentrega planejada após onboarding.", envioExterno: false };
  }
  return { estado: "regular", alerta: null, envioExterno: false };
}

/** Só entrega publicada chega ao App Cliente. */
export function visivelNoAppCliente(d: { approval_status?: string | null; archived_at?: string | null }): boolean {
  return d.approval_status === "publicado" && !d.archived_at;
}

/** Normalização de telefone para deduplicação de contatos (somente dígitos). */
export function normalizarTelefone(valor?: string | null): string {
  const so = String(valor ?? "").replace(/\D+/g, "");
  if (!so) return "";
  return so.length > 11 ? so.slice(-11) : so;
}

export function normalizarEmail(valor?: string | null): string {
  return String(valor ?? "").trim().toLowerCase();
}

export type ContatoDedupe = { id?: string; nome?: string | null; email?: string | null; telefone?: string | null };

/** Deduplicação por telefone normalizado e e-mail; o resto vai para revisão humana. */
export function encontrarDuplicado(
  candidato: ContatoDedupe,
  existentes: readonly ContatoDedupe[],
): { duplicado: ContatoDedupe | null; motivo: string | null } {
  const tel = normalizarTelefone(candidato.telefone);
  const mail = normalizarEmail(candidato.email);
  for (const e of existentes) {
    if (tel && normalizarTelefone(e.telefone) === tel) return { duplicado: e, motivo: "telefone_normalizado" };
    if (mail && normalizarEmail(e.email) === mail) return { duplicado: e, motivo: "email" };
  }
  return { duplicado: null, motivo: null };
}
