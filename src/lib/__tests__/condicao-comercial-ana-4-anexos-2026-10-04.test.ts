import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  condicaoVigente,
  conferirCondicao,
  instanciasDeCobertura,
  lacunasDeCobertura,
  type CondicaoComercialCaso,
} from "@/lib/condicao-comercial-caso";
import {
  ANEXOS_CANONICOS,
  DE_PARA_ANEXOS_DUPLICADOS,
  anexosARetirar,
  anexosQuePermanecem,
} from "@/lib/anexos-de-para-duplicidade";

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
 * A condição é: total R$ 9.600, rateado **igualitariamente** entre os três
 * adultos — R$ 3.200 cada, em 3 assinaturas de R$ 320 × 10 meses; Felipe
 * dependente representado, sem acréscimo.
 *
 * 23/10/2026 — correção da Proprietária, reafirmando decisão já aprovada
 * várias vezes. A redação anterior deste comentário registrava valores
 * desiguais por pessoa (Ana R$ 4.800, pai R$ 2.400, irmã R$ 2.400), lidos da
 * extração das páginas 4 e 6: aquilo era dimensionamento técnico interno de
 * horas, não a obrigação de cada contratante. O total sempre foi o mesmo.
 *
 * O dado de produção foi corrigido no mesmo dia, no banco do Lovable Cloud
 * (projeto Ancestral Canvas), pela migration
 * `20261023140000_rateio_igualitario_condicao_ana.sql`: a versão 3 nasceu
 * aprovada com os três em R$ 3.200,00 e a versão 2 passou a `substituida`,
 * preservada com a composição antiga. Por isso o fixture abaixo acompanha o
 * estado real — R$ 3.200,00 por adulto. Os escopos não mudaram: continuam
 * descrevendo quem carrega o dossiê-base e quem o aproveita.
 */

