import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ler = (p: string) => readFileSync(p, "utf8");

/**
 * Pendência informa; não trava campo. A gravação continua revalidada no servidor.
 * O único disable legítimo de controle de escrita é a mutação em andamento.
 */
describe("Desk — pendência informa e não trava campo", () => {
  it("ficha da pessoa no caso não desabilita CPF, telefone nem CEP por autoridade", () => {
    const src = ler("src/routes/_authenticated/casos.$caseId.index.tsx");
    expect(src).not.toMatch(/desabilitado=\{bloqueado\}/);
  });

  it("lead não desabilita e-mail, telefone nem origem por !podeEscrever", () => {
    const src = ler("src/routes/_authenticated/leads.tsx");
    expect(src).not.toMatch(/desabilitado=\{!podeEscrever\}/);
  });

  it("extração Canva só trava o botão enquanto grava", () => {
    const src = ler("src/components/contrato/completude-canva.tsx");
    expect(src).not.toMatch(/desabilitado=\{!podeEscrever\}/);
    expect(src).not.toMatch(/disabled=\{!podeEscrever/);
    expect(src).toContain("disabled={mut.isPending && mut.variables?.page_number === p}");
  });

  it("fechamento não esconde a tarefa por autoridade.bloqueado", () => {
    const src = ler("src/components/caso/fechamento.tsx");
    expect(src).not.toContain("const podeAgir = dados.podeEscrever && !bloqueado");
    expect(src).toContain("disabled={tarefa.isPending}");
  });

  it("login do Desk e Painel Hoje declaram o menu enxuto na cara", () => {
    expect(ler("src/routes/equipe.entrar.tsx")).toContain("Entrar no Desk");
    expect(ler("src/components/saas/shell.tsx")).toContain("Desk Intelligence");
    expect(ler("src/components/painel/painel-dia.tsx")).toContain("data-desk-enxuto");
  });
});
