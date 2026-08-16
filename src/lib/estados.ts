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
