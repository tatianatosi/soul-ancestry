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

describe("pré-visualização do CSV filtrado", () => {
  it("informa o total de linhas igual ao filtro aplicado", () => {
    const filtro = { dominio: "todos" as const, status: "todos" as const };
    expect(previaCsvInventario(filtro).totalLinhas).toBe(filtrarInventario(filtro).length);
  });

  it("limita a amostra ao número pedido sem esconder o total", () => {
    const p = previaCsvInventario({}, 3);
    expect(p.amostra.length).toBeLessThanOrEqual(3);
    expect(p.linhasNaAmostra).toBe(p.amostra.length);
    expect(p.totalLinhas).toBeGreaterThanOrEqual(p.linhasNaAmostra);
  });

  it("cada linha da amostra tem uma célula por coluna do cabeçalho", () => {
    const p = previaCsvInventario({}, 5);
    for (const linha of p.amostra) expect(linha.length).toBe(p.colunas.length);
  });

  it("devolve zero linhas e amostra vazia quando o filtro não casa com nada", () => {
    const p = previaCsvInventario({ dominio: "contratual", status: "inexistente" as never });
    expect(p.totalLinhas).toBe(0);
    expect(p.amostra).toEqual([]);
  });

  it("expõe nome de arquivo e tamanho aproximado coerentes com o CSV gerado", () => {
    const filtro = { dominio: "todos" as const, status: "todos" as const };
    const p = previaCsvInventario(filtro);
    expect(p.nomeArquivo).toBe(nomeArquivoCsv(filtro));
    expect(p.tamanhoAproximadoBytes).toBe(new TextEncoder().encode(gerarCsvInventario(filtro)).length);
    expect(tamanhoLegivel(2048)).toBe("2.0 KB");
    expect(tamanhoLegivel(512)).toBe("512 B");
  });
});
