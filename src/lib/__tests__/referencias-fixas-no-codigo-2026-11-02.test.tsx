// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { ReferenciasFixasNoCodigo } from "@/components/governanca/referencias-fixas-no-codigo";
import { CASE_REGISTRY } from "@/data/case-registry";
import { TEMPLATES_CONHECIDOS } from "@/lib/rascunhos-comunicacao-governados";

describe("Dados fixos no código ganham tela rotulada (02/11/2026)", () => {
  it("renderiza os três blocos, cada um marcado como não ao vivo ou demo", () => {
    const { container } = render(<ReferenciasFixasNoCodigo />);
    expect(container.querySelector("[data-referencias-fixas-no-codigo]")).not.toBeNull();
    expect(screen.getByText("Retrato fixo, pode estar desatualizado")).toBeTruthy();
    expect(screen.getAllByText("DEMO").length).toBeGreaterThan(0);
    expect(screen.getByText("Modelos de comunicação governados")).toBeTruthy();
  });

  it("mostra um escopo por registro demonstrativo e todos os modelos conhecidos", () => {
    const { container } = render(<ReferenciasFixasNoCodigo />);
    const texto = container.textContent ?? "";
    for (const r of CASE_REGISTRY) expect(texto).toContain(r.id);
    for (const t of TEMPLATES_CONHECIDOS) expect(texto).toContain(t.id);
  });

  it("está montada na tela de Qualidade", () => {
    const src = readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8");
    expect(src).toContain("<ReferenciasFixasNoCodigo />");
  });
});
