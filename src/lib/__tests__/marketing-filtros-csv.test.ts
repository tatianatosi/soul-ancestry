import { describe, expect, it } from "vitest";

import { SEM_DADOS, type EntradaAquisicao } from "@/lib/marketing-aquisicao";
import {
  CANAL_SEM_ATRIBUICAO,
  canaisDisponiveis,
  explicarMetrica,
  filtrarEntrada,
  gerarCsvMarketing,
  linhasCsvMarketing,
  prontidaoAtribuicao,
} from "@/lib/marketing-filtros-csv";

const vazia: EntradaAquisicao = {
  leads: [],
  eventos: [],
  investimentos: [],
  campanhas: [],
  fontes: [],
  atribuicoes: [],
};

const agora = new Date("2026-08-23T00:00:00Z");

describe("filtros de marketing", () => {
  it("recorta por período usando a data da linha", () => {
    const entrada = {
      ...vazia,
      leads: [
        { origem: "indicacao", criado_em: "2026-08-20T00:00:00Z" },
        { origem: "manual", criado_em: "2025-01-01T00:00:00Z" },
      ] as never,
    };
    const r = filtrarEntrada(entrada, { periodo: "7d", canal: "todos" }, agora);
    expect(r.leads).toHaveLength(1);
    expect(filtrarEntrada(entrada, { periodo: "tudo", canal: "todos" }, agora).leads).toHaveLength(
      2,
    );
  });

  it("segmenta por canal e expõe o balde sem atribuição", () => {
    const entrada = { ...vazia, leads: [{ origem: "indicacao" }, {}] as never };
    expect(canaisDisponiveis(entrada).map((c) => c.valor)).toContain(CANAL_SEM_ATRIBUICAO);
    expect(
      filtrarEntrada(entrada, { periodo: "tudo", canal: "indicacao" }, agora).leads,
    ).toHaveLength(1);
  });
});

describe("explicação de CAC, ROI e ROAS", () => {
  it("lista exatamente os campos faltantes", () => {
    const cac = explicarMetrica("cac", vazia);
    expect(cac.faltantes.length).toBeGreaterThan(0);
    expect(cac.tooltip).toContain("Faltam:");
    expect(explicarMetrica("roas", vazia).faltantes.some((f) => f.campo.includes("receita"))).toBe(
      true,
    );
  });
});

describe("prontidão de atribuição", () => {
  it("nunca fica pronta sem captura e receita atribuída", () => {
    const p = prontidaoAtribuicao(vazia);
    expect(p.pronto).toBe(false);
    expect(p.itens.map((i) => i.grupo)).toContain("captura");
    expect(p.resumo).toContain(SEM_DADOS);
  });
});

describe("exportação CSV", () => {
  it("inclui estados sem dados e o recorte aplicado", () => {
    const linhas = linhasCsvMarketing(vazia, { periodo: "tudo", canal: "todos" });
    expect(linhas.some((l) => l.valor === SEM_DADOS)).toBe(true);
    expect(linhas.some((l) => l.secao === "prontidao_atribuicao")).toBe(true);
    const csv = gerarCsvMarketing(vazia, { periodo: "tudo", canal: "todos" });
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("Todo o histórico");
  });
});
