import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const painel = readFileSync("src/components/painel/painel-dia.tsx", "utf8");
const plano = readFileSync("src/components/caso/onboarding-plano.tsx", "utf8");

describe("o verificador de admin saiu do Painel Hoje", () => {
  it("não é mais montado no Painel", () => {
    // Foi pedido em 25/08, no meio da crise de acesso, e era instrumento de
    // emergência. O vínculo está confirmado; a tela de reconfirmação foi
    // arquivada em 29/08 (docs/arquivados/governanca-removida-2026-08-29) —
    // sessão + vínculo + papel admin já bastam, sem ritual extra.
    expect(painel).not.toContain("VerificadorAdminProprietaria");
  });
});

describe("plano de ação e touchpoints viraram um percurso só", () => {
  it("monta a cadência", () => {
    expect(plano).toContain("<CadenciaOnboarding");
  });

  it("não recria as duas listas separadas do mesmo assunto", () => {
    // O que a Proprietária rejeitou explicitamente: "não quero listas e sim
    // jornada dentro do sistema".
    expect(plano).not.toContain('titulo="Plano de ação"');
    expect(plano).not.toContain('titulo="Touchpoints previstos"');
  });
});

describe("a cor nunca decide sozinha", () => {
  const componente = readFileSync("src/components/caso/cadencia-onboarding.tsx", "utf8");

  it("toda situação exibe sinal e rótulo em texto", () => {
    expect(componente).toContain("tom.sinal");
    expect(componente).toContain("tom.rotulo");
  });

  it("o marcador do trilho é decorativo para leitor de tela", () => {
    // A situação já está no rótulo; o ponto colorido não deve ser lido de novo.
    expect(componente).toMatch(/aria-hidden="true"[\s\S]{0,200}rounded-full/);
  });
});
