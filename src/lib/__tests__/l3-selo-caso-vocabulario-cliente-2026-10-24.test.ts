import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { rotuloSeloCaso } from "@/lib/selo-caso-cliente";

/**
 * L3 (plano de lançamento de 25/10/2026): o selo do caso no App fala a língua
 * da família. Antes, a Ana via "PRONTO PARA ATIVAR" (estado do Desk) e um caso
 * sem status via "NÃO REGISTRADO".
 */
describe("L3 — selo do caso no vocabulário do cliente", () => {
  it("ativo vira 'Caso ativo' (pelo status ou pela flag)", () => {
    expect(rotuloSeloCaso("ativo")).toBe("Caso ativo");
    expect(rotuloSeloCaso(null, true)).toBe("Caso ativo");
  });

  it("estados internos de preparação viram 'Em preparação'", () => {
    for (const s of [
      "rascunho",
      "aguardando_documentos",
      "aguardando_pagamento",
      "pronto_para_ativar",
    ]) {
      expect(rotuloSeloCaso(s)).toBe("Em preparação");
    }
  });

  it("estados finais têm rótulo próprio", () => {
    expect(rotuloSeloCaso("pausado")).toBe("Caso pausado");
    expect(rotuloSeloCaso("concluido")).toBe("Caso concluído");
    expect(rotuloSeloCaso("encerrado")).toBe("Caso encerrado");
    expect(rotuloSeloCaso("arquivado")).toBe("Caso encerrado");
  });

  it("sem status ou status desconhecido: o selo some (nunca 'Não registrado')", () => {
    expect(rotuloSeloCaso(null)).toBeNull();
    expect(rotuloSeloCaso(undefined)).toBeNull();
    expect(rotuloSeloCaso("valor_novo_qualquer")).toBeNull();
  });

  it("o componente não usa mais o rótulo operacional nem 'Não registrado'", () => {
    const fonte = readFileSync(
      resolve(__dirname, "../../components/portal/elementos-mockup.tsx"),
      "utf8",
    );
    const selo = fonte.slice(fonte.indexOf("export function SeloEstadoCaso"));
    const corpo = selo.slice(0, selo.indexOf("\n}\n"));
    expect(corpo).not.toContain("statusRotulo");
    expect(corpo).not.toContain("Não registrado");
  });
});
