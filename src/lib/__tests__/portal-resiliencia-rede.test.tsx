// @vitest-environment jsdom
/**
 * Resiliência a falhas de rede no App Cliente (12/10/2026).
 * Regra: falha de rede nunca vira ausência de dados.
 */
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  comTimeout,
  estadoDaCarga,
  TempoEsgotadoError,
  MENSAGEM_CONTEUDO_MANTIDO,
  MENSAGEM_INSTABILIDADE_FINANCEIRA,
} from "@/lib/portal-resiliencia";

const prepararMock = vi.fn();
const confirmarMock = vi.fn();

vi.mock("@tanstack/react-start", async (orig) => ({
  ...(await orig<object>()),
  useServerFn: (fn: unknown) => fn,
}));
vi.mock("@/lib/portal-cliente.functions", () => ({
  prepararEnvioDocumento: (...a: unknown[]) => prepararMock(...a),
  confirmarEnvioDocumento: (...a: unknown[]) => confirmarMock(...a),
  membrosDoMeuCaso: () => Promise.resolve([]),
  minhasFaturas: () => Promise.resolve({ faturas: [], restritoAoContratante: false }),
}));
vi.mock("@/components/portal/portal-shell", () => ({
  PortalShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PortalCarregando: () => <p>Carregando</p>,
  PortalVazio: ({ mensagem }: { mensagem: string }) => <p>{mensagem}</p>,
  usePortal: () => ({ data: null }),
}));
vi.mock("@/components/portal/portal-visibilidade", () => ({
  useVisibilidade: () => ({ visibilidade: null, carregando: false }),
  BlocoVisibilidade: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<object>()),
  useSearch: () => ({}),
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  createFileRoute: () => (o: unknown) => o,
}));

import { EnviarDocumento } from "@/components/portal/enviar-documento";
import { FontePortalProvider, type FontePortal } from "@/components/portal/fonte-portal";
import { PortalArvore } from "@/routes/portal/arvore";
import { PortalConta } from "@/routes/portal/conta";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function comQuery(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

function fonte(parcial: Partial<FontePortal>): FontePortal {
  return {
    dados: { projecoes: [], documentos: [] },
    carregando: false,
    erro: false,
    previa: { selo: "Teste", titulo: "Teste" },
    ...parcial,
  };
}

describe("comTimeout", () => {
  it("rejeita quando a promessa não responde no prazo", async () => {
    await expect(comTimeout(new Promise(() => {}), 20)).rejects.toBeInstanceOf(TempoEsgotadoError);
  });
  it("resolve quando a promessa responde antes", async () => {
    await expect(comTimeout(Promise.resolve(7), 50)).resolves.toBe(7);
  });
});

describe("estadoDaCarga — erro ≠ vazio", () => {
  it("erro sem dado é erro, nunca vazio", () => {
    expect(estadoDaCarga({ carregando: false, erro: true, temDados: false, vazio: false })).toBe("erro");
  });
  it("vazio só com consulta bem-sucedida", () => {
    expect(estadoDaCarga({ carregando: false, erro: false, temDados: true, vazio: true })).toBe("vazio");
  });
  it("falha em segundo plano mantém dados exibidos", () => {
    expect(estadoDaCarga({ carregando: false, erro: true, temDados: true, vazio: false })).toBe("dados");
  });
});

describe("Árvore — erro de conexão", () => {
  it("mostra Recarregar árvore e não Lacuna", () => {
    const recarregar = vi.fn();
    comQuery(
      <FontePortalProvider fonte={fonte({ erro: true, recarregar })}>
        <PortalArvore />
      </FontePortalProvider>,
    );
    expect(screen.queryByText(/Lacuna/)).toBeNull();
    expect(screen.queryByText(/ninguém/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Recarregar árvore/ }));
    expect(recarregar).toHaveBeenCalledTimes(1);
  });
});

describe("Conta — erro de conexão (fail-closed)", () => {
  it("mostra instabilidade e não 'nenhuma assinatura'", () => {
    const recarregar = vi.fn();
    comQuery(
      <FontePortalProvider fonte={fonte({ erro: true, recarregar })}>
        <PortalConta />
      </FontePortalProvider>,
    );
    expect(screen.getByText(MENSAGEM_INSTABILIDADE_FINANCEIRA)).toBeTruthy();
    expect(screen.queryByText(/Nenhuma assinatura publicada/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    expect(recarregar).toHaveBeenCalledTimes(1);
  });
  it("sucesso vazio mostra o vazio honesto", () => {
    comQuery(
      <FontePortalProvider fonte={fonte({})}>
        <PortalConta />
      </FontePortalProvider>,
    );
    expect(screen.getByText(/Nenhuma assinatura publicada/)).toBeTruthy();
    expect(screen.queryByText(MENSAGEM_INSTABILIDADE_FINANCEIRA)).toBeNull();
  });
});

describe("Envio de documento — conteúdo mantido após falha", () => {
  it("mantém o arquivo e reenvia", async () => {
    prepararMock.mockRejectedValueOnce(new Error("Failed to fetch"));
    comQuery(<EnviarDocumento casoId="caso-1" />);
    const arquivo = new File(["x"], "certidao.pdf", { type: "application/pdf" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [arquivo] } });

    await screen.findByText(MENSAGEM_CONTEUDO_MANTIDO);
    expect(screen.getByText(/certidao\.pdf/)).toBeTruthy();

    prepararMock.mockRejectedValueOnce(new Error("Failed to fetch"));
    fireEvent.click(screen.getByRole("button", { name: /Reenviar/ }));
    await waitFor(() => expect(prepararMock).toHaveBeenCalledTimes(2));
    expect(prepararMock.mock.calls[1]![0]).toMatchObject({ data: { nome: "certidao.pdf" } });
  });
});
