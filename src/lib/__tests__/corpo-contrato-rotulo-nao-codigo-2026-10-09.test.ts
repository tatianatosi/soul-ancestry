import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { CAT_FORMA_ASSINATURA, CAT_ROTA } from "@/lib/parametros-catalogos";
import { definicaoCampo } from "@/lib/parametros-dicionario";

/**
 * Defeito medido dentro do HTML da prévia vigente da Ana (470a93d3) em
 * 09/10/2026: o corpo do contrato imprimia o CÓDIGO interno, não o rótulo.
 *
 *   `html like '%eletronica_govbr%'` → true
 *   `html like '%gov.br%'`           → false
 *   `html like '%Austria%'`          → true   (sem acento = o código)
 *   `html like '%Áustria%'`          → false
 *
 * Um contrato que imprime "eletronica_govbr" não é apresentável a quem
 * assina. Campo classificatório guarda código por desenho; o documento
 * precisa do rótulo.
 */

describe("o corpo do contrato mostra rótulo, não código interno", () => {
  const fonte = readFileSync("src/lib/contrato-corpo.server.ts", "utf8");

  it("o acessor de valor traduz campo de lista controlada", () => {
    expect(fonte).toContain("const def = definicaoCampo(campo);");
    expect(fonte).toContain('if (def.tipo !== "dropdown" && def.tipo !== "multiselect") return bruto;');
    expect(fonte).toContain("(def.opcoes ?? []).find((o) => o.valor === bruto)?.rotulo ?? bruto");
  });

  it("os dois casos reais da Ana têm rótulo legível no catálogo", () => {
    expect(CAT_FORMA_ASSINATURA.find((o) => o.valor === "eletronica_govbr")?.rotulo).toBe("Eletrônica via gov.br");
    expect(CAT_ROTA.find((o) => o.valor === "Austria")?.rotulo).toBe("Áustria — administrativa (§ 58c StbG)");
  });

  it("os dois campos são classificatórios no dicionário", () => {
    expect(definicaoCampo("forma_assinatura").tipo).toBe("dropdown");
    expect(definicaoCampo("pais_rota").tipo).toBe("dropdown");
  });

  it("valor fora da lista continua aparecendo — some seria pior que o código", () => {
    expect(fonte).toContain("?.rotulo ?? bruto");
  });

  it("campo de texto não passa por tradução", () => {
    expect(definicaoCampo("objeto_contrato").tipo).toBe("texto_longo");
    expect(definicaoCampo("escopo_resumo").tipo).toBe("texto_longo");
  });

  it("a ficha parametrizada também mostra rótulo — o corpo e a ficha usam o mesmo critério", () => {
    const ficha = readFileSync("src/lib/contrato-parametros.server.ts", "utf8");
    expect(ficha).toContain("const exibir = (v: ValorParam)");
    expect(ficha).toContain("${esc(exibir(v))}");
    // O conteúdo hasheado continua com o código; só a exibição muda.
    expect(ficha).toContain("valor: v.valor,");
  });

  it("forma de pagamento no corpo deixou de sair como assinatura_mensal", () => {
    // Medido na linha 29 do HTML guardado: "Forma de pagamento: assinatura_mensal".
    expect(definicaoCampo("forma_pagamento").tipo).toBe("dropdown");
  });
});
