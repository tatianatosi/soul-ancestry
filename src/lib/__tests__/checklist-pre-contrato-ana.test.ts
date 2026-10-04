/*
 * Decisão da Proprietária em 04/10/2026, literal: "Retire todas as auditorias
 * repetidas do menu, de todas as abas e também os bloqueios humanos do
 * contrato." As asserções abaixo foram ajustadas a essa decisão; o que era
 * exigido antes fica descrito no próprio arquivo, não apagado da história.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { checklistPreContrato } from "@/lib/contrato-checklist-pre";

/**
 * Item 5 (autorização explícita da Proprietária, 2026-09-23): checklist
 * operacional real de pré-contrato para o caso da Ana, sem fabricar
 * cláusula, assinatura, cobrança, pagamento ou produto/preço fictício.
 * Cada item deriva de dado já carregado por abrirPreparacaoContrato
 * (case_plans, case_members, contract_case_parameters, contracts,
 * invoices) — nenhum é marcado concluído sem evidência real.
 */

const BASE = {
  produtoPaiId: null,
  membros: [] as { nome: string; representacao_necessaria?: boolean | null; representacao_documentada?: boolean | null }[],
  bloqueios: [] as { chave: string; motivo: string }[],
  registroStatus: "rascunho",
  contrato: null,
  faturas: [] as { status: string | null; valor_pago: number | null; paga_em: string | null }[],
};

describe("checklistPreContrato — 7 itens, nenhum concluído sem evidência", () => {
  it("gera exatamente 7 itens, na ordem pedida", () => {
    const itens = checklistPreContrato(BASE);
    expect(itens.map((i) => i.chave)).toEqual([
      "produto_pai",
      "partes_dados",
      "representacao_dependente",
      "contrato_preparar",
      "assinatura",
      "cobranca",
      "pagamento_inicial",
    ]);
  });

  it("sem produto-pai definido, item fica pendente com próxima ação — nunca concluído por omissão", () => {
    const [item] = checklistPreContrato(BASE);
    expect(item.estado).toBe("pendente");
    expect(item.proximaAcao).toBeTruthy();
  });

  it("com produto-pai definido, resolve o rótulo real do catálogo canônico", () => {
    const itens = checklistPreContrato({ ...BASE, produtoPaiId: "PP-03" });
    const item = itens.find((i) => i.chave === "produto_pai")!;
    expect(item.estado).toBe("concluido");
    expect(item.estadoTexto).toContain("Pesquisa Genealógica por Ramo Familiar");
  });

  it("representação de dependente (Felipe): necessária e documentada = concluído", () => {
    const itens = checklistPreContrato({
      ...BASE,
      membros: [{ nome: "Felipe", representacao_necessaria: true, representacao_documentada: true }],
    });
    const item = itens.find((i) => i.chave === "representacao_dependente")!;
    expect(item.estado).toBe("concluido");
  });

  it("representação de dependente: necessária e NÃO documentada = bloqueado, nunca concluído", () => {
    const itens = checklistPreContrato({
      ...BASE,
      membros: [{ nome: "Felipe", representacao_necessaria: true, representacao_documentada: false }],
    });
    const item = itens.find((i) => i.chave === "representacao_dependente")!;
    expect(item.estado).toBe("bloqueado");
    expect(item.proximaAcao).toContain("Felipe");
  });

  it("representação de dependente: necessidade nunca avaliada (null/null) = pendente, não inventa concluído", () => {
    const itens = checklistPreContrato({
      ...BASE,
      membros: [{ nome: "Felipe", representacao_necessaria: null, representacao_documentada: null }],
    });
    const item = itens.find((i) => i.chave === "representacao_dependente")!;
    expect(item.estado).toBe("pendente");
  });

  it("Felipe ausente da lista de membros: item declara ausência, não inventa", () => {
    const itens = checklistPreContrato(BASE);
    const item = itens.find((i) => i.chave === "representacao_dependente")!;
    expect(item.estado).toBe("pendente");
    expect(item.estadoTexto).toContain("não encontrado");
  });

  it("contrato a preparar: bloqueios reais (fora de partes) mantêm o item bloqueado", () => {
    const itens = checklistPreContrato({
      ...BASE,
      bloqueios: [{ chave: "proposta", motivo: "Nenhuma proposta vinculada ao caso." }],
    });
    const item = itens.find((i) => i.chave === "contrato_preparar")!;
    expect(item.estado).toBe("bloqueado");
    expect(item.estadoTexto).toContain("Nenhuma proposta vinculada");
  });

  it("assinatura: sem contracts.signed_at, fica pendente mesmo com contrato registrado", () => {
    const itens = checklistPreContrato({ ...BASE, contrato: { status: "rascunho", signed_at: null } });
    const item = itens.find((i) => i.chave === "assinatura")!;
    expect(item.estado).toBe("pendente");
    expect(item.estadoTexto).toContain("rascunho");
  });

  it("assinatura: com signed_at real, concluído", () => {
    const itens = checklistPreContrato({
      ...BASE,
      contrato: { status: "assinado", signed_at: "2026-09-23T10:00:00Z" },
    });
    const item = itens.find((i) => i.chave === "assinatura")!;
    expect(item.estado).toBe("concluido");
  });

  it("cobrança: sem faturas, pendente; com faturas, concluído", () => {
    const semFatura = checklistPreContrato(BASE).find((i) => i.chave === "cobranca")!;
    expect(semFatura.estado).toBe("pendente");
    const comFatura = checklistPreContrato({
      ...BASE,
      faturas: [{ status: "pendente", valor_pago: null, paga_em: null }],
    }).find((i) => i.chave === "cobranca")!;
    expect(comFatura.estado).toBe("concluido");
  });

  it("pagamento inicial: fatura emitida mas não paga continua pendente — nunca concluído sem paga_em/status paga", () => {
    const itens = checklistPreContrato({
      ...BASE,
      faturas: [{ status: "pendente", valor_pago: null, paga_em: null }],
    });
    const item = itens.find((i) => i.chave === "pagamento_inicial")!;
    expect(item.estado).toBe("pendente");
  });

  it("pagamento inicial: fatura com paga_em real, concluído", () => {
    const itens = checklistPreContrato({
      ...BASE,
      faturas: [{ status: "paga", valor_pago: 320, paga_em: "2026-09-20" }],
    });
    const item = itens.find((i) => i.chave === "pagamento_inicial")!;
    expect(item.estado).toBe("concluido");
  });

  it("itens sem sinal de dado real nunca ficam 'concluido' com entrada vazia (caso Ana início)", () => {
    // partes_dados e contrato_preparar são espelho do array `bloqueios` já
    // computado por abrirPreparacaoContrato (gate real, várias checagens) —
    // um array vazio ali É um sinal real de "sem bloqueio", não omissão.
    // Os 5 itens abaixo dependem de dado próprio, direto na entrada: sem
    // ele, nunca podem ficar concluídos.
    const itens = checklistPreContrato(BASE);
    const semDado = itens.filter((i) =>
      ["produto_pai", "representacao_dependente", "assinatura", "cobranca", "pagamento_inicial"].includes(i.chave),
    );
    expect(semDado.every((i) => i.estado !== "concluido")).toBe(true);
  });
});

