import { describe, expect, it } from "vitest";

import {
  ORDEM_BLOCOS_PAINEL,
  PAR_OBRIGATORIO,
  duplicidadesDeRegistro,
  validarOrdemPainel,
  validarPainelHoje,
} from "@/lib/painel-ordem";

const ordemCompleta = ORDEM_BLOCOS_PAINEL.map((b) => b.chave);

describe("ordem dos blocos do Painel Hoje", () => {
  it("aceita a ordem canônica completa", () => {
    expect(validarOrdemPainel(ordemCompleta)).toEqual([]);
  });

  it("aceita tela parcial preservando a ordem relativa", () => {
    expect(validarOrdemPainel(["fila_priorizada", "excecoes", "comercial"])).toEqual([]);
  });

  it("acusa ordem trocada", () => {
    const problemas = validarOrdemPainel(["comercial", "excecoes"]);
    expect(problemas.map((p) => p.chave)).toContain("ordem");
  });

  it("acusa bloco duplicado e bloco desconhecido", () => {
    const problemas = validarOrdemPainel(["excecoes", "comercial", "comercial", "catalogo"]);
    expect(problemas.some((p) => p.mensagem.includes("mais de uma vez"))).toBe(true);
    expect(problemas.some((p) => p.mensagem.includes("não faz parte"))).toBe(true);
  });

  it("“sinais” deixou de ser bloco: foi fundido em Encontrar no Desk", () => {
    expect(ordemCompleta).not.toContain("sinais");
    // Bloco desconhecido é acusado, o que impede que ele volte por descuido.
    expect(validarOrdemPainel(["sinais"]).some((p) => p.mensagem.includes("não faz parte"))).toBe(
      true,
    );
  });

  it("sem par obrigatório, nenhuma adjacência é cobrada", () => {
    expect(PAR_OBRIGATORIO).toBeNull();
    const problemas = validarOrdemPainel(ordemCompleta);
    expect(problemas.some((p) => p.chave === "adjacencia")).toBe(false);
  });
});

describe("duplicidade de registro na fila", () => {
  it("não acusa registros distintos", () => {
    expect(
      duplicidadesDeRegistro([
        { bloco: "fila_priorizada", tipo: "caso", id: "a" },
        { bloco: "excecoes", tipo: "caso", id: "b" },
        { bloco: "excecoes", tipo: "lead", id: "a" },
      ]),
    ).toEqual([]);
  });

  it("acusa o mesmo registro na fila e nas exceções", () => {
    const problemas = duplicidadesDeRegistro([
      { bloco: "fila_priorizada", tipo: "caso", id: "a" },
      { bloco: "excecoes", tipo: "caso", id: "a" },
    ]);
    expect(problemas).toHaveLength(1);
    expect(problemas[0]!.chave).toBe("caso:a");
  });

  it("ignora blocos que só contam e linkam, como sinais de atenção", () => {
    expect(
      duplicidadesDeRegistro([
        { bloco: "fila_priorizada", tipo: "caso", id: "a" },
        { bloco: "sinais", tipo: "caso", id: "a" },
        { bloco: "comercial", tipo: "caso", id: "a" },
      ]),
    ).toEqual([]);
  });

  it("verificação completa junta ordem e duplicidade", () => {
    const problemas = validarPainelHoje(
      ["excecoes", "comercial", "sinais"],
      [
        { bloco: "fila_priorizada", tipo: "lead", id: "x" },
        { bloco: "excecoes", tipo: "lead", id: "x" },
      ],
    );
    expect(problemas.length).toBeGreaterThanOrEqual(2);
  });
});
