// @vitest-environment jsdom
/**
 * Testes de regressão de comportamento (DOM real via jsdom) do painel
 * contextual da cadeia da jornada: prévia do PDF, foco inicial, ciclo de
 * Tab/Shift+Tab, Escape e download do resumo em .txt.
 *
 * Somente leitura: nenhum teste envia, publica ou persiste dado.
 */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CadeiaJornada } from "@/components/desk/cadeia-jornada";
import {
  htmlImpressaoPainelContextual,
  resumoTextoPainelContextual,
} from "@/lib/cadeia-jornada-pdf";
import { descreverCadeia, proximaAcaoDoPainel } from "@/lib/cadeia-jornada-visao";
import { executarCadeiaJornada } from "@/lib/orquestracao-jornada";

const HOJE = "2026-08-25";
const resultado = executarCadeiaJornada({
  hoje: HOJE,
  evento: "proposta_enviada",
  caso_id: "CA-TESTE-001",
  responsavel_id: "tati",
  prazo: "2026-08-30",
});
const elos = descreverCadeia(resultado, { evento: "proposta_enviada" });
const proxima = proximaAcaoDoPainel(resultado, elos);

function montar() {
  return render(<CadeiaJornada resultado={resultado} evento="proposta_enviada" />);
}

const q = (sel: string) => document.querySelector<HTMLElement>(`[data-cadeia="${sel}"]`);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("prévia do PDF somente leitura", () => {
  it("abre com o mesmo conteúdo do documento de impressão", () => {
    montar();
    expect(q("previa-pdf")).toBeNull();
    fireEvent.click(q("exportar-pdf")!);

    const previa = q("previa-pdf");
    expect(previa).not.toBeNull();
    expect(previa!.getAttribute("aria-modal")).toBe("true");
    const iframe = q("previa-iframe") as HTMLIFrameElement;
    const esperado = htmlImpressaoPainelContextual({
      evento: "Proposta enviada",
      data: new Date().toISOString().slice(0, 10),
      proxima,
      elos,
    });
    expect(iframe.getAttribute("srcdoc")).toBe(esperado);
    expect(iframe.getAttribute("srcdoc")).toContain(proxima.rotulo);
    expect(iframe.getAttribute("srcdoc")).toContain("somente leitura");
    expect(q("exportar-pdf")!.getAttribute("aria-expanded")).toBe("true");
  });

  it("Escape fecha a prévia e devolve o foco ao gatilho", () => {
    montar();
    const gatilho = q("exportar-pdf")!;
    fireEvent.click(gatilho);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(q("previa-pdf")).toBeNull();
    expect(document.activeElement).toBe(gatilho);
  });

  it("prende Tab e Shift+Tab dentro da prévia", () => {
    montar();
    fireEvent.click(q("exportar-pdf")!);
    const previa = q("previa-pdf")!;
    const focaveis = Array.from(previa.querySelectorAll<HTMLElement>("button, iframe"));
    const primeiro = focaveis[0]!;
    const ultimo = focaveis[focaveis.length - 1]!;

    ultimo.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(primeiro);

    primeiro.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(ultimo);
  });
});

describe("drawer por elo", () => {
  it("recebe foco inicial no botão fechar e exibe evidências e modelo sugerido", () => {
    montar();
    const botoes = document.querySelectorAll<HTMLButtonElement>("button[data-elo]");
    expect(botoes.length).toBe(elos.length);
    fireEvent.click(botoes[0]!);

    const drawer = q("drawer-elo")!;
    expect(document.activeElement).toBe(
      within(drawer).getByRole("button", { name: "Fechar detalhes do elo" }),
    );
    expect(q("drawer-evidencias")!.textContent).toContain("Evidências");
    expect(q("drawer-template")!.textContent!.length).toBeGreaterThan(0);
  });

  it("Escape fecha o drawer e devolve o foco ao elo de origem", () => {
    montar();
    const gatilho = document.querySelectorAll<HTMLButtonElement>("button[data-elo]")[1]!;
    fireEvent.click(gatilho);
    expect(q("drawer-elo")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(q("drawer-elo")).toBeNull();
    expect(document.activeElement).toBe(gatilho);
  });

  it("prende Tab e Shift+Tab dentro do drawer", () => {
    montar();
    fireEvent.click(document.querySelector<HTMLButtonElement>("button[data-elo]")!);
    const drawer = q("drawer-elo")!;
    const focaveis = Array.from(drawer.querySelectorAll<HTMLElement>("button"));
    const primeiro = focaveis[0]!;
    const ultimo = focaveis[focaveis.length - 1]!;

    ultimo.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(primeiro);

    primeiro.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(ultimo);
  });

  it("setas navegam entre os elos", () => {
    montar();
    const botoes = Array.from(document.querySelectorAll<HTMLButtonElement>("button[data-elo]"));
    botoes[0]!.focus();
    fireEvent.keyDown(botoes[0]!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(botoes[1]);
    fireEvent.keyDown(botoes[1]!, { key: "End" });
    expect(document.activeElement).toBe(botoes[botoes.length - 1]);
  });
});

describe("download do resumo em .txt", () => {
  it("baixa arquivo local com o resumo padronizado e informa o estado", () => {
    montar();
    const criado: string[] = [];
    const cliques: HTMLAnchorElement[] = [];
    const criarUrl = vi.fn(() => "blob:resumo");
    Object.defineProperty(URL, "createObjectURL", { value: criarUrl, configurable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: vi.fn(), configurable: true });
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreate(tag) as HTMLElement;
      if (tag === "a") {
        const a = el as HTMLAnchorElement;
        a.click = () => {
          cliques.push(a);
          criado.push(a.download);
        };
      }
      return el;
    });

    fireEvent.click(q("baixar-txt")!);

    expect(criarUrl).toHaveBeenCalledTimes(1);
    expect(cliques).toHaveLength(1);
    expect(criado[0]).toMatch(/^painel-contextual-cadeia_\d{4}-\d{2}-\d{2}\.txt$/);
    expect(q("copiar-status")!.textContent).toBe("Resumo baixado em arquivo .txt.");
    expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite");
  });

  it("o conteúdo baixado é o mesmo resumo padronizado somente leitura", () => {
    const texto = resumoTextoPainelContextual({
      evento: "Proposta enviada",
      data: HOJE,
      proxima,
      elos,
    });
    expect(texto).toContain("PRÓXIMA AÇÃO NO PAINEL HOJE");
    expect(texto).toContain("EVIDÊNCIAS");
    expect(texto).toContain("Nenhum envio, publicação ou gravação foi executado.");
  });
});
