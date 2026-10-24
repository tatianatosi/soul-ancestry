// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { decidirAcao } from "../autoridade-operacional";
import { ResolucaoBloqueioPiloto } from "@/components/caso/resolucao-bloqueio-piloto";

const contexto = vi.hoisted(() => ({ papeis: ["admin"], organizationId: "org-teste" }));
vi.mock("@/components/saas/autoridade", () => ({
  useAutoridade: () => ({ decidir: (pedido: Parameters<typeof decidirAcao>[1]) => decidirAcao(contexto, pedido) }),
}));

afterEach(() => { cleanup(); contexto.papeis = ["admin"]; });
function montar(onResolver = vi.fn().mockResolvedValue({ ok: true }), podeResolver = true, pendente = false) {
  render(<ResolucaoBloqueioPiloto bloqueioId="bloqueio-teste" podeResolver={podeResolver}
    pendente={pendente} onResolver={onResolver} />);
  return onResolver;
}
function preencher(texto = "Documento conferido pela operação.") {
  fireEvent.change(screen.getByLabelText("Justificativa da resolução"), { target: { value: texto } });
}

describe("resolução do piloto: interação com AcaoOperacional real", () => {
  it("reproduz admin executando direto, sem motivo de override", () => {
    const decisao = decidirAcao(contexto, { capacidade: "avancar_caso_planejador_tarefa" });
    expect(decisao.decisao).toBe("permitir");
    expect(decisao.exigeMotivo).toBe(false);
  });

  it.each(["", "curta", "          "])("não envia justificativa inválida: %j", (texto) => {
    const salvar = montar();
    preencher(texto);
    const botao = screen.getByRole("button", { name: "Resolver" }) as HTMLButtonElement;
    expect(botao.disabled).toBe(true);
    fireEvent.click(botao);
    expect(salvar).not.toHaveBeenCalled();
  });

  it("admin envia motivo humano; limpa somente após confirmação", async () => {
    const salvar = montar();
    preencher("  Documento conferido pela operação.  ");
    fireEvent.click(screen.getByRole("button", { name: "Resolver" }));
    await waitFor(() => expect(salvar).toHaveBeenCalledWith({
      status: "resolvido", justificativa: "Documento conferido pela operação.",
    }));
    await waitFor(() => expect((screen.getByLabelText("Justificativa da resolução") as HTMLTextAreaElement).value).toBe(""));
  });

  it("operações autorizado também consegue resolver", async () => {
    contexto.papeis = ["operacoes"];
    const salvar = montar();
    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Resolver" }));
    await waitFor(() => expect(salvar).toHaveBeenCalledTimes(1));
  });

  it("envia não aplicável como decisão distinta", async () => {
    const salvar = montar();
    preencher("Este documento não é exigido nesta modalidade.");
    fireEvent.click(screen.getByRole("button", { name: "Marcar não aplicável" }));
    await waitFor(() => expect(salvar).toHaveBeenCalledWith({
      status: "nao_aplicavel", justificativa: "Este documento não é exigido nesta modalidade.",
    }));
  });

  it("papel sem autorização não consegue escrever", () => {
    contexto.papeis = ["leitura"];
    const salvar = montar(undefined, false);
    expect((screen.getByRole("button", { name: "Resolver" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Resolver" }));
    expect(salvar).not.toHaveBeenCalled();
  });

  it("retorno negativo fica visível e preserva o motivo", async () => {
    const salvar = montar(vi.fn().mockResolvedValue({ ok: false, erro: "Bloqueio de outra organização." }));
    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Resolver" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("outra organização"));
    expect((screen.getByLabelText("Justificativa da resolução") as HTMLTextAreaElement).value).toBe("Documento conferido pela operação.");
    expect(salvar).toHaveBeenCalledTimes(1);
  });

  it("exceção fica visível sem apagar o motivo", async () => {
    montar(vi.fn().mockRejectedValue(new Error("Falha de rede durante a gravação.")));
    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Resolver" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/rede|grava/i));
    expect((screen.getByLabelText("Justificativa da resolução") as HTMLTextAreaElement).value).not.toBe("");
  });

  it("enquanto aguarda o escritor, impede os dois envios", async () => {
    const salvar = montar(vi.fn(() => new Promise<{ ok: boolean }>(() => {})));
    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Resolver" }));
    await waitFor(() => expect((screen.getByRole("button", { name: "Resolver" }) as HTMLButtonElement).disabled).toBe(true));
    fireEvent.click(screen.getByRole("button", { name: "Marcar não aplicável" }));
    expect(salvar).toHaveBeenCalledTimes(1);
  });

  it("pendência da mutation impede acionar outro bloqueio", () => {
    const salvar = montar(undefined, true, true);
    expect((screen.getByLabelText("Justificativa da resolução") as HTMLTextAreaElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Marcar não aplicável" }));
    expect(salvar).not.toHaveBeenCalled();
  });
});
