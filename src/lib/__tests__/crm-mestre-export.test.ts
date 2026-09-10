import { describe, expect, it } from "vitest";

import { GRUPOS_DESK, MENU_CONTA, rotaAtendeDestino } from "@/lib/navegacao-desk";
import {
  CABECALHO_CSV_CRM_MESTRE,
  gerarCsvCrmMestre,
  htmlImpressaoCrmMestre,
  linhasCrmMestre,
  nomeArquivoCrmMestre,
} from "@/lib/crm-mestre-export";

describe("/crm-mestre no menu do Desk", () => {
  const links = MENU_CONTA.itens.filter((s): s is { to: string; label: string } => "to" in s);

  it("aparece no menu da conta, fora da face Comercial", () => {
    expect(links.some((s) => s.to === "/crm-mestre")).toBe(true);
    const comercial = GRUPOS_DESK.find((g) => g.icone === "comercial");
    const rotasComercial = (comercial?.sub ?? [])
      .filter((s): s is { to: string; label: string } => "to" in s)
      .map((s) => s.to);
    expect(rotasComercial).not.toContain("/crm-mestre");
  });

  it("mantém estado ativo sem colisão de prefixo (desktop e mobile usam a mesma regra)", () => {
    const rota = "/crm-mestre";
    const ativos = links.filter((s) => rotaAtendeDestino(rota, s.to)).map((s) => s.to);
    expect(ativos).toEqual(["/crm-mestre"]);
  });
});

describe("exportação somente leitura de /crm-mestre", () => {
  it("gera linhas de todas as seções", () => {
    const secoes = new Set(linhasCrmMestre().map((l) => l.secao));
    expect(secoes.has("Fontes de verdade")).toBe(true);
    expect(secoes.has("Matriz de handoff")).toBe(true);
    expect(secoes.has("Listas controladas")).toBe(true);
    expect(secoes.has("Decisões humanas pendentes")).toBe(true);
  });

  it("CSV tem BOM, cabeçalho e escapa separadores", () => {
    const csv = gerarCsvCrmMestre();
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv.split("\r\n")[0]).toBe(`\uFEFF${CABECALHO_CSV_CRM_MESTRE.join(",")}`);
    for (const linha of csv.split("\r\n").slice(1).filter(Boolean)) {
      expect(linha.replace(/"(?:[^"]|"")*"/g, "").split(",").length).toBe(4);
    }
  });

  it("nome do arquivo é versionado", () => {
    expect(nomeArquivoCrmMestre("csv")).toMatch(/^crm-mestre_CA-04-v[\d.]+\.csv$/);
    expect(nomeArquivoCrmMestre("pdf")).toMatch(/\.pdf$/);
  });

  it("HTML de impressão usa a marca oficial e não o azul retirado", () => {
    const html = htmlImpressaoCrmMestre("2026-08-24");
    expect(html).toContain("#2F4B6E");
    expect(html).toContain("#FCB73A");
    expect(html).not.toContain("#1B2B4B");
    expect(html).toContain("2026-08-24");
  });
});
