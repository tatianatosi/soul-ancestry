/**
 * Composição da Visão Geral (mockup de 17 páginas): Casos, Alertas, Receita,
 * Conversão e funil de leads. Números vêm de fonte real. Sem dado, o card
 * declara ausência — nunca R$ 18.400 nem 34% de demonstração.
 */

export const ETAPAS_FUNIL_HOJE = [
  { codigo: "lead_criado", rotulo: "Leads" },
  { codigo: "discovery_realizada", rotulo: "Discovery" },
  { codigo: "proposta_enviada", rotulo: "Propostas" },
  { codigo: "contrato_assinado", rotulo: "Contratos" },
  { codigo: "caso_ativo", rotulo: "Casos" },
] as const;

export type PagamentoReceita = {
  status?: unknown;
  pago_em?: unknown;
  valor?: unknown;
  dados_teste?: unknown;
};

/** Soma pagamentos confirmados no mês (YYYY-MM). Lista vazia = 0; falha de leitura = null. */
export function receitaDoMes(
  pagamentos: readonly PagamentoReceita[] | null | undefined,
  mesISO: string,
  incluirDemo = false,
): number | null {
  if (!pagamentos) return null;
  const prefixo = mesISO.slice(0, 7);
  let total = 0;
  for (const l of pagamentos) {
    if (!incluirDemo && l.dados_teste === true) continue;
    if (l.status !== "confirmado" || !l.pago_em) continue;
    if (!String(l.pago_em).startsWith(prefixo)) continue;
    total += Number(l.valor) || 0;
  }
  return total;
}

export type LinhaFunilMinima = { codigo: string; entidades: number };

/** Conversão lead → caso ativo. Sem denominador, não inventa percentual. */
export function taxaConversaoLeadParaCaso(funil: readonly LinhaFunilMinima[]): number | null {
  const leads = funil.find((l) => l.codigo === "lead_criado")?.entidades ?? 0;
  const casos = funil.find((l) => l.codigo === "caso_ativo")?.entidades ?? 0;
  if (leads <= 0) return null;
  return casos / leads;
}

export function recorteFunilHoje<T extends LinhaFunilMinima & { rotulo?: string }>(
  funil: readonly T[],
): { codigo: string; rotulo: string; entidades: number }[] {
  return ETAPAS_FUNIL_HOJE.map((e) => {
    const linha = funil.find((l) => l.codigo === e.codigo);
    return { codigo: e.codigo, rotulo: e.rotulo, entidades: linha?.entidades ?? 0 };
  });
}
