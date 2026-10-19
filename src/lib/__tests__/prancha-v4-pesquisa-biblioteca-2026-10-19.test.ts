/**
 * Prancha V4 (19/10/2026) — /pesquisa-modulo e /biblioteca como "casca":
 * todo elemento gráfico da prancha existe, com dado real ou vazio honesto.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PESQUISA = readFileSync("src/routes/_authenticated/pesquisa-modulo.index.tsx", "utf8");
const BIBLIOTECA = readFileSync("src/routes/_authenticated/biblioteca.tsx", "utf8");
const FUNCOES = readFileSync("src/lib/pesquisa-modulo.functions.ts", "utf8");

describe("Pesquisa — composição da prancha V4", () => {
  it("cabeçalho do dossiê com subtítulo, Filtros e Nova consulta rolando até o formulário", () => {
    expect(PESQUISA).toContain('titulo="Dossiê de pesquisa"');
    expect(PESQUISA).toContain("Fontes, transcrições, interpretações, hipóteses e conclusões permanecem separadas");
    expect(PESQUISA).toContain('document.getElementById("abrir-pesquisa-caso")');
    expect(PESQUISA).toContain('id="abrir-pesquisa-caso"');
  });

  it("blocos na ordem da prancha: 3 cartões → régua larga → 2 gráficos", () => {
    const ordem = [
      'titulo="Fontes e referências"',
      'titulo="Hipóteses e confiança"',
      'titulo="Miniatura familiar"',
      'titulo="Da pergunta à microentrega"',
      'titulo="Cobertura das fontes"',
      'titulo="Produção de evidências"',
    ].map((t) => PESQUISA.indexOf(t));
    expect(ordem.every((i) => i > 0)).toBe(true);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
    expect(PESQUISA).toContain("xl:grid-cols-3");
  });

  it("usa os gráficos do kit (anel, régua, barras, colunas) e o rótulo Gerações documentadas", () => {
    for (const c of ["<AnelPercentual", "<ReguaEtapas", "<BarrasHorizontais", "<GraficoColunas", "Referência auxiliar", "Gerações documentadas"]) {
      expect(PESQUISA).toContain(c);
    }
  });

  it("percentual de cobertura só com denominador real (totalFontes > 0)", () => {
    expect(PESQUISA).toMatch(/d\.dossie\.totalFontes > 0 \? \(c\.quantidade \/ d\.dossie\.totalFontes\) \* 100 : 0/);
  });

  it("miniatura: aresta só como registrada e papel direcional não atribuído às duas pontas", () => {
    expect(FUNCOES).toContain('const SIMETRICOS = new Set(["conjuge", "irmao", "colateral", "a_confirmar"])');
    expect(FUNCOES).toContain("relacoes: relacoesExplicitas");
    expect(FUNCOES).toContain("geracoesDocumentadas");
  });
});

describe("Biblioteca Mestre — padrão V4", () => {
  it("KPIs nunca somem: '—' sem leitura completa", () => {
    expect(BIBLIOTECA).toContain("ROTULOS_KPI_BIBLIOTECA");
    expect(BIBLIOTECA).toContain('valor={k.valor === null ? "—" : String(k.valor)}');
  });

  it("gráficos com denominador real e entradas em CaCard", () => {
    expect(BIBLIOTECA).toContain('titulo="Itens vigentes por subárea"');
    expect(BIBLIOTECA).toContain("totalVigentes > 0 ? (n / totalVigentes) * 100 : 0");
    expect(BIBLIOTECA).toContain('<CaCard titulo="Entradas de referência" eyebrow="Biblioteca Mestre">');
    expect(BIBLIOTECA).toContain("Da Biblioteca até o App Cliente");
  });
});
