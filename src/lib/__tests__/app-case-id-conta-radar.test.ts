import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rotaConta = readFileSync(path.resolve(__dirname, "../../routes/portal/conta.tsx"), "utf8");

describe("APP-CASE-ID-CONTA-RADAR: portal/conta.tsx nunca mostra Sophia/demo em prévia de caso real", () => {
  it("distingue prévia real (Acesso Master) de demo pela fonte da identidade, não só por `previa` truthy", () => {
    expect(rotaConta).toMatch(/previa\?\.identidade\?\.fonte === "demo"/);
  });

  it("prioriza o código do caso real (previa.identidade.codigo) antes de qualquer fallback de demo", () => {
    // 21/09/2026 — o termo do meio deixou de ser `casosPortal?.[0]?.codigo`
    // (primeiro caso da lista) e passou a ser o caso ATIVO, resolvido por
    // `casoDoPortal`. A ordem que este teste protege é a mesma: caso real
    // primeiro, demo só no fim.
    expect(rotaConta).toMatch(
      /const casoCodigo =\s*\n?\s*previa\?\.identidade\?\.codigo \?\? casoDoPortal\?\.codigo \?\? \(previaDemo \? CASO_DEMO_CODIGO/,
    );
  });

  it("o caso exibido na Conta é o caso ativo, não o primeiro da lista", () => {
    expect(rotaConta).toContain("c.id === vivo.data?.casoAtivoId");
  });

  it("titular e país só caem no valor fixo de demo quando previaDemo é verdadeiro, nunca em prévia real", () => {
    expect(rotaConta).toContain('const titular = data?.cliente?.nome ?? (previaDemo ? CLIENTE_DEMO_NOME : null) ?? "—"');
    expect(rotaConta).toContain('const paisInteresse = data?.cliente?.pais_interesse ?? (previaDemo ? "Itália" : null) ?? "—"');
  });

  it('rótulo de publicação não chama prévia de caso real de "Demo"', () => {
    // Contrato visual de 24/09/2026: a Conta deixou de exibir rótulo de
    // publicação (metadado técnico). Garantia equivalente: nenhum rótulo
    // "Demo" literal pode aparecer na tela, em prévia real ou não.
    expect(rotaConta).not.toMatch(/"Demo"|>\s*Demo\s*</);
  });
});