describe("D · rota oficial (casos.$caseId.contrato.preparar.tsx) expõe o checklist", () => {
  const rota = readFileSync(
    resolve(__dirname, "../../routes/_authenticated/casos.$caseId.contrato.preparar.tsx"),
    "utf8",
  );
  const funcoes = readFileSync(resolve(__dirname, "../contrato-preparar.functions.ts"), "utf8");

  it("04/10/2026: o checklist saiu da tela de contrato; o módulo canônico continua intacto", () => {
    // O trilho de prontidão passou a responder "onde está e o que falta".
    expect(rota).not.toContain("data-checklist-pre-contrato");
    expect(rota).not.toContain("Checklist operacional");
    expect(rota).toContain("TrilhoProntidaoContrato");
    // Nada foi apagado: o módulo puro e seus testes seguem valendo.
    expect(existsSync("src/lib/contrato-checklist-pre.ts")).toBe(true);
  });

  it("o módulo do checklist continua devolvendo fonte, estado e próxima ação por item", () => {
    const mod = readFileSync("src/lib/contrato-checklist-pre.ts", "utf8");
    for (const campo of ["fonte", "estado", "proximaAcao"]) expect(mod, campo).toContain(campo);
  });

  it("abrirPreparacaoContrato lê case_plans (produto-pai) e invoices (cobrança/pagamento), sem fabricar", () => {
    expect(funcoes).toMatch(/\.from\("case_plans"\)/);
    expect(funcoes).toMatch(/\.from\("invoices"\)/);
    expect(funcoes).toContain("produtoPaiId: planoAtivo?.produto_pai_id ?? null");
    expect(funcoes).toContain("faturas: faturas ?? []");
  });

  it("nenhuma função de emissão de contrato/cobrança/assinatura nova foi criada neste corte", () => {
    expect(funcoes).not.toMatch(/export const emitirContrato|export const emitirFatura|export const assinarContrato/);
  });
});
