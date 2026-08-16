/**
 * Máquina de estados operacional do Clube Ancestral.
 *
 * Espelho exato das travas aplicadas no banco (funções `transicao_permitida`,
 * `fn_estado_*`). A interface usa esta fonte para só oferecer transições
 * válidas; o banco continua sendo a autoridade final.
 */

export type Dominio = "lead" | "cliente" | "caso" | "tarefa" | "evidencia";

export const ESTADOS: Record<Dominio, { valor: string; rotulo: string }[]> = {
  lead: [
    { valor: "novo", rotulo: "Novo" },
    { valor: "qualificado", rotulo: "Qualificado" },
    { valor: "proposta_em_preparo", rotulo: "Proposta em preparo" },
    { valor: "proposta_enviada", rotulo: "Proposta enviada" },
    { valor: "ganho", rotulo: "Ganho" },
    { valor: "perdido", rotulo: "Perdido" },
    { valor: "arquivado", rotulo: "Arquivado" },
  ],
  cliente: [
    { valor: "pre_onboarding", rotulo: "Pré-onboarding" },
    { valor: "ativo", rotulo: "Ativo" },
    { valor: "suspenso", rotulo: "Suspenso" },
    { valor: "encerrado", rotulo: "Encerrado" },
    { valor: "arquivado", rotulo: "Arquivado" },
  ],
  caso: [
    { valor: "rascunho", rotulo: "Rascunho" },
    { valor: "aguardando_documentos", rotulo: "Aguardando documentos" },
    { valor: "aguardando_pagamento", rotulo: "Aguardando pagamento" },
    { valor: "pronto_para_ativar", rotulo: "Pronto para ativar" },
    { valor: "ativo", rotulo: "Ativo" },
    { valor: "pausado", rotulo: "Pausado" },
    { valor: "concluido", rotulo: "Concluído" },
    { valor: "encerrado", rotulo: "Encerrado" },
    { valor: "arquivado", rotulo: "Arquivado" },
  ],
  tarefa: [
    { valor: "nao_iniciada", rotulo: "Não iniciada" },
    { valor: "em_andamento", rotulo: "Em andamento" },
    { valor: "bloqueada", rotulo: "Bloqueada" },
    { valor: "concluida", rotulo: "Concluída" },
    { valor: "cancelada", rotulo: "Cancelada" },
  ],
  evidencia: [
    { valor: "coletada", rotulo: "Coletada" },
    { valor: "em_revisao", rotulo: "Em revisão" },
    { valor: "validada", rotulo: "Validada" },
    { valor: "inconclusiva", rotulo: "Inconclusiva" },
    { valor: "descartada", rotulo: "Descartada" },
  ],
};

export const TRANSICOES: Record<Dominio, Record<string, string[]>> = {
  lead: {
    novo: ["qualificado", "perdido", "arquivado"],
    qualificado: ["proposta_em_preparo", "perdido", "arquivado"],
    proposta_em_preparo: ["proposta_enviada", "perdido", "arquivado"],
    proposta_enviada: ["ganho", "perdido", "arquivado"],
    ganho: ["arquivado"],
    perdido: ["novo", "qualificado", "arquivado"],
    arquivado: [],
  },
  cliente: {
    pre_onboarding: ["ativo", "encerrado", "arquivado"],
    ativo: ["suspenso", "encerrado", "arquivado"],
    suspenso: ["ativo", "encerrado", "arquivado"],
    encerrado: ["arquivado"],
    arquivado: [],
  },
  caso: {
    rascunho: ["aguardando_documentos", "aguardando_pagamento", "encerrado", "arquivado"],
    aguardando_documentos: ["aguardando_pagamento", "pronto_para_ativar", "encerrado", "arquivado"],
    aguardando_pagamento: ["aguardando_documentos", "pronto_para_ativar", "encerrado", "arquivado"],
    pronto_para_ativar: ["ativo", "aguardando_documentos", "aguardando_pagamento", "encerrado", "arquivado"],
    ativo: ["pausado", "concluido", "encerrado", "arquivado"],
    pausado: ["ativo", "encerrado", "arquivado"],
    concluido: ["encerrado", "arquivado"],
    encerrado: ["arquivado"],
    arquivado: [],
  },
  tarefa: {
    nao_iniciada: ["em_andamento", "bloqueada", "cancelada"],
    em_andamento: ["bloqueada", "concluida", "cancelada"],
    bloqueada: ["em_andamento", "cancelada"],
    concluida: [],
    cancelada: ["nao_iniciada"],
  },
  evidencia: {
    coletada: ["em_revisao", "descartada"],
    em_revisao: ["validada", "inconclusiva", "descartada", "coletada"],
    validada: ["em_revisao", "descartada"],
    inconclusiva: ["em_revisao", "descartada"],
    descartada: [],
  },
};

