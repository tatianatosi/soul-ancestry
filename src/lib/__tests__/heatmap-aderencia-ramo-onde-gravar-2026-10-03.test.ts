import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { validarAderenciaPercentual } from "@/lib/pessoas-linhagens";

/**
 * Item 6 da lista da Proprietária (03/10/2026) — "criar os cinco campos do
 * heatmap e cálculo/validação de percentuais".
 *
 * O que faltava, conferido no banco ao vivo: a coluna
 * `lineage_paths.aderencia_percentual`, o CHECK e o escritor já existiam
 * desde 02/10, mas NÃO havia campo na interface — o caso real da Ana tem um
 * ramo gravado ("Linha de cidadania — Áustria (§58c StbG)") com aderência
 * nula, e nenhuma tela onde preenchê-la. Campo sem onde gravar pela interface
 * não é campo entregue.
 *
 * Fronteira que o rótulo da tela declara, não só o código: o percentual é
 * aderência operacional/documental do ramo — nunca parecer jurídico, direito
 * reconhecido ou elegibilidade definitiva.
 */

describe("Item 6 — validação do percentual (0–100 inteiro, sem símbolo)", () => {
  it("aceita inteiro de 0 a 100", () => {
    expect(validarAderenciaPercentual(0)).toBe(0);
    expect(validarAderenciaPercentual(62)).toBe(62);
    expect(validarAderenciaPercentual(100)).toBe(100);
    expect(validarAderenciaPercentual("62")).toBe(62);
  });

  it("recusa 101, negativo, fracionário, string com % e texto", () => {
    for (const ruim of [101, -1, 62.5, "80%", "abc"]) {
      expect(() => validarAderenciaPercentual(ruim as unknown), String(ruim)).toThrow();
    }
  });

  it("branco é ausência de dado, nunca zero — inclusive no servidor", () => {
    // Defeito achado em 03/10 ao escrever este teste: `Number("")` é 0, e 0
    // passava no intervalo — campo em branco gravava "0% de aderência".
    expect(validarAderenciaPercentual(null)).toBeNull();
    expect(validarAderenciaPercentual(undefined)).toBeNull();
    expect(validarAderenciaPercentual("")).toBeNull();
    expect(validarAderenciaPercentual("   ")).toBeNull();
    // Zero de verdade continua gravável: é diferente de "não calculada".
    expect(validarAderenciaPercentual(0)).toBe(0);
    expect(validarAderenciaPercentual("0")).toBe(0);
  });
});

describe("Item 6 — o campo agora tem onde ser gravado pela interface", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");

  it("o formulário de nova linhagem coleta a aderência do ramo", () => {
    expect(pagina).toContain('<Campo label="Aderência do ramo (%)">');
    expect(pagina).toContain("nova.aderencia_percentual");
  });

  it("ramo JÁ gravado pode receber a aderência sem recriar a linhagem (o caso da Ana)", () => {
    expect(pagina).toContain("function AderenciaDoRamo(");
    expect(pagina).toContain("<AderenciaDoRamo linhagem={l} onSalvar={onSalvar} />");
    expect(pagina).toContain('onSalvar(linhagem.id, { aderencia_percentual:');
  });

  it("campo em branco grava null, não 0 — nos dois caminhos", () => {
    expect(pagina).toContain('valor.trim() === "" ? null : valor');
    expect(pagina).toContain('nova.aderencia_percentual.trim() === "" ? null : nova.aderencia_percentual');
  });

  it("a tela mostra quando a aderência ainda não foi calculada, em vez de exibir 0%", () => {
    expect(pagina).toContain("Aderência não calculada");
  });

  it("a fronteira está escrita na tela, não só no comentário", () => {
    expect(pagina).toContain("Não é parecer jurídico, direito reconhecido nem elegibilidade definitiva.");
  });
});

describe("Item 6 — o servidor é quem recusa, e os 5 campos saem deste eixo", () => {
  it("o escritor normaliza pelo validador antes de gravar em lineage_paths", () => {
    const fn = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");
    expect(fn).toContain("validarAderenciaPercentual(");
    expect(fn).toContain('data.tabela === "lineage_paths"');
  });

  it("a Ficha Master ordena os ramos por aderência e tira dali país/pct 1..3", () => {
    const ficha = readFileSync("src/lib/ficha-master.server.ts", "utf8");
    expect(ficha).toContain("aderencia_percentual");
    expect(ficha).toContain("heatmap");
    // Ramo sem percentual nunca ganha nota: ordena por último, não some.
    expect(ficha).toContain("(b.aderencia_percentual ?? -1) - (a.aderencia_percentual ?? -1)");
  });
});
