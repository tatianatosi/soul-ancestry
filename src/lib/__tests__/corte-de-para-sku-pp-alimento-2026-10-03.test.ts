import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { PRODUTOS_PAI_CANONICOS } from "@/lib/planejador-produtos-pai";
import {
  alimentoDeParaSku,
  FAMILIAS_A_CLASSIFICAR,
  motivoSemProdutoPai,
  produtoPaiDoSku,
  REGRAS_SKU_PP,
} from "@/lib/sku-produto-pai";

/**
 * De-para SKU→PP como alimento (03/10/2026) — "aprovado de para sku-pp para
 * todos os produtos ser usado como alimento e não tela estática".
 */

/** Catálogo real da organização, lido do banco em 03/10 (46 códigos distintos). */
const CATALOGO_REAL: [string, string][] = [
  ["CA-ASS-001", "Continuidade — Assinatura Base"],
  ["CA-ASS-002", "Plano Memorias"],
  ["CA-ASS-005", "Plano Anual com Desconto — Memórias"],
  ["CA-CID-001", "Consultoria de Cidadania Italiana"],
  ["CA-CID-002", "Montagem Completa de Pasta para Cidadania"],
  ["CA-CID-002D", "Pasta + Checklist de Pendências"],
  ["CA-CID-003", "AIRE + Agendamento de Passaporte"],
  ["CA-CID-019", "Declaracao de Valor - Ensino Fundamental ate Universidade"],
  ["CA-CID-023", "Assessoria Completa de Cidadania Italiana"],
  ["CA-CID-025", "Acompanhamento Familiar — Processo Compartilhado"],
  ["CA-DIAG-003", "Diagnóstico de Pesquisa de Origem"],
  ["CA-DOC-005", "Coordenação de Tradução e Apostilamento"],
  ["CA-FAM-001", "Familiar Conectado"],
  ["CA-HIST-005", "Pesquisa de Base Familiar"],
  ["CA-IND-002", "Legado em Vídeo — Mini-Série de Depoimentos"],
  ["CA-MEM-004", "Livro da Historia Familiar"],
  ["CA-MEM-006", "Acervo Digital Familiar"],
  ["CA-PROT-002", "Estratégia de Via Jurídica com Parceiro"],
  ["CA-PROT-004", "Preparação de Reunião ou Entrevista Consular"],
  ["CA-WPP-001", "Pacote WhatsApp Essencial"],
  ["PROD-COMPL-DOC", "Complemento — Obtenção documental"],
  ["PROD-DIAG-FAM-MULTI", "Diagnóstico Familiar Multipaís"],
  ["PROD-DIAG-INDIVIDUAL", "Diagnóstico Individual"],
];

const pp = (code: string, nome: string) => produtoPaiDoSku(code, nome)?.produtoPaiId ?? null;

describe("a regra classifica o catálogo real pelo que o nome diz", () => {
  it.each([
    ["PROD-DIAG-FAM-MULTI", "Diagnóstico Familiar Multipaís", "PP-01"],
    ["PROD-DIAG-INDIVIDUAL", "Diagnóstico Individual", "PP-02"],
    ["CA-CID-001", "Consultoria de Cidadania Italiana", "PP-02"],
    ["CA-HIST-005", "Pesquisa de Base Familiar", "PP-03"],
    ["CA-CID-002", "Montagem Completa de Pasta para Cidadania", "PP-04"],
    ["CA-DOC-005", "Coordenação de Tradução e Apostilamento", "PP-04"],
    ["CA-PROT-002", "Estratégia de Via Jurídica com Parceiro", "PP-05"],
    ["CA-CID-023", "Assessoria Completa de Cidadania Italiana", "PP-06"],
    ["CA-CID-025", "Acompanhamento Familiar — Processo Compartilhado", "PP-06"],
    ["CA-CID-003", "AIRE + Agendamento de Passaporte", "PP-07"],
    ["CA-CID-019", "Declaracao de Valor - Ensino Fundamental ate Universidade", "PP-07"],
    ["CA-MEM-004", "Livro da Historia Familiar", "PP-08"],
    ["CA-IND-002", "Legado em Vídeo — Mini-Série de Depoimentos", "PP-08"],
    ["CA-MEM-006", "Acervo Digital Familiar", "PP-09"],
    ["CA-ASS-001", "Continuidade — Assinatura Base", "PP-09"],
  ])("%s → %s", (code, nome, esperado) => {
    expect(pp(code, nome)).toBe(esperado);
  });

  it('assinatura vence memória: "Plano Memórias" é PP-09, não livro', () => {
    expect(pp("CA-ASS-002", "Plano Memorias")).toBe("PP-09");
    expect(pp("CA-ASS-005", "Plano Anual com Desconto — Memórias")).toBe("PP-09");
  });

  it("todo produto-pai devolvido existe na taxonomia vigente PP-01–09", () => {
    const validos = new Set(PRODUTOS_PAI_CANONICOS.map((p) => p.id));
    for (const [c, n] of CATALOGO_REAL) {
      const r = produtoPaiDoSku(c, n);
      if (r) expect(validos.has(r.produtoPaiId), `${c} → ${r.produtoPaiId}`).toBe(true);
    }
  });

  it("toda regra tem motivo legível — nenhuma classificação sem porquê", () => {
    for (const r of REGRAS_SKU_PP) {
      expect(r.porque.length, r.id).toBeGreaterThan(20);
      expect(r.porque, r.id).toMatch(/PP-0\d/);
    }
  });
});

