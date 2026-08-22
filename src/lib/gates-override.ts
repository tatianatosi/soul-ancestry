/**
 * Gates com três estados e override interno auditado da proprietária.
 *
 * O gate nunca desaparece: ele passa a ser exibido como
 * `superado_por_decisao_proprietaria`, com motivo, fonte, autora, data/hora e
 * event_id. A pendência original é preservada e o avanço permitido é sempre
 * interno. Nenhuma função aqui executa ação externa.
 */

import { ACOES_EXTERNAS, MOTIVO_MINIMO, exigeConfirmacaoFinal } from "@/lib/modo-proprietaria";

/** Papel canônico do modo. `admin` é o portador desse papel na organização. */
export const PAPEL_PROPRIETARIA = "proprietaria_administradora" as const;

export function ehPapelProprietaria(papel: string | null | undefined): boolean {
  return papel === PAPEL_PROPRIETARIA || papel === "admin";
}

export const ESTADOS_GATE = [
  "atende_regra",
  "pendente_bloqueante",
  "superado_por_decisao_proprietaria",
] as const;
export type EstadoGate = (typeof ESTADOS_GATE)[number];

export const ROTULO_ESTADO_GATE: Record<EstadoGate, string> = {
  atende_regra: "Atende à regra",
  pendente_bloqueante: "Pendente — bloqueante",
  superado_por_decisao_proprietaria: "Superado por decisão da proprietária",
};

/** Gates de formalização que aceitam avanço interno controlado. */
export const GATES_FORMALIZACAO = [
  "aprovacao",
  "os_final",
  "congelamento",
  "assinatura",
  "financeiro",
  "portal_onboarding",
] as const;
export type GateFormalizacao = (typeof GATES_FORMALIZACAO)[number];

/**
 * Avanço interno máximo por gate. Assinatura, financeiro e portal/onboarding
 * jamais avançam além do estado de espera por confirmação externa.
 */
export const AVANCO_INTERNO_MAXIMO: Record<GateFormalizacao, string> = {
  aprovacao: "aprovado_internamente",
  os_final: "os_interna_registrada",
  congelamento: "versao_congelada_internamente",
  assinatura: "aguardando_confirmacao_externa",
  financeiro: "aguardando_confirmacao_externa",
  portal_onboarding: "aguardando_confirmacao_externa",
};

/** Operações internas que a proprietária pode superar por decisão auditada. */
export const OPERACOES_OVERRIDE_INTERNO = [
  "aprovacao_interna",
  "validacao_proposta",
  "escolha_sku_condicao_comercial",
  "aceite_interno_escopo",
  "os_criacao_aprovacao_revisao",
  "congelamento_interno_versao_derivada",
  "avanco_fase_caso",
  "liberacao_planejamento",
  "correcao_responsavel_prazo_proxima_acao",
  "correcao_pessoa_nucleo_representacao",
  "validacao_interna_pesquisa",
  "correcao_vinculo_financeiro_interno",
  "aprovacao_interna_projecao_app",
] as const;
export type OperacaoOverrideInterno = (typeof OPERACOES_OVERRIDE_INTERNO)[number];

export function ehOperacaoInterna(op: string): op is OperacaoOverrideInterno {
  return (OPERACOES_OVERRIDE_INTERNO as readonly string[]).includes(op);
}

export type EntradaOverride = {
  organization_id: string;
  entidade: string;
  entidade_id: string;
  gate: string;
  valor_anterior: unknown;
  valor_novo: unknown;
  motivo: string;
  fonte: string;
  autora: string;
  em: string;
  avanco_interno: string;
  papel: string | null | undefined;
  /** Organização do registro alvo — RLS por organização também é conferida no banco. */
  organizacao_da_entidade?: string | null;
};

export type ResultadoValidacao = { valida: boolean; erros: string[] };

