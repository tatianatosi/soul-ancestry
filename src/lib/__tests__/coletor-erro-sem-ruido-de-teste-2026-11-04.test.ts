import { describe, expect, it, vi } from "vitest";

const gravarErroNoBanco = vi.fn(async () => {});
vi.mock("@/lib/erro-no-banco.server", () => ({ gravarErroNoBanco }));

import { capturarErroProducao, rodandoSobTeste } from "../producao-erros.server";

/**
 * 04/11/2026: rodar a suíte localmente gravou 7 linhas `erro_app` falsas no banco real
 * ("falha de teste", "texto solto", "undefined"). A Proprietária lê esses registros como erros
 * do app; ruído de teste não pode chegar lá.
 */
describe("Coletor de erro não grava no banco durante a suíte de testes", () => {
  it("reconhece a execução sob vitest", () => {
    expect(rodandoSobTeste()).toBe(true);
  });

  it("não chama a gravação no banco e continua resolvendo sem lançar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(capturarErroProducao(new Error("falha de teste"))).resolves.toBeUndefined();
    await expect(capturarErroProducao("texto solto")).resolves.toBeUndefined();
    await new Promise((r) => setTimeout(r, 20));
    expect(gravarErroNoBanco).not.toHaveBeenCalled();
  });
});
