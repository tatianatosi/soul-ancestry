/**
 * Gera os snapshots de SKUs e de casos/financeiro para análise externa
 * (Perplexity Computer). Fonte: src/data/casos.ts + src/data/propostas.ts,
 * que por sua vez derivam da Planilha Mestre e do planejador universal.
 *
 * Uso: bun run scripts/export-snapshots.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { CASOS, PARAMETROS, SKUS_REFERENCIA, resumoCaso } from "../src/data/casos";
import { PORTFOLIO_MESTRE, PLANOS_WHATSAPP } from "../src/data/propostas";

const csv = (rows: (string | number)[][]) =>
  rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c);
          return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\n") + "\n";

const skusEmLancamentos = new Set(CASOS.flatMap((c) => c.plano.skus));
const emReferencia = new Set(SKUS_REFERENCIA.map((s) => s.sku));

const tipoProcesso = (categoria: string) =>
  PARAMETROS[categoria] ? categoria : SKUS_REFERENCIA.find((s) => s.sku === categoria)?.tipo ?? categoria;

const skuRows: (string | number)[][] = [
  [
    "SKU",
    "Nome",
    "Categoria",
    "Tipo de Processo",
    "Papel no portfolio",
    "Preco atual",
    "Presenca em SKUS_REFERENCIA",
    "Presenca em LANCAMENTOS",
  ],
  ...PORTFOLIO_MESTRE.map((p) => [
    p.sku,
    p.nome,
    p.categoria,
    tipoProcesso(p.categoria),
    p.papel,
    p.precoAtual,
    emReferencia.has(p.sku) ? "sim" : "nao",
    skusEmLancamentos.has(p.sku) ? "sim" : "nao",
  ]),
  ...PLANOS_WHATSAPP.filter((w) => !PORTFOLIO_MESTRE.some((p) => p.sku === w.sku)).map((w) => [
    w.sku,
    w.rotulo,
    "WhatsApp Familiar",
    "Recorrencia",
    w.tipo === "individual" ? "upsell" : "assinatura",
    w.precoAtual,
    emReferencia.has(w.sku) ? "sim" : "nao",
    skusEmLancamentos.has(w.sku) ? "sim" : "nao",
  ]),
];

const casoRows: (string | number)[][] = [
  [
    "ID Caso",
    "Cliente",
    "Tipo de Processo",
    "Honorarios previstos",
    "Despesas previstas",
    "Taxas previstas",
    "Pago Cliente",
    "Desembolsado Clube",
    "Saldo",
    "Parcelas padrao",
    "Parcelas personalizadas",
  ],
  ...CASOS.map((c) => {
    const { saldo } = resumoCaso(c);
    const padrao = PARAMETROS[c.tipoProcesso]?.parcelas ?? "";
    return [
      c.id,
      c.cliente,
      c.tipoProcesso,
      c.plano.honorariosBase,
      c.plano.despesasPrevistas,
      c.plano.taxasPrevistas,
      c.financeiro.pagoCliente,
      c.financeiro.desembolsadoClube,
      saldo,
      padrao,
      c.plano.parcelas,
    ];
  }),
];

mkdirSync("output", { recursive: true });
writeFileSync("output/skus_snapshot.csv", csv(skuRows));
writeFileSync("output/casos_financeiro_snapshot.csv", csv(casoRows));
console.log(`skus_snapshot.csv: ${skuRows.length - 1} linhas`);
console.log(`casos_financeiro_snapshot.csv: ${casoRows.length - 1} linhas`);
