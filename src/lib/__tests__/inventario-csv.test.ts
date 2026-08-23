import { describe, expect, it } from "vitest";
import { INVENTARIO } from "@/lib/inventario-patrimonial";
import {
  CABECALHO_CSV,
  filtrarInventario,
  gerarCsvInventario,
  nomeArquivoCsv,
} from "@/lib/inventario-csv";

describe("exportação CSV do inventário patrimonial", () => {
  it("exporta todas as linhas quando não há filtro", () => {
    const linhas = gerarCsvInventario().trim().split("\r\n");
    expect(linhas).toHaveLength(INVENTARIO.length + 1);
  });

  it("mantém o cabeçalho canônico na primeira linha", () => {
    const [cabecalho] = gerarCsvInventario().split("\r\n");
    expect(cabecalho).toBe(`\uFEFF${CABECALHO_CSV.map((c) => `"${c}"`).join(",")}`);
  });

  it("filtra por domínio", () => {
    const itens = filtrarInventario({ dominio: "anexos" });
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.every((i) => i.dominio === "anexos")).toBe(true);
  });

  it("filtra por status", () => {
    const itens = filtrarInventario({ status: "PARCIAL" });
    expect(itens.every((i) => i.status === "PARCIAL")).toBe(true);
  });

  it("combina domínio e status", () => {
    const itens = filtrarInventario({ dominio: "governanca", status: "COMPLETO" });
    expect(itens.every((i) => i.dominio === "governanca" && i.status === "COMPLETO")).toBe(true);
  });

  it("escapa aspas e remove quebras de linha", () => {
    const csv = gerarCsvInventario();
    const corpo = csv.split("\r\n").slice(1).filter(Boolean);
    for (const linha of corpo) {
      expect(linha.startsWith('"INV-')).toBe(true);
    }
    expect(csv.includes("\n\n")).toBe(false);
  });

  it("nomeia o arquivo com domínio e status", () => {
    expect(nomeArquivoCsv({ dominio: "financeiro", status: "PARCIAL" })).toContain(
      "dominio-financeiro_status-PARCIAL",
    );
  });
});
