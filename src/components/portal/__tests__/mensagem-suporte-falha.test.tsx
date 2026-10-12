// @vitest-environment jsdom
/**
 * Verificação temporária (12/10/2026) — envio de mensagem do App Cliente com falha de rede.
 * Não envia nada real: o envio é interceptado e faz falhar.
 */
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", async (orig) => ({
  ...(await orig<object>()),
  useServerFn: (fn: unknown) => fn,
}));

const meuCasoMock = vi.fn();
const abrirMock = vi.fn();
vi.mock("@/lib/portal-cliente.functions", () => ({
  meuCaso: (...a: unknown[]) => meuCasoMock(...a),
  abrirTicket: (...a: unknown[]) => abrirMock(...a),
  prepararEnvioDocumento: vi.fn(),
  confirmarEnvioDocumento: vi.fn(),
  baixarEntrega: vi.fn(),
}));
vi.mock("@/components/portal/portal-shell", () => ({
  PortalVazio: ({ mensagem }: { mensagem: string }) => <p>{mensagem}</p>,
}));
vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<object>()),
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

import { PortalCasoDetalhe } from "@/components/portal/caso-detalhe";

const PAINEL = {
  caso: {
    statusRotulo: "Em estudo",
    statusTexto: "Pesquisa em andamento",
    atualizadoEm: "2026-10-12T12:00:00Z",
  },
  solicitacoes: [],
  meusEnvios: [],
  publicacoes: [],
  entregas: [],
  faturas: [],
  tickets: [],
};

afterEach(() => {
  vi.clearAllMocks();
});

function comQuery(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("Mensagem de suporte — falha de rede (simulação)", () => {
  it("mostra o aviso, mantém assunto e texto e reenvia sem perder nada", async () => {
    meuCasoMock.mockResolvedValue(PAINEL);
    abrirMock.mockRejectedValueOnce(new Error("Failed to fetch"));
    comQuery(<PortalCasoDetalhe casoId="caso-simulado" />);

    await screen.findByText("Nova mensagem");
    const assunto = screen.getByPlaceholderText("Assunto") as HTMLInputElement;
    const texto = screen.getByPlaceholderText("Escreva sua mensagem") as HTMLTextAreaElement;

    fireEvent.change(assunto, { target: { value: "Assunto da simulação" } });
    fireEvent.change(texto, { target: { value: "Texto da simulação que não deve ser gravado" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar mensagem/ }));

    const aviso = await screen.findByRole("alert");
    expect(aviso.textContent).toContain("Não foi possível enviar agora. Sua mensagem continua aqui.");
    expect(assunto.value).toBe("Assunto da simulação");
    expect(texto.value).toBe("Texto da simulação que não deve ser gravado");
    expect(abrirMock).toHaveBeenCalledTimes(1);

    abrirMock.mockRejectedValueOnce(new Error("Failed to fetch"));
    fireEvent.click(screen.getByRole("button", { name: /Reenviar/ }));
    await waitFor(() => expect(abrirMock).toHaveBeenCalledTimes(2));
    expect(abrirMock.mock.calls[1]![0]).toMatchObject({
      data: { assunto: "Assunto da simulação", mensagem: "Texto da simulação que não deve ser gravado" },
    });
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(assunto.value).toBe("Assunto da simulação");
    expect(texto.value).toBe("Texto da simulação que não deve ser gravado");
  });
});
