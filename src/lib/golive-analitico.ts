/**
 * Cálculos das superfícies Pesquisa, Financeiro, Jurídico, Portal e App.
 *
 * Funções puras sobre o que o motor aprovado já leu. Nenhum dado é criado,
 * estimado ou completado: ausência vira lista vazia, e a tela mostra o estado
 * vazio canônico. Toda função temporal aceita `agora` injetável.
 *
 * Datas (documentado, sem conversão nova):
 * - `paga_em`, `pago_em`, `created_at`, `found_at`, `approved_at` chegam como
 *   timestamp com fuso; datas só de dia viram meia-noite local via `paraData`.
 */

import { paraData } from "./golive-operacao";

export type Fatia = { rotulo: string; valor: number };

/** Contagem por chave já gravada; registro sem valor cai no rótulo de ausência. */
export function contarPor<T>(
  itens: readonly T[],
  chave: (i: T) => string | null | undefined,
  semValor = "Sem registro",
): Fatia[] {
  const mapa = new Map<string, number>();
  for (const i of itens) {
    const v = (chave(i) ?? "").trim();
    const rotulo = v || semValor;
    mapa.set(rotulo, (mapa.get(rotulo) ?? 0) + 1);
  }
  return [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor }));
}

const DIA = 86_400_000;

function meiaNoite(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Série semanal de itens datados, da semana mais antiga à atual (segunda a domingo). */
export function porSemana<T>(
  itens: readonly T[],
  data: (i: T) => string | null | undefined,
  semanas = 7,
  agora: Date = new Date(),
): Fatia[] {
  const hoje = meiaNoite(agora);
  const segunda = new Date(hoje.getTime() - ((hoje.getDay() + 6) % 7) * DIA);
  const baldes = Array.from({ length: semanas }, (_, k) => {
    const inicio = new Date(segunda.getTime() - (semanas - 1 - k) * 7 * DIA);
    return {
      rotulo: inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      valor: 0,
      inicio: inicio.getTime(),
      fim: inicio.getTime() + 7 * DIA,
    };
  });
  for (const i of itens) {
    const d = paraData(data(i));
    if (!d) continue;
    const t = d.getTime();
    const balde = baldes.find((b) => t >= b.inicio && t < b.fim);
    if (balde) balde.valor += 1;
  }
  return baldes.map((b) => ({ rotulo: b.rotulo, valor: b.valor }));
}

/** Soma mensal de valores datados, do mês mais antigo ao atual. */
export function porMes<T>(
  itens: readonly T[],
  data: (i: T) => string | null | undefined,
  valor: (i: T) => number | null | undefined,
  meses = 6,
  agora: Date = new Date(),
): Fatia[] {
  const base = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const baldes = Array.from({ length: meses }, (_, k) => {
    const inicio = new Date(base.getFullYear(), base.getMonth() - (meses - 1 - k), 1);
    const fim = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 1);
    return {
      rotulo: inicio.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      valor: 0,
      inicio: inicio.getTime(),
      fim: fim.getTime(),
    };
  });
  for (const i of itens) {
    const d = paraData(data(i));
    if (!d) continue;
    const v = valor(i);
    if (typeof v !== "number" || Number.isNaN(v)) continue;
    const t = d.getTime();
    const balde = baldes.find((b) => t >= b.inicio && t < b.fim);
    if (balde) balde.valor += v;
  }
  return baldes.map((b) => ({ rotulo: b.rotulo, valor: Math.round(b.valor) }));
}

/* ----------------------------- Financeiro ----------------------------- */

export type FaturaGoLive = {
  id: string;
  valor: number | null;
  valorPago: number | null;
  status: string | null;
  vencimento: string | null;
  pagaEm: string | null;
};

export type PagamentoGoLive = { id: string; valor: number | null; pagoEm: string | null };

const PAGA = /(pag|quitad|liquidad)/i;

export function estaPaga(f: FaturaGoLive) {
  return Boolean(f.pagaEm) || PAGA.test(f.status ?? "");
}

const CANCELADA = /(cancel|dispens|estorn|anulad)/i;

