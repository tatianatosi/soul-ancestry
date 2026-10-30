// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import { CpfMascarado } from "@/components/campos/cpf-mascarado";
import { formatarCpf, mascararCpf } from "@/lib/validacao-pessoa";
import { radarInternoDoCaso } from "@/lib/radar-interno-caso";

/**
 * Polimento visual (22/10/2026) — os três itens que o parecer de design
 * autorizou depois da primeira rodada: título empilhado no celular, rótulo
 * humano no lugar de nome de coluna/enum, e CPF mascarado por padrão.
 */
afterEach(cleanup);

const shell = readFileSync("src/components/saas/shell.tsx", "utf8");
const financeiro = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");
const pessoa360 = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
const composicaoV4 = readFileSync("src/components/pessoa/composicao-pessoa360-v4.tsx", "utf8");

describe("Título do Desk não quebra letra por letra no celular", () => {
  it("o cabeçalho empilha no celular e só divide a linha a partir de sm:", () => {
    const bloco = shell.slice(shell.indexOf("data-desk-titulo"), shell.indexOf("<h1"));
    expect(bloco).toContain("flex flex-col");
    expect(bloco).toContain("sm:flex-row");
    // A grade de duas colunas que espremia o título até zero não volta.
    expect(bloco).not.toContain("grid-cols-[minmax(0,1fr)_auto]");
  });

  it("o título continua podendo quebrar por palavra, nunca cortado", () => {
    expect(shell).toContain('<h1 className="break-words font-serif text-3xl leading-tight text-navy">{titulo}</h1>');
    expect(shell).not.toContain("break-all");
  });
});

describe("Rótulo humano no lugar de nome técnico", () => {
  it("o cartão de Reconciliação não expõe mais o nome da coluna do banco", () => {
    expect(financeiro).not.toContain('eyebrow="Financeiro · payments.conciliacao_status"');
    expect(financeiro).toContain('eyebrow="Financeiro · situação da conciliação"');
  });

  it("o Radar traduz hipótese e via pelas listas que a ficha do caso já usa", () => {
    const eixos = radarInternoDoCaso({
      caso: { hipotese_elegibilidade: "nao_avaliada", via: "a_definir", pais: "Áustria" },
      nucleoCompletude: null,
      nucleoCriterios: [],
      checksAtivacao: [],
      bloqueiosReais: [],
    } as never);
    const estrategia = eixos.find((e) => e.id === "estrategia");
    const valores = (estrategia?.itens ?? []).map((i: { valor: string }) => i.valor);
    expect(valores).toContain("Não avaliada");
    expect(valores).toContain("A definir");
    expect(valores).not.toContain("nao_avaliada");
    expect(valores).not.toContain("a_definir");
  });
});

describe("CPF mascarado por padrão na Pessoa 360", () => {
  it("a máscara esconde os 6 primeiros dígitos e mostra os 5 últimos", () => {
    expect(mascararCpf("12345678901")).toBe("•••.•••.789-01");
    expect(mascararCpf("123.456.789-01")).toBe("•••.•••.789-01");
  });

  it("CPF incompleto não vira número parcial com cara de completo", () => {
    expect(mascararCpf("1234")).toBe("•••.•••.•••-••");
    expect(mascararCpf("")).toBe("•••.•••.•••-••");
  });

  it("a ficha abre mascarada e só revela por clique explícito", () => {
    render(<CpfMascarado cpf="12345678901" />);
    expect(screen.getByText("•••.•••.789-01")).toBeTruthy();
    expect(screen.queryByText(formatarCpf("12345678901"))).toBeNull();

    const botao = screen.getByRole("button", { name: "revelar" });
    expect(botao.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(botao);
    expect(screen.getByText("123.456.789-01")).toBeTruthy();
    expect(screen.getByRole("button", { name: "ocultar" }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "ocultar" }));
    expect(screen.getByText("•••.•••.789-01")).toBeTruthy();
  });

  it("os dois pontos de leitura da Pessoa 360 deixaram de mostrar o documento inteiro", () => {
    expect(pessoa360).toContain("<CpfMascarado cpf={String(cliente.cpf)} />");
    expect(pessoa360).not.toContain('valor={cliente.cpf ? formatarCpf(String(cliente.cpf)) : cliente.cpf}');
    expect(composicaoV4).toContain("mascararCpf(String(cliente.cpf))");
    expect(composicaoV4).not.toContain("formatarCpf(String(cliente.cpf))");
  });

  it("as telas de reconciliação continuam comparando o CPF inteiro — mascarar ali inutilizaria a ferramenta", () => {
    for (const caminho of [
      "src/components/contrato/reconciliar-cpf-partes.tsx",
      "src/components/caso/reconciliar-cpf-membros-caso.tsx",
    ]) {
      expect(readFileSync(caminho, "utf8")).toContain("formatarCpf(");
    }
  });
});
