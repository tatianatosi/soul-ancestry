import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { exigirPersistenciaConferida } from "@/lib/verificacao-persistencia";

/*
 * 30/10/2026 — resgate da PR #32 ("Pessoa: salvar com releitura real").
 *
 * Desde 24/10 `gravarComVerificacao` e `inserirComVerificacao` só registram
 * aviso no console quando a releitura diverge do enviado. Na ficha
 * genealógica (salvarRegistroG02) a confirmação volta a ser estrita: a tela
 * só pode dizer "Salvo e confirmado no banco" se o valor relido bate.
 */
const fonte = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");
const inicio = fonte.indexOf("export const salvarRegistroG02");
const salvar = fonte.slice(inicio, fonte.indexOf("\nexport const", inicio + 1));

describe("salvarRegistroG02 — releitura estrita", () => {
  it("confere a releitura nos dois caminhos (editar e criar)", () => {
    const chamadas = salvar.match(/exigirPersistenciaConferida\(valores, r\.registro\)/g) ?? [];
    expect(chamadas.length).toBe(2);
  });

  it("confere antes de propagar vínculo, auditoria e linha do tempo", () => {
    const edicao = salvar.slice(salvar.indexOf("if (data.id) {\n      const r = await gravarComVerificacao"));
    expect(edicao.indexOf("exigirPersistenciaConferida")).toBeLessThan(edicao.indexOf("await registrarVinculo(data.id)"));
    const criacao = salvar.slice(salvar.indexOf("const r = await inserirComVerificacao"));
    expect(criacao.indexOf("exigirPersistenciaConferida")).toBeLessThan(criacao.indexOf("await registrarVinculo(r.id)"));
  });
});

describe("exigirPersistenciaConferida — o que conta como confirmado", () => {
  it("valor relido diferente do enviado é erro, nunca sucesso", () => {
    expect(() =>
      exigirPersistenciaConferida({ nascimento_localidade: "Graz" }, { nascimento_localidade: "Viena" }),
    ).toThrow(/DIVERGENCIA_PERSISTENCIA/);
  });

  it("releitura vazia (helper devolve {}) é erro: nada foi confirmado", () => {
    expect(() => exigirPersistenciaConferida({ nome_completo: "Otto Reimer" }, {})).toThrow(/DIVERGENCIA_PERSISTENCIA/);
  });

  it("mesma data em formatos diferentes e vazio/nulo não são divergência", () => {
    expect(() =>
      exigirPersistenciaConferida(
        { nascimento_data: "1895-03-01", client_id: null },
        { nascimento_data: "1895-03-01T00:00:00+00:00", client_id: null },
      ),
    ).not.toThrow();
  });
});
