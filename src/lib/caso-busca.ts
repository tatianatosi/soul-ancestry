/**
 * Resolução de caso por código canônico ou identificador histórico (alias).
 * Regra: alias nunca vira chave — ele apenas resolve para o caso canônico,
 * sem criar registro, sem alerta de duplicidade e sem segundo caso.
 */

export type ResultadoBuscaCaso = {
  caseId: string;
  codigoCanonico: string;
  titulo: string | null;
  /** Código digitado que originou a resolução. */
  termo: string;
  /** true quando o termo digitado era um identificador histórico. */
  viaAlias: boolean;
  aliasUsado: string | null;
};

/** Normaliza o código digitado: maiúsculas, sem espaços nas pontas, sem espaços internos duplicados. */
export function normalizarCodigo(termo: string): string {
  return termo.trim().replace(/\s+/g, "").toUpperCase();
}

/** Mensagem de resolução exibida na tela, sempre apontando o código canônico. */
export function mensagemResolucao(r: ResultadoBuscaCaso): string {
  return r.viaAlias
    ? `Identificador histórico ${r.aliasUsado} resolvido para o caso canônico ${r.codigoCanonico}.`
    : `Caso canônico ${r.codigoCanonico} localizado.`;
}