export const PRIORIDADES = [
  { valor: "baixa", rotulo: "Baixa" },
  { valor: "media", rotulo: "Média" },
  { valor: "alta", rotulo: "Alta" },
  { valor: "critica", rotulo: "Crítica" },
];

export function rotuloEstado(dominio: Dominio, valor: unknown): string {
  const v = typeof valor === "string" ? valor : "";
  return ESTADOS[dominio].find((e) => e.valor === v)?.rotulo ?? (v || "—");
}

export function transicoesDe(dominio: Dominio, atual: unknown): { valor: string; rotulo: string }[] {
  const v = typeof atual === "string" ? atual : "";
  const destinos = TRANSICOES[dominio][v] ?? [];
  return ESTADOS[dominio].filter((e) => destinos.includes(e.valor));
}

export function transicaoPermitida(dominio: Dominio, de: string, para: string): boolean {
  if (de === para) return true;
  return (TRANSICOES[dominio][de] ?? []).includes(para);
}

/** Tabela operacional -> domínio de estado (espelho de `fn_estado_*` no banco). */
export const DOMINIO_POR_TABELA: Record<string, { dominio: Dominio; campo: string }> = {
  leads: { dominio: "lead", campo: "estagio" },
  clientes: { dominio: "cliente", campo: "status" },
  crm_casos: { dominio: "caso", campo: "status" },
  tarefas: { dominio: "tarefa", campo: "status" },
  evidencias: { dominio: "evidencia", campo: "status" },
};

/** Estado inicial precisa pertencer ao vocabulário oficial. */
export function validarEstadoInicial(tabela: string, dados: Record<string, unknown>) {
  const mapa = DOMINIO_POR_TABELA[tabela];
  if (!mapa) return;
  const valor = dados[mapa.campo];
  if (valor === undefined || valor === null || valor === "") return;
  const valido = ESTADOS[mapa.dominio].some((e) => e.valor === valor);
  if (!valido) throw new Error(`Estado inválido para ${tabela}: ${String(valor)}.`);
}

/** Bloqueia transições fora da máquina de estados. */
export function validarTransicao(
  tabela: string,
  atual: Record<string, unknown>,
  alteracoes: Record<string, unknown>,
) {
  const mapa = DOMINIO_POR_TABELA[tabela];
  if (!mapa) return;
  const novo = alteracoes[mapa.campo];
  if (novo === undefined || novo === null || novo === "") return;
  const de = String(atual[mapa.campo] ?? "");
  const para = String(novo);
  if (!ESTADOS[mapa.dominio].some((e) => e.valor === para)) {
    throw new Error(`Estado inválido para ${tabela}: ${para}.`);
  }
  if (!transicaoPermitida(mapa.dominio, de, para)) {
    throw new Error(
      `Transição não permitida: ${rotuloEstado(mapa.dominio, de)} → ${rotuloEstado(mapa.dominio, para)}.`,
    );
  }
}

/** Regras de integridade obrigatórias (também aplicadas por trigger no banco). */
export function validarRegrasNegocio(tabela: string, registro: Record<string, unknown>) {
  const vazio = (v: unknown) => v === undefined || v === null || String(v).trim() === "";

  if (tabela === "crm_casos" && registro["status"] === "ativo") {
    if (vazio(registro["cliente_id"])) throw new Error("Caso ativo exige cliente vinculado.");
    if (vazio(registro["responsavel_id"])) throw new Error("Caso ativo exige responsável.");
    if (vazio(registro["tipo_servico"])) throw new Error("Caso ativo exige tipo de serviço.");
  }

  if (tabela === "tarefas") {
    const bloqueada = registro["status"] === "bloqueada" || registro["bloqueio"] === true;
    if (registro["status"] === "bloqueada" && vazio(registro["motivo_bloqueio"])) {
      throw new Error("Tarefa bloqueada exige motivo do bloqueio.");
    }
    if (registro["status"] === "concluida" && bloqueada) {
      throw new Error("Tarefa bloqueada não pode ser concluída. Desbloqueie antes.");
    }
  }
}
