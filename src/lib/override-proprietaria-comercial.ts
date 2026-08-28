/**
 * Override auditável da Proprietária — exceções operacionais e comerciais
 * (PROMPT 02: Autoridade de Override da Proprietária).
 *
 * A exceção declara uma superação explícita e limitada de um gate; ela
 * nunca apaga a pendência original, nunca marca pagamento como recebido,
 * nunca altera preço/escopo/assinatura e nunca dispara ação externa
 * (envio, cobrança, assinatura, publicação, pesquisa externa). A ativação
 * real do caso (`crm_casos.ativo`) continua decidida pelo gate no banco
 * (trg_caso_ativacao_gates_guard); este módulo só registra que um escopo
 * interno específico foi liberado por decisão humana auditada, sem tocar
 * nesse gate.
 */

import { ehPapelProprietaria } from "@/lib/gates-override";

export const ESTADOS_OVERRIDE = [
  "BLOQUEADO",
  "LIBERADO_POR_OVERRIDE_PROPRIETARIA",
  "EXPIRADO_AGUARDA_REVISAO",
  "REVOGADO",
] as const;
export type EstadoOverride = (typeof ESTADOS_OVERRIDE)[number];

export const ROTULO_ESTADO_OVERRIDE: Record<EstadoOverride, string> = {
  BLOQUEADO: "Bloqueado",
  LIBERADO_POR_OVERRIDE_PROPRIETARIA: "Liberado por decisão da Proprietária",
  EXPIRADO_AGUARDA_REVISAO: "Expirado — aguarda revisão",
  REVOGADO: "Revogado",
};

export const TIPOS_OVERRIDE = [
  "iniciar_antes_pagamento",
  "materializacao_contratual",
  "progressao_caso",
  "aprovacao_excepcional_tarefa",
  "onboarding_interno",
] as const;
export type TipoOverride = (typeof TIPOS_OVERRIDE)[number];

/** Escopo máximo liberável por tipo de override. Nada fora desta lista pode ser marcado como liberado. */
export const ESCOPOS_LIBERAVEIS: Record<TipoOverride, readonly string[]> = {
  iniciar_antes_pagamento: ["preparacao_contratual", "coleta_de_dados", "onboarding_interno", "planejamento"],
  materializacao_contratual: ["rascunho_interno_contrato", "rascunho_interno_os", "rascunho_interno_anexos"],
  progressao_caso: ["avanco_fase_interna"],
  aprovacao_excepcional_tarefa: ["aprovacao_interna_tarefa", "aprovacao_interna_microentrega"],
  onboarding_interno: ["onboarding_interno"],
};

/**
 * Ações que uma exceção jamais libera, em nenhum tipo de override. Servem
 * de lista de checagem para revisão de código e para os testes: nenhum
 * campo de `SolicitacaoOverride` ou de `montarEventoOverride` pode indicar
 * que uma destas ações foi autorizada.
 */
export const ACOES_JAMAIS_LIBERADAS_POR_OVERRIDE = [
  "marcar_pagamento_recebido",
  "alterar_preco",
  "alterar_escopo_contratado",
  "assinar",
  "enviar_ao_cliente",
  "publicar_no_portal",
  "criar_cobranca",
  "executar_pesquisa_externa",
  "burlar_rls",
  "burlar_autenticacao",
  "acessar_dado_de_terceiro",
] as const;

export const MOTIVO_MINIMO_OVERRIDE = 20;

export type GatePendenteOverride = { chave: string; motivo: string };

export type SolicitacaoOverride = {
  tipo: TipoOverride;
  casoId: string;
  /** O que exatamente está sendo afetado: "ativacao_do_caso", "contrato", "anexo_ii" etc. */
  objetoAfetado: string;
  /** A regra original que está sendo superada — nunca é apagada, só registrada junto da exceção. */
  condicaoOriginal: string;
  gatesPendentes: GatePendenteOverride[];
  /** Subconjunto de ESCOPOS_LIBERAVEIS[tipo]. */
  escopoLiberado: string[];
  justificativa: string;
  autorPapel: string | null | undefined;
  autorUserId: string;
  /** ISO 8601 — data obrigatória de revisão/expiração da exceção. */
  dataRevisao: string;
};

export type ResultadoValidacaoOverride = { valida: boolean; erros: string[] };

/** Validação canônica de uma solicitação de override. Pura: não grava nada. */
export function validarSolicitacaoOverride(s: SolicitacaoOverride): ResultadoValidacaoOverride {
  const erros: string[] = [];
  if (!ehPapelProprietaria(s.autorPapel)) {
    erros.push("Somente a Proprietária administradora autenticada pode registrar um override.");
  }
  if (!s.casoId?.trim()) erros.push("Caso obrigatório.");
  if (!s.objetoAfetado?.trim()) erros.push("Objeto afetado obrigatório.");
  if (!s.condicaoOriginal?.trim()) {
    erros.push("Condição original obrigatória — a exceção precisa declarar a regra que está superando.");
  }
  if (!s.gatesPendentes || s.gatesPendentes.length === 0) {
    erros.push("Ao menos um gate pendente deve ser declarado.");
  }
  if (!s.escopoLiberado || s.escopoLiberado.length === 0) {
    erros.push("Escopo liberado obrigatório.");
  } else {
    const validos = new Set(ESCOPOS_LIBERAVEIS[s.tipo] ?? []);
    const invalidos = s.escopoLiberado.filter((e) => !validos.has(e));
    if (invalidos.length) {
      erros.push(`Escopo fora do permitido para este tipo de override: ${invalidos.join(", ")}.`);
    }
  }
  if ((s.justificativa ?? "").trim().length < MOTIVO_MINIMO_OVERRIDE) {
    erros.push(`Justificativa obrigatória e específica, com pelo menos ${MOTIVO_MINIMO_OVERRIDE} caracteres.`);
  }
  if (!s.dataRevisao?.trim() || Number.isNaN(Date.parse(s.dataRevisao))) {
    erros.push("Data de revisão/expiração obrigatória e válida.");
  }
  if (!s.autorUserId?.trim()) erros.push("Autora autenticada obrigatória.");
  return { valida: erros.length === 0, erros };
}

