/**
 * Agenda assistida, sem criação automática (PROMPT 06).
 *
 * Produz apenas sugestões internas de reunião/follow-up/revisão de override/
 * vencimento — nunca cria evento em Google Calendar nem em qualquer
 * conector externo. Este repositório não tem nenhuma integração de
 * calendário configurada; mesmo que existisse, esta camada não a invoca.
 */

export const ESTADOS_SUGESTAO_AGENDA = [
  "RASCUNHO_INTERNO",
  "AGUARDA_CONFIRMACAO_PROPRIETARIA",
  "PRONTO_PARA_CRIAR_EVENTO",
  "CANCELADO",
] as const;
export type EstadoSugestaoAgenda = (typeof ESTADOS_SUGESTAO_AGENDA)[number];

export type JanelaData = { inicio: string; fim: string };

export type EntradaSugestaoAgenda = {
  titulo: string;
  objetivo: string;
  participantesPropostos: string[];
  janela: JanelaData | null;
  duracaoMinutos: number | null;
  contexto: string;
  rotaDoObjeto: string;
  dependencias: string[];
  textoPauta: string;
  /** Destino do texto de pauta: "interno" mostra tudo; "cliente" exige sanitização. */
  destino: "interno" | "cliente";
  confirmadoPelaProprietaria: boolean;
  cancelado: boolean;
};

export type SugestaoAgenda = EntradaSugestaoAgenda & {
  estado: EstadoSugestaoAgenda;
  camposAusentes: string[];
};

const CAMPOS_OBRIGATORIOS: (keyof EntradaSugestaoAgenda)[] = ["titulo", "objetivo", "contexto", "rotaDoObjeto", "textoPauta"];

function camposAusentesDe(e: EntradaSugestaoAgenda): string[] {
  const ausentes: string[] = [];
  for (const c of CAMPOS_OBRIGATORIOS) {
    const v = e[c];
    if (typeof v === "string" && !v.trim()) ausentes.push(c);
  }
  if (e.participantesPropostos.length === 0) ausentes.push("participantesPropostos");
  if (!e.janela) ausentes.push("janela");
  if (!e.duracaoMinutos) ausentes.push("duracaoMinutos");
  return ausentes;
}

/**
 * Deriva o estado da sugestão. Nunca produz PRONTO_PARA_CRIAR_EVENTO sem
 * confirmação explícita da Proprietária — e mesmo pronta, esta função não
 * cria nada: é a UI/servidor consumidor que decide o próximo passo humano.
 */
export function montarSugestaoAgenda(entrada: EntradaSugestaoAgenda): SugestaoAgenda {
  const camposAusentes = camposAusentesDe(entrada);
  let estado: EstadoSugestaoAgenda;
  if (entrada.cancelado) estado = "CANCELADO";
  else if (camposAusentes.length > 0) estado = "RASCUNHO_INTERNO";
  else if (!entrada.confirmadoPelaProprietaria) estado = "AGUARDA_CONFIRMACAO_PROPRIETARIA";
  else estado = "PRONTO_PARA_CRIAR_EVENTO";

  return { ...entrada, estado, camposAusentes };
}

/** Termos que nunca podem aparecer na pauta quando o destino é o cliente. */
const TERMOS_INTERNOS_PROIBIDOS_NA_PAUTA = [
  /score/i,
  /hip[óo]tese/i,
  /marco jur[íi]dico/i,
  /evid[êe]ncia/i,
  /gate/i,
  /pend[êe]ncia bloqueante/i,
  /override/i,
  /custo|cac|cpl|roi|roas/i,
];

export function pautaContemDadoInterno(texto: string): boolean {
  return TERMOS_INTERNOS_PROIBIDOS_NA_PAUTA.some((r) => r.test(texto));
}

export type ResultadoValidacaoPauta = { valida: boolean; erros: string[] };

/**
 * Valida a pauta antes de qualquer exibição ao cliente. Nunca reescreve o
 * texto sozinha — apenas recusa e explica o motivo.
 */
export function validarPautaParaDestino(e: EntradaSugestaoAgenda): ResultadoValidacaoPauta {
  const erros: string[] = [];
  if (e.destino === "cliente" && pautaContemDadoInterno(e.textoPauta)) {
    erros.push("Pauta contém termo de uso interno e não pode ser exibida ao cliente sem revisão.");
  }
  if (!e.textoPauta.trim()) erros.push("Texto de pauta obrigatório.");
  return { valida: erros.length === 0, erros };
}

/**
 * Nenhuma função deste módulo cria, atualiza ou cancela evento externo.
 * Existe só para deixar explícito, em teste, que a superfície de escrita
 * externa não existe aqui.
 */
export const AGENDA_ASSISTIDA_NUNCA_CHAMA_API_EXTERNA = true as const;
