import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { estadoCpfMembroCaso, sinalCpfDaPessoaPorCaso } from "@/lib/pessoa-vinculo";

/**
 * R2 fechado (24/09/2026, "Motores Pessoa Unificada, Núcleos e Dossiê"):
 * uma regra única de estado de CPF (pessoa-vinculo.ts) usada pelo servidor
 * e pelo sinal da Pessoa 360; escrita com releitura; conflito só se
 * resolve membro a membro, com motivo; nunca funde pessoas.
 */
const funcoes = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
const componente = readFileSync("src/components/caso/reconciliar-cpf-membros-caso.tsx", "utf8");
const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
const pessoa360 = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

const trechoR2 = funcoes.slice(
  funcoes.indexOf("export const conferirDivergenciaCpfMembrosCaso"),
  funcoes.indexOf("export const carregarMapaEtiquetas"),
);

describe("estadoCpfMembroCaso — os 5 estados, regra única", () => {
  it("dependente nunca herda CPF do responsável", () => {
    expect(estadoCpfMembroCaso({ cpf: null, dependente: true }, "111.222.333-44")).toBe("dependente_nao_sincronizado");
  });
  it("sem CPF no cadastro canônico não há o que comparar", () => {
    expect(estadoCpfMembroCaso({ cpf: "111" }, null)).toBe("sem_dado_canonico");
    expect(estadoCpfMembroCaso({ cpf: null }, "  ")).toBe("sem_dado_canonico");
  });
  it("CPF vazio no membro vira preencher", () => {
    expect(estadoCpfMembroCaso({ cpf: "" }, "111.222.333-44")).toBe("preencher");
  });
  it("compara só dígitos — máscara diferente não é conflito", () => {
    expect(estadoCpfMembroCaso({ cpf: "11122233344" }, "111.222.333-44")).toBe("ja_sincronizado");
  });
  it("dígitos diferentes são conflito, nunca sobrescrita automática", () => {
    expect(estadoCpfMembroCaso({ cpf: "999.222.333-44" }, "111.222.333-44")).toBe("conflito");
  });
});

describe("sinalCpfDaPessoaPorCaso — sinal da Pessoa 360", () => {
  const membros = [
    { case_id: "c1", cliente_id: "p1", cpf: "999", origem: "case_members" },
    { case_id: "c1", cliente_id: "p1", cpf: null, origem: "case_members" },
    { case_id: "c2", cliente_id: "p1", cpf: "111.222.333-44", origem: "case_members" },
    { case_id: "c3", cliente_id: "outra", cpf: "999", origem: "case_members" },
    { case_id: "c4", cliente_id: "p1", cpf: null, origem: "nucleo" },
  ];
  it("só conta registros desta pessoa, só de case_members, só conflito/preencher", () => {
    expect(sinalCpfDaPessoaPorCaso(membros, "p1", "111.222.333-44")).toEqual({
      c1: { conflito: 1, preencher: 1 },
    });
  });
});

describe("conferirDivergenciaCpfMembrosCaso — escrita com releitura e conflito com motivo", () => {
  it("preencher grava via gravarComVerificacao (grava, relê, compara), nunca update cru", () => {
    expect(trechoR2).toContain('tabela: "case_members"');
    expect(trechoR2).toContain("gravarComVerificacao({");
    expect(trechoR2).not.toMatch(/\.from\("case_members"\)\s*\.update\(/);
  });
  it("cadastro canônico lido só da organização do usuário", () => {
    expect(trechoR2).toContain('.from("clientes").select("id,cpf").eq("organization_id", organizationId)');
  });
  it("resolver conflito exige motivo e só vale para membro em conflito", () => {
    expect(trechoR2).toContain("Resolver conflito de CPF exige o motivo da decisão.");
    expect(trechoR2).toContain('alvo.acao !== "conflito"');
    expect(trechoR2).toContain('acao: "cpf_conflito_resolvido_pelo_canonico"');
    expect(trechoR2).toContain("valores_anteriores: { cpf:");
  });
  it("UI: resolver conflito passa por AcaoOperacional (confirmação + motivo), membro a membro", () => {
    expect(componente).toContain('acaoExterna="resolver_conflito_cpf_membro"');
    expect(componente).toContain("onResolverConflito(p.membroId, motivo)");
    expect(caso360).toContain("resolverMembroId: v.membroId, motivo: v.motivo");
  });
  it("Pessoa 360 só mostra o sinal e o link Conferir — nenhuma escrita de CPF lá", () => {
    expect(pessoa360).toContain("sinalCpfDaPessoaPorCaso(caseMembers");
    expect(pessoa360).toContain('hash="pessoas"');
    expect(pessoa360).not.toContain("conferirDivergenciaCpfMembrosCaso");
  });
  it("Caso 360 abre a seção pedida pelo link contextual (#pessoas, #jornada)", () => {
    expect(caso360).toContain('window.location.hash.replace("#", "")');
  });
});