describe("o que a regra não decide fica declarado, não chutado", () => {
  it("familiar conectado e pacote de WhatsApp não recebem produto-pai", () => {
    expect(produtoPaiDoSku("CA-FAM-001", "Familiar Conectado")).toBeNull();
    expect(produtoPaiDoSku("CA-WPP-001", "Pacote WhatsApp Essencial")).toBeNull();
  });

  it("cada pendência explica por quê e devolve a decisão à Proprietária", () => {
    for (const f of FAMILIAS_A_CLASSIFICAR) {
      expect(f.porque).toMatch(/decisão de catálogo/);
    }
    expect(motivoSemProdutoPai("XX-NOVO-001")).toMatch(/pendente de decisão de catálogo/i);
  });

  it("o alimento separa classificados de pendentes, sem perder ninguém", () => {
    const skus = CATALOGO_REAL.map(([code, nome], i) => ({ id: `s${i}`, code, nome_comercial: nome }));
    const a = alimentoDeParaSku(skus);
    expect(a.total).toBe(skus.length);
    expect(a.classificados + a.aClassificar.length).toBe(skus.length);
    expect(a.aClassificar.map((s) => s.code).sort()).toEqual(["CA-FAM-001", "CA-WPP-001"]);
  });
});

describe("é alimento, não tela estática nem segunda cópia do catálogo", () => {
  it("o Planejador consome o de-para: o SKU do plano diz o produto-pai", () => {
    const server = readFileSync("src/lib/jornada-planejador.server.ts", "utf8");
    expect(server).toMatch(/produtoPaiDoSku/);
    expect(server).toMatch(/divergeDoSku/);
    const painel = readFileSync("src/components/caso/jornada-planejador.tsx", "utf8");
    expect(painel).toMatch(/Produto-Pai implicado por este SKU/);
  });

  it("nada é persistido: product_catalog.produto_pai_id é uuid auto-FK, outra coisa", () => {
    const fn = readFileSync("src/lib/sku-produto-pai.functions.ts", "utf8");
    expect(fn).not.toMatch(/gravarComVerificacao|\.update\(/);
    expect(fn).not.toMatch(/produto_pai_id:/);
    // o achado fica registrado no próprio módulo, para ninguém repetir
    expect(fn).toMatch(/uuid com FK para `product_catalog\(id\)`/);
  });

  it("o painel do catálogo mostra o agrupamento e as pendências", () => {
    const rota = readFileSync("src/routes/_authenticated/catalogo.tsx", "utf8");
    expect(rota).toMatch(/DeParaSkuProdutoPai/);
    const painel = readFileSync("src/components/catalogo/de-para-sku-produto-pai.tsx", "utf8");
    expect(painel).toMatch(/Pendente de decisão de catálogo/);
    expect(painel).toMatch(/derivada na leitura/);
  });
});
