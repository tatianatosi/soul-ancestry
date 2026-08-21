/**
 * Atendimento ao cliente — regras puras de elegibilidade e vocabulário.
 *
 * Espelha as travas do banco (atendimento_bloqueios, fn_atendimento_*_guard)
 * para que a tela mostre o motivo do bloqueio antes de qualquer envio. A
 * decisão de segurança continua sendo do servidor/banco.
 *
 * Nada aqui envia e-mail, WhatsApp ou dispara automação externa.
 */

export type CasoAtendimento = {
  id: string;
  codigo: string | null;
  titulo: string | null;
  cliente_id: string | null;
  contrato_assinado: boolean | null;
  pagamento_confirmado: boolean | null;
  documentos_minimos_ok: boolean | null;
  ativado_em: string | null;
  data_ativacao: string | null;
  eixo_comercial: string | null;
  eixo_formalizacao: string | null;
  responsavel_id: string | null;
  demo: boolean | null;
  acesso_portal_ativo?: boolean;
};

export type Bloqueio = { bloqueado: boolean; motivos: string[] };

/** Fases comerciais/formais em que nada pode ser exposto ao cliente. */
export const EIXOS_COMERCIAIS_BLOQUEADOS = [
  "novo_lead",
  "diagnostico",
  "aceite_verbal",
  "confirmacao_formal_recebida",
];
export const EIXOS_FORMALIZACAO_BLOQUEADOS = [
  "nao_iniciado",
  "formalizacao_em_preparacao",
  "confirmacao_formal",
];

/** Mesma ordem de motivos usada pela função atendimento_bloqueios no banco. */
export function bloqueioAtendimento(caso: CasoAtendimento): Bloqueio {
  const motivos: string[] = [];
  if (!caso.contrato_assinado) motivos.push("Contrato não assinado");
  if (!caso.pagamento_confirmado) motivos.push("Pagamento inicial não confirmado");
  if (!caso.documentos_minimos_ok) motivos.push("Documentos mínimos pendentes");
  if (!caso.ativado_em && !caso.data_ativacao) motivos.push("Falta decisão humana de ativação");
  if (
    EIXOS_COMERCIAIS_BLOQUEADOS.includes(caso.eixo_comercial ?? "") ||
    EIXOS_FORMALIZACAO_BLOQUEADOS.includes(caso.eixo_formalizacao ?? "")
  ) {
    motivos.push("Caso em diagnóstico, aceite verbal, confirmação formal ou formalização");
  }
  return { bloqueado: motivos.length > 0, motivos };
}

/** Fatura visível exige, além do caso elegível, acesso ao espaço do cliente. */
export function bloqueioFatura(caso: CasoAtendimento | undefined): Bloqueio {
  if (!caso) return { bloqueado: true, motivos: ["Fatura sem caso vinculado"] };
  const base = bloqueioAtendimento(caso);
  const motivos = [...base.motivos];
  if (!caso.acesso_portal_ativo) motivos.push("Cliente sem acesso ativo ao espaço do cliente");
  return { bloqueado: motivos.length > 0, motivos };
}

/** Rótulo curto de estado do caso para o seletor: apto, demo ou bloqueado com motivo. */
export type EstadoCaso = {
  situacao: "apto" | "demo" | "bloqueado";
  rotulo: string;
  motivos: string[];
};

export function estadoCasoAtendimento(caso: CasoAtendimento): EstadoCaso {
  const { bloqueado, motivos } = bloqueioAtendimento(caso);
  if (bloqueado) return { situacao: "bloqueado", rotulo: `Bloqueado — ${motivos[0]}`, motivos };
  if (caso.demo) return { situacao: "demo", rotulo: "Demonstração — portal liberado (fora dos indicadores reais)", motivos: [] };
  return { situacao: "apto", rotulo: "Apto ao portal", motivos: [] };
}

/** Classificação de visibilidade usada na confirmação de publicação. */
export const VISIBILIDADE_ENTREGA_LABEL = "Espaço do cliente";
export const VISIBILIDADE_FATURA_LABEL = "Espaço do cliente — financeiro";


export const CATEGORIAS_SOLICITACAO: Record<string, string> = {
  identificacao: "Identificação",
  certidao: "Certidão",
  documento_civil: "Documento civil",
  comprovante_residencia: "Comprovante de residência",
  documento_financeiro: "Documento financeiro",
  procuracao: "Procuração ou representação",
  outro: "Outro documento",
};

export const FINALIDADES_SOLICITACAO: Record<string, string> = {
  instrucao_processo: "Instrução do processo",
  comprovacao_vinculo: "Comprovação de vínculo familiar",
  formalizacao_contratual: "Formalização contratual",
  exigencia_consular: "Exigência consular ou de órgão",
  conferencia_cadastral: "Conferência cadastral",
};

export const STATUS_SOLICITACAO: Record<string, string> = {
  pendente: "Aguardando o cliente",
  enviado: "Enviado pelo cliente",
  aceito: "Recebimento validado",
  recusado: "Reenvio solicitado",
  cancelado: "Cancelada",
};

export const STATUS_ENVIO: Record<string, string> = {
  pendente_de_revisao: "Pendente de revisão",
  em_revisao: "Em revisão",
  aprovado: "Recebimento validado",
  recusado: "Reenvio solicitado",
};

export const STATUS_TICKET: Record<string, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  respondido: "Respondido",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

export const CLASSIFICACAO_ENTREGA = "externa_aprovada";
export const CLASSIFICACAO_ENTREGA_LABEL = "Externa aprovada";

/** Papéis que podem executar cada liberação (espelho do banco). */
export const PAPEIS_ENTREGA = ["admin", "operacoes"];
export const PAPEIS_FATURA = ["admin", "financeiro"];

/** Prazo em dias até vencer; negativo indica atraso. */
export function diasAtePrazo(prazo: string | null | undefined, agora = Date.now()): number | null {
  if (!prazo) return null;
  const alvo = new Date(`${prazo}T12:00:00`).getTime();
  if (Number.isNaN(alvo)) return null;
  return Math.round((alvo - agora) / 86_400_000);
}

export function rotuloPrazo(prazo: string | null | undefined): string {
  const dias = diasAtePrazo(prazo);
  if (dias === null) return "Sem prazo";
  if (dias < 0) return `Atrasado ${Math.abs(dias)} dia(s)`;
  if (dias === 0) return "Vence hoje";
  return `Vence em ${dias} dia(s)`;
}
