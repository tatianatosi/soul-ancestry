import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const leadsFn = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
const leadsPg = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
const contratosDetalhe = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
const contratosLista = readFileSync("src/routes/_authenticated/contratos.index.tsx", "utf8");
const pesquisa = readFileSync("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", "utf8");
const docsFn = readFileSync("src/lib/documentos-solicitacoes.functions.ts", "utf8");
const privacidade = readFileSync("src/routes/_authenticated/privacidade.index.tsx", "utf8");
const preparar = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

describe("CA-PESSOA-360 — navegação a partir de superfícies (2026-09-11)", () => {
  it("Leads enriquecem cliente_id via crm_casos e expõem Pessoa/Caso 360", () => {
    expect(leadsFn).toContain('.select("id,cliente_id")');
    expect(leadsFn).toContain("clientePorCaso");
    expect(leadsPg).toContain('to="/pessoas/$clienteId"');
    expect(leadsPg).toContain("Abrir Pessoa 360");
    expect(leadsPg).toContain('to="/casos/$caseId"');
  });

  it("Contratos detalhe e lista ligam Pessoa 360 e Caso 360", () => {
    expect(contratosDetalhe).toContain("Abrir Pessoa 360");
    expect(contratosDetalhe).toContain('to="/pessoas/$clienteId"');
    expect(contratosDetalhe).toContain("Abrir Caso 360");
    expect(contratosLista).toContain("Pessoa 360");
    expect(contratosLista).toContain('to="/pessoas/$clienteId"');
  });

  it("Pesquisa/evidências e documentos/privacidade ligam Pessoa 360", () => {
    expect(docsFn).toContain("id,codigo,titulo,pais,cliente_id");
    expect(pesquisa).toContain("Abrir Pessoa 360");
    expect(pesquisa).toContain('to="/pessoas/$clienteId"');
    expect(privacidade).toContain("Pessoa 360");
    expect(privacidade).toContain('to="/pessoas/$clienteId"');
  });

  it("Formalização preparar aponta Pessoa 360 e Caso 360", () => {
    expect(preparar).toContain("Abrir Pessoa 360");
    expect(preparar).toContain('to="/pessoas/$clienteId"');
    expect(preparar).toContain('to="/casos/$caseId"');
  });
});
