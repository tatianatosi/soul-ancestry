import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ANEXOS_POR_COMPOSICAO,
  anexosDaComposicao,
  condicaoVigente,
  conferirCondicao,
  lacunasDeAnexos,
  type CondicaoComercialCaso,
} from "@/lib/condicao-comercial-caso";

/**
 * Proprietária, 04/10/2026: "primeiro fechar o case commercial condition e
 * proposta da Ana... Ana não está condicionada em sku, tudo já era legado, já
 * tinha sido feita a extração da proposta do Canva. No contrato revise pois
 * somente está cobrindo um anexo quando na verdade são 04 anexos."
 *
 * Medido antes de executar, e ela está certa nas três afirmações:
 *  - as 7 páginas do Canva estão em `proposal_canva_pages` com
 *    `extracao_status = extraida` desde antes desta rodada — a extração já
 *    estava feita, e eu não precisava refazê-la;
 *  - `case_commercial_condition` **não existia**, então nada lia aquela
 *    extração: o preço ia continuar atravessando `condicao-comercial.ts`, que
 *    é o gate de homologação de SKU do `product_catalog` — legado, e que nunca
 *    se aplicou ao caso dela;
 *  - `contract_annexes` do contrato da Ana tinha **0 linhas**.
 *
 * A composição da condição (páginas 4 e 6) é: Ana R$ 4.800, pai R$ 2.400,
 * irmã R$ 2.400, Felipe dependente representado, total R$ 9.600 em 3
 * assinaturas de R$ 320 × 10 meses.
 */

const ANA: CondicaoComercialCaso = {
  id: "c1",
  caseId: "a11a0000-0000-4000-8000-000000000002",
  propostaId: "p1",
  propostaReferencia: "DECK-CANVA-CA-CID-AT-FAM-2026-001-v1 (páginas 1–7 extraídas)",
  versao: 1,
  itens: [
    { parte: "Ana Luiza Gomes Silveira Rodrigues", valor: 4800, escopo: "Pesquisa histórica, dossiê-base e declaração individual" },
    { parte: "Adair Gomes Silveira", valor: 2400, escopo: "Elo documental direto e declaração própria" },
    { parte: "Alice Gomes Silveira", valor: 2400, escopo: "Certidões pessoais e declaração própria" },
    { parte: "Felipe", valor: 0, escopo: "Dependente menor representado — sem assinatura e sem cobrança própria" },
  ],
  total: 9600,
  despesasTerceiros: "Certidões, buscas, traduções, apostilas, taxas consulares — previamente aprovadas.",
  taxasOficiais: null,
  formaPagamento: "3 assinaturas mensais de R$ 320 por responsável, durante 10 meses",
  responsaveisFinanceiros: ["Ana Luiza Gomes Silveira Rodrigues", "Adair Gomes Silveira", "Alice Gomes Silveira"],
  parcelas: 10,
  valorParcela: 320,
  moeda: "BRL",
  validade: "2026-08-19",
  estado: "aprovada",
  origem: "proposta_canva",
};

describe("a condição da Ana fecha, e é a fonte — não o catálogo", () => {
  it("soma dos escopos por pessoa fecha com o total aprovado", () => {
    const c = conferirCondicao(ANA);
    expect(c.somaDosItens).toBe(9600);
    expect(c.fecha).toBe(true);
    expect(c.diferenca).toBe(0);
  });

  it("as 3 assinaturas × R$ 320 × 10 meses fecham com os R$ 9.600", () => {
    expect(conferirCondicao(ANA).totalPelasAssinaturas).toBe(9600);
  });

  it("divergência é declarada, nunca ajustada", () => {
    const torta = { ...ANA, total: 9000 };
    const c = conferirCondicao(torta);
    expect(c.fecha).toBe(false);
    expect(c.diferenca).toBe(600);
    expect(c.avisos.join(" ")).toContain("Nada foi ajustado");
  });

  it("a validade comercial é dita, não aplicada em silêncio", () => {
    expect(conferirCondicao(ANA).avisos.join(" ")).toContain("19");
  });

  it("só a versão aprovada de maior número é vigente", () => {
    const v2 = { ...ANA, id: "c2", versao: 2, estado: "rascunho" };
    expect(condicaoVigente([ANA, v2])?.versao).toBe(1);
    expect(condicaoVigente([ANA, { ...v2, estado: "aprovada" }])?.versao).toBe(2);
    expect(condicaoVigente([{ ...ANA, estado: "substituida" }])).toBeNull();
  });

  it("origem é a proposta Canva já extraída, não SKU nem catálogo", () => {
    expect(ANA.origem).toBe("proposta_canva");
    expect(ANA.propostaReferencia).toContain("extraídas");
  });
});

