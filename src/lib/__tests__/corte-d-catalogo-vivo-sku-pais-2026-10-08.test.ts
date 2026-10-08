import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  ISO_POR_PAIS,
  divergenciaProdutoPai,
  divergenciaProdutoSku,
  isoDoPais,
  opcoesProdutoSku,
  type ItemCatalogoFeed,
} from "@/lib/catalogo-opcoes-contrato";
import { CAT_PRODUTO_SKU } from "@/lib/parametros-catalogos";

/**
 * Corte D — medido no banco vivo em 08/10/2026:
 * `planner_catalog_feed` tem 99 itens vivos, 8 produtos-pai e 20 países em
 * `country_scope` — e guarda ISO-2 (`AT`), enquanto o caso guarda o nome
 * (`austria`) e o plano guarda com acento (`Áustria`).
 *
 * `CAT_PRODUTO_SKU` tinha UMA opção fixa: o código real `CA-CID-AT-001`
 * colado num nome que o catálogo nunca emitiu. No feed o item se chama
 * "Consultoria e Acompanhamento de Cidadania Austríaca".
 */

const FEED: ItemCatalogoFeed[] = [
  {
    itemId: "CA-CID-AT-001",
    nome: "Consultoria e Acompanhamento de Cidadania Austríaca",
    produtoPai: "Diagnóstico de Cidadania por Etapas",
    statusDicionario: "ATIVO_SEM_PRECO_HOMOLOGADO",
    paises: ["AT"],
  },
  {
    itemId: "CA-CID-AT-002",
    nome: "Pesquisa/prova — Áustria",
    produtoPai: "Preparação de Prova e Pasta Documental",
    statusDicionario: "ATIVO_SEM_PRECO_HOMOLOGADO",
    paises: ["AT"],
  },
  {
    itemId: "CA-CID-IT-001",
    nome: "Consultoria — Itália",
    produtoPai: "Diagnóstico de Cidadania por Etapas",
    statusDicionario: "ATIVO_HOMOLOGADO",
    paises: ["IT"],
  },
  {
    itemId: "CA-ARQ-999",
    nome: "Item arquivado",
    produtoPai: "Continuidade e Acervo Familiar",
    statusDicionario: "ARQUIVADO_DECISAO_PROPRIETARIA",
    paises: ["AT"],
  },
];

describe("país do caso casa com o ISO do catálogo, nas três grafias", () => {
  it("nome minúsculo, nome com acento e o próprio ISO", () => {
    expect(isoDoPais("austria")).toBe("AT");
    expect(isoDoPais("Áustria")).toBe("AT");
    expect(isoDoPais("AT")).toBe("AT");
  });

  it("rota composta casa pelo primeiro termo", () => {
    expect(isoDoPais("Áustria — administrativa (§ 58c StbG)")).toBe("AT");
  });

  it("país desconhecido não é chutado", () => {
    expect(isoDoPais("Narnia")).toBeNull();
    expect(isoDoPais(null)).toBeNull();
    expect(isoDoPais("")).toBeNull();
  });

  it("cobre os 20 países que o feed realmente tem", () => {
    expect(Object.keys(ISO_POR_PAIS)).toHaveLength(20);
    expect(new Set(Object.values(ISO_POR_PAIS)).size).toBe(20);
  });
});

