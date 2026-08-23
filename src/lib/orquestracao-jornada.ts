/**
 * CA-OPS-01 — ORQUESTRAÇÃO INTERNA DE JORNADA
 * CRM → ONBOARDING → CADÊNCIA → MICROENTREGAS → ALERTAS → PAINEL HOJE.
 *
 * Módulo puro (sem I/O, sem rede, sem banco). Ele apenas DERIVA, a partir de
 * eventos internos já existentes, quais ações internas são permitidas e qual
 * template governado é aplicável.
 *
 * Invariantes:
 *  - Nenhum envio (WhatsApp, e-mail, SMS), publicação externa, cobrança,
 *    assinatura, integração ou pesquisa externa é executado ou autorizado.
 *  - A Biblioteca de Mensagens é fonte de TEMPLATE, nunca canal de envio.
 *  - Alertas são derivados: abrem o objeto canônico, nunca criam fila paralela.
 *  - Um objeto aparece uma única vez na fila do Painel Hoje.
 *  - Só microentrega `publicado` pode projetar conteúdo sanitizado ao cliente.
 */

import {
  calcularCadencia,
  entregasParaAppCliente,
  podeTransicionarEntrega,
  validarTouchpoint,
  avaliarSituacaoCaso,
  type EstadoCaso,
  type FaseJornada,
  type MicroentregaBruta,
  type MicroentregaPublicada,
  type SaudeCadencia,
  type StatusAprovacao,
  type TouchpointConteudo,
} from "@/lib/jornada-cliente";

/* ------------------------------------------------------------------ */
/* A. Biblioteca de Mensagens — templates governados (sem envio)       */
/* ------------------------------------------------------------------ */

export const CANAIS_PREVISTOS = ["whatsapp", "email", "portal", "interno"] as const;
export type CanalPrevisto = (typeof CANAIS_PREVISTOS)[number];

export type PublicoElegivel = "cliente_titular" | "cliente_acompanhante" | "equipe_interna";

export type TemplateGovernado = {
  chave: string;
  titulo: string;
  etapa_jornada: FaseJornada;
  evento_canonico: EventoInterno;
  finalidade: string;
  /** Canal previsto é declaração de destino humano — não habilita envio. */
  canal_previsto: CanalPrevisto;
  publico_elegivel: PublicoElegivel;
  /** Condição que impede a sugestão do template. */
  regra_de_bloqueio: string;
  vigencia: { inicio: string; fim: string | null };
  /** Versão do texto governado. Ausente = versão 1. */
  versao?: number;
  /** Versão anterior que esta substitui (rastro de sucessão). */
  substitui_versao?: number | null;
};


/**
 * Registro governado dos templates da Biblioteca de Mensagens.
 * Sugerir ≠ enviar: o resultado é sempre rascunho interno para decisão humana.
 */
