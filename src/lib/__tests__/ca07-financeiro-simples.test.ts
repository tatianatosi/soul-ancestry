import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// CA07-FINANCEIRO-SIMPLES (09/09/2026): leitura financeira por caso, sem ERP,
// sem fonte de preço nova, sem integração externa.
const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
const visaoGeral = readFileSync("src/components/caso/visao-geral.tsx", "utf8");
const financeiroCaso = readFileSync("src/lib/financeiro-caso.ts", "utf8");
const comercialFn = readFileSync("src/lib/comercial.functions.ts", "utf8");

const CAMPOS_EXIGIDOS = [
  "Valor contratado",
  "Valor recebido",
  "Saldo aberto",
  "Próxima parcela",
  "Status",
  "Despesas de terceiros",
  "Condição comercial",
  "Próxima ação financeira",
];

describe("CA07-FINANCEIRO-SIMPLES — os oito campos aparecem no Caso 360 e na Visão Geral", () => {
  it("hero do Caso 360 mostra os oito campos", () => {
    const bloco = caso360.slice(caso360.indexOf('id="resumo-financeiro"'));
    for (const campo of CAMPOS_EXIGIDOS) {
      expect(bloco, `campo ausente no Caso 360: ${campo}`).toContain(campo);
    }
  });

  it("Visão Geral (AbaVisaoGeral) mostra os mesmos oito campos", () => {
    for (const campo of CAMPOS_EXIGIDOS) {
      expect(visaoGeral, `campo ausente na Visão Geral: ${campo}`).toContain(campo);
    }
  });

  it("só existem dois botões de ação financeira interna: Registrar pagamento e Preparar cobrança", () => {
    const bloco = caso360.slice(caso360.indexOf('id="resumo-financeiro"'), caso360.indexOf('id="resumo-financeiro"') + 6000);
    expect(bloco).toContain("Registrar pagamento");
    expect(bloco).toContain("Preparar cobrança");
  });

  it("a Visão Geral é só leitura — nenhum botão de ação financeira lá, mesmo cálculo do Caso 360", () => {
    expect(visaoGeral).not.toMatch(/Registrar pagamento|Preparar cobrança/);
    expect(visaoGeral).toContain('import { ROTULO_STATUS_FINANCEIRO_CASO, type ResumoFinanceiroCaso } from "@/lib/financeiro-caso"');
  });
});

describe("CA07-FINANCEIRO-SIMPLES — uma métrica, uma fonte (nenhum cálculo duplicado)", () => {
  it("valor contratado só vem de proposals; recebido/saldo só de invoices.valor_pago — nunca resomado de payments", () => {
    expect(financeiroCaso).toContain("propostaDeReferencia(propostas)");
    expect(financeiroCaso).toContain("Number(f.valor_pago ?? 0)");
    expect(financeiroCaso).not.toMatch(/from\("payments"\)/);
  });

  it("o servidor lê só as três fontes já existentes — nenhuma tabela nova", () => {
    const trecho = comercialFn.slice(comercialFn.indexOf("export const obterResumoFinanceiroCaso"));
    expect(trecho).toContain('.from("proposals")');
    expect(trecho).toContain('.from("invoices")');
    expect(trecho).toContain('.from("third_party_expenses")');
    expect(trecho).not.toMatch(/create table|third_party_expenses_v2|invoices_v2/i);
  });

  it("Caso 360 e Visão Geral chamam a mesma leitura (uma query, dois lugares) — nenhum segundo cálculo", () => {
    expect(caso360).toContain("obterResumoFinanceiroCaso");
    const ocorrenciasImport = caso360.match(/obterResumoFinanceiroCaso/g) ?? [];
    expect(ocorrenciasImport.length).toBe(2); // import + uso na query
    expect(caso360).toContain("financeiro={qFinanceiro.data ?? null}");
  });
});

describe("CA07-FINANCEIRO-SIMPLES — sem dados suficientes, nunca número simulado", () => {
  it("todo campo sem base mostra o rótulo fixo, nunca zero fabricado", () => {
    const ocorrencias = (caso360.match(/Sem dados suficientes/g) ?? []).length;
    expect(ocorrencias).toBeGreaterThan(0);
    expect(visaoGeral).toContain("Sem dados suficientes");
  });

  it("despesasTerceiros é null (não objeto zerado) quando não há nenhuma despesa registrada", () => {
    expect(financeiroCaso).toContain("despesas.length\n    ? {");
  });
});

describe("CA07-FINANCEIRO-SIMPLES — ações internas reusam escritores já existentes", () => {
  it("Registrar pagamento reusa salvarPagamento + conciliarPagamento (mesmo par que /financeiro já usa) — nenhum motor novo", () => {
    const trecho = caso360.slice(caso360.indexOf("const mRegistrarPagamento"), caso360.indexOf("const mPrepararCobranca"));
    expect(trecho).toContain("salvarPagamentoFn(");
    expect(trecho).toContain("conciliarPagamentoFn(");
  });

  it("Preparar cobrança reusa salvarFatura, cria/move para rascunho ou emitida — nunca envia nada externo", () => {
    const trecho = caso360.slice(caso360.indexOf("const mPrepararCobranca"), caso360.indexOf("const [form, setForm]"));
    expect(trecho).toContain("salvarFaturaFn(");
    expect(trecho).toMatch(/status:\s*"rascunho"|status:\s*"emitida"/);
    for (const proibido of ["enviarWhatsapp", "enviarEmail", "sendInvite", "sendEmail", "mailto:", "wa.me"]) {
      expect(trecho).not.toContain(proibido);
    }
  });

  it("nenhuma das duas ações toca proposals, contracts ou service_orders — financeiro não bloqueia rascunho comercial", () => {
    const bloco = caso360.slice(caso360.indexOf("const mRegistrarPagamento"), caso360.indexOf("const [form, setForm]"));
    expect(bloco).not.toMatch(/\.from\("proposals"\)|\.from\("contracts"\)|\.from\("service_orders"\)/);
  });
});

describe("CA07-FINANCEIRO-SIMPLES — RLS preservada", () => {
  it("a leitura financeira do caso é sempre filtrada por organização e por caso", () => {
    const trecho = comercialFn.slice(comercialFn.indexOf("export const obterResumoFinanceiroCaso"));
    const filtrosOrg = trecho.match(/\.eq\("organization_id", organizationId\)/g) ?? [];
    const filtrosCaso = trecho.match(/\.eq\("case_id", data\.caseId\)/g) ?? [];
    expect(filtrosOrg.length).toBeGreaterThanOrEqual(3);
    expect(filtrosCaso.length).toBeGreaterThanOrEqual(3);
  });

  it("nenhum service_role nem RLS desligada no código novo", () => {
    expect(financeiroCaso).not.toMatch(/service_role|disable row level security/i);
    const trecho = comercialFn.slice(comercialFn.indexOf("export const obterResumoFinanceiroCaso"));
    expect(trecho).not.toMatch(/service_role|disable row level security/i);
  });
});
