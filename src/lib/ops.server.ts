/**
 * Helpers server-only do Desk Operacional.
 *
 * O banco é a autoridade das travas (bloqueio, desbloqueio, critério de aceite,
 * caso pausado/encerrado). Aqui só normalizamos campos e resolvemos contexto.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Sb = any;

export const STATUS_TAREFA = [
  "nao_iniciada",
  "em_andamento",
  "bloqueada",
  "concluida",
  "cancelada",
] as const;

export const ROTULO_TAREFA: Record<string, string> = {
  nao_iniciada: "Não iniciada",
  em_andamento: "Em andamento",
  bloqueada: "Bloqueada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const PRIORIDADES = ["urgente", "alta", "media", "baixa"] as const;

export const ROTULO_PRIORIDADE: Record<string, string> = {
  urgente: "Urgente",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const TIPOS_TAREFA = [
  "geral",
  "documental",
  "pesquisa",
  "juridico",
  "atendimento",
  "financeiro",
] as const;

export const ROTULO_TIPO: Record<string, string> = {
  geral: "Geral",
  documental: "Documental",
  pesquisa: "Pesquisa",
  juridico: "Jurídico",
  atendimento: "Atendimento",
  financeiro: "Financeiro",
};

export const STATUS_MICRO = ["pendente", "em_andamento", "concluida", "cancelada"] as const;

export const ROTULO_MICRO: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const ROTULO_SLA: Record<string, string> = {
  no_prazo: "No prazo",
  em_risco: "SLA em risco",
  atrasada: "Atrasada",
  concluido: "Encerrada",
  sem_sla: "Sem SLA",
  sem_prazo: "Sem prazo",
};

export const TIPOS_EXCECAO: Record<string, string> = {
  microentrega_caso_pausado: "Micro-entrega em caso pausado",
  reabertura_caso: "Reabertura de caso encerrado",
  desbloqueio_tarefa: "Desbloqueio excepcional de tarefa",
  prazo_excedido: "Prazo excedido com autorização",
};

export const CAMPOS_TAREFA = [
  "caso_id",
  "titulo",
  "descricao",
  "tipo",
  "status",
  "prioridade",
  "prazo",
  "responsavel_id",
  "motivo_bloqueio",
];

export const CAMPOS_MICRO = [
  "caso_id",
  "fase",
  "titulo",
  "descricao",
  "responsavel_id",
  "prazo",
  "prioridade",
  "status",
  "criterio_aceite",
  "evidencia_url",
  "evidencia_descricao",
  "justificativa_sem_evidencia",
];

const NULO_QUANDO_VAZIO = new Set([
  "caso_id",
  "responsavel_id",
  "prazo",
  "motivo_bloqueio",
  "evidencia_url",
]);

/** Mantém apenas campos permitidos; strings vazias viram nulo. */
export function limparOps(permitidos: string[], dados: Record<string, unknown>) {
  const saida: Record<string, unknown> = {};
  for (const chave of permitidos) {
    if (!(chave in dados)) continue;
    const bruto = dados[chave];
    const valor = typeof bruto === "string" ? bruto.trim() : bruto;
    if (valor === "" || valor === undefined) {
      saida[chave] = NULO_QUANDO_VAZIO.has(chave) ? null : null;
      continue;
    }
    saida[chave] = valor;
  }
  return saida;
}

export const PAPEIS_ESCRITA_OPS = ["admin", "operacoes", "pesquisador", "comercial", "financeiro"];

/** Resolve organização e papel do usuário interno autenticado. */
export async function contextoOps(supabase: Sb, userId: string) {
  const { data, error } = await supabase
    .from("staff_access")
    .select("organization_id,role,status")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.status !== "active") throw new Error("Acesso interno não autorizado.");
  return {
    organizationId: data.organization_id as string,
    papel: data.role as string,
    podeEscrever: PAPEIS_ESCRITA_OPS.includes(data.role as string),
    ehAdmin: data.role === "admin",
  };
}

export function exigirEscrita(ctx: { podeEscrever: boolean }) {
  if (!ctx.podeEscrever) throw new Error("Seu papel é somente leitura no Desk Operacional.");
}
