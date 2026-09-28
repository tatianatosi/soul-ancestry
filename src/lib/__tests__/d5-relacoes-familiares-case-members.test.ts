import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { relacoesAprovadas, estadoDeConfirmacao } from "@/lib/golive-pessoas";

/**
 * D5 Pessoa 360 (§15) — zona "Relações". Achado real desta rodada:
 * `case_members.pai_id`/`mae_id` (migration 20260816201830) já grava
 * parentesco administrativo do caso, e `relacoesAprovadas`/
 * `estadoDeConfirmacao` (golive-pessoas.ts) já sabem calcular vínculo e
 * grau de confirmação a partir daí — só nunca tinham sido chamadas pela
 * rota canônica `/pessoas/$clienteId`. Isto NÃO é a pesquisa genealógica
 * (research_people/identity_status); é o motor aprovado.
 */
describe("relacoesAprovadas/estadoDeConfirmacao aceitam o shape real de case_members", () => {
  it("relacoesAprovadas aceita objetos com só id/nome/paiId/maeId (Pick, não PessoaCaso completo)", () => {
    const membros = [
      { id: "1", nome: "Adair", paiId: null, maeId: null },
      { id: "2", nome: "Ana Luiza", paiId: "1", maeId: null },
    ];
    const relacoes = relacoesAprovadas(membros);
    expect(relacoes).toEqual([{ id: "2-pai", de: "Adair", para: "Ana Luiza", rotulo: "pai" }]);
  });

  it("estadoDeConfirmacao aceita objetos com só verificadoEm/statusCadastral/paiId/maeId", () => {
    expect(
      estadoDeConfirmacao({ verificadoEm: "2026-01-01", statusCadastral: null, paiId: "1", maeId: null }),
    ).toBe("Confirmada");
    expect(
      estadoDeConfirmacao({ verificadoEm: null, statusCadastral: null, paiId: "1", maeId: null }),
    ).toBe("Em revisão");
    expect(
      estadoDeConfirmacao({ verificadoEm: null, statusCadastral: null, paiId: null, maeId: null }),
    ).toBe("Pendente");
  });
});

describe("D5 · Pessoa 360 mostra vínculos familiares reais de case_members", () => {
  const funcoes = readFileSync(resolve(__dirname, "../pessoa.functions.ts"), "utf8");
  const vinculo = readFileSync(resolve(__dirname, "../pessoa-vinculo.ts"), "utf8");
  const rota = readFileSync(resolve(__dirname, "../../routes/_authenticated/pessoas.$clienteId.tsx"), "utf8");

  it("carregarPessoa usa a função canônica pessoasDoCasoComFallbackNucleo, não leitor cru (CA19)", () => {
    expect(funcoes).toContain("pessoasDoCasoComFallbackNucleo(supabase, String(caseId))");
    expect(funcoes).not.toMatch(/\.from\("case_members"\)/);
  });

  it("pessoasDoCasoComFallbackNucleo agora seleciona pai_id/mae_id/data_verificacao_dado de case_members", () => {
    // Corte U3 (28/09/2026): as colunas lidas de case_members ficam numa constante única.
    const inicio = vinculo.indexOf("export const COLUNAS_CASE_MEMBERS_PESSOA");
    const trecho = vinculo.slice(inicio, inicio + 500);
    expect(vinculo).toContain(".select(COLUNAS_CASE_MEMBERS_PESSOA)");
    expect(trecho).toContain("pai_id");
    expect(trecho).toContain("mae_id");
    expect(trecho).toContain("data_verificacao_dado");
  });

  it("o fallback de Núcleos nunca inventa pai_id/mae_id (nucleo_membros não tem esse dado)", () => {
    expect(vinculo).toMatch(/pai_id: null as string \| null/);
    expect(vinculo).toMatch(/mae_id: null as string \| null/);
  });

  it('retorna caseMembers no payload', () => {
    expect(funcoes).toContain("caseMembers: caseMembers as Linha[]");
  });

  it("a rota importa relacoesAprovadas/estadoDeConfirmacao do módulo canônico", () => {
    expect(rota).toMatch(/from "@\/lib\/golive-pessoas"/);
    expect(rota).toContain("relacoesAprovadas");
    expect(rota).toContain("estadoDeConfirmacao");
  });

  it("marca a seção com data-relacoes-familiares-caso e mostra grau de confirmação", () => {
    expect(rota).toContain("data-relacoes-familiares-caso");
    expect(rota).toContain("Grau de confirmação");
  });

  it("distingue explicitamente da pesquisa genealógica interna (não são a mesma fonte)", () => {
    const idx = rota.indexOf("data-relacoes-familiares-caso");
    const trecho = rota.slice(idx, idx + 800);
    expect(trecho).toMatch(/distinto da pesquisa/i);
  });
});
