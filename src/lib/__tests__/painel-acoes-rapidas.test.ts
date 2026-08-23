import { describe, expect, it } from "vitest";

import { podeExibirAcoesRapidas } from "@/lib/painel-acoes-rapidas";

describe("visibilidade das ações rápidas da proprietária", () => {
  it("exibe para a sessão de proprietária administradora", () => {
    expect(podeExibirAcoesRapidas({ ativo: true, papel: "proprietaria_administradora" })).toBe(true);
  });

  it("exibe para o portador do papel na organização (admin)", () => {
    expect(podeExibirAcoesRapidas({ ativo: true, papel: "admin" })).toBe(true);
  });

  it.each(["operacoes", "comercial", "financeiro", "pesquisador", "leitura"])(
    "oculta para o papel %s",
    (papel) => {
      expect(podeExibirAcoesRapidas({ ativo: true, papel })).toBe(false);
    },
  );

  it("oculta quando o servidor não marcou o modo como ativo, mesmo com papel admin", () => {
    expect(podeExibirAcoesRapidas({ ativo: false, papel: "admin" })).toBe(false);
  });

  it("oculta enquanto a sessão não respondeu", () => {
    expect(podeExibirAcoesRapidas(undefined)).toBe(false);
    expect(podeExibirAcoesRapidas(null)).toBe(false);
    expect(podeExibirAcoesRapidas({})).toBe(false);
  });

  it("oculta quando o papel vem vazio ou nulo", () => {
    expect(podeExibirAcoesRapidas({ ativo: true, papel: null })).toBe(false);
    expect(podeExibirAcoesRapidas({ ativo: true, papel: "" })).toBe(false);
  });
});
