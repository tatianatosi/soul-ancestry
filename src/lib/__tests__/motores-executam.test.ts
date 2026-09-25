import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { tituloTarefaAposSalvarPessoa } from "@/lib/decisao-apos-salvar-pessoa";
import {
  CHECKLIST_INICIAL_PADRAO,
  checklistComGates,
  titulosTarefasDosGates,
  TITULO_PRIMEIRA_MICROENTREGA,
} from "@/lib/onboarding-plano";
import { TITULO_TAREFA_AVALIACAO_CIDADANIA } from "@/lib/motor-cidadania";

describe("P3 — decisão após salvar pessoa", () => {
  it("título da tarefa é estável e inclui o nome", () => {
    expect(tituloTarefaAposSalvarPessoa("Ana Luiza")).toBe(
      "Acompanhar após gravação da ficha: Ana Luiza",
    );
    expect(tituloTarefaAposSalvarPessoa("  ")).toContain("pessoa sem nome");
  });

  it("a ficha da pessoa e a G-02 oferecem a decisão depois do save confirmado", () => {
    const pessoa = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
    const g02 = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");
    expect(pessoa).toContain("DecisaoAposSalvarPessoa");
    expect(g02).toContain("DecisaoAposSalvarPessoa");
    expect(g02).toContain("Salvo e confirmado no banco");
    const ui = readFileSync("src/components/pessoa/decisao-apos-salvar.tsx", "utf8");
    expect(ui).toContain("Salvo e confirmado no banco");
    expect(ui).toContain("salvarTarefa");
    expect(ui).toContain("marcarSemNovaAcaoNecessaria");
  });
});

describe("P4 — onboarding vira checklist, tarefa e micro-entrega", () => {
  it("gates pendentes geram títulos idempotentes de tarefa", () => {
    expect(titulosTarefasDosGates({ contrato_assinado: false, pagamento_confirmado: false })).toEqual(
      [
        "Onboarding: registrar contrato assinado",
        "Onboarding: registrar pagamento inicial",
      ],
    );
    expect(titulosTarefasDosGates({ contrato_assinado: true, pagamento_confirmado: true })).toEqual([]);
  });

  it("checklist marca ok quando o gate já está no caso", () => {
    const lista = checklistComGates(
      { contrato_assinado: true, pagamento_confirmado: false },
      CHECKLIST_INICIAL_PADRAO,
    );
    expect(lista.find((i) => /contrato/i.test(i.item))?.status).toBe("ok");
    expect(lista.find((i) => /pagamento/i.test(i.item))?.status).toBe("pendente");
  });

  it("recalcular persiste checklist e tarefas; CTA grava ops_microentregas", () => {
    const fn = readFileSync("src/lib/onboarding-plano.functions.ts", "utf8");
    expect(fn).toContain("checklist_inicial");
    expect(fn).toContain("titulosTarefasDosGates");
    expect(fn).toContain("garantirTarefaAberta");
    expect(fn).toContain("criarPrimeiraMicroentregaOnboarding");
    expect(fn).toContain('.from("ops_microentregas")');
    expect(fn).toContain("clienteAtivado: false");
    expect(fn).not.toMatch(/onboarding_runs/);
    const ui = readFileSync("src/components/caso/onboarding-plano.tsx", "utf8");
    // P3 (25/09/2026): o CTA virou idempotente (cria ou reconcilia o D7).
    expect(ui).toContain("Criar ou reconciliar micro-entrega D7");
    expect(TITULO_PRIMEIRA_MICROENTREGA).toMatch(/micro-entrega/i);
  });
});

describe("P7 — fase 4 grava tarefa de avaliação", () => {
  it("writer e CTA existem, sem citizenship_cases", () => {
    const fn = readFileSync("src/lib/motor-cidadania.functions.ts", "utf8");
    expect(fn).toContain("registrarTarefaAvaliacaoCidadania");
    expect(fn).toContain("TITULO_TAREFA_AVALIACAO_CIDADANIA");
    expect(fn).not.toMatch(/\.from\("citizenship_cases"\)/);
    const ui = readFileSync("src/components/caso/fases-motor-cidadania.tsx", "utf8");
    expect(ui).toContain("Criar tarefa de avaliação (fase 4)");
  });
});