describe("o seletor de SKU vem do catálogo vivo, não de lista fixa", () => {
  it("a lista estática ficou vazia — o nome inventado saiu do código", () => {
    expect(CAT_PRODUTO_SKU).toEqual([]);
    // O nome inventado só pode sobrar como comentário explicando o porquê —
    // nunca mais como `valor`/`rotulo` de uma opção oferecida pela tela.
    const arquivo = readFileSync("src/lib/parametros-catalogos.ts", "utf8");
    expect(arquivo).not.toMatch(/valor:\s*"CA-CID-AT-001/);
    expect(arquivo).not.toMatch(/rotulo:\s*"CA-CID-AT-001/);
  });

  it("grava o item_id do catálogo e rotula com o nome real do Planejador", () => {
    const o = opcoesProdutoSku(FEED, "AT", "PP-03");
    const at1 = o.find((x) => x.valor === "CA-CID-AT-001");
    expect(at1?.valor).toBe("CA-CID-AT-001");
    expect(at1?.rotulo).toBe("CA-CID-AT-001 — Consultoria e Acompanhamento de Cidadania Austríaca");
  });

  it("cascata: país do caso primeiro, nada escondido", () => {
    const o = opcoesProdutoSku(FEED, "AT", "PP-03");
    expect(o[0]!.valor.startsWith("CA-CID-AT")).toBe(true);
    expect(o.map((x) => x.valor)).toContain("CA-CID-IT-001");
  });

  it("dentro do país, o produto-pai do caso sobe", () => {
    // PP-04 = Preparação de Prova e Pasta Documental → CA-CID-AT-002 no topo.
    const o = opcoesProdutoSku(FEED, "AT", "PP-04");
    expect(o[0]!.valor).toBe("CA-CID-AT-002");
  });

  it("item arquivado por decisão da Proprietária nunca entra no seletor", () => {
    const o = opcoesProdutoSku(FEED, "AT", "PP-03");
    expect(o.map((x) => x.valor)).not.toContain("CA-ARQ-999");
  });

  it("sem país resolvido, oferece o catálogo inteiro em vez de nada", () => {
    expect(opcoesProdutoSku(FEED, null, null)).toHaveLength(3);
  });
});

describe("divergência é declarada, não corrigida sozinha", () => {
  it("o valor hoje gravado no contrato da Ana é apontado como nome não emitido", () => {
    const gravado = "CA-CID-AT-001 — Cidadania austríaca — atendimento familiar (§ 58c StbG)";
    const d = divergenciaProdutoSku(gravado, FEED);
    expect(d).toContain("CA-CID-AT-001");
    expect(d).toContain("Consultoria e Acompanhamento de Cidadania Austríaca");
  });

  it("item_id puro do catálogo não gera divergência", () => {
    expect(divergenciaProdutoSku("CA-CID-AT-001", FEED)).toBeNull();
  });

  it("código fora do catálogo é dito como tal", () => {
    expect(divergenciaProdutoSku("CA-XXX-000", FEED)).toContain("não corresponde a nenhum item vivo");
  });

  it("campo vazio não é divergência — SKU é opcional", () => {
    expect(divergenciaProdutoSku("", FEED)).toBeNull();
    expect(divergenciaProdutoSku(null, FEED)).toBeNull();
  });

  it("produto-pai do caso (PP-03) × produto-pai do item (PP-02) é declarado, não escolhido", () => {
    const d = divergenciaProdutoPai("PP-03", "CA-CID-AT-001", FEED);
    expect(d).toContain("PP-03");
    expect(d).toContain("Pesquisa Genealógica por Ramo Familiar");
    expect(d).toContain("Diagnóstico de Cidadania por Etapas");
    expect(d).toContain("Decisão da Proprietária");
  });

  it("produto-pai coerente não gera divergência", () => {
    expect(divergenciaProdutoPai("PP-02", "CA-CID-AT-001", FEED)).toBeNull();
  });
});

describe("o leitor e a tela usam o catálogo vivo", () => {
  it("o leitor anexa opcoes_vivas e divergencia_catalogo, e não grava nada", () => {
    const fn = readFileSync("src/lib/catalogo-opcoes-contrato.server.ts", "utf8");
    expect(fn).toContain('.from("planner_catalog_feed")');
    expect(fn).toContain("opcoes_vivas");
    expect(fn).toContain("divergencia_catalogo");
    expect(fn).not.toContain(".update(");
    expect(fn).not.toContain(".insert(");
  });

  it("as duas telas de parâmetro passam pelo leitor", () => {
    for (const arquivo of ["src/lib/contrato-parametros.functions.ts", "src/lib/contrato-preparar.functions.ts"]) {
      expect(readFileSync(arquivo, "utf8")).toContain("anexarOpcoesVivasDoCatalogo(");
    }
  });

  it("o seletor prefere a lista viva e mostra a divergência", () => {
    const tela = readFileSync("src/components/contrato/linha-parametro.tsx", "utf8");
    expect(tela).toContain("valor.opcoes_vivas");
    expect(tela).toContain("data-divergencia-catalogo");
  });
});
