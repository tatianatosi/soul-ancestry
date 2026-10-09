import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { CLAUSULAS_FIXAS, CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";
import { fonteDeclarada, montarBlocosIncorporados } from "@/lib/contrato-blocos-incorporados";
import { previaVigente, previasSubstituidas, rotuloPrevia } from "@/lib/previa-vigente";

/**
 * Prévia da Ana — mecanismo único de saída (09/10/2026).
 *
 * Medido antes de escrever: as regras puras de `previa-vigente.ts` existiam
 * desde 08/10, mas só PDF e DOCX as consultavam, e nem esses dois exigiam que
 * o id fosse o da VIGENTE (a Ana tem duas prévias vivas — o rascunho de
 * trabalho e a congelada v8 —, então bastava mandar a outra). Revisão humana e
 * envio para assinatura não consultavam nada. Este arquivo trava as quatro
 * saídas no mesmo guard.
 */
const GUARD = readFileSync("src/lib/previa-vigente.server.ts", "utf8");
const PDF = readFileSync("src/lib/contrato-pdf.functions.ts", "utf8");
const DOCX = readFileSync("src/lib/contrato-docx.functions.ts", "utf8");
const PREPARAR = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");
const PARAMETROS = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");
const TELA = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

describe("prévia vigente — um guard para documento, revisão e assinatura", () => {
  it("as quatro saídas chamam o mesmo guard do servidor", () => {
    for (const [nome, fonte] of [
      ["PDF", PDF],
      ["DOCX", DOCX],
      ["revisão humana", PREPARAR],
      ["envio para assinatura", PARAMETROS],
    ] as const) {
      expect(fonte, nome).toMatch(/exigirPreviaVigenteLiberada\(/);
    }
  });

  it("nenhuma das quatro reimplementa a regra de defasagem por conta própria", () => {
    for (const [nome, fonte] of [
      ["PDF", PDF],
      ["DOCX", DOCX],
    ] as const) {
      expect(fonte, nome).not.toMatch(/motivoBloqueioSaida\(/);
    }
  });

  it("o guard recusa id de prévia que não é a vigente, dizendo qual é", () => {
    expect(GUARD).toMatch(/args\.previaId !== vigente\.id/);
    expect(GUARD).toMatch(/foi substituída pela vigente/);
  });

  it("o guard nomeia a ação recusada — documento, revisão ou assinatura", () => {
    for (const saida of ["documento", "revisao", "assinatura"]) {
      expect(GUARD).toContain(`${saida}:`);
    }
  });

  it("defasagem só conta parâmetro COM valor: linha semeada vazia não trava a saída", () => {
    expect(GUARD).toMatch(/\.not\("valor", "is", null\)/);
  });

  it("o guard lê apenas prévias vivas da própria ficha e da própria organização", () => {
    expect(GUARD).toMatch(/\.eq\("parameters_id", args\.parametersId\)/);
    expect(GUARD).toMatch(/\.eq\("organization_id", args\.organizationId\)/);
    expect(GUARD).toMatch(/\.is\("archived_at", null\)/);
  });
});

describe("prévia arquivada nunca é vigente — regra no código, não só no comentário", () => {
  const base = { id: "a", versao: 8, estado: "congelado", congelado_em: "2026-10-09T13:39:16Z" };

  it("linha arquivada é ignorada mesmo quando é a de maior versão", () => {
    const vigente = previaVigente([
      { ...base, id: "nova-mas-arquivada", versao: 9, archived_at: "2026-10-09T14:00:00Z" },
      base,
    ]);
    expect(vigente?.id).toBe("a");
  });

  it("todas arquivadas = nenhuma vigente (não devolve substituída como se valesse)", () => {
    expect(previaVigente([{ ...base, archived_at: "2026-10-09T14:00:00Z" }])).toBeNull();
  });

  it("o rascunho de trabalho continua prevalecendo sobre a congelada", () => {
    const vigente = previaVigente([
      base,
      { id: "rascunho", versao: 0, estado: "rascunho_editavel", updated_at: "2026-10-09T13:39:16Z" },
    ]);
    expect(vigente?.id).toBe("rascunho");
    expect(previasSubstituidas([base, { id: "rascunho", versao: 0, estado: "rascunho_editavel" }]).map((p) => p.id)).toEqual(["a"]);
  });
});

describe("congelar substitui as congeladas anteriores — sem apagar", () => {
  it("o congelamento arquiva as congeladas vivas e preserva a linha", () => {
    expect(PARAMETROS).toMatch(/archive_reason: `Substituída pela versão \$\{nova\.versao\}/);
    expect(PARAMETROS).toMatch(/\.eq\("estado", "congelado"\)/);
    expect(PARAMETROS).toMatch(/\.neq\("id", nova\.id\)/);
  });

  it("nunca apaga prévia e nunca arquiva o rascunho de trabalho", () => {
    expect(PARAMETROS).not.toMatch(/from\("contract_parameter_previews"\)\s*\n\s*\.delete\(\)/);
    const bloco = PARAMETROS.slice(PARAMETROS.indexOf("as antigas ficam marcadas como substituídas"));
    expect(bloco.slice(0, 1200)).not.toMatch(/rascunho_editavel/);
  });

  it("a substituição vira registro de auditoria com as versões envolvidas", () => {
    expect(PARAMETROS).toMatch(/acao: "previas_substituidas_por_versao_nova"/);
    expect(PARAMETROS).toMatch(/versao_vigente: nova\.versao/);
  });
});

describe("cabeçalho da prévia — data e versão do modelo", () => {
  it("o modelo vigente é o v2.0 com 16 cláusulas", () => {
    expect(CONTRATO_BASE_VERSAO).toBe("v2.0");
    expect(CLAUSULAS_FIXAS.length).toBe(16);
  });

  it("o rótulo traz modelo, nº de cláusulas, estado e data de geração", () => {
    const texto = rotuloPrevia(
      { id: "x", versao: 8, estado: "congelado", congelado_em: "2026-10-09T13:39:16Z" },
      CONTRATO_BASE_VERSAO,
      CLAUSULAS_FIXAS.length,
    );
    expect(texto).toContain("Modelo v2.0");
    expect(texto).toContain("16 cláusulas");
    expect(texto).toContain("v8");
    expect(texto).toMatch(/gerada em \d{2}\/\d{2}\/\d{4}/);
  });

  it("a tela imprime esse cabeçalho e o motivo do bloqueio", () => {
    expect(TELA).toMatch(/data-previa-cabecalho/);
    expect(TELA).toMatch(/data-previa-bloqueio/);
    expect(TELA).toMatch(/rotuloPrevia\(previaAtual, CONTRATO_BASE_VERSAO, CLAUSULAS_FIXAS\.length\)/);
  });

  it("tela, PDF e DOCX leem a MESMA prévia — a vigente, nunca a primeira da lista", () => {
    expect(TELA).toMatch(/onClick=\{\(\) => mVer\.mutate\(previaAtual\.id\)\}/);
    expect(TELA).not.toMatch(/mVer\.mutate\(\(rascunhoAtual \?\? listaOpcional<any>\(d\.previas\)\[0\]\)\.id\)/);
    expect(TELA).toMatch(/BaixarPdfContrato previaId=\{bloqueioPrevia \? null : \(previaAtual\?\.id \?\? null\)\}/);
  });

  it("o histórico lista as substituídas em vez de esconder (substituir não é apagar)", () => {
    expect(PREPARAR).toMatch(/previasHistorico/);
    expect(TELA).toMatch(/previasHistorico/);
    expect(TELA).toMatch(/· substituída/);
    expect(TELA).toMatch(/p\.archive_reason/);
  });
});

describe("origem declarada no documento vem do dado, não de literal", () => {
  it("objeto do caso declara a origem gravada no parâmetro", () => {
    expect(
      fonteDeclarada(
        { objeto_contrato: { origem: "proposta", detalhe: "Deck Canva da proposta, página 2" } },
        "objeto_contrato",
        "CRM confirmado",
      ),
    ).toBe("proposta aprovada — Deck Canva da proposta, página 2");
  });

  it("sem origem registrada cai no texto de reserva, nunca inventa procedência", () => {
    expect(fonteDeclarada({}, "objeto_contrato", "CRM confirmado")).toBe("CRM confirmado");
    expect(fonteDeclarada(undefined, "objeto_contrato", "CRM confirmado")).toBe("CRM confirmado");
  });

  it("o bloco de qualificação e o de objeto usam a origem declarada", () => {
    const blocos = montarBlocosIncorporados({
      pessoas: [],
      contratadaQualificacao: "TATIANA MELANI TOSI – ME",
      objeto: "Estudo genealógico e assessoria de cidadania austríaca",
      paisRota: null,
      escopoResumo: null,
      servicosIncluidos: null,
      servicosExcluidos: null,
      fasesEntregas: null,
      prazosReferencia: null,
      despesasExternas: null,
      total: null,
      moeda: "BRL",
      formaPagamento: null,
      parcelas: null,
      vencimentos: null,
      propostaReferencia: null,
      regraDespesasInstitucional: "",
      origens: {
        objeto_contrato: { origem: "proposta", detalhe: "Deck Canva da proposta, página 2" },
        contratada_qualificacao: { origem: "preenchimento_humano", detalhe: null },
      },
    });
    const objeto = blocos.find((b) => b.chave === "objeto_do_caso");
    expect(objeto?.linhas.find((l) => l.rotulo === "Objeto do caso")?.fonte).toContain("proposta aprovada");
    const qualificacao = blocos.find((b) => b.chave === "qualificacao");
    expect(qualificacao?.linhas.find((l) => l.rotulo === "Contratada")?.fonte).toBe(
      "preenchimento humano registrado",
    );
  });
});
