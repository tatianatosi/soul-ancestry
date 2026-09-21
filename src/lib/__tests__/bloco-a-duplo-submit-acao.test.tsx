// @vitest-environment jsdom
/**
 * Bloco A da ordem "Execução Técnica Total" (21/09/2026) — prevenção de
 * duplo submit no motor de ação.
 *
 * `AcaoOperacional` já travava o botão durante `await onConfirmar`, mas a
 * trava era só o estado `executando`. Quando `onConfirmar` é SÍNCRONO — e
 * várias telas passam `m.mutate()`, que devolve void — `await undefined`
 * resolve no microtask seguinte e o par setExecutando(true)/false colapsa
 * no mesmo lote de render: o botão nunca chega a ficar desabilitado e dois
 * cliques rápidos disparam duas escritas.
 *
 * Estes testes clicam de verdade, no DOM, duas vezes seguidas.
 * Somente leitura: nada aqui persiste.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { AutoridadeProvider, type Autoridade } from "@/components/saas/autoridade";

afterEach(cleanup);

/**
 * Autoridade injetada que permite direto, sem diálogo — o caminho de 1
 * clique, que é onde o duplo submit acontecia. `AutoridadeProvider` existe
 * justamente para injeção em teste.
 */
const AUTORIDADE_PERMISSIVA: Autoridade = {
  papeis: ["proprietaria"],
  organizationId: "org-1",
  carregando: false,
  proprietaria: true,
  decidir: () => ({ decisao: "permitir", exigeMotivo: false }) as ReturnType<Autoridade["decidir"]>,
  bloqueado: () => false,
  rotulo: () => "",
};

function renderPermitindo(onConfirmar: (motivo: string) => void | Promise<void>) {
  // `useAutoridade` chama `useSaas()` antes de consultar o contexto
  // injetado, e `useSaas` usa react-query — daí o QueryClientProvider.
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AutoridadeProvider valor={AUTORIDADE_PERMISSIVA}>
        <AcaoOperacional rotulo="Executar agora" onConfirmar={onConfirmar} />
      </AutoridadeProvider>
    </QueryClientProvider>,
  );
}

describe("duplo submit com onConfirmar síncrono", () => {
  it("dois cliques seguidos produzem UMA execução", () => {
    // `m.mutate()` devolve void — é exatamente este o caso que escapava.
    const escrever = vi.fn((): void => undefined);
    renderPermitindo(escrever);

    const botao = screen.getByRole("button", { name: /executar agora/i });
    fireEvent.click(botao);
    fireEvent.click(botao);

    expect(escrever).toHaveBeenCalledTimes(1);
  });

  it("três cliques seguidos continuam produzindo UMA execução", () => {
    const escrever = vi.fn((): void => undefined);
    renderPermitindo(escrever);

    const botao = screen.getByRole("button", { name: /executar agora/i });
    fireEvent.click(botao);
    fireEvent.click(botao);
    fireEvent.click(botao);

    expect(escrever).toHaveBeenCalledTimes(1);
  });

  it("depois que a ação termina, um novo clique executa de novo", async () => {
    const escrever = vi.fn((): void => undefined);
    renderPermitindo(escrever);

    const botao = screen.getByRole("button", { name: /executar agora/i }) as HTMLButtonElement;
    fireEvent.click(botao);
    // A trava é liberada no `finally`; espera o botão voltar a aceitar
    // clique em vez de contar microtasks.
    await waitFor(() => expect(botao.disabled).toBe(false));
    fireEvent.click(botao);

    expect(escrever).toHaveBeenCalledTimes(2);
  });
});

describe("duplo submit com onConfirmar assíncrono", () => {
  it("cliques durante a escrita em voo não disparam segunda execução", async () => {
    let liberar: () => void = () => {};
    const escrever = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          liberar = resolve;
        }),
    );
    renderPermitindo(escrever);

    const botao = screen.getByRole("button", { name: /executar agora/i });
    fireEvent.click(botao);
    fireEvent.click(botao);
    fireEvent.click(botao);

    expect(escrever).toHaveBeenCalledTimes(1);

    liberar();
    await Promise.resolve();
  });
});