/** Estado do override em função da data de revisão e de eventual revogação. Nunca infere pagamento. */
export function estadoOverride(input: { dataRevisao: string; revogadoEm?: string | null; agora?: string }): EstadoOverride {
  if (input.revogadoEm) return "REVOGADO";
  const agora = input.agora ? new Date(input.agora).getTime() : Date.now();
  const revisao = new Date(input.dataRevisao).getTime();
  if (Number.isNaN(revisao)) return "BLOQUEADO";
  if (agora > revisao) return "EXPIRADO_AGUARDA_REVISAO";
  return "LIBERADO_POR_OVERRIDE_PROPRIETARIA";
}

/**
 * Verifica se um escopo interno específico está coberto por um override
 * válido para o caso — sem nunca consultar nem inferir campo financeiro.
 * Usado pelas telas para decidir se mostram "liberado por exceção" em vez
 * de bloquear a preparação interna.
 */
export function permiteEscopoInterno(
  overrides: { casoId: string; tipo: TipoOverride; escopoLiberado: string[]; estado: EstadoOverride }[],
  casoId: string,
  tipo: TipoOverride,
  escopo: string,
): boolean {
  return overrides.some(
    (o) =>
      o.casoId === casoId &&
      o.tipo === tipo &&
      o.estado === "LIBERADO_POR_OVERRIDE_PROPRIETARIA" &&
      o.escopoLiberado.includes(escopo),
  );
}

/**
 * Payload para `owner_override_events`. Nunca inclui campo financeiro,
 * assinatura, envio ou publicação — só o registro da decisão interna.
 */
export function montarEventoOverride(s: SolicitacaoOverride, organizationId: string) {
  return {
    organization_id: organizationId,
    actor_user_id: s.autorUserId,
    actor_papel: s.autorPapel ?? "admin",
    categoria: "override_proprietaria_comercial",
    acao: s.tipo,
    entidade: "crm_casos",
    entidade_id: s.casoId,
    campo: s.objetoAfetado,
    motivo: s.justificativa.trim(),
    fonte: s.condicaoOriginal,
    impacto: `Escopo liberado: ${s.escopoLiberado.join(", ")}. Revisão em ${s.dataRevisao}.`,
    pendencias_assumidas: s.gatesPendentes,
    valor_anterior: { estado: "BLOQUEADO" as EstadoOverride, condicao_original: s.condicaoOriginal },
    valor_novo: {
      estado: "LIBERADO_POR_OVERRIDE_PROPRIETARIA" as EstadoOverride,
      escopo_liberado: s.escopoLiberado,
      data_revisao: s.dataRevisao,
    },
    anexos: [] as string[],
    destinatario: null as string | null,
    valor_financeiro: null as number | null,
    acao_externa: false,
    irreversivel: false,
    confirmacao_manual: false,
    executado: true,
    dados_teste: false,
  };
}

/* ------------------------------------------------------------------ */
/* PROMPT 04 — estado do artefato de materialização contratual         */
/* ------------------------------------------------------------------ */

export const ESTADOS_ARTEFATO_MATERIALIZACAO = [
  "RASCUNHO_INTERNO",
  "AGUARDA_REVISAO",
  "PRONTO_PARA_CONFIRMACAO",
  "BLOQUEADO",
] as const;
export type EstadoArtefatoMaterializacao = (typeof ESTADOS_ARTEFATO_MATERIALIZACAO)[number];

/**
 * Deriva o estado de um artefato (contrato, OS ou anexo) materializado sob
 * exceção. Campos ausentes nunca são inventados — aparecem como
 * `PENDENTE_DE_DADO` na lista de `camposPendentes` e travam o artefato em
 * BLOQUEADO ou AGUARDA_REVISAO, nunca em PRONTO_PARA_CONFIRMACAO.
 */
export function estadoArtefatoMaterializacao(input: {
  temOverrideValido: boolean;
  gatesPendentes: GatePendenteOverride[];
  camposPendentes: string[];
  revisaoHumanaConcluida: boolean;
}): EstadoArtefatoMaterializacao {
  if (input.gatesPendentes.length > 0 && !input.temOverrideValido) return "BLOQUEADO";
  if (input.camposPendentes.length > 0) return "AGUARDA_REVISAO";
  // Gate pendente coberto por exceção auditada: materializa só como rascunho interno.
  if (input.gatesPendentes.length > 0 && input.temOverrideValido) return "RASCUNHO_INTERNO";
  if (!input.revisaoHumanaConcluida) return "AGUARDA_REVISAO";
  return "PRONTO_PARA_CONFIRMACAO";
}

export const PENDENTE_DE_DADO = "PENDENTE_DE_DADO" as const;
