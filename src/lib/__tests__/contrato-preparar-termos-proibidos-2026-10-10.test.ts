import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { verificarTermosProibidos } from "@/lib/linguagem-proibida";

const fonte = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");

describe("solicitarRevisaoHumana — termos proibidos da Governança 5A (10/10/2026)", () => {
  it("importa e aplica o checker depois do gate da prévia vigente", () => {
    expect(fonte).toContain('import { verificarTermosProibidos } from "@/lib/linguagem-proibida"');
    const gate = fonte.indexOf('saida: "revisao"');
    const checker = fonte.indexOf("verificarTermosProibidos(`");
    expect(gate).toBeGreaterThan(0);
    expect(checker).toBeGreaterThan(gate);
    expect(fonte).toContain("Termo proibido pela Governança 5A");
  });

  it("o checker pega os termos vedados e deixa passar texto limpo", () => {
    expect(verificarTermosProibidos("Faremos uma constelação familiar e cura ancestral.").map((t) => t.termo)).toEqual([
      "constelação familiar",
      "cura ancestral",
    ]);
    expect(verificarTermosProibidos("Pesquisa documental de registros civis.")).toEqual([]);
  });
});
