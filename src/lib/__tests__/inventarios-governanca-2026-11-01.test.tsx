// @vitest-environment jsdom
/**
 * Onda 3 (01/11/2026): os inventários de governança deixam de ser órfãos e aparecem no Desk (/qualidade).
 */
import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/biblioteca/motores-primordiais", () => ({
  MotoresPrimordiais: () => <div data-testid="motores-primordiais" />,
}));

import { InventariosDeGovernanca } from "@/components/governanca/inventarios-governanca";
import { CRITERIOS_ACEITE } from "@/lib/criterios-aceite";
import { INDICADORES } from "@/lib/indicadores-governanca";
import { INVENTARIO_CAMPOS_ABAS, totalDeCampos } from "@/lib/inventario-campos-abas";
import { MATRIZ_CONFORMIDADE } from "@/lib/matriz-conformidade";
import { PASSOS_ACEITE_E2E } from "@/lib/aceite-e2e-passos";

afterEach(cleanup);

describe("inventários de governança no Desk", () => {
  it("mostra a contagem real de cada inventário, vinda do próprio módulo", () => {
    render(<InventariosDeGovernanca />);
    expect(screen.getByText(`Indicadores (${INDICADORES.length})`)).toBeTruthy();
    expect(screen.getByText(`Conformidade (${MATRIZ_CONFORMIDADE.length})`)).toBeTruthy();
    expect(screen.getByText(`Critérios de aceite (${CRITERIOS_ACEITE.length})`)).toBeTruthy();
    expect(screen.getByText(`Roteiro de aceite ponta a ponta (${PASSOS_ACEITE_E2E.length} passos)`)).toBeTruthy();
    expect(screen.getByText(`${INVENTARIO_CAMPOS_ABAS.length} abas · ${totalDeCampos()} campos`)).toBeTruthy();
  });

  it("lista todas as abas do inventário de campos e monta os motores", () => {
    const { container } = render(<InventariosDeGovernanca />);
    const linhas = container.querySelectorAll("table tbody tr");
    expect(linhas.length).toBe(INVENTARIO_CAMPOS_ABAS.length);
    expect(screen.getByTestId("motores-primordiais")).toBeTruthy();
  });

  it("a auditoria visual roda ao clicar e diz o resultado", () => {
    const { container } = render(<InventariosDeGovernanca />);
    fireEvent.click(container.querySelector("[data-rodar-auditoria-canvas]") as HTMLElement);
    expect(screen.getByRole("status").textContent).toMatch(/Sem falhas|Falhas:/);
  });

  it("não escreve nada e não cita dado de família", () => {
    const src = readFileSync("src/components/governanca/inventarios-governanca.tsx", "utf8");
    expect(src).not.toMatch(/Ana Luiza|Adair|Alice|Felipe|Friedmann|CA-CID-AT-FAM/);
    expect(src).not.toMatch(/useMutation|\.insert\(|\.update\(|createServerFn/);
  });

  it("está montado na tela de Qualidade", () => {
    expect(readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8")).toContain("<InventariosDeGovernanca />");
  });
});
