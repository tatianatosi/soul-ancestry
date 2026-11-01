// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const leitura = vi.hoisted(() => ({ atual: (): Promise<unknown> => Promise.resolve(null) }));

vi.mock("@/lib/contratos.functions", () => ({ painelContratual: () => leitura.atual() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

import { PainelEstadoContratual } from "@/components/contratos/painel-estado-contratual";

function montar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PainelEstadoContratual />
    </QueryClientProvider>,
  );
}

const VAZIO = {
  contratos: [],
  bloqueios: [],
  pendencias: [],
  revisaoPendente: [],
  anexosAusentes: [],
  ordensImpedidas: [],
  excecoesExpiradas: [],
};

afterEach(cleanup);

describe("PainelEstadoContratual renderizado (01/11/2026)", () => {
  it("mostra a contagem real de cada indicador", async () => {
    leitura.atual = () =>
      Promise.resolve(
        Object.assign({}, VAZIO, {
          contratos: [{ id: "c1" }, { id: "c2" }],
          bloqueios: [{ id: "b1", contract_id: "c1", label: "CPF ausente" }],
        }),
      );
    montar();
    await waitFor(() => expect(screen.getByText("instrumentos vivos")).toBeTruthy());
    expect(screen.getByText("CPF ausente")).toBeTruthy();
    expect(screen.getByText("validações bloqueantes").previousSibling?.textContent).toBe("1");
    expect(screen.getByText("instrumentos vivos").previousSibling?.textContent).toBe("2");
  });

  it("falha de leitura aparece como erro, nunca como zeros", async () => {
    leitura.atual = () => Promise.reject(new Error("permission denied for table contracts"));
    montar();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const alerta = screen.getByRole("alert");
    expect(alerta.textContent).toContain("Não foi possível carregar o estado contratual");
    expect(screen.queryByText("instrumentos vivos")).toBeNull();
    expect(screen.queryByText("validações bloqueantes")).toBeNull();
  });

  it("deixa claro que nenhuma ação externa sai deste painel", async () => {
    leitura.atual = () => Promise.resolve(Object.assign({}, VAZIO, { contratos: [{ id: "c1" }] }));
    montar();
    await waitFor(() => expect(screen.getByText(/Nenhuma ação\s+externa é executada/)).toBeTruthy());
  });
});
