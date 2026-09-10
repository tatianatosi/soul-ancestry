import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * CA15-COMERCIAL-E-FONTE-VIVA (09/09/2026) — duas funções puras já existiam
 * sem nenhum consumidor: `conflitoPlanejadorProposta` (perfil-institucional.ts,
 * testada mas nunca chamada em produção) e o enriquecimento de produto-pai
 * do CA09 (planejador-produtos-pai.ts, usado só em Caso e Catálogo). Nenhuma
 * tela comercial comparava o preço homologado do SKU com o valor declarado
 * na proposta do mesmo caso — a divergência existia sem nenhum aviso.
 * `conferirRegraComercial` passa a trazer produto-pai + a proposta ativa do
 * caso + o conflito preço-homologado × proposta; `RegraComercial` exibe os
 * dois e a conciliação, sem sobrescrever nenhum valor. A Planilha Mestre
 * continua fora: nenhuma consulta nova a `catalogo-fonte-mestre.ts`.
 */

const servidor = readFileSync("src/lib/regra-comercial.functions.ts", "utf8");
const componente = readFileSync("src/components/contrato/regra-comercial.tsx", "utf8");

describe("CA15 — conferirRegraComercial concilia produto-pai, SKU técnico, preço e proposta", () => {
  it("reaproveita o enriquecimento de produto-pai do CA09, não uma leitura nova", () => {
    expect(servidor).toContain('from "@/lib/planejador-produtos-pai"');
    expect(servidor).toContain("construirMapaProdutoPaiPorCodigo(");
    expect(servidor).toContain("produtoPaiDoCodigo(");
  });

  it("reaproveita conflitoPlanejadorProposta já existente, não inventa uma nova regra de conflito", () => {
    expect(servidor).toContain('from "@/lib/perfil-institucional"');
    expect(servidor).toContain("conflitoPlanejadorProposta(");
  });

  it("lê a proposta ativa do mesmo caso (não de outro caso) para conciliar valor", () => {
    const bloco = servidor.slice(servidor.indexOf('.from("proposals")'), servidor.indexOf('.from("proposals")') + 300);
    expect(bloco).toContain('.eq("case_id", data.caseId)');
    expect(bloco).toContain('.order("versao"');
  });

  it("nunca lê a Planilha Mestre (catalogo-fonte-mestre) para preço comercial", () => {
    expect(servidor).not.toMatch(/catalogo-fonte-mestre/);
  });

  it("retorna produtoPai, proposta e conflitoValor no payload — não descarta o resultado", () => {
    const bloco = servidor.slice(servidor.indexOf("return {\n      despesas"));
    expect(bloco).toContain("produtoPai:");
    expect(bloco).toContain("proposta: propostaAtiva");
    expect(bloco).toContain("conflitoValor,");
  });
});

describe("CA15 — RegraComercial mostra produto-pai, SKU técnico e a conciliação com a proposta", () => {
  it("mostra produto-pai como decisão e SKU como dado técnico, nunca escondido", () => {
    expect(componente).toMatch(/Produto-pai/);
    expect(componente).toMatch(/SKU do caso \(técnico\)/);
  });

  it("mostra a conciliação apenas quando há conflito real, com o motivo da função existente", () => {
    const bloco = componente.slice(componente.indexOf("conflitoValor?.conflito"));
    expect(bloco.slice(0, 400)).toContain("Conciliação proposta");
    expect(bloco.slice(0, 400)).toContain("data.conflitoValor.motivo");
  });

  it("nunca sobrescreve valor: não há campo editável de preço nesta conciliação", () => {
    const bloco = componente.slice(
      componente.indexOf("Preço e condição do SKU"),
      componente.indexOf("Preço e condição do SKU") + 3000,
    );
    expect(bloco).not.toMatch(/<input[^>]*preco/i);
  });
});
