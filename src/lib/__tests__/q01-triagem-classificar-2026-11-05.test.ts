import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// @ts-expect-error módulo .mjs de script, sem tipos
import { classificarBranch, lerNameStatus, marcadorDaLinha } from "../../../scripts/triagem-classificar.mjs";

/** Bloco Q01 / LC-04 (05/11/2026): triagem de branches trata erro do git como erro. */
describe("Q01 — veredito por branch", () => {
  it("falha ao contar commits vira ERRO_GIT, nunca JA_NA_MAIN", () => {
    expect(classificarBranch({ frente: null }).veredito).toBe("ERRO_GIT");
    expect(classificarBranch({ frente: 0 }).veredito).toBe("JA_NA_MAIN");
  });

  it("arquivo novo de código → PORTAR_ARQUIVOS_NOVOS; igual ao da main → ENTREGUE; só docs → DOC_SEM_EXECUCAO", () => {
    expect(classificarBranch({ frente: 2, arquivos: [{ status: "A", caminho: "src/a.ts", noRef: "x", naMain: null }] }).veredito).toBe(
      "PORTAR_ARQUIVOS_NOVOS",
    );
    expect(classificarBranch({ frente: 1, arquivos: [{ status: "M", caminho: "src/a.ts", noRef: "x", naMain: "x" }] }).veredito).toBe("ENTREGUE");
    expect(classificarBranch({ frente: 1, arquivos: [{ status: "M", caminho: "docs/p.md", noRef: "x", naMain: null }] }).veredito).toBe(
      "DOC_SEM_EXECUCAO",
    );
  });

  it("remoção na branch não conta como entregue nem como arquivo novo; leitura de blob falha vira ERRO_GIT", () => {
    const r = classificarBranch({ frente: 1, arquivos: [{ status: "D", caminho: "src/velho.ts", noRef: null, naMain: "y" }] });
    expect(r.veredito).toBe("PORTAR_OU_SUPERADO_REVISAR");
    expect(r.removidos).toBe(1);
    expect(classificarBranch({ frente: 1, arquivos: [{ status: "M", caminho: "src/a.ts", erro: true }] }).veredito).toBe("ERRO_GIT");
  });

  it("renomeação vale pelo caminho novo", () => {
    expect(lerNameStatus("R087\tsrc/antigo.ts\tsrc/novo.ts\nM\tsrc/b.ts")).toEqual([
      { status: "R", caminho: "src/novo.ts" },
      { status: "M", caminho: "src/b.ts" },
    ]);
  });

  it("marcadores de pendência em documentos", () => {
    expect(marcadorDaLinha("- [ ] fazer X")).toBe("CHECKBOX_ABERTO");
    expect(marcadorDaLinha("Status: [PLANEJADO]")).toBe("PLANEJADO");
    expect(marcadorDaLinha("- [x] feito")).toBeNull();
  });

  it("o script usa as regras puras e não grava triagem vazia sem branches remotas", () => {
    const s = readFileSync("scripts/triagem-branches-e-docs.mjs", "utf8");
    expect(s).toContain('from "./triagem-classificar.mjs"');
    expect(s).toContain("Nenhuma branch remota");
    expect(s).not.toContain("?? 0");
  });
});
