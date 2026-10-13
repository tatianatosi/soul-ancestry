import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rotaConta = readFileSync(path.resolve(__dirname, "../../routes/portal/conta.tsx"), "utf8");

describe("APP-CASE-ID-CONTA-RADAR: portal/conta.tsx nunca mostra Sophia/demo em prévia de caso real", () => {
  it("distingue prévia real (Acesso Master) de demo pela fonte da identidade, não só por `previa` truthy", () => {
    expect(rotaConta).toMatch(/previa\?\.identidade\?\.fonte === "demo"/);
  });

  it("não expõe código do caso nem mesmo como conteúdo oculto", () => {
    expect(rotaConta).not.toContain("casoCodigo");
    expect(rotaConta).not.toContain("Caso vinculado");
  });

  it("continua usando o caso ativo somente para os avisos sanitizados", () => {
    expect(rotaConta).toContain("vivo.data?.proximaAcao");
  });

  it("titular só vem do cadastro real, nunca do valor fixo de demo; país só cai em demo quando previaDemo é verdadeiro", () => {
    // Ordem da Proprietária (13/10/2026): "remova qualquer referência ou
    // fallback para CLIENTEDEMO" — o nome da titular é sempre o cadastrado.
    expect(rotaConta).toContain('const titular = data?.cliente?.nome ?? null');
    expect(rotaConta).not.toContain('CLIENTE_DEMO_NOME');
    expect(rotaConta).toContain('const paisInteresse = data?.cliente?.pais_interesse ?? (previaDemo ? "Itália" : null)');
  });

  it('rótulo de publicação não chama prévia de caso real de "Demo"', () => {
    // Contrato visual de 24/09/2026: a Conta deixou de exibir rótulo de
    // publicação (metadado técnico). Garantia equivalente: nenhum rótulo
    // "Demo" literal pode aparecer na tela, em prévia real ou não.
    expect(rotaConta).not.toMatch(/"Demo"|>\s*Demo\s*</);
  });
});