/** Validação canônica da ação de override — reusada por todos os módulos. */
export function validarOverrideInterno(e: EntradaOverride): ResultadoValidacao {
  const erros: string[] = [];
  if (!ehPapelProprietaria(e.papel)) erros.push("Somente a proprietária administradora pode superar um gate interno.");
  if (!e.organization_id?.trim()) erros.push("Organização obrigatória.");
  if (!e.entidade?.trim()) erros.push("Entidade obrigatória.");
  if (!e.entidade_id?.trim()) erros.push("Registro alvo obrigatório.");
  if (!e.gate?.trim()) erros.push("Gate ou regra obrigatória.");
  if ((e.motivo ?? "").trim().length < MOTIVO_MINIMO) erros.push(`Motivo obrigatório com pelo menos ${MOTIVO_MINIMO} caracteres.`);
  if (!(e.fonte ?? "").trim()) erros.push("Fonte ou justificativa documental obrigatória.");
  if (!e.autora?.trim()) erros.push("Autora autenticada obrigatória.");
  if (!e.em?.trim()) erros.push("Data e hora obrigatórias.");
  if (e.valor_anterior === undefined) erros.push("Valor anterior obrigatório.");
  if (e.valor_novo === undefined) erros.push("Decisão ou valor novo obrigatório.");
  if (!ehOperacaoInterna(e.avanco_interno) && !Object.values(AVANCO_INTERNO_MAXIMO).includes(e.avanco_interno)) {
    erros.push("Escopo de avanço interno inválido: informe uma operação interna reconhecida.");
  }
  if (exigeConfirmacaoFinal(e.gate) || exigeConfirmacaoFinal(e.avanco_interno)) {
    erros.push("Ação externa não pode ser executada por override: exige janela final de confirmação explícita.");
  }
  if (
    e.organizacao_da_entidade != null &&
    e.organizacao_da_entidade !== e.organization_id
  ) {
    erros.push("Registro de outra organização: edição recusada.");
  }
  return { valida: erros.length === 0, erros };
}

export type PendenciaGate = { chave: string; rotulo: string; motivo: string };

export type GateDerivado = {
  gate: string;
  estado: EstadoGate;
  rotulo: string;
  /** Pendência original preservada, mesmo quando superada. */
  pendencia: PendenciaGate | null;
  decisao?: {
    motivo: string;
    fonte: string;
    autora: string;
    em: string;
    event_id: string;
    avanco_interno: string;
  };
};

/** Deriva o estado do gate sem sobrescrever a pendência original. */
export function derivarEstadoGate(input: {
  gate: string;
  pendencia: PendenciaGate | null;
  override?: { motivo: string; fonte: string; autora: string; em: string; event_id: string; avanco_interno: string } | null;
}): GateDerivado {
  if (!input.pendencia) {
    return { gate: input.gate, estado: "atende_regra", rotulo: ROTULO_ESTADO_GATE.atende_regra, pendencia: null };
  }
  if (input.override) {
    return {
      gate: input.gate,
      estado: "superado_por_decisao_proprietaria",
      rotulo: ROTULO_ESTADO_GATE.superado_por_decisao_proprietaria,
      pendencia: input.pendencia,
      decisao: input.override,
    };
  }
  return {
    gate: input.gate,
    estado: "pendente_bloqueante",
    rotulo: ROTULO_ESTADO_GATE.pendente_bloqueante,
    pendencia: input.pendencia,
  };
}

/** Estado interno permitido após o override; nunca ultrapassa o limite do gate. */
export function avancoPermitido(gate: string, solicitado: string): string {
  const limite = (AVANCO_INTERNO_MAXIMO as Record<string, string | undefined>)[gate];
  if (!limite) return solicitado;
  if (gate === "assinatura" || gate === "financeiro" || gate === "portal_onboarding") return limite;
  return solicitado || limite;
}

/** Nenhuma ação externa é executável por este caminho. */
export function acoesExternasBloqueadas(): readonly string[] {
  return ACOES_EXTERNAS;
}
