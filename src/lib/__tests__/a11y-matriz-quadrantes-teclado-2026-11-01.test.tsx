// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MatrizQuadrantes } from "@/components/prancha-v4/kit";

afterEach(cleanup);

const PONTOS = [{ id: "caso-1", rotulo: "Caso Um", x: 0.5, y: 0.5, tom: "sucesso" as const }];
const QUADRANTES: [string, string, string, string] = [
  "Avaliar",
  "Agir agora",
  "Monitorar",
  "Cultivar",
];

describe("MatrizQuadrantes — acessibilidade de teclado (achado crítico #1 do audit-as-a11y-eng, 01/11/2026)", () => {
  it("sem onPontoSelecionar, permanece estática: role=img e ponto como span não focável", () => {
    render(
      <MatrizQuadrantes
        pontos={PONTOS}
        quadrantes={QUADRANTES}
        eixoX="Elegibilidade"
        eixoY="Urgência"
        tituloAcessivel="Matriz de teste"
      />,
    );
    expect(screen.getByRole("img", { name: "Matriz de teste" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Caso Um" })).toBeNull();
  });

  it("com onPontoSelecionar, cada ponto é um <button> alcançável por Tab e ativável por Enter", async () => {
    const aoSelecionar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <MatrizQuadrantes
        pontos={PONTOS}
        quadrantes={QUADRANTES}
        eixoX="Elegibilidade"
        eixoY="Urgência"
        tituloAcessivel="Matriz de teste"
        onPontoSelecionar={aoSelecionar}
      />,
    );

    // role deixa de ser "img" porque agora há descendentes interativos reais.
    expect(screen.queryByRole("img", { name: "Matriz de teste" })).toBeNull();
    expect(screen.getByRole("group", { name: "Matriz de teste" })).toBeTruthy();

    const botao = screen.getByRole("button", { name: "Caso Um" });
    await usuario.tab();
    expect(document.activeElement).toBe(botao);

    await usuario.keyboard("{Enter}");
    expect(aoSelecionar).toHaveBeenCalledWith("caso-1");
  });

  it("com onPontoSelecionar, Espaço também ativa o ponto focado", async () => {
    const aoSelecionar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <MatrizQuadrantes
        pontos={PONTOS}
        quadrantes={QUADRANTES}
        eixoX="Elegibilidade"
        eixoY="Urgência"
        tituloAcessivel="Matriz de teste"
        onPontoSelecionar={aoSelecionar}
      />,
    );

    const botao = screen.getByRole("button", { name: "Caso Um" });
    botao.focus();
    await usuario.keyboard(" ");
    expect(aoSelecionar).toHaveBeenCalledWith("caso-1");
  });
});
