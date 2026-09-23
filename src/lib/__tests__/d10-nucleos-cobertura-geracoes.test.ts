import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { coberturaPorGeracao, pessoaPrincipalDoCaso } from "@/lib/golive-pessoas";

/**
 * D10 Pessoas & Famílias (§21) — "gerações reais". Mesmo achado de D5:
 * case_members.pai_id/mae_id (migration 20260816201830) já grava o
 * parentesco; coberturaPorGeracao (golive-pessoas.ts) já sabe contar
 * G1-G5 a partir daí — só nunca tinha sido chamada por /nucleos. O que
 * parecia dívida estrutural era peça órfã: conectada, não inventada.
 */
describe("coberturaPorGeracao/pessoaPrincipalDoCaso aceitam o shape real de case_members mapeado", () => {
  it("conta G1 (raiz) e G2 (pai/mãe da raiz) a partir de pai_id/mae_id reais", () => {
    const membros = [
      { id: "avo", paiId: null, maeId: null, titular: false, requerente: false, contratante: false },
      { id: "pai", paiId: "avo", maeId: null, titular: false, requerente: false, contratante: false },
      { id: "titular", paiId: "pai", maeId: null, titular: true, requerente: false, contratante: false },
    ];
    const cobertura = coberturaPorGeracao(membros);
    expect(cobertura).toEqual([
      { rotulo: "G1", valor: 1 },
      { rotulo: "G2", valor: 1 },
      { rotulo: "G3", valor: 1 },
      { rotulo: "G4", valor: 0 },
      { rotulo: "G5", valor: 0 },
    ]);
  });

  it("sem titular/requerente/contratante, não há raiz — cobertura vazia, nunca estimada", () => {
    const membros = [{ id: "1", paiId: null, maeId: null, titular: false, requerente: false, contratante: false }];
    expect(coberturaPorGeracao(membros)).toEqual([]);
    expect(pessoaPrincipalDoCaso(membros)).toBeNull();
  });

  it("lista vazia não quebra", () => {
    expect(coberturaPorGeracao([])).toEqual([]);
  });
});

describe("D10 · listarNucleos calcula cobertura via case_members real, não estimativa", () => {
  const funcoes = readFileSync(resolve(__dirname, "../nucleos-desk.functions.ts"), "utf8");
  const rota = readFileSync(resolve(__dirname, "../../routes/_authenticated/nucleos.tsx"), "utf8");

  it("usa a função canônica pessoasDoCasoComFallbackNucleo, não leitor cru de case_members", () => {
    expect(funcoes).toContain("pessoasDoCasoComFallbackNucleo(supabase, String(caseId))");
    expect(funcoes).not.toMatch(/\.from\("case_members"\)/);
  });

  it("importa coberturaPorGeracao do módulo canônico e anexa coberturaGeracoes por núcleo", () => {
    expect(funcoes).toMatch(/from "@\/lib\/golive-pessoas"/);
    expect(funcoes).toContain("coberturaGeracoes: n.case_id ? (coberturaPorCaso.get(n.case_id) ?? []) : []");
  });

  it("a rota marca a seção com data-nucleo-cobertura-geracoes e trata ausência sem inventar número", () => {
    expect(rota).toContain("data-nucleo-cobertura-geracoes");
    expect(rota).toMatch(/não é estimada/);
  });
});
