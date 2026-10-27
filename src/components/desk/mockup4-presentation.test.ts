import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Mockup 4 — isolated presentation contracts", () => {
  it("keeps published next steps instead of injecting the three sample obligations", () => {
    const home = source("src/routes/portal/index.tsx");
    expect(home).toContain("proximoPasso !== PROXIMO_PASSO_VAZIO");
    expect(home).toContain("for (const s of solicitacoes)");
    expect(home).not.toContain("1. Assinatura do Contrato de Assessoria");
  });
  // 19/10/2026 — reconciliação com o Lovable: achados usam `CartaoAchado`
  // (estado React próprio, `useState aberto`) em vez de `<details>` cru, e o
  // link do WhatsApp mora dentro de `CartaoAssessoria`, não inline aqui — a
  // checagem real é que ambos são os componentes/fonte reais, nunca um
  // telefone hardcoded nesta tela.
  it("expands actual findings and uses the existing WhatsApp source", () => {
    const home = source("src/routes/portal/index.tsx");
    expect(home).toContain("<CartaoAchado");
    expect(home).toContain("key={a.id}");
    expect(home).toContain("<CartaoAssessoria");
    expect(home).not.toContain("5511988384907");
    expect(source("src/components/portal/elementos-mockup.tsx")).toContain(
      "href={WHATSAPP_ESPECIALISTA.url}",
    );
  });
  it("stacks Jornada on mobile and restores two lines at desktop", () => {
    expect(source("src/routes/portal/jornada.tsx")).toContain(
      "grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2",
    );
    // Prettier pode quebrar a regra CSS em múltiplas linhas; checar seletor e declaração separadamente.
    expect(source("src/components/portal/portal-v11.css")).toContain(
      "[data-jornada-duas-linhas] > .col-span-2",
    );
    expect(source("src/components/portal/portal-v11.css")).toMatch(
      /\[data-jornada-duas-linhas\] > \.col-span-2 \{\s*grid-column: 1 \/ -1;/,
    );
  });
  it("shows conditions as predicted, without asserting active subscriptions", () => {
    const conta = source("src/routes/portal/conta.tsx");
    // 26/10/2026 — texto atualizado pelo Lovable (mockup17): "Plano familiar".
    expect(conta).toContain("Plano familiar · condição prevista");
    expect(conta).not.toContain("3 assinaturas ativas");
  });
  it("uses the existing Case CRUD in list mode and keeps four sequential lots", () => {
    expect(source("src/routes/_authenticated/casos.index.tsx")).toContain('apresentacao="tabela"');
    const caso = source("src/routes/_authenticated/casos.$caseId.index.tsx");
    for (const lote of ["A", "B", "C", "D"]) expect(caso).toContain(`data-caso360-lote="${lote}"`);
  });
  it("does not change global palette and exposes mobile column labels", () => {
    const css = source("src/components/desk/mockup4-superficies.css");
    expect(css).not.toContain(":root");
    expect(css).not.toMatch(/#[a-f\d]{3,8}\b/i);
    expect(source("src/components/saas/entidade-crud.tsx")).toContain("data-label={c.rotulo}");
  });
});
