import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rotaConta = readFileSync(path.resolve(__dirname, "../../routes/portal/conta.tsx"), "utf8");

describe("APP-CASE-ID-CONTA-RADAR: portal/conta.tsx nunca mostra Sophia/demo em prévia de caso real", () => {
  it("distingue prévia real (Acesso Master) de demo pela fonte da identidade, não só por `previa` truthy", () => {
    expect(rotaConta).toMatch(/previa\?\.identidade\?\.fonte === "demo"/);
  });

  it("prioriza o código do caso real (previa.identidade.codigo) antes de qualquer fallback de demo", () => {
    expect(rotaConta).toMatch(
      /const casoCodigo =\s*\n?\s*previa\?\.identidade\?\.codigo \?\? casosPortal\?\.\[0\]\?\.codigo \?\? \(previaDemo \? CASO_DEMO_CODIGO/,
    );
  });

  it("titular e país só caem no valor fixo de demo quando previaDemo é verdadeiro, nunca em prévia real", () => {
    expect(rotaConta).toContain('const titular = data?.cliente?.nome ?? (previaDemo ? CLIENTE_DEMO_NOME : null) ?? "—"');
    expect(rotaConta).toContain('const paisInteresse = data?.cliente?.pais_interesse ?? (previaDemo ? "Itália" : null) ?? "—"');
  });

  it('rótulo de publicação não chama prévia de caso real de "Demo"', () => {
    expect(rotaConta).toMatch(/previaDemo \? "Demo" : previa \? "Prévia da equipe \(caso real\)"/);
  });
});
