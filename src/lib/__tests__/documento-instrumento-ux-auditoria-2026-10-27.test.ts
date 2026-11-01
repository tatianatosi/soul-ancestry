import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Achados R3, R4, R6 e R7 da auditoria de espectro completo de 27/10/2026
 * (Frente C, lentes UX e Frontend) sobre `documento-do-instrumento.tsx`.
 */
const src = readFileSync("src/components/contrato/documento-do-instrumento.tsx", "utf8");

describe("Documento do instrumento — correções da auditoria de 27/10/2026", () => {
  it("R3: toast não afirma 'dado atual' quando a parametrização não executou", () => {
    const inicio = src.indexOf("onSuccess: (r) => {");
    const bloco = src.slice(inicio, src.indexOf("onError:", inicio));
    expect(bloco).toContain("if (r.parametrizacao.executada)");
    expect(bloco).toContain("toast.warning(");
    // o ramo de sucesso (toast verde) não pode estar fora do if — senão a
    // afirmação "com o dado atual" volta a valer mesmo sem parametrizar.
    const ramoSucesso = bloco.slice(
      bloco.indexOf("if (r.parametrizacao.executada)"),
      bloco.indexOf("} else {"),
    );
    expect(ramoSucesso).toContain("toast.success(");
  });

  it("R4: a explicação do bloqueio vem antes dos botões de download, não depois", () => {
    const iBloqueio = src.indexOf("data-documento-instrumento-bloqueio");
    const iBotoes = src.indexOf("<BaixarPdfContrato");
    expect(iBloqueio).toBeGreaterThan(-1);
    expect(iBotoes).toBeGreaterThan(-1);
    expect(iBloqueio).toBeLessThan(iBotoes);
  });

  it("R6: sem Record<string, unknown> nem 'as never' no caminho que decide o previaId", () => {
    // o comentário que documenta a correção cita as duas strings em prosa —
    // checa o código real (fora de comentário), não a página inteira.
    const codigo = src.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(codigo).not.toContain("as Record<string, unknown>");
    expect(codigo).not.toContain("as never");
    expect(src).toContain("PreviaRegistro[]");
  });

  it("R7: ultimoAviso é resetado ao trocar de caso", () => {
    expect(src).toContain("useEffect(() => setUltimoAviso(null), [caseId])");
  });
});
