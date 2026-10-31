import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

// P24 (2026-09-26) — pedido literal da Proprietária: "Adicione e execute
// caso 360 Visão · Jornada · Pessoas · Pesquisa · Documentos · Formalização
// · Financeiro · Histórico". Taxonomia fixada: 8 seções endereçáveis pelo
// índice fixo, todas reaproveitando dado já carregado nesta mesma tela —
// nenhuma tabela, escritor, rota ou query nova.
describe("P24 — taxonomia dos 8 nomes exatos da Proprietária no índice do Caso 360", () => {
  it("SECOES tem exatamente os 8 rótulos pedidos, nesta ordem", () => {
    const rotulos = [...pagina.matchAll(/\{ id: "\w+", rotulo: "([^"]+)" \}/g)].map((m) => m[1]);
    expect(rotulos).toEqual([
      "Visão", "Jornada", "Pessoa e família", "Pesquisa", "Documentos",
      "Formalização", "Financeiro", "Histórico",
    ]);
  });

  it("nenhum rótulo mislabeled sobrevive (bug encontrado: visão dizia Histórico, log dizia Dados técnicos)", () => {
    expect(pagina).not.toContain('{ id: "visao", rotulo: "Histórico" }');
    expect(pagina).not.toContain('{ id: "log", rotulo: "Dados técnicos e validações" }');
  });
});

describe("P24 — Documentos e Financeiro são seções novas, reaproveitando dado já carregado", () => {
  it("seção Documentos existe, lê qDocumentos (sem query nova) e linka para a gestão completa", () => {
    const inicio = pagina.search(/<SecaoAncora\s+id="documentos"/);
    const fim = pagina.search(/<SecaoAncora\s+id="financeiro"/);
    expect(inicio).toBeGreaterThan(-1);
    const bloco = pagina.slice(inicio, fim);
    expect(bloco).toContain("qDocumentos.data");
    expect(bloco).toContain("/pesquisa-evidencias/$caseId");
  });

  it("seção Financeiro existe, lê qFinanceiro (sem query nova) e não duplica o CTA de pagamento/cobrança", () => {
    const inicio = pagina.search(/<SecaoAncora\s+id="financeiro"/);
    const fim = pagina.search(/<details\s+id="secao-log"/);
    expect(inicio).toBeGreaterThan(-1);
    const bloco = pagina.slice(inicio, fim);
    expect(bloco).toContain("qFinanceiro.data");
    expect(bloco).not.toContain("<button");
    expect(bloco).not.toContain("<AcaoOperacional");
    expect(bloco).toContain("resumo executivo");
  });
});

describe("P24 — nenhuma tabela, rota ou escritor novo", () => {
  it("não introduz nenhum novo useServerFn nem novo useQuery além dos já existentes na tela", () => {
    const inicio = pagina.search(/<SecaoAncora\s+id="documentos"/);
    const fim = pagina.search(/<details\s+id="secao-log"/);
    const bloco = pagina.slice(inicio, fim);
    expect(bloco).not.toContain("useServerFn(");
    expect(bloco).not.toContain("useQuery(");
  });
});