export const TEMPLATES_GOVERNADOS: readonly TemplateGovernado[] = [
  {
    chave: "primeiro_contato",
    titulo: "Primeiro contato com lead",
    etapa_jornada: "aceite_formalizacao",
    evento_canonico: "lead_novo",
    finalidade: "Apresentar o serviço e propor conversa de diagnóstico.",
    canal_previsto: "whatsapp",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Lead sem consentimento de contato registrado.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "confirmacao_call",
    titulo: "Confirmação de call agendada",
    etapa_jornada: "aceite_formalizacao",
    evento_canonico: "call_agendada",
    finalidade: "Confirmar data, horário e objetivo da call.",
    canal_previsto: "whatsapp",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Call sem data confirmada.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "resumo_call",
    titulo: "Resumo interno pós-call",
    etapa_jornada: "aceite_formalizacao",
    evento_canonico: "call_concluida",
    finalidade: "Registrar o combinado e o próximo marco verificável.",
    canal_previsto: "interno",
    publico_elegivel: "equipe_interna",
    regra_de_bloqueio: "Call sem registro de conclusão.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "proposta_enviada",
    titulo: "Acompanhamento de proposta",
    etapa_jornada: "aceite_formalizacao",
    evento_canonico: "proposta_enviada",
    finalidade: "Contextualizar a proposta enviada e combinar retorno.",
    canal_previsto: "whatsapp",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Proposta sem versão aprovada internamente.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "followup_vencido",
    titulo: "Retomada de follow-up",
    etapa_jornada: "aceite_formalizacao",
    evento_canonico: "followup_vencido",
    finalidade: "Retomar contato sem pressionar decisão.",
    canal_previsto: "whatsapp",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Lead arquivado ou com pedido de não contato.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "aceite_verbal",
    titulo: "Registro de aceite verbal",
    etapa_jornada: "aceite_formalizacao",
    evento_canonico: "aceite_verbal",
    finalidade: "Confirmar por escrito o que foi aceito verbalmente.",
    canal_previsto: "whatsapp",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Sem registro interno do aceite verbal.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "confirmacao_formal",
    titulo: "Orientação de formalização",
    etapa_jornada: "aceite_formalizacao",
    evento_canonico: "confirmacao_formal",
    finalidade: "Explicar as etapas de formalização já decididas.",
    canal_previsto: "email",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Confirmação formal não registrada no caso.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "boas_vindas",
    titulo: "Boas-vindas de onboarding",
    etapa_jornada: "onboarding",
    evento_canonico: "onboarding_elegivel",
    finalidade: "Abrir o onboarding e apresentar responsável e próximo marco.",
    canal_previsto: "whatsapp",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Gates de onboarding não cumpridos.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "microentrega_aprovada",
    titulo: "Preparação de microentrega aprovada",
    etapa_jornada: "pesquisa_inicial",
    evento_canonico: "microentrega_aprovada",
    finalidade: "Preparar o texto sanitizado antes da publicação interna.",
    canal_previsto: "interno",
    publico_elegivel: "equipe_interna",
    regra_de_bloqueio: "Microentrega fora do estado aprovado.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "microentrega_publicada",
    titulo: "Aviso de nova atualização publicada",
    etapa_jornada: "pesquisa_validacao",
    evento_canonico: "microentrega_publicada",
    finalidade: "Contextualizar a atualização já publicada no App Cliente.",
    canal_previsto: "portal",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Microentrega não publicada.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "microentrega_atrasada",
    titulo: "Contextualização de atraso interno",
    etapa_jornada: "pesquisa_validacao",
    evento_canonico: "microentrega_atrasada",
    finalidade: "Explicar internamente o atraso e o replanejamento.",
    canal_previsto: "interno",
    publico_elegivel: "equipe_interna",
    regra_de_bloqueio: "Microentrega sem prazo definido.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "cadencia_atencao",
    titulo: "Atualização de cadência",
    etapa_jornada: "protocolo_acompanhamento",
    evento_canonico: "cadencia_atencao",
    finalidade: "Enviar atualização contextualizada com os quatro elementos obrigatórios.",
    canal_previsto: "whatsapp",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Espera institucional externa já comunicada.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
  {
    chave: "cadencia_critica",
    titulo: "Atualização de cadência crítica",
    etapa_jornada: "protocolo_acompanhamento",
    evento_canonico: "cadencia_critica",
    finalidade: "Retomar cadência quando o caso passa de 14 dias sem atualização.",
    canal_previsto: "whatsapp",
    publico_elegivel: "cliente_titular",
    regra_de_bloqueio: "Espera institucional externa já comunicada.",
    vigencia: { inicio: "2026-01-01", fim: null },
  },
] as const;

export function templateVigente(t: TemplateGovernado, hoje: string): boolean {
  if (Date.parse(hoje) < Date.parse(t.vigencia.inicio)) return false;
  if (t.vigencia.fim && Date.parse(hoje) > Date.parse(t.vigencia.fim)) return false;
  return true;
}

/** Versão declarada do template (ausente = 1). */
export function versaoTemplate(t: TemplateGovernado): number {
  return t.versao ?? 1;
}

/** Template com vigência encerrada na data de referência. */
export function templateExpirado(t: TemplateGovernado, hoje: string): boolean {
  return !!t.vigencia.fim && Date.parse(hoje) > Date.parse(t.vigencia.fim);
}

export type FiltroTemplate = {
  evento: EventoInterno;
  etapa?: FaseJornada;
  canal?: CanalPrevisto;
};

function candidatos(filtro: FiltroTemplate): readonly TemplateGovernado[] {
  return TEMPLATES_GOVERNADOS.filter(
    (t) =>
      t.evento_canonico === filtro.evento &&
      (!filtro.etapa || t.etapa_jornada === filtro.etapa) &&
      (!filtro.canal || t.canal_previsto === filtro.canal),
  );
}

/**
 * Seleciona automaticamente a versão vigente para a combinação
 * etapa × canal × evento. Empate de vigência resolve pela maior versão.
 */
export function selecionarVersaoVigente(
  filtro: FiltroTemplate,
  hoje: string,
): TemplateGovernado | null {
  const vigentes = candidatos(filtro).filter((t) => templateVigente(t, hoje));
  if (vigentes.length === 0) return null;
  return [...vigentes].sort((a, b) => {
    const v = versaoTemplate(b) - versaoTemplate(a);
    if (v !== 0) return v;
    return Date.parse(b.vigencia.inicio) - Date.parse(a.vigencia.inicio);
  })[0]!;
}

/** Catálogo de versões vigentes por etapa × canal na data de referência. */
export function templatesVigentesPorEtapaCanal(hoje: string): readonly TemplateGovernado[] {
  const mapa = new Map<string, TemplateGovernado>();
  for (const t of TEMPLATES_GOVERNADOS) {
    if (!templateVigente(t, hoje)) continue;
    const k = `${t.etapa_jornada}|${t.canal_previsto}|${t.evento_canonico}`;
    const atual = mapa.get(k);
    if (!atual || versaoTemplate(t) > versaoTemplate(atual)) mapa.set(k, t);
  }
  return [...mapa.values()];
}

export type SugestaoTemplate = {
  template: TemplateGovernado | null;
  /** Sempre "rascunho_interno": nenhum envio é executado ou agendado. */
  resultado: "rascunho_interno" | "sem_template";
  bloqueado: boolean;
  motivo: string;
  /** Versão vigente aplicada, quando houver template. */
  versao?: number;
  /** Verdadeiro quando existiam templates do evento, mas todos fora de vigência. */
  expirado?: boolean;
};

/**
 * Sugere o template vigente do evento (versão automática por etapa e canal).
 * NUNCA envia, agenda ou integra: o único resultado possível é um rascunho
 * interno para decisão humana.
 */
export function sugerirTemplate(
  evento: EventoInterno,
  contexto: {
    hoje: string;
    bloqueios?: readonly string[];
    etapa?: FaseJornada;
    canal?: CanalPrevisto;
  },
): SugestaoTemplate {
  const filtro: FiltroTemplate = { evento, etapa: contexto.etapa, canal: contexto.canal };
  const template = selecionarVersaoVigente(filtro, contexto.hoje);
  if (!template) {
    const existentes = candidatos(filtro);
    const expirado = existentes.length > 0 && existentes.every((t) => templateExpirado(t, contexto.hoje));
    return {
      template: null,
      resultado: "sem_template",
      bloqueado: false,
      expirado,
      motivo: expirado
        ? "Todas as versões do template expiraram por vigência; é necessária nova versão homologada."
        : "Nenhum template vigente para o evento.",
    };
  }
  const bloqueio = (contexto.bloqueios ?? []).find((b) => b === template.regra_de_bloqueio);
  if (bloqueio) {
    return { template: null, resultado: "sem_template", bloqueado: true, motivo: bloqueio };
  }
  return {
    template,
    resultado: "rascunho_interno",
    bloqueado: false,
    versao: versaoTemplate(template),
    motivo: `Versão vigente v${versaoTemplate(template)} sugerida como rascunho interno; envio depende de ação humana fora do sistema.`,
  };
}


/* ------------------------------------------------------------------ */
/* B. Eventos internos e ações permitidas                              */
/* ------------------------------------------------------------------ */

export const EVENTOS_INTERNOS = [
  "lead_novo",
  "call_agendada",
  "call_concluida",
  "proposta_enviada",
  "followup_vencido",
  "aceite_verbal",
  "confirmacao_formal",
  "onboarding_elegivel",
  "microentrega_aprovada",
  "microentrega_publicada",
  "microentrega_atrasada",
  "cadencia_atencao",
  "cadencia_critica",
] as const;
export type EventoInterno = (typeof EVENTOS_INTERNOS)[number];

export const ROTULO_EVENTO: Record<EventoInterno, string> = {
  lead_novo: "Lead novo",
  call_agendada: "Call agendada",
  call_concluida: "Call concluída",
  proposta_enviada: "Proposta enviada",
  followup_vencido: "Follow-up vencido",
  aceite_verbal: "Aceite verbal",
  confirmacao_formal: "Confirmação formal",
  onboarding_elegivel: "Onboarding elegível",
  microentrega_aprovada: "Microentrega aprovada",
  microentrega_publicada: "Microentrega publicada",
  microentrega_atrasada: "Microentrega atrasada ou bloqueada",
  cadencia_atencao: "Cadência em atenção",
  cadencia_critica: "Cadência crítica",
};

/** Lista fechada de efeitos internos permitidos por evento. */
export const ACOES_PERMITIDAS = [
  "sugerir_template_vigente",
  "criar_ou_atualizar_tarefa_canonica",
  "atribuir_responsavel_e_prazo",
  "criar_rascunho_interno",
  "recalcular_cadencia",
  "gerar_alerta_derivado",
  "abrir_objeto_canonico",
] as const;
export type AcaoPermitida = (typeof ACOES_PERMITIDAS)[number];

/** Ações jamais autorizadas por orquestração. */
export const ACOES_NAO_AUTORIZADAS = [
  "enviar_whatsapp",
  "enviar_email",
  "enviar_sms",
  "publicar_externamente",
  "assinar_contrato",
  "cobrar_ou_pagar",
  "alterar_gate",
  "pesquisar_externamente",
  "criar_integracao",
] as const;
export type AcaoNaoAutorizada = (typeof ACOES_NAO_AUTORIZADAS)[number];

export function acaoAutorizada(acao: string): acao is AcaoPermitida {
  return (ACOES_PERMITIDAS as readonly string[]).includes(acao);
}

export type PlanoEvento = {
  evento: EventoInterno;
  acoes: readonly AcaoPermitida[];
  tarefaSugerida: string | null;
  objetoCanonico: string;
  template: SugestaoTemplate;
  /** Nenhum plano contém ação externa. Sempre false. */
  contemAcaoExterna: false;
};

const PLANO_BASE: Record<EventoInterno, { acoes: AcaoPermitida[]; tarefa: string | null; objeto: string }> = {
  lead_novo: {
    acoes: ["sugerir_template_vigente", "criar_ou_atualizar_tarefa_canonica", "atribuir_responsavel_e_prazo", "abrir_objeto_canonico"],
    tarefa: "Triagem do lead e definição de próxima ação",
    objeto: "/leads",
  },
  call_agendada: {
    acoes: ["sugerir_template_vigente", "criar_ou_atualizar_tarefa_canonica", "atribuir_responsavel_e_prazo", "abrir_objeto_canonico"],
    tarefa: "Preparar roteiro da call de discovery",
    objeto: "/calls",
  },
  call_concluida: {
    acoes: ["criar_rascunho_interno", "criar_ou_atualizar_tarefa_canonica", "recalcular_cadencia", "abrir_objeto_canonico"],
    tarefa: "Registrar devolutiva e próximo marco verificável",
    objeto: "/calls",
  },
  proposta_enviada: {
    acoes: ["sugerir_template_vigente", "criar_ou_atualizar_tarefa_canonica", "atribuir_responsavel_e_prazo", "abrir_objeto_canonico"],
    tarefa: "Agendar follow-up da proposta",
    objeto: "/propostas",
  },
  followup_vencido: {
    acoes: ["sugerir_template_vigente", "gerar_alerta_derivado", "criar_ou_atualizar_tarefa_canonica", "abrir_objeto_canonico"],
    tarefa: "Retomar follow-up pendente",
    objeto: "/conversao",
  },
  aceite_verbal: {
    acoes: ["sugerir_template_vigente", "criar_ou_atualizar_tarefa_canonica", "abrir_objeto_canonico"],
    tarefa: "Registrar aceite verbal e preparar formalização",
    objeto: "/conversao",
  },
  confirmacao_formal: {
    acoes: ["sugerir_template_vigente", "criar_ou_atualizar_tarefa_canonica", "atribuir_responsavel_e_prazo", "abrir_objeto_canonico"],
    tarefa: "Conferir cadeia de formalização do caso",
    objeto: "/contratos",
  },
  onboarding_elegivel: {
    acoes: ["sugerir_template_vigente", "criar_ou_atualizar_tarefa_canonica", "atribuir_responsavel_e_prazo", "criar_rascunho_interno", "abrir_objeto_canonico"],
    tarefa: "Acolhimento de onboarding",
    objeto: "/casos",
  },
  microentrega_aprovada: {
    acoes: ["criar_rascunho_interno", "criar_ou_atualizar_tarefa_canonica", "abrir_objeto_canonico"],
    tarefa: "Revisar microentrega aprovada antes da publicação",
    objeto: "/ops",
  },
  microentrega_publicada: {
    acoes: ["recalcular_cadencia", "sugerir_template_vigente", "abrir_objeto_canonico"],
    tarefa: null,
    objeto: "/ops",
  },
  microentrega_atrasada: {
    acoes: ["gerar_alerta_derivado", "criar_ou_atualizar_tarefa_canonica", "abrir_objeto_canonico"],
    tarefa: "Replanejar microentrega atrasada ou bloqueada",
    objeto: "/ops-excecoes",
  },
  cadencia_atencao: {
    acoes: ["gerar_alerta_derivado", "sugerir_template_vigente", "criar_rascunho_interno", "abrir_objeto_canonico"],
    tarefa: null,
    objeto: "/casos",
  },
  cadencia_critica: {
    acoes: ["gerar_alerta_derivado", "sugerir_template_vigente", "criar_rascunho_interno", "criar_ou_atualizar_tarefa_canonica", "abrir_objeto_canonico"],
    tarefa: "Retomar cadência crítica do caso",
    objeto: "/casos",
  },
};

/** Deriva o plano interno permitido de um evento canônico. */
export function orquestrarEvento(
  evento: EventoInterno,
  contexto: { hoje: string; bloqueios?: readonly string[] },
): PlanoEvento {
  const base = PLANO_BASE[evento];
  return {
    evento,
    acoes: base.acoes,
    tarefaSugerida: base.tarefa,
    objetoCanonico: base.objeto,
    template: sugerirTemplate(evento, contexto),
    contemAcaoExterna: false,
  };
}

/* ------------------------------------------------------------------ */
/* C. Onboarding condicionado a gate                                   */
/* ------------------------------------------------------------------ */

export type PlanoOnboarding = {
  permitido: boolean;
  bloqueios: readonly string[];
  tarefaAcolhimento: string | null;
  responsavel: string | null;
  prazo: string | null;
  proximoMarcoVerificavel: string | null;
  rascunhoBoasVindas: SugestaoTemplate | null;
  primeiraMicroentrega: string | null;
  /** Nunca ativa caso, cobra, assina ou envia. */
  naoExecuta: readonly string[];
};

const NAO_EXECUTA_ONBOARDING = [
  "ativar_caso",
  "cobrar",
  "assinar",
  "enviar_mensagem",
] as const;

export function planejarOnboarding(entrada: {
  estado: EstadoCaso;
  hoje: string;
  responsavel?: string | null;
  prazoDias?: number;
}): PlanoOnboarding {
  const situacao = avaliarSituacaoCaso(entrada.estado);
  if (!situacao.permite.onboarding) {
    return {
      permitido: false,
      bloqueios: situacao.bloqueios.map((b) => b.codigo),
      tarefaAcolhimento: null,
      responsavel: null,
      prazo: null,
      proximoMarcoVerificavel: null,
      rascunhoBoasVindas: null,
      primeiraMicroentrega: null,
      naoExecuta: NAO_EXECUTA_ONBOARDING,
    };
  }
  const dias = entrada.prazoDias ?? 3;
  const prazo = new Date(Date.parse(entrada.hoje) + dias * 86_400_000).toISOString().slice(0, 10);
  return {
    permitido: true,
    bloqueios: [],
    tarefaAcolhimento: "Acolhimento de onboarding",
    responsavel: entrada.responsavel ?? null,
    prazo,
    proximoMarcoVerificavel: "Call de onboarding realizada e checklist documental aberto",
    rascunhoBoasVindas: sugerirTemplate("onboarding_elegivel", { hoje: entrada.hoje }),
    primeiraMicroentrega: "boas_vindas",
    naoExecuta: NAO_EXECUTA_ONBOARDING,
  };
}

/* ------------------------------------------------------------------ */
/* D. Microentregas                                                    */
/* ------------------------------------------------------------------ */

export type VinculoMicroentrega = {
  caso_id: string;
  fase: FaseJornada;
  responsavel_id: string | null;
  prazo: string | null;
  /** Tarefa ou evento interno que originou a microentrega. */
  objeto_origem: string | null;
  /** Resumo interno (nunca projetado). */
  resumo_interno?: string | null;
  /** Resumo sanitizado ao cliente — exigido apenas para publicar. */
  resumo_cliente?: string | null;
};

export function vinculoCompleto(
  v: VinculoMicroentrega,
  opcoes?: { paraPublicacao?: boolean },
): { valido: boolean; faltando: string[] } {
  const faltando: string[] = [];
  if (!v.caso_id) faltando.push("caso");
  if (!v.fase) faltando.push("fase");
  if (!v.responsavel_id) faltando.push("responsável");
  if (!v.prazo) faltando.push("prazo");
  if (!v.objeto_origem) faltando.push("objeto de origem");
  if (!(v.resumo_interno ?? "").trim()) faltando.push("resumo interno");
  if (opcoes?.paraPublicacao && !(v.resumo_cliente ?? "").trim()) faltando.push("resumo sanitizado ao cliente");
  return { valido: faltando.length === 0, faltando };
}


export const transicaoMicroentregaPermitida = (de: StatusAprovacao, para: StatusAprovacao) =>
  podeTransicionarEntrega(de, para);

/** Projeção ao cliente: somente `publicado`, sanitizado. */
export function projetarAoCliente(itens: MicroentregaBruta[]): MicroentregaPublicada[] {
  return entregasParaAppCliente(itens);
}

export type EfeitoPublicacao = {
  eventoInterno: EventoInterno;
  cadencia: SaudeCadencia;
  envioExecutado: false;
};

/**
 * Publicar microentrega é touchpoint interno válido: recalcula cadência e
 * emite evento interno. Nenhuma mensagem é enviada.
 */
export function publicarMicroentrega(entrada: {
  hoje: string;
  aguardandoInstituicaoExterna?: boolean;
  motivoEsperaExterna?: string | null;
}): EfeitoPublicacao {
  return {
    eventoInterno: "microentrega_publicada",
    cadencia: calcularCadencia({
      hoje: entrada.hoje,
      ultimoTouchpointEm: entrada.hoje,
      aguardandoInstituicaoExterna: entrada.aguardandoInstituicaoExterna,
      motivoEsperaExterna: entrada.motivoEsperaExterna,
    }),
    envioExecutado: false,
  };
}

/* ------------------------------------------------------------------ */
/* E. Cadência e alertas                                               */
/* ------------------------------------------------------------------ */

export type ResultadoTouchpoint = {
  aceito: boolean;
  faltando: readonly string[];
  cadencia: SaudeCadencia;
};

/**
 * Touchpoint inválido NÃO atualiza cadência: a saúde continua sendo calculada
 * a partir do último touchpoint válido anterior.
 */
export function registrarTouchpoint(entrada: {
  hoje: string;
  conteudo: TouchpointConteudo;
  ultimoTouchpointValidoEm?: string | null;
  aguardandoInstituicaoExterna?: boolean;
  motivoEsperaExterna?: string | null;
}): ResultadoTouchpoint {
  const validacao = validarTouchpoint(entrada.conteudo);
  const referencia = validacao.valido ? entrada.hoje : (entrada.ultimoTouchpointValidoEm ?? null);
  return {
    aceito: validacao.valido,
    faltando: validacao.faltando,
    cadencia: calcularCadencia({
      hoje: entrada.hoje,
      ultimoTouchpointEm: referencia,
      aguardandoInstituicaoExterna: entrada.aguardandoInstituicaoExterna,
      motivoEsperaExterna: entrada.motivoEsperaExterna,
    }),
  };
}

/** Evento de cadência derivado do status já calculado. */
export function eventoDeCadencia(status: SaudeCadencia["status"]): EventoInterno | null {
  if (status === "critico") return "cadencia_critica";
  if (status === "atencao") return "cadencia_atencao";
  return null;
}

/**
 * Tentativa de publicação/comunicação sem condição: recusa a ação e devolve
 * um ALERTA DERIVADO que apenas abre o objeto canônico de origem. Nunca cria
 * tarefa, prazo, status ou registro paralelo.
 */
export type AlertaTentativa = {
  permitido: boolean;
  alerta: {
    chave: string;
    motivo: "pendencia_bloqueia_estado";
    titulo: string;
    detalhe: string;
    destino: string;
    /** Alerta é visão derivada: não escreve em nenhuma entidade. */
    criaRegistro: false;
  } | null;
};

export function avaliarTentativaSemCondicao(entrada: {
  acao: "publicar" | "comunicar";
  objeto: { entidade: string; id: string; destino: string };
  condicoesFaltantes: readonly string[];
}): AlertaTentativa {
  if (entrada.condicoesFaltantes.length === 0) return { permitido: true, alerta: null };
  return {
    permitido: false,
    alerta: {
      chave: `tentativa-${entrada.acao}:${entrada.objeto.entidade}:${entrada.objeto.id}`,
      motivo: "pendencia_bloqueia_estado",
      titulo:
        entrada.acao === "publicar"
          ? "Tentativa de publicação sem condição cumprida"
          : "Tentativa de comunicação sem condição cumprida",
      detalhe: `Pendências: ${entrada.condicoesFaltantes.join("; ")}.`,
      destino: entrada.objeto.destino,
      criaRegistro: false,
    },
  };
}



/* ------------------------------------------------------------------ */
/* F. Painel Hoje — fila derivada, sem duplicação                      */
/* ------------------------------------------------------------------ */

export const CATEGORIAS_PAINEL = [
  "vencidos",
  "proximo_marco",
  "acao_comercial_pendente",
  "cadencia",
  "microentrega_aguardando",
  "bloqueio_gate",
] as const;
export type CategoriaPainel = (typeof CATEGORIAS_PAINEL)[number];

export type ItemOrquestrado = {
  /** Chave canônica do objeto: entidade + id. Base da deduplicação. */
  chave: string;
  categoria: CategoriaPainel;
  rotulo: string;
  destino: string;
  prazo?: string | null;
};

const PESO_CATEGORIA: Record<CategoriaPainel, number> = {
  vencidos: 1,
  bloqueio_gate: 2,
  cadencia: 3,
  acao_comercial_pendente: 4,
  microentrega_aguardando: 5,
  proximo_marco: 6,
};

/** Um objeto canônico aparece uma única vez, na categoria de maior precedência. */
export function filaPainelHoje(itens: readonly ItemOrquestrado[]): ItemOrquestrado[] {
  const mapa = new Map<string, ItemOrquestrado>();
  for (const i of itens) {
    const atual = mapa.get(i.chave);
    if (!atual || PESO_CATEGORIA[i.categoria] < PESO_CATEGORIA[atual.categoria]) mapa.set(i.chave, i);
  }
  return [...mapa.values()].sort(
    (a, b) => PESO_CATEGORIA[a.categoria] - PESO_CATEGORIA[b.categoria] || a.chave.localeCompare(b.chave),
  );
}

/* ------------------------------------------------------------------ */
/* G. Assistente — explica, não executa                                */
/* ------------------------------------------------------------------ */

export const ASSISTENTE_PODE = [
  "explicar_contexto",
  "explicar_bloqueio",
  "indicar_template_aplicavel",
  "explicar_tarefa",
  "explicar_entrega",
  "explicar_cadencia",
] as const;
export type CapacidadeAssistente = (typeof ASSISTENTE_PODE)[number];

export const ASSISTENTE_NAO_PODE = [
  "enviar",
  "publicar",
  "cobrar",
  "assinar",
  "alterar_gate",
  "criar_dado_sem_acao_humana",
  "pesquisar_externamente",
] as const;

export function assistentePodeExecutar(acao: string): boolean {
  return (ASSISTENTE_PODE as readonly string[]).includes(acao);
}

/* ------------------------------------------------------------------ */
/* H. Cadeia completa da jornada (11 elos)                             */
/*                                                                      */
/* Evento/fase → regra de jornada → tarefa+responsável+prazo →          */
/* template vigente → rascunho ou microentrega → revisão humana →       */
/* publicação autorizada ou fila interna → touchpoint/entrega →         */
/* cadência recalculada → alerta derivado (só com desvio) →             */
/* Painel Hoje mostra a próxima ação.                                   */
/*                                                                      */
/* Módulo puro: não escreve dado, não publica e não envia nada.         */
/* ------------------------------------------------------------------ */

export const ELOS_CADEIA = [
  "evento_ou_fase",
  "regra_de_jornada",
  "tarefa_responsavel_prazo",
  "template_sugerido",
  "rascunho_ou_microentrega",
  "revisao_humana",
  "publicacao_ou_fila",
  "touchpoint_ou_entrega",
  "cadencia_recalculada",
  "alerta_derivado",
  "painel_hoje",
] as const;
export type EloCadeia = (typeof ELOS_CADEIA)[number];

export type EntradaCadeia = {
  hoje: string;
  evento: EventoInterno;
  caso_id: string;
  fase?: FaseJornada;
  canal?: CanalPrevisto;
  bloqueios?: readonly string[];
  responsavel_id?: string | null;
  prazo?: string | null;
  /** Vínculo da microentrega, quando o elo 5 for entrega e não rascunho. */
  vinculo?: VinculoMicroentrega;
  /** Revisão humana explícita: sem ela nada avança para publicação/fila. */
  aprovadoPorHumano?: boolean;
  /** Conteúdo do touchpoint, se houver registro no ciclo. */
  touchpoint?: TouchpointConteudo;
  ultimoTouchpointValidoEm?: string | null;
  aguardandoInstituicaoExterna?: boolean;
  motivoEsperaExterna?: string | null;
};

export type ResultadoCadeia = {
  elos: readonly EloCadeia[];
  plano: PlanoEvento;
  tarefa: { titulo: string | null; responsavel_id: string | null; prazo: string | null; completa: boolean };
  template: SugestaoTemplate;
  saida: "rascunho_interno" | "microentrega" | "nenhuma";
  revisao: { exigida: true; aprovada: boolean; pendencias: readonly string[] };
  publicacao: { autorizada: boolean; destino: "app_cliente" | "fila_interna" | "nenhum"; envioExecutado: false };
  touchpoint: ResultadoTouchpoint | null;
  cadencia: SaudeCadencia | null;
  alerta: AlertaTentativa["alerta"] | null;
  painelHoje: ItemOrquestrado | null;
  /** Invariante da cadeia: nenhuma etapa executa ação externa. */
  contemAcaoExterna: false;
};

/**
 * Percorre a cadeia canônica de ponta a ponta e devolve o estado derivado de
 * cada elo. Nada é persistido, publicado ou enviado: o resultado é insumo de
 * decisão humana no Desk.
 */
export function executarCadeiaJornada(entrada: EntradaCadeia): ResultadoCadeia {
  const plano = orquestrarEvento(entrada.evento, { hoje: entrada.hoje, bloqueios: entrada.bloqueios });
  const template = sugerirTemplate(entrada.evento, {
    hoje: entrada.hoje,
    bloqueios: entrada.bloqueios,
    etapa: entrada.fase,
    canal: entrada.canal,
  });

  const tarefa = {
    titulo: plano.tarefaSugerida,
    responsavel_id: entrada.responsavel_id ?? null,
    prazo: entrada.prazo ?? null,
    completa: Boolean(plano.tarefaSugerida && entrada.responsavel_id && entrada.prazo),
  };

  const saida: ResultadoCadeia["saida"] = entrada.vinculo
    ? "microentrega"
    : template.template
      ? "rascunho_interno"
      : "nenhuma";

  const pendencias: string[] = [];
  if (!tarefa.completa && plano.tarefaSugerida) pendencias.push("tarefa sem responsável ou prazo");
  if (entrada.vinculo) {
    pendencias.push(...vinculoCompleto(entrada.vinculo, { paraPublicacao: true }).faltando);
  }
  pendencias.push(...(entrada.bloqueios ?? []));

  const aprovada = Boolean(entrada.aprovadoPorHumano) && pendencias.length === 0;

  const tentativa =
    entrada.aprovadoPorHumano && pendencias.length > 0
      ? avaliarTentativaSemCondicao({
          acao: saida === "microentrega" ? "publicar" : "comunicar",
          objeto: { entidade: "caso", id: entrada.caso_id, destino: plano.objetoCanonico },
          condicoesFaltantes: pendencias,
        })
      : { permitido: true, alerta: null };

  const publicacao: ResultadoCadeia["publicacao"] = {
    autorizada: aprovada,
    destino: !aprovada ? "nenhum" : saida === "microentrega" ? "app_cliente" : "fila_interna",
    envioExecutado: false,
  };

  const touchpoint = entrada.touchpoint
    ? registrarTouchpoint({
        hoje: entrada.hoje,
        conteudo: entrada.touchpoint,
        ultimoTouchpointValidoEm: entrada.ultimoTouchpointValidoEm,
        aguardandoInstituicaoExterna: entrada.aguardandoInstituicaoExterna,
        motivoEsperaExterna: entrada.motivoEsperaExterna,
      })
    : null;

  const cadencia =
    touchpoint?.cadencia ??
    (publicacao.autorizada && saida === "microentrega"
      ? publicarMicroentrega({
          hoje: entrada.hoje,
          aguardandoInstituicaoExterna: entrada.aguardandoInstituicaoExterna,
          motivoEsperaExterna: entrada.motivoEsperaExterna,
        }).cadencia
      : null);

  const eventoCadencia = cadencia ? eventoDeCadencia(cadencia.status) : null;

  const alerta =
    tentativa.alerta ??
    (eventoCadencia
      ? {
          chave: `cadencia:caso:${entrada.caso_id}`,
          motivo: "pendencia_bloqueia_estado" as const,
          titulo:
            eventoCadencia === "cadencia_critica"
              ? "Cadência crítica do caso"
              : "Cadência em atenção",
          detalhe: cadencia?.motivo ?? "Cadência derivada do último touchpoint válido.",
          destino: plano.objetoCanonico,
          criaRegistro: false as const,
        }
      : null);

  const painelHoje: ItemOrquestrado | null = alerta
    ? {
        chave: alerta.chave.startsWith("cadencia:") ? `caso:${entrada.caso_id}` : alerta.chave,
        categoria: alerta.chave.startsWith("cadencia:") ? "cadencia" : "bloqueio_gate",
        rotulo: alerta.titulo,
        destino: alerta.destino,
        prazo: tarefa.prazo,
      }
    : tarefa.titulo
      ? {
          chave: `caso:${entrada.caso_id}`,
          categoria: "proximo_marco",
          rotulo: tarefa.titulo,
          destino: plano.objetoCanonico,
          prazo: tarefa.prazo,
        }
      : null;

  return {
    elos: ELOS_CADEIA,
    plano,
    tarefa,
    template,
    saida,
    revisao: { exigida: true, aprovada, pendencias },
    publicacao,
    touchpoint,
    cadencia,
    alerta,
    painelHoje,
    contemAcaoExterna: false,
  };
}

/* ------------------------------------------------------------------ */
/* H. Fiação de cadência real por caso (CA-OPS-02)                     */
/*    Resolve o template vigente a partir da cadência real do caso,    */
/*    incluindo os eventos derivados. Puro: sem envio e sem escrita.   */
/* ------------------------------------------------------------------ */

export type EstadoCadenciaCaso = {
  hoje: string;
  caso_id: string;
  /** Evento de origem já ocorrido no caso, quando houver. */
  evento?: EventoInterno | null;
  fase?: FaseJornada;
  canal?: CanalPrevisto;
  bloqueios?: readonly string[];
  ultimoTouchpointValidoEm?: string | null;
  aguardandoInstituicaoExterna?: boolean;
  motivoEsperaExterna?: string | null;
  responsavel_id?: string | null;
  prazo?: string | null;
};

export type ResolucaoTemplateCaso = {
  evento: EventoInterno;
  /** `base` = evento informado; `derivado` = evento nascido da cadência. */
  origem: "base" | "derivado";
  template: SugestaoTemplate;
  tarefaSugerida: string | null;
  destino: string;
};

export type FiacaoCadenciaCaso = {
  caso_id: string;
  cadencia: SaudeCadencia;
  eventoDerivado: EventoInterno | null;
  resolucoes: readonly ResolucaoTemplateCaso[];
  /** Fila derivada e deduplicada por objeto canônico. */
  painelHoje: readonly ItemOrquestrado[];
  alertas: readonly NonNullable<AlertaTentativa["alerta"]>[];
  /** Invariantes verificáveis: nada é enviado nem gravado. */
  envioExecutado: false;
  persistido: false;
};

/**
 * Liga a resolução de template vigente à cadência REAL do caso.
 * A cadência é calculada do último touchpoint válido; dela nasce o evento
 * derivado (`cadencia_atencao` / `cadencia_critica`), que também resolve o seu
 * próprio template vigente. Nenhum envio, agendamento ou persistência ocorre.
 */
export function fiarCadenciaDoCaso(estado: EstadoCadenciaCaso): FiacaoCadenciaCaso {
  const cadencia = calcularCadencia({
    hoje: estado.hoje,
    ultimoTouchpointEm: estado.ultimoTouchpointValidoEm ?? null,
    aguardandoInstituicaoExterna: estado.aguardandoInstituicaoExterna,
    motivoEsperaExterna: estado.motivoEsperaExterna,
  });
  const eventoDerivado = eventoDeCadencia(cadencia.status);

  const eventos: { evento: EventoInterno; origem: "base" | "derivado" }[] = [];
  if (estado.evento) eventos.push({ evento: estado.evento, origem: "base" });
  if (eventoDerivado && eventoDerivado !== estado.evento) {
    eventos.push({ evento: eventoDerivado, origem: "derivado" });
  }

  const resolucoes: ResolucaoTemplateCaso[] = [];
  const alertas: NonNullable<AlertaTentativa["alerta"]>[] = [];
  const fila = new Map<string, ItemOrquestrado>();

  for (const { evento, origem } of eventos) {
    const cadeia = executarCadeiaJornada({
      hoje: estado.hoje,
      evento,
      caso_id: estado.caso_id,
      fase: estado.fase,
      canal: estado.canal,
      bloqueios: estado.bloqueios,
      responsavel_id: estado.responsavel_id ?? null,
      prazo: estado.prazo ?? null,
    });
    resolucoes.push({
      evento,
      origem,
      template: cadeia.template,
      tarefaSugerida: cadeia.plano.tarefaSugerida,
      destino: cadeia.plano.objetoCanonico,
    });
    if (cadeia.alerta) alertas.push(cadeia.alerta);
    const item = cadeia.painelHoje;
    if (item && !fila.has(item.chave)) fila.set(item.chave, item);
  }

  if (eventoDerivado) {
    const chave = `cadencia:caso:${estado.caso_id}`;
    if (!alertas.some((a) => a.chave === chave)) {
      alertas.push({
        chave,
        motivo: "pendencia_bloqueia_estado",
        titulo: eventoDerivado === "cadencia_critica" ? "Cadência crítica do caso" : "Cadência em atenção",
        detalhe: cadencia.motivo,
        destino: `/casos/${estado.caso_id}`,
        criaRegistro: false,
      });
    }
    const chaveFila = `caso:${estado.caso_id}`;
    if (!fila.has(chaveFila)) {
      fila.set(chaveFila, {
        chave: chaveFila,
        categoria: "cadencia",
        rotulo: eventoDerivado === "cadencia_critica" ? "Cadência crítica do caso" : "Cadência em atenção",
        destino: `/casos/${estado.caso_id}`,
        prazo: estado.prazo ?? null,
      });
    }
  }

  return {
    caso_id: estado.caso_id,
    cadencia,
    eventoDerivado,
    resolucoes,
    painelHoje: filaPainelHoje([...fila.values()]),
    alertas,
    envioExecutado: false,
    persistido: false,
  };
}