const ANA: CondicaoComercialCaso = {
  id: "c1",
  caseId: "a11a0000-0000-4000-8000-000000000002",
  propostaId: "p1",
  propostaReferencia: "DECK-CANVA-CA-CID-AT-FAM-2026-001-v1 (páginas 1–7 extraídas)",
  versao: 1,
  itens: [
    { parte: "Ana Luiza Gomes Silveira Rodrigues", valor: 3200, escopo: "Pesquisa histórica, dossiê-base e declaração individual" },
    { parte: "Adair Pinto Silveira Júnior", valor: 3200, escopo: "Elo documental direto e declaração própria" },
    { parte: "Alice Gomes Silveira", valor: 3200, escopo: "Certidões pessoais e declaração própria" },
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

/**
 * Correção de 04/10/2026, instrução da Proprietária: "o correto é anexo de I
 * até V; revise que os demais são cópias dos mesmos". Eu havia criado Anexos
 * A–D por parte contratante — duplicata de terceiro nível, porque
 * `anexos-dicionario.ts` já gerava instância por titular. O de-para mede o
 * que cada cópia repetia e o que já a cobria.
 */
describe("a família canônica é Anexo I a V, e só ela", () => {
  it("são exatamente cinco, com I e II obrigatórios", () => {
    expect(ANEXOS_CANONICOS).toHaveLength(5);
    expect(anexosQuePermanecem()).toEqual([
      "ANEXO_I_ORDEM_SERVICO",
      "ANEXO_II_DESPESAS_EXTERNAS",
      "ANEXO_III_AUTORIZACAO_PESQUISA",
      "ANEXO_IV_PROCURACAO",
      "ANEXO_V_ALTERACAO_ESCOPO",
    ]);
    expect(ANEXOS_CANONICOS.filter((a) => a.obrigatorio).map((a) => a.codigo)).toEqual([
      "ANEXO_I_ORDEM_SERVICO",
      "ANEXO_II_DESPESAS_EXTERNAS",
    ]);
  });

  it("cada duplicata diz o que a cobre: cláusula do contrato, anexo I–V ou a proposta", () => {
    for (const l of DE_PARA_ANEXOS_DUPLICADOS) {
      expect(l.clausulasQueCobrem.length + l.anexosQueCobrem.length).toBeGreaterThan(0);
      expect(l.decisao.length).toBeGreaterThan(40);
    }
  });

  it("escopo e comercial eram cópia de cláusula do contrato-base", () => {
    const escopo = DE_PARA_ANEXOS_DUPLICADOS.find((l) => l.codigo === "ANX-ESCOPO")!;
    expect(escopo.clausulasQueCobrem.map((c) => c.numero)).toEqual([3, 10]);
    const comercial = DE_PARA_ANEXOS_DUPLICADOS.find((l) => l.codigo === "ANX-COMERCIAL")!;
    expect(comercial.clausulasQueCobrem.map((c) => c.numero)).toEqual([8, 9]);
    expect(comercial.anexosQueCobrem).toContain("ANEXO_II_DESPESAS_EXTERNAS");
  });

  it("individual não era anexo novo: vira instância do Anexo I", () => {
    const ind = DE_PARA_ANEXOS_DUPLICADOS.find((l) => l.codigo === "ANX-INDIVIDUAL")!;
    expect(ind.veredicto).toBe("VIRA_INSTANCIA");
    expect(ind.anexosQueCobrem).toEqual(["ANEXO_I_ORDEM_SERVICO"]);
    expect(ind.decisao).toContain("instância do Anexo I");
  });

  it("os Anexos A–D que eu criei estão na lista de retirados, com motivo", () => {
    const meus = ["ANEXO_A_ANA_LUIZA", "ANEXO_B_ADAIR", "ANEXO_C_ALICE", "ANEXO_D_FINANCEIRO"];
    for (const c of meus) {
      const l = DE_PARA_ANEXOS_DUPLICADOS.find((x) => x.codigo === c)!;
      expect(l.veredicto).toBe("DUPLICATA_DE_ANEXO");
    }
    const retirar = anexosARetirar().map((r) => r.codigo);
    for (const c of meus) expect(retirar).toContain(c);
    expect(retirar).toHaveLength(9);
  });

  it("nenhum código canônico aparece na lista de retirada", () => {
    const retirar = anexosARetirar().map((r) => r.codigo);
    for (const c of anexosQuePermanecem()) expect(retirar).not.toContain(c);
  });
});

describe("cobertura por requerente — instância do Anexo I", () => {
  const instancias = instanciasDeCobertura(ANA, [
    { nome: "Felipe", representadoPor: "Ana Luiza Gomes Silveira Rodrigues" },
  ]);

  it("uma instância por titular com valor; o menor entra na do representante", () => {
    expect(instancias).toHaveLength(3);
    expect(instancias[0]!.chave).toBe("ANEXO_I_ORDEM_SERVICO::Ana Luiza Gomes Silveira Rodrigues");
    expect(instancias[0]!.dependentesRepresentados).toContain("Felipe");
    expect(instancias.some((i) => i.parte === "Felipe")).toBe(false);
  });

  it("sem Anexo I registrado, a lacuna é o próprio Anexo I", () => {
    const lacunas = lacunasDeCobertura([], instancias);
    expect(lacunas).toHaveLength(1);
    expect(lacunas[0]).toContain("Anexo I");
  });

  it("com Anexo I registrado mas sem instâncias, cada pessoa aparece como lacuna", () => {
    expect(lacunasDeCobertura(["ANEXO_I_ORDEM_SERVICO"], instancias)).toHaveLength(3);
  });

  it("com todas as instâncias registradas, não há lacuna", () => {
    const todas = ["ANEXO_I_ORDEM_SERVICO", ...instancias.map((i) => i.chave)];
    expect(lacunasDeCobertura(todas, instancias)).toEqual([]);
  });
});

describe("a tela e o escritor ficaram ligados — nada de peça órfã", () => {
  it("o painel está montado em Caso 360", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(rota).toContain("<CondicaoComercialVersionada caseId={id} />");
  });

  it("o leitor expõe condição vigente, conferência, canônicos, instâncias e duplicidades", () => {
    const fn = readFileSync("src/lib/condicao-comercial-caso.functions.ts", "utf8");
    for (const chave of [
      "vigente",
      "conferencia",
      "anexosCanonicos",
      "duplicidadesRetiradas",
      "instancias",
      "anexosRegistrados",
      "lacunasDeCobertura",
    ]) {
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
