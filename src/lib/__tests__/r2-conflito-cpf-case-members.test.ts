import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte R2 (21/09/2026, sequência da auditoria de reconciliação): estende a
 * detecção de conflito de CPF (já usada em `sincronizarPessoaDoCaso` para
 * contract_parties) para `case_members` — hoje `sincronizarMembrosDoCaso`
 * só cria membros que faltam, nunca revisita um membro já vinculado a
 * `cliente_id` para conferir se o CPF ainda bate com o cadastro canônico.
 * `conferirDivergenciaCpfMembrosCaso` (nova) só preenche CPF vazio; nunca
 * sobrescreve um conflito automaticamente.
 */

const funcoes = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
const componente = readFileSync("src/components/caso/reconciliar-cpf-membros-caso.tsx", "utf8");
const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("conferirDivergenciaCpfMembrosCaso (caso-canonico.functions.ts)", () => {
  it("só grava itens 'preencher', nunca sobrescreve conflito", () => {
    expect(funcoes).toContain('if (item.acao !== "preencher") continue;');
  });

  it("nunca sincroniza CPF de dependente — a guarda mora na regra canônica estadoCpfMembroCaso (pessoa-vinculo.ts)", () => {
    expect(funcoes).toContain("estadoCpfMembroCaso(m, cliente?.cpf ?? null)");
    // P28 (26/09/2026): import combinado com estadoTelefoneMembroCaso; P31 (26/09/2026)
    // acrescenta estadoCepMembroCaso ao mesmo import, mesmo módulo.
    expect(funcoes).toContain(
      'import { estadoCepMembroCaso, estadoCpfMembroCaso, estadoTelefoneMembroCaso } from "@/lib/pessoa-vinculo";',
    );
  });

  it("só considera membros já vinculados a um cliente_id", () => {
    expect(funcoes).toContain('.not("cliente_id", "is", null)');
  });

  it("não sobrescreveu sincronizarMembrosDoCaso — a função original continua intocada", () => {
    expect(funcoes).toContain("export const sincronizarMembrosDoCaso");
    expect(funcoes).toContain('acao: "membros_sincronizados_de_nucleo"');
  });
});

describe("ReconciliarCpfMembrosCaso (novo componente)", () => {
  it("define os 5 estados possíveis do plano", () => {
    for (const acao of [
      "preencher",
      "conflito",
      "ja_sincronizado",
      "sem_dado_canonico",
      "dependente_nao_sincronizado",
    ]) {
      expect(componente).toContain(`${acao}:`);
    }
  });

  it("o botão de gravar é desabilitado quando não há nada a preencher", () => {
    expect(componente).toContain("disabled={ocupado || preencher === 0}");
  });
});

describe("casos.$caseId.index.tsx — wiring do painel na aba Pessoas", () => {
  it("importa a nova função e o novo componente", () => {
    expect(pagina).toContain("conferirDivergenciaCpfMembrosCaso");
    expect(pagina).toContain(
      'import { ReconciliarCpfMembrosCaso } from "@/components/caso/reconciliar-cpf-membros-caso";',
    );
  });

  it("chama a função com o caseId da rota", () => {
    expect(pagina).toContain("reconciliarCpfMembros({ data: { caseId: casoId, confirmar } })");
  });

  it("o painel aparece nos dois ramos da aba (com núcleo e sem núcleo)", () => {
    const ocorrencias = pagina.match(/<ReconciliarCpfMembrosCaso/g) ?? [];
    expect(ocorrencias.length).toBe(2);
  });
});
