import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { GERACOES_PUBLICAVEIS, validarPublicacaoArvore } from "@/lib/arvore-publicacao";
import { CADASTRO_PLANEJADOR } from "@/lib/planejador-parametros";

/**
 * Lançamento da Ana (05/10/2026) — prioridades explícitas da Proprietária:
 * reabrir o contrato, ampliar a árvore para 1–10 gerações e publicar Rudolf/
 * Heinrich, corrigir o texto "todos maiores de idade", e retirar a segunda
 * lista de Anexo I ("ANX-*") da tela de preparação, travada por teste.
 */

const PREPARAR = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

describe("árvore do App: 1–10 gerações, não mais 1–5", () => {
  it("GERACOES_PUBLICAVEIS vai de 1 a 10", () => {
    expect([...GERACOES_PUBLICAVEIS]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("geração 6 e 7 (Rudolf, Heinrich) são válidas; 11 não é", () => {
    const base = { clientVisibility: "aprovada", sensitivityLevel: "standard", nome: "Ascendente" };
    expect(validarPublicacaoArvore({ ...base, geracao: 6 })).toEqual([]);
    expect(validarPublicacaoArvore({ ...base, geracao: 7 })).toEqual([]);
    expect(validarPublicacaoArvore({ ...base, geracao: 11 }).length).toBeGreaterThan(0);
  });
});

describe('o texto "todos maiores de idade" foi corrigido', () => {
  it("as observações do cadastro citam a representação do Felipe, não uma afirmação falsa", () => {
    const texto = CADASTRO_PLANEJADOR.flatMap((c) => c.observacoes).join(" ");
    expect(texto).not.toContain("Todos os beneficiários são maiores de idade — não há representação legal de menores.");
    expect(texto).toContain("Felipe");
    expect(texto).toContain("representante legal");
  });
});

describe("a tela de preparação do contrato tem uma lista de Anexo I só, não duas", () => {
  it("não importa mais o componente antigo", () => {
    const nomeDoComponenteAntigo = ["Anexos", "Aplicaveis"].join("");
    expect(PREPARAR).not.toContain(nomeDoComponenteAntigo);
    expect(PREPARAR).not.toContain('from "@/components/contrato/anexos-aplicaveis"');
  });

  it("o componente antigo foi removido do repositório, não só desreferenciado", () => {
    expect(() => readFileSync("src/components/contrato/anexos-aplicaveis.tsx", "utf8")).toThrow();
  });

  it("só existe um título de card mencionando Anexo I, e é o governado", () => {
    const titulos = [...PREPARAR.matchAll(/titulo="[^"]*Anexo I[^"]*"/g)].map((m) => m[0]);
    expect(titulos).toHaveLength(1);
    expect(titulos[0]).toContain("Ordem de Serviço (Anexo I) e anexos");
  });

  it("a lista única usa os anexos governados (AnexosIaV + anexosGovernados)", () => {
    expect(PREPARAR).toContain("<AnexosIaV");
    expect(PREPARAR).toContain("anexos={anexosGovernados}");
  });
});