/** Situação da fatura: paga, cancelada/dispensada, vencida ou aberta. */
export function situacaoDaFatura(f: FaturaGoLive, agora: Date = new Date()) {
  if (CANCELADA.test(f.status ?? "")) return "Cancelada/dispensada";
  if (estaPaga(f)) return "Paga";
  const d = paraData(f.vencimento);
  if (d && meiaNoite(d).getTime() < meiaNoite(agora).getTime()) return "Vencida";
  return "Aberta";
}

/** Distribuição das faturas pelas quatro situações, omitindo fatia sem nenhum registro. */
export function situacaoDasFaturas(faturas: readonly FaturaGoLive[], agora: Date = new Date()): Fatia[] {
  const ordem = ["Aberta", "Vencida", "Paga", "Cancelada/dispensada"] as const;
  return ordem
    .map((rotulo) => ({ rotulo, valor: faturas.filter((f) => situacaoDaFatura(f, agora) === rotulo).length }))
    .filter((i) => i.valor > 0);
}

/** Totais do caso: contratado, pago, em aberto e vencido — só do que está gravado. */
export function totaisFinanceiros(
  faturas: readonly FaturaGoLive[],
  pagamentos: readonly PagamentoGoLive[],
  agora: Date = new Date(),
) {
  const contratado = faturas.reduce((s, f) => s + (f.valor ?? 0), 0);
  const pagoRegistrado = pagamentos.reduce((s, p) => s + (p.valor ?? 0), 0);
  const pagoFaturas = faturas.filter(estaPaga).reduce((s, f) => s + (f.valorPago ?? f.valor ?? 0), 0);
  const pago = Math.max(pagoRegistrado, pagoFaturas);
  const abertas = faturas.filter((f) => !estaPaga(f));
  const emAberto = abertas.reduce((s, f) => s + (f.valor ?? 0), 0);
  const vencido = abertas
    .filter((f) => {
      const d = paraData(f.vencimento);
      return d !== null && meiaNoite(d).getTime() < meiaNoite(agora).getTime();
    })
    .reduce((s, f) => s + (f.valor ?? 0), 0);
  return { contratado, pago, emAberto, vencido };
}

/** Recebimento por mês: pagamentos registrados; sem eles, faturas com data de quitação. */
export function recebimentoPorMes(
  faturas: readonly FaturaGoLive[],
  pagamentos: readonly PagamentoGoLive[],
  meses = 6,
  agora: Date = new Date(),
): Fatia[] {
  if (pagamentos.some((p) => p.pagoEm)) {
    return porMes(pagamentos, (p) => p.pagoEm, (p) => p.valor, meses, agora);
  }
  const quitadas = faturas.filter((f) => Boolean(f.pagaEm));
  if (!quitadas.length) return [];
  return porMes(quitadas, (f) => f.pagaEm, (f) => f.valorPago ?? f.valor, meses, agora);
}

/* ------------------------------ Jurídico ------------------------------ */

export type PipelineFormalizacao = {
  propostas: number;
  escopo: number;
  contratos: number;
  assinados: number;
  ordens: number;
};

/** Escada da formalização: cada degrau só é concluído com registro gravado. */
export function escadaFormalizacao(p: PipelineFormalizacao) {
  return [
    { rotulo: "Proposta", feito: p.propostas > 0 },
    { rotulo: "Escopo", feito: p.escopo > 0 },
    { rotulo: "Contrato", feito: p.contratos > 0 },
    { rotulo: "Assinatura", feito: p.assinados > 0 },
    { rotulo: "OS", feito: p.ordens > 0 },
  ];
}

/* ------------------------------- Portal ------------------------------- */

const PUBLICADO = /(publish|publicad|aprovad|approved)/i;

export function estadoDaProjecao(estado: string) {
  if (PUBLICADO.test(estado)) return "Publicado";
  if (/(rascunho|draft)/i.test(estado)) return "Rascunho";
  if (/(revis|review|pendente|pending)/i.test(estado)) return "Em revisão";
  if (/(despublic|retir|revog)/i.test(estado)) return "Despublicado";
  return "Sem situação";
}
