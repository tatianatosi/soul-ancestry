/**
 * Regra institucional — despesas de terceiros.
 *
 * Despesa de terceiro nunca entra em honorário, receita, custo próprio ou
 * cobrança padrão. É comunicada antes, aprovada pelo cliente com registro e
 * paga diretamente por ele. Exceção só com justificativa, aprovador e validade.
 */

export const CLAUSULA_DESPESAS_TERCEIROS =
  "Despesas de terceiros não estão incluídas nos honorários do Clube Ancestral. " +
  "Serão comunicadas previamente e pagas diretamente pelo cliente, mediante aprovação registrada.";

export const CLAUSULA_DESPESAS_CHAVE = "CLAUSULA-DESPESAS-TERCEIROS";

export const ESTADOS_DESPESA = [
  "nao_aplicavel",
  "estimativa_pendente",
  "estimada_comunicada",
  "aguardando_aprovacao",
  "aprovada",
  "paga_diretamente_pelo_cliente",
  "parcialmente_paga",
  "pendencia_do_cliente",
] as const;
export type EstadoDespesa = (typeof ESTADOS_DESPESA)[number];

export const ROTULO_ESTADO_DESPESA: Record<EstadoDespesa, string> = {
  nao_aplicavel: "Não aplicável",
  estimativa_pendente: "Estimativa pendente",
  estimada_comunicada: "Estimada e comunicada",
  aguardando_aprovacao: "Aguardando aprovação",
  aprovada: "Aprovada",
  paga_diretamente_pelo_cliente: "Paga diretamente pelo cliente",
  parcialmente_paga: "Parcialmente paga",
  pendencia_do_cliente: "Pendência do cliente",
};

export const ESTADOS_EXECUCAO: EstadoDespesa[] = [
  "aprovada",
  "paga_diretamente_pelo_cliente",
  "parcialmente_paga",
];

export type Despesa = {
  id: string;
  descricao: string | null;
  categoria: string | null;
  estado: string;
  estimativa_min: number | null;
  estimativa_max: number | null;
  moeda: string;
  pagador: string;
  comunicado_em: string | null;
  aprovado_pelo_cliente_em: string | null;
  aprovacao_evidencia: string | null;
  executado_em: string | null;
  valor_pago: number | null;
  excecao_id: string | null;
};

/** Pendências da despesa segundo a regra institucional (espelha as travas do banco). */
export function pendenciasDespesa(d: Despesa): string[] {
  const p: string[] = [];
  const estado = d.estado as EstadoDespesa;
  if (!d.descricao?.trim()) p.push("Descrição obrigatória.");
  if (estado === "nao_aplicavel") return p;

  const temEstimativa = d.estimativa_min != null || d.estimativa_max != null;
  if (estado !== "estimativa_pendente" && !temEstimativa) {
    p.push("Estimativa ou faixa de valor não registrada.");
  }
  if (estado !== "estimativa_pendente" && estado !== "pendencia_do_cliente" && !d.comunicado_em) {
    p.push("Comunicação prévia ao cliente não registrada.");
  }
  if (ESTADOS_EXECUCAO.includes(estado)) {
    if (!d.aprovado_pelo_cliente_em) p.push("Aprovação do cliente não registrada.");
    if (!d.aprovacao_evidencia?.trim()) p.push("Evidência da aprovação ausente.");
  }
  if (d.executado_em && !d.aprovado_pelo_cliente_em) {
    p.push("Despesa executada sem aprovação prévia do cliente.");
  }
  if (d.pagador !== "cliente" && !d.excecao_id) {
    p.push("Pagador diferente do cliente sem exceção formal aprovada.");
  }
  return p;
}

/** Pode executar/contratar o serviço de terceiro? */
export function podeExecutarDespesa(d: Despesa): boolean {
  return d.estado !== "nao_aplicavel" && pendenciasDespesa(d).length === 0 && !!d.aprovado_pelo_cliente_em;
}

export const REGRAS_DESPESAS_TERCEIROS = [
  "Toda despesa aplicável exige descrição, estimativa (ou faixa), responsável pagador e aprovação do cliente registrada antes da execução.",
  "O Clube não antecipa, não reembolsa e não registra despesa de terceiro como receita, custo próprio ou cobrança padrão.",
  "Exceção exige justificativa, aprovador, validade e auditoria.",
];