describe("os 4 anexos da composição", () => {
  const anexos = anexosDaComposicao(ANA, [{ nome: "Felipe", representadoPor: "Ana Luiza Gomes Silveira Rodrigues" }]);

  it("são quatro: três partes contratantes + financeiro", () => {
    expect(anexos).toHaveLength(4);
    expect(ANEXOS_POR_COMPOSICAO).toHaveLength(4);
    expect(anexos.map((a) => a.letra)).toEqual(["A", "B", "C", "D"]);
    expect(anexos.filter((a) => a.tipo === "parte_contratante")).toHaveLength(3);
    expect(anexos.filter((a) => a.tipo === "financeiro")).toHaveLength(1);
  });

  it("Anexo A é da Ana e carrega Felipe representado — o menor não tem anexo próprio", () => {
    expect(anexos[0]!.parte).toContain("Ana Luiza");
    expect(anexos[0]!.dependentesRepresentados).toContain("Felipe");
    expect(anexos.some((a) => a.parte === "Felipe")).toBe(false);
  });

  it("Anexo D é o financeiro, com a forma de pagamento e o total", () => {
    const d = anexos[3]!;
    expect(d.tipo).toBe("financeiro");
    expect(d.valor).toBe(9600);
    expect(d.escopo).toContain("assinaturas mensais");
  });

  it("contrato sem anexo nenhum: as quatro lacunas aparecem nomeadas", () => {
    const lacunas = lacunasDeAnexos([], anexos);
    expect(lacunas).toHaveLength(4);
    expect(lacunas.join(" ")).toContain("Anexo A");
    expect(lacunas.join(" ")).toContain("Anexo D");
  });

  it("contrato cobrindo só um anexo deixa três lacunas — o defeito que ela apontou", () => {
    expect(lacunasDeAnexos(["ANEXO_A"], anexos)).toHaveLength(3);
  });

  it("o anexo de despesas não é duplicado aqui: já é o Anexo II governado", () => {
    expect(anexos.some((a) => (a.titulo + a.escopo).toLowerCase().includes("reembolso"))).toBe(false);
    const fonte = readFileSync("src/lib/condicao-comercial-caso.ts", "utf8");
    expect(fonte).toContain("já é o Anexo II governado");
  });
});

describe("a tela e o escritor ficaram ligados — nada de peça órfã", () => {
  it("o painel está montado em Caso 360", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(rota).toContain("<CondicaoComercialVersionada caseId={id} />");
  });

  it("o leitor expõe condição vigente, conferência, anexos esperados e lacunas", () => {
    const fn = readFileSync("src/lib/condicao-comercial-caso.functions.ts", "utf8");
    for (const chave of ["vigente", "conferencia", "anexosEsperados", "anexosRegistrados", "lacunasDeAnexos"]) {
      expect(fn).toContain(chave);
    }
  });

  it("nova versão nunca reescreve a anterior: a antiga passa a substituida", () => {
    const fn = readFileSync("src/lib/condicao-comercial-caso.functions.ts", "utf8");
    expect(fn).toContain('approval_status: "substituida"');
    expect(fn).toContain('approval_status: "rascunho"');
    expect(fn).toContain("Informe o motivo da nova versão");
  });

  it("o leitor não toca em product_catalog, Planilha Mestre nem SKU", () => {
    const fn = readFileSync("src/lib/condicao-comercial-caso.functions.ts", "utf8");
    // Procura LEITURA real, não a palavra: o cabeçalho do módulo cita o
    // catálogo exatamente para explicar por que ele não é lido aqui.
    expect(fn).not.toContain('from("product_catalog")');
    expect(fn).not.toContain('from("price_catalog_rescued")');
    expect(fn).not.toContain("preco_sugerido");
  });
});
