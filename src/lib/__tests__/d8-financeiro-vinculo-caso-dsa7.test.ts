import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * D8 (§19 do De-Para — Desk Financeiro, zona "Relação com caso": vínculo
 * financeiro ao caso/contrato) + DSA-7 (sétimo consumidor de `CaCard`).
 *
 * `invoices.case_id` já existia na tabela e já era gravado na criação da
 * fatura, mas nenhuma tela voltava a mostrá-lo — a fatura "esquecia" o
 * caso. Este corte só conecta o dado já existente a uma exibição, sem
 * query nova (`casos` já vinha carregado por `vinculos()` para o
 * formulário de criação).
 */

const ROTA = resolve(__dirname, "../../routes/_authenticated/financeiro.tsx");
const codigo = readFileSync(ROTA, "utf8");

describe("D8 Financeiro · §19 — vínculo da fatura ao caso na Gaveta de detalhe", () => {
  it("resolve o caso a partir de case_id sem query nova (reusa `casos` de qv)", () => {
    expect(codigo).toMatch(/const casoDoId = \(id: unknown\) => casos\.find\(\(c\) => c\.id === id\)/);
  });

  it("marca o bloco com data-financeiro-vinculo-caso, só na aba faturas", () => {
    expect(codigo).toContain("data-financeiro-vinculo-caso");
  });

  it("mostra estado honesto quando não há caso vinculado, sem inventar valor", () => {
    expect(codigo).toMatch(/if \(!caso\) return "Sem caso vinculado"/);
  });

  it("link abre o Caso 360 real, não uma rota inventada", () => {
    const trecho = codigo.slice(
      codigo.indexOf("data-financeiro-vinculo-caso"),
      codigo.indexOf("data-financeiro-vinculo-caso") + 500,
    );
    expect(trecho).toMatch(/to="\/casos\/\$caseId"/);
    expect(trecho).toMatch(/params=\{\{ caseId: caso\.id \}\}/);
  });
});

describe("DSA-7 · Financeiro adota CaCard no Resumo da Gaveta", () => {
  it("importa CaCard do design system", () => {
    expect(codigo).toMatch(/from "@\/components\/ui\/ca-card"/);
  });

  it("o bloco Resumo da Gaveta usa CaCard, não mais o Painel genérico", () => {
    expect(codigo).toMatch(/<CaCard titulo="Resumo" eyebrow="Financeiro · Detalhe">/);
  });

  it("Painel continua em uso nos demais blocos da tela (não removido do arquivo)", () => {
    const usos = codigo.match(/<Painel /g) ?? [];
    expect(usos.length).toBeGreaterThan(0);
  });
});
