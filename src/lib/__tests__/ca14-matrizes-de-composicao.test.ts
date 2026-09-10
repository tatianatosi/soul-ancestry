import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { classificarComposicaoCaso, modeloAplicavelAoCaso } from "@/lib/matriz-modelos-contratuais";

/*
 * CA14-MATRIZES-DE-COMPOSICAO (09/09/2026) — as matrizes individual, casal e
 * núcleo familiar (matriz-modelos-contratuais.ts) já existiam com regras de
 * composição, anexos e gates completos, mas só apareciam como rascunho TESTE
 * abstrato em /governanca/modelos-contratuais — nenhuma tela as aplicava à
 * composição real de um caso. `classificarComposicaoCaso`/`modeloAplicavelAoCaso`
 * leem os papéis já resolvidos por `pessoasDoCasoComFallbackNucleo`
 * (titular/dependente) e escolhem a matriz correspondente, sem fundir pessoas
 * de fontes diferentes e sem criar um segundo checklist jurídico — reaproveita
 * as regras/anexos já existentes em MODELOS_CONTRATUAIS.
 */

describe("CA14 — classificarComposicaoCaso nunca escolhe matriz por suposição", () => {
  it("sem nenhuma pessoa, é sem_dados", () => {
    expect(classificarComposicaoCaso([])).toEqual({
      estado: "sem_dados",
      motivo: "Nenhuma pessoa registrada no caso ainda.",
    });
  });

  it("com pessoas mas nenhum titular confirmado, é sem_dados", () => {
    const r = classificarComposicaoCaso([{ titular: false, dependente: false }]);
    expect(r.estado).toBe("sem_dados");
  });

  it("um titular sem dependente é individual", () => {
    const r = classificarComposicaoCaso([{ titular: true, dependente: false }]);
    expect(r).toMatchObject({ estado: "classificado", chave: "individual" });
  });

  it("dois titulares sem dependente é casal", () => {
    const r = classificarComposicaoCaso([
      { titular: true, dependente: false },
      { titular: true, dependente: false },
    ]);
    expect(r).toMatchObject({ estado: "classificado", chave: "casal" });
  });

  it("titular com dependente é núcleo familiar, mesmo com um único titular", () => {
    const r = classificarComposicaoCaso([
      { titular: true, dependente: false },
      { titular: false, dependente: true },
    ]);
    expect(r).toMatchObject({ estado: "classificado", chave: "nucleo_familiar" });
  });

  it("três ou mais titulares é núcleo familiar mesmo sem dependente", () => {
    const r = classificarComposicaoCaso([
      { titular: true, dependente: false },
      { titular: true, dependente: false },
      { titular: true, dependente: false },
    ]);
    expect(r).toMatchObject({ estado: "classificado", chave: "nucleo_familiar" });
  });
});

describe("CA14 — modeloAplicavelAoCaso reaproveita a matriz existente (nunca cria checklist novo)", () => {
  it("caso individual real recebe as regras e anexos do modelo individual existente", () => {
    const r = modeloAplicavelAoCaso([{ titular: true, dependente: false }]);
    expect(r.estado).toBe("classificado");
    if (r.estado === "classificado") {
      expect(r.modelo.chave).toBe("individual");
      expect(r.modelo.regrasComposicao.length).toBeGreaterThan(0);
      expect(r.modelo.anexos.length).toBeGreaterThan(0);
    }
  });

  it("sem titular, devolve pendência honesta em vez de modelo", () => {
    const r = modeloAplicavelAoCaso([]);
    expect(r).toEqual({ estado: "sem_dados", motivo: "Nenhuma pessoa registrada no caso ainda." });
  });
});

describe("CA14 — tela de preparação de contrato aplica a matriz à composição real do caso", () => {
  const tela = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

  it("consome modeloAplicavelAoCaso com os membros reais do caso (d.membros), não uma lista fixa", () => {
    expect(tela).toContain("modeloAplicavelAoCaso");
    expect(tela).toMatch(/modeloAplicavelAoCaso\(listaOpcional\(d\.membros\)/);
  });

  it("mostra composição e anexos aplicáveis, e Sem dados suficientes quando não há composição confirmada", () => {
    const bloco = tela.slice(tela.indexOf("Composição contratual (matriz aplicável)"));
    expect(bloco.slice(0, 700)).toMatch(/Sem dados suficientes/);
    expect(bloco.slice(0, 700)).toMatch(/Anexos aplicáveis/);
  });
});
