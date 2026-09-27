import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ordemDoContratantePrincipal,
  pessoaDoCasoAPartirDoNucleo,
  type MembroNucleoBruto,
} from "@/lib/pessoa-vinculo";
import { PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO } from "@/lib/nucleos-desk.functions";
import { PAPEIS_PESSOA } from "@/lib/caso-ficha";

/**
 * Fase 2 (27/09/2026) — "Prompt Canônicos": Ficha Núcleo/Família.
 * "isso não pode acontecer a mesma pessoa com rótulos diferentes" — a mesma
 * função (`pessoaDoCasoAPartirDoNucleo`) e o mesmo vocabulário
 * (`PAPEIS_PESSOA`) passam a valer em /nucleos, Caso 360 e Pessoa 360.
 */

describe("Fase 2 — papel_no_caso real prevalece sobre a aproximação derivada", () => {
  const membroSemPapelReal: MembroNucleoBruto = {
    id: "m1",
    nome: "Ana",
    papel: "contratante_signatario",
    vinculo: "Titular",
    processo: "P1",
    ordem: 1,
    cliente_id: null,
  };

  it("sem papel_no_caso gravado, usa a aproximação derivada de papel+ordem (comportamento antigo preservado)", () => {
    const r = pessoaDoCasoAPartirDoNucleo(membroSemPapelReal, 1);
    expect(r.papel_no_caso).toBe("contratante");
    expect(r.contratante).toBe(true);
  });

  it("com papel_no_caso gravado como 'representante', prevalece e nenhum booleano de geração familiar fica true", () => {
    const r = pessoaDoCasoAPartirDoNucleo({ ...membroSemPapelReal, papel_no_caso: "representante" }, 1);
    expect(r.papel_no_caso).toBe("representante");
    expect(r.titular).toBe(false);
    expect(r.contratante).toBe(false);
    expect(r.dependente).toBe(false);
  });

  it("com papel_no_caso gravado como 'interlocutor_externo', prevalece igualmente", () => {
    const r = pessoaDoCasoAPartirDoNucleo({ ...membroSemPapelReal, papel_no_caso: "interlocutor_externo" }, 1);
    expect(r.papel_no_caso).toBe("interlocutor_externo");
    expect(r.titular).toBe(false);
  });

  it("com papel_no_caso gravado como 'titular', os booleanos batem com o valor real, não com a aproximação", () => {
    const r = pessoaDoCasoAPartirDoNucleo({ ...membroSemPapelReal, papel_no_caso: "titular" }, 1);
    expect(r.papel_no_caso).toBe("titular");
    expect(r.titular).toBe(true);
    expect(r.contratante).toBe(false);
  });
});

describe("Fase 2 — 'interlocutor' (variante legada) nunca é gravação nova, mas nunca é apagado", () => {
  it("PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO exclui a variante legada 'interlocutor'", () => {
    expect(PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO.some((o) => o.valor === "interlocutor")).toBe(false);
    expect(PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO.length).toBe(PAPEIS_PESSOA.length - 1);
  });

  it("os 5 valores reais do CHECK continuam presentes", () => {
    for (const v of ["contratante", "titular", "dependente", "representante", "interlocutor_externo"]) {
      expect(PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO.some((o) => o.valor === v)).toBe(true);
    }
  });

  it("salvarMembroNucleo recusa gravação nova de 'interlocutor' quando a linha ainda não o tinha", () => {
    const arquivo = readFileSync("src/lib/nucleos-desk.functions.ts", "utf8");
    const inicio = arquivo.indexOf("export const salvarMembroNucleo");
    const trecho = arquivo.slice(inicio, inicio + 3000);
    expect(trecho).toContain('data.papelNoCaso === "interlocutor"');
    expect(trecho).toContain("variante legada");
  });
});

describe("Fase 2 — uma única fonte de rótulo em /nucleos, Caso 360 e Pessoa 360", () => {
  const nucleos = readFileSync("src/routes/_authenticated/nucleos.tsx", "utf8");
  const pessoasDoNucleo = readFileSync("src/components/caso/pessoas-do-nucleo.tsx", "utf8");

  it("/nucleos exibe papel_no_caso via PAPEIS_PESSOA, não mais só o vocabulário cru NUCLEO_PAPEIS", () => {
    expect(nucleos).toContain("PAPEIS_PESSOA.find((o) => o.valor === m2.papel_no_caso)");
  });

  it("/nucleos tem um <Selecao> de 'Papel no caso' usando PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO", () => {
    expect(nucleos).toContain("PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO");
    expect(nucleos).toContain('label="Papel no caso"');
  });

  it("PessoasDoNucleo (Caso 360) não tem mais rótulo próprio (ROTULO_PAPEL removido) e usa PAPEIS_PESSOA", () => {
    expect(pessoasDoNucleo).not.toContain("ROTULO_PAPEL");
    expect(pessoasDoNucleo).not.toContain('"Participante"');
    expect(pessoasDoNucleo).toContain("PAPEIS_PESSOA");
    expect(pessoasDoNucleo).toContain("rotuloPapel(m)");
  });
});

describe("Fase 2 — representação de menor: só exposta quando a fonte é case_members real", () => {
  const arquivo = readFileSync("src/lib/nucleos-desk.functions.ts", "utf8");

  it("listarNucleos casa representação por nome normalizado, só para origem case_members", () => {
    expect(arquivo).toContain('m.origem !== "case_members"');
    expect(arquivo).toContain("representacaoNecessaria");
    expect(arquivo).toContain("representacaoDocumentada");
  });

  it("nunca escreve representacao_necessaria/documentada em nucleo_membros (só leitura)", () => {
    const inicio = arquivo.indexOf("representacaoPorCaso");
    const fim = arquivo.indexOf("return (nucleos ?? []).map");
    const trecho = arquivo.slice(inicio, fim);
    expect(trecho).not.toContain(".update(");
    expect(trecho).not.toContain(".insert(");
  });
});

describe("Fase 2 — ordemDoContratantePrincipal continua estável (não regressão)", () => {
  it("ainda calcula a menor ordem entre contratante_signatario", () => {
    const membros: MembroNucleoBruto[] = [
      { id: "a", nome: "A", papel: "dependente", vinculo: null, processo: null, ordem: 1, cliente_id: null },
      { id: "b", nome: "B", papel: "contratante_signatario", vinculo: null, processo: null, ordem: 2, cliente_id: null },
    ];
    expect(ordemDoContratantePrincipal(membros)).toBe(2);
  });
});
