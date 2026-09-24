import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Maior família migrada de DSA-10 (Painel → CaCard canônico): Pesquisa —
 * src/components/pesquisa/painel.tsx (8 blocos), pesquisa/modulo.tsx
 * (5 blocos), pesquisa/assistente.tsx (1 bloco),
 * pesquisa-modulo.index.tsx (2 blocos, além do CaCard `padrao` já
 * existente desde DSA-3, que fica intocado). Mesmo mecanismo mecânico dos
 * cortes anteriores.
 */

const ARQUIVOS = [
  { caminho: "src/components/pesquisa/painel.tsx", blocos: 8 },
  { caminho: "src/components/pesquisa/modulo.tsx", blocos: 5 },
  { caminho: "src/components/pesquisa/assistente.tsx", blocos: 1 },
];

describe.each(ARQUIVOS)("$caminho — migrado para CaCard canônico", ({ caminho, blocos }) => {
  const conteudo = readFileSync(caminho, "utf8");

  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(conteudo).not.toMatch(/<Painel[\s>]/);
    expect(conteudo).not.toContain("</Painel>");
    expect(conteudo).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it(`importa CaCard e usa variante compacto em ${blocos} bloco(s)`, () => {
    expect(conteudo).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(conteudo.match(/<CaCard variante="compacto"/g)?.length).toBe(blocos);
  });
});

describe("pesquisa-modulo.index.tsx — migrado para CaCard canônico (preserva o CaCard padrao do DSA-3)", () => {
  const rota = readFileSync("src/routes/_authenticated/pesquisa-modulo.index.tsx", "utf8");

  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    expect(rota).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it("usa variante compacto nos 2 blocos migrados agora", () => {
    expect(rota).toContain('<CaCard variante="compacto" titulo="Pesquisas em andamento">');
    expect(rota).toContain('<CaCard variante="compacto" titulo="Abrir pesquisa para um caso existente">');
  });

  it("preserva o CaCard padrao do bloco DSA-3 (Inconsistências), sem variante — não regride a decisão anterior", () => {
    expect(rota).toContain('<CaCard titulo="Inconsistências de pesquisa em aberto" eyebrow="Pesquisa Genealógica · Centro de Inteligência">');
  });
});

describe("preserva os rótulos de cada bloco migrado", () => {
  it("pesquisa/painel.tsx — 8 rótulos", () => {
    const conteudo = readFileSync("src/components/pesquisa/painel.tsx", "utf8");
    for (const titulo of [
      "Situação da pesquisa",
      "Legenda visual",
      "Hipóteses de parentesco",
      "Linha familiar",
      "Evidências",
      "Linha do tempo",
      "Pendências de pesquisa",
      "Relatório interno de andamento",
    ]) {
      expect(conteudo).toContain(`titulo="${titulo}"`);
    }
  });

  it("pesquisa/modulo.tsx — rótulos estáticos e dinâmico", () => {
    const conteudo = readFileSync("src/components/pesquisa/modulo.tsx", "utf8");
    expect(conteudo).toContain('titulo="Pesquisa genealógica"');
    expect(conteudo).toContain('titulo={`Pesquisa · ${String(d.caso["codigo"] ?? "caso")}`}');
    expect(conteudo).toContain('titulo="Situação da pesquisa"');
    expect(conteudo).toContain('titulo="Inconsistências detectadas"');
    expect(conteudo).toContain('titulo="Trilha de auditoria da pesquisa"');
  });

  it("pesquisa/assistente.tsx — rótulo único", () => {
    const conteudo = readFileSync("src/components/pesquisa/assistente.tsx", "utf8");
    expect(conteudo).toContain('titulo="Assistente de pesquisa genealógica"');
  });
});
