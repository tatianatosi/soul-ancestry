import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 3, batch 12 (confirmação
// humana em Pesquisa). O Lote 2 (histórico) já cobria estas funções;
// faltava a confirmação: 3 CTAs de src/components/pesquisa/modulo.tsx
// usavam window.prompt(), incluindo o arquivamento genérico reusado em
// todos os blocos (pessoas/relações/eventos/fontes/evidências/hipóteses/
// pedidos/pendências/relatórios).

const modulo = readFileSync("src/components/pesquisa/modulo.tsx", "utf8");

describe("pesquisa/modulo.tsx — confirmação humana nas três ações que faltavam", () => {
  it("import de AcaoOperacional presente", () => {
    expect(modulo).toContain('import { AcaoOperacional } from "@/components/saas/acao-operacional";');
  });

  it("nenhum window.prompt() restante no arquivo", () => {
    expect(modulo).not.toContain("window.prompt(");
  });

  it("linhaAcoes (Arquivar, reusado em todos os blocos) está dentro de AcaoOperacional", () => {
    const idx = modulo.indexOf("const linhaAcoes = ");
    const trecho = modulo.slice(idx, idx + 700);
    expect(trecho).toContain("<AcaoOperacional");
    expect(trecho).toContain('acaoExterna="arquivar_registro_pesquisa"');
    expect(trecho).toContain("onConfirmar={(motivo) =>");
  });

  it("liberação humana da pesquisa externa está dentro de AcaoOperacional", () => {
    const idx = modulo.indexOf("Registrar liberação humana da pesquisa externa");
    const trecho = modulo.slice(Math.max(0, idx - 400), idx + 400);
    expect(trecho).toContain("<AcaoOperacional");
    expect(trecho).toContain('acaoExterna="liberar_pesquisa_externa"');
  });

  it("Resolver pendência está dentro de AcaoOperacional", () => {
    const idx = modulo.indexOf('acaoExterna="resolver_pendencia_pesquisa"');
    expect(idx).toBeGreaterThan(-1);
    const trecho = modulo.slice(Math.max(0, idx - 400), idx + 300);
    expect(trecho).toContain("<AcaoOperacional");
    expect(trecho).toContain("onConfirmar={(nota) =>");
  });
});
