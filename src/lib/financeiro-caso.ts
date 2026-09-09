/**
 * Leitura financeira por caso (CA07-FINANCEIRO-SIMPLES, 09/09/2026).
 *
 * Uma métrica, uma fonte: valor contratado vem só de `proposals` (a proposta
 * aprovada do caso, ou a mais recente se nenhuma foi aprovada ainda); valor
 * recebido e saldo vêm só de `invoices`/`invoices.valor_pago` (já mantido
 * pelo trigger `fn_payments_pos` a partir de `payments` conciliados — nunca
 * resomado aqui, para não duplicar o mesmo cálculo em fonte diferente).
 * Despesas de terceiros nunca entram em receita, custo ou saldo do Clube.
 */

export type PropostaBruta = {
  id: string;
  status: string;
  valor: number | null;
  moeda: string | null;
  forma_pagamento: string | null;
};

export type FaturaBruta = {
  id: string;
  status: string;
  valor: number | null;
  valor_pago: number | null;
  moeda: string | null;
  vencimento: string | null;
};

export type DespesaBruta = {
  id: string;
  estado: string;
};

export type StatusFinanceiroCaso =
  | "sem_dados_suficientes"
  | "sem_cobranca_emitida"
  | "vencido"
  | "quitado"
  | "parcialmente_pago"
  | "em_dia";

export const ROTULO_STATUS_FINANCEIRO_CASO: Record<StatusFinanceiroCaso, string> = {
  sem_dados_suficientes: "Sem dados suficientes",
  sem_cobranca_emitida: "Sem cobrança emitida",
  vencido: "Vencido",
  quitado: "Quitado",
  parcialmente_pago: "Parcialmente pago",
  em_dia: "Em dia",
};

export type ResumoFinanceiroCaso = {
  valorContratado: number | null;
  moeda: string;
  condicaoComercial: string | null;
  valorRecebido: number;
  saldoAberto: number | null;
  proximaParcela: { faturaId: string; valor: number; vencimento: string } | null;
  status: StatusFinanceiroCaso;
  despesasTerceiros: { total: number; aguardandoAprovacao: number; aprovadasOuPagas: number } | null;
  proximaAcaoFinanceira: string;
  faturaRascunhoAberta: { faturaId: string } | null;
};

const FATURAS_ATIVAS = (f: FaturaBruta) => f.status !== "cancelada";
const FATURAS_EM_ABERTO = (f: FaturaBruta) => !["paga", "cancelada"].includes(f.status);

/** Proposta usada como fonte de valor contratado: aprovada, senão a mais recente (já ordenada por quem chama). */
function propostaDeReferencia(propostas: readonly PropostaBruta[]): PropostaBruta | null {
  return propostas.find((p) => p.status === "aprovada") ?? propostas[0] ?? null;
}

export function calcularResumoFinanceiroCaso(
  propostas: readonly PropostaBruta[],
  faturas: readonly FaturaBruta[],
  despesas: readonly DespesaBruta[],
  hojeISO: string,
): ResumoFinanceiroCaso {
  const proposta = propostaDeReferencia(propostas);
  const valorContratado = proposta ? Number(proposta.valor ?? 0) : null;
  const moeda = proposta?.moeda ?? faturas[0]?.moeda ?? "BRL";
  const condicaoComercial = proposta?.forma_pagamento?.trim() || null;

  const ativas = faturas.filter(FATURAS_ATIVAS);
  const valorRecebido = ativas.reduce((soma, f) => soma + Number(f.valor_pago ?? 0), 0);
  const saldoAberto = valorContratado === null ? null : Math.max(valorContratado - valorRecebido, 0);

  const emAberto = ativas
    .filter(FATURAS_EM_ABERTO)
    .filter((f) => f.vencimento)
    .sort((a, b) => String(a.vencimento).localeCompare(String(b.vencimento)));
  const proximaParcela = emAberto[0]
    ? { faturaId: emAberto[0].id, valor: Number(emAberto[0].valor ?? 0), vencimento: String(emAberto[0].vencimento) }
    : null;

  const vencida = emAberto.find((f) => String(f.vencimento) < hojeISO) ?? null;
  const faturaRascunho = ativas.find((f) => f.status === "rascunho") ?? null;

  let status: StatusFinanceiroCaso;
  if (valorContratado === null && ativas.length === 0) status = "sem_dados_suficientes";
  else if (ativas.length === 0) status = "sem_cobranca_emitida";
  else if (vencida) status = "vencido";
  else if (saldoAberto !== null && saldoAberto <= 0 && valorContratado! > 0) status = "quitado";
  else if (valorRecebido > 0) status = "parcialmente_pago";
  else status = "em_dia";

  let proximaAcaoFinanceira: string;
  if (status === "vencido") proximaAcaoFinanceira = "Cobrar parcela vencida";
  else if (status === "quitado") proximaAcaoFinanceira = "Nenhuma ação financeira pendente";
  else if (proximaParcela) proximaAcaoFinanceira = `Aguardar parcela de ${proximaParcela.vencimento}`;
  else if (valorContratado !== null && ativas.length === 0) proximaAcaoFinanceira = "Preparar cobrança inicial";
  else proximaAcaoFinanceira = "Sem dados suficientes";

  const despesasTerceiros = despesas.length
    ? {
        total: despesas.length,
        aguardandoAprovacao: despesas.filter((d) => d.estado === "aguardando_aprovacao" || d.estado === "estimada_comunicada").length,
        aprovadasOuPagas: despesas.filter((d) => d.estado === "aprovada" || d.estado === "paga_diretamente_pelo_cliente").length,
      }
    : null;

  return {
    valorContratado,
    moeda,
    condicaoComercial,
    valorRecebido,
    saldoAberto,
    proximaParcela,
    status,
    despesasTerceiros,
    proximaAcaoFinanceira,
    faturaRascunhoAberta: faturaRascunho ? { faturaId: faturaRascunho.id } : null,
  };
}
