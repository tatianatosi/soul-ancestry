import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ler = (p: string) => readFileSync(p, "utf8");

const componente = ler("src/components/contrato/planejador-operacional.tsx");
const fn = ler("src/lib/cadeia-operacional.functions.ts");
const rotaContrato = ler("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx");

/**
 * 28/08/2026 — "não é só a Ana, não consigo fazer nada". A Cadeia
 * operacional (elo 1, Planejador) tinha motor pronto e testado
 * (`salvarPlanejadorOperacional`) mas nenhuma tela o chamava: todo caso
 * novo nascia com "Planejador não persistido" e a cadeia inteira ficava
 * bloqueada em cascata, sem nenhum bug de dado por trás. Este teste trava
 * a entrada que faltava.
 */
describe("Planejador operacional — entrada que faltava no elo 1 da cadeia", () => {
  it("o formulário chama o motor já existente, não recria um novo", () => {
    expect(componente).toContain("salvarPlanejadorOperacional");
    expect(componente).toContain("listarSkusPlanejador");
  });

  it("está montado na tela de preparar contrato, antes da leitura da cadeia", () => {
    expect(rotaContrato).toContain("PlanejadorOperacional");
    const idxPlanejador = rotaContrato.indexOf("<PlanejadorOperacional");
    const idxCadeia = rotaContrato.indexOf("<CadeiaOperacional");
    expect(idxPlanejador).toBeGreaterThan(-1);
    expect(idxCadeia).toBeGreaterThan(-1);
    expect(idxPlanejador).toBeLessThan(idxCadeia);
  });

  it("não se esconde de quem tem autoridade e só trava durante a gravação", () => {
    // Política de autoridade operacional (05/09/2026): a tela nunca some por
    // permissão. O único bloqueio legítimo do controle de escrita é a gravação
    // em andamento, que protege contra envio duplicado.
    expect(componente).not.toContain("if (!podeEscrever) return null;");
    expect(componente).toContain("disabled={mSalvar.isPending}");
    expect(componente).not.toMatch(/disabled=\{[^}]*!podeEscrever/);
    expect(componente).not.toMatch(/disabled=\{[^}]*somenteLeitura/);
  });

  it("o motor nunca infere: campos vazios viram string vazia ou lista vazia, nunca valor chutado", () => {
    expect(componente).not.toMatch(/produtoSkuCodigo:\s*estado\.produtoSkuCodigo\s*\|\|\s*["'][^"']+["']/);
  });

  it("responsável nominal vem sempre da sessão autenticada, nunca do cliente", () => {
    expect(componente).toContain("responsavelUserId: null");
    expect(fn).toContain("responsavelUserId: userId");
    expect(fn).toContain("nunca aceito do cliente");
  });

  it("a listagem de SKU chama semCache() — é GET autenticado", () => {
    expect(fn).toContain("listarSkusPlanejador");
    const trecho = fn.slice(fn.indexOf("listarSkusPlanejador"));
    expect(trecho.slice(0, 400)).toContain("semCache();");
  });

  it("hidrata o formulário a partir do planejador persistido (reload)", () => {
    expect(componente).toContain("carregarPlanejadorOperacional");
    expect(componente).toContain("planejador-operacional");
    expect(fn).toContain("carregarPlanejadorOperacional");
  });

  it("grava fase da jornada com valor CHECK válido, não null", () => {
    expect(componente).toContain("faseJornada: estado.faseJornada");
    expect(componente).not.toContain("faseJornada: null");
    expect(componente).toContain("FASES_JORNADA");
  });
});
