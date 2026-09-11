import { describe, expect, it } from "vitest";

import {
  CAMPOS_COMPLEMENTAVEIS_PELA_PROPOSTA,
  complementoPropostaPermitido,
  conflitoPlanejadorProposta,
  despesaTerceiroNoCaixaDoClube,
  edicaoInstitucionalPermitida,
  perfilInstitucionalRenderizado,
  precoDeFonteHomologada,
  skuPodeGerarValor,
  vencimentoInferido,
} from "@/lib/perfil-institucional";
import {
  CLAUSULAS_MATRIZ,
  IDS_CLAUSULAS,
  avaliarMatrizClausulas,
  clausulaEditavelPorCaso,
  estruturaContratoFamiliar,
  financeiroLiberado,
  previaFinalLiberada,
} from "@/lib/matriz-clausulas";
import {
  CONFLITOS_TESTE,
  ENTRADA_TESTE_ANEXOS,
  anexosIaVTeste,
  estruturaFamiliarTeste,
  gatesTeste,
  matrizClausulasTeste,
  previaFinalTeste,
} from "@/lib/contrato-base-previa";
import { anexosIaV, modeloGeraPrevia } from "@/lib/anexos-i-v";

const base = {
  entradaAnexos: ENTRADA_TESTE_ANEXOS,
  anexos: anexosIaVTeste(),
  conflitos: CONFLITOS_TESTE,
  politicaPrivacidadeVigente: false,
  foroConfigurado: false,
  metodoAssinaturaConfigurado: false,
  revisaoJuridicaAprovada: false,
};

describe("Motor contratual institucional", () => {
  it("1. perfil institucional renderiza sem dado pessoal da titular", () => {
    const p = perfilInstitucionalRenderizado();
    expect(p.violacoes).toHaveLength(0);
    const texto = p.campos.map((c) => c.valor).join(" ");
    expect(texto).toContain("TATIANA MELANI TOSI – ME");
    expect(texto).toContain("10.448.812/0001-58");
    expect(texto).not.toMatch(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/);
    expect(texto).not.toMatch(/\(?\d{2}\)?\s?9\d{4}-?\d{4}/);
  });

  it("2. dados institucionais não são editáveis dentro do caso", () => {
    expect(edicaoInstitucionalPermitida("caso").permitido).toBe(false);
    expect(
      edicaoInstitucionalPermitida("administrativo", { perfilAutorizado: true, motivo: "x" })
        .permitido,
    ).toBe(false);
    expect(
      edicaoInstitucionalPermitida("administrativo", {
        perfilAutorizado: true,
        motivo: "correção cadastral",
        vigenciaAte: "2026-12-31",
        autor: "admin",
        registradoEmAuditoria: true,
      }).permitido,
    ).toBe(true);
  });

  it("3. MODELO-ESTUDO e BASE-GEN-V2 são os únicos geradores permitidos", () => {
    expect(modeloGeraPrevia("MODELO-ESTUDO")).toBe(true);
    expect(modeloGeraPrevia("BASE-GEN-V2")).toBe(true);
    expect(modeloGeraPrevia("MODELO-HISTORICO-2024")).toBe(false);
    expect(modeloGeraPrevia("")).toBe(false);
    expect(modeloGeraPrevia(null)).toBe(false);
  });

  it("4. modelo histórico/folha em branco é recusado no gate de prévia", () => {
    const r = previaFinalLiberada({ modelo: "", linhas: [], bloqueiosGates: [] });
    expect(r.liberada).toBe(false);
    expect(r.motivos.join(" ")).toContain("Modelo não permitido");
  });

  it("5. matriz contém todas as cláusulas A–R (Q e R adicionadas em 07/09/2026: inadimplemento e rescisão)", () => {
    expect(IDS_CLAUSULAS).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
    ]);
    expect(matrizClausulasTeste()).toHaveLength(18);
  });

  it("6. cláusula fixa não é editável por caso", () => {
    for (const c of CLAUSULAS_MATRIZ) {
      expect(clausulaEditavelPorCaso(c.id)).toBe(c.tipo !== "fixa");
    }
    expect(clausulaEditavelPorCaso("G")).toBe(false);
  });

  it("7. proposta de outro caso, arquivada ou substituída bloqueia objeto e escopo", () => {
    for (const cenario of [
      { estado: "aprovada" as const, caseId: "OUTRO-CASO" },
      { estado: "arquivada" as const, caseId: ENTRADA_TESTE_ANEXOS.caseId },
      { estado: "substituida" as const, caseId: ENTRADA_TESTE_ANEXOS.caseId },
    ]) {
      const entrada = {
        ...ENTRADA_TESTE_ANEXOS,
        proposta: { ...ENTRADA_TESTE_ANEXOS.proposta!, ...cenario },
      };
      const linhas = avaliarMatrizClausulas({
        ...base,
        modelo: "MODELO-ESTUDO",
        entradaAnexos: entrada,
        anexos: anexosIaV(entrada),
      });
      expect(linhas.find((l) => l.id === "C")!.status).toBe("bloqueante");
      expect(linhas.find((l) => l.id === "D")!.status).toBe("bloqueante");
    }
  });

  it("8. preço de template/WhatsApp/transcrição não é aceito", () => {
    for (const f of [
      "template",
      "whatsapp",
      "transcricao",
      "preenchimento_humano_confirmado",
      null,
    ]) {
      expect(precoDeFonteHomologada(f)).toBe(false);
    }
    expect(precoDeFonteHomologada("product_catalog")).toBe(true);
    expect(precoDeFonteHomologada("planilha_mestre")).toBe(false);
    const entrada = {
      ...ENTRADA_TESTE_ANEXOS,
      proposta: { ...ENTRADA_TESTE_ANEXOS.proposta!, fontePreco: "whatsapp" },
    };
    const linhas = avaliarMatrizClausulas({
      ...base,
      modelo: "MODELO-ESTUDO",
      entradaAnexos: entrada,
      anexos: anexosIaV(entrada),
    });
    expect(linhas.find((l) => l.id === "I")!.status).toBe("bloqueante");
  });

  it("9. SKU sem preço/condição homologados não gera valor", () => {
    expect(
      skuPodeGerarValor({
        sku: "SKU-1",
        precoHomologado: null,
        condicaoHomologada: "à vista",
        fonte: "product_catalog",
      }).ok,
    ).toBe(false);
    expect(
      skuPodeGerarValor({
        sku: "SKU-1",
        precoHomologado: "R$ 1",
        condicaoHomologada: null,
        fonte: "product_catalog",
      }).ok,
    ).toBe(false);
    expect(
      skuPodeGerarValor({
        sku: "SKU-1",
        precoHomologado: "R$ 1",
        condicaoHomologada: "à vista",
        fonte: "product_catalog",
      }).ok,
    ).toBe(true);
    expect(
      skuPodeGerarValor({
        sku: "SKU-1",
        precoHomologado: "R$ 1",
        condicaoHomologada: "à vista",
        fonte: "planilha_mestre",
      }).ok,
    ).toBe(false);
  });

  it("10. despesa de terceiro é segregada de caixa e cobrança do Clube", () => {
    expect(despesaTerceiroNoCaixaDoClube()).toBe(false);
    const j = matrizClausulasTeste().find((l) => l.id === "J")!;
    expect(j.fonte).toBe("anx_comercial");
    expect(j.status).not.toBe("presente");
  });

  it("11. vencimento ausente permanece pendente sem inferência", () => {
    expect(vencimentoInferido()).toBeNull();
    const entrada = {
      ...ENTRADA_TESTE_ANEXOS,
      proposta: {
        ...ENTRADA_TESTE_ANEXOS.proposta!,
        primeiroVencimento: null,
        parcelas: "3 etapas",
      },
    };
    const i = avaliarMatrizClausulas({
      ...base,
      modelo: "MODELO-ESTUDO",
      entradaAnexos: entrada,
      anexos: anexosIaV(entrada),
    }).find((l) => l.id === "I")!;
    expect(i.status).toBe("pendente");
    expect(i.motivo).toContain("não inferido");
  });

  it("12. conflito Planejador x proposta bloqueia avanço e não sobrescreve", () => {
    const c = conflitoPlanejadorProposta({
      campo: "valor_total",
      planejador: "R$ 1.290",
      proposta: "R$ 990",
    });
    expect(c.conflito).toBe(true);
    expect(c.motivo).toContain("nenhum valor é sobrescrito");
    const entrada = ENTRADA_TESTE_ANEXOS;
    const linhas = avaliarMatrizClausulas({
      ...base,
      modelo: "MODELO-ESTUDO",
      entradaAnexos: entrada,
      conflitos: [
        {
          campo: "valor_total",
          motivo: "Divergência de valor entre Planejador e proposta.",
          valorAtual: "R$ 1.290",
          origemAtual: "planejador_homologado",
          valorConcorrente: "R$ 990",
          origemConcorrente: "proposta_os",
          transicaoBloqueada: "previa_final",
        } as never,
      ],
    });
    expect(linhas.find((l) => l.id === "I")!.status).toBe("conflito");
  });

  it("13. proposta só complementa campos permitidos quando o Planejador não tem valor", () => {
    expect(CAMPOS_COMPLEMENTAVEIS_PELA_PROPOSTA).toHaveLength(7);
    expect(
      complementoPropostaPermitido({ campo: "valor_total_aprovado", planejadorTemValor: false })
        .permitido,
    ).toBe(true);
    expect(
      complementoPropostaPermitido({ campo: "valor_total_aprovado", planejadorTemValor: true })
        .permitido,
    ).toBe(false);
    expect(
      complementoPropostaPermitido({ campo: "escopo_resumo", planejadorTemValor: false }).permitido,
    ).toBe(false);
    expect(
      complementoPropostaPermitido({ campo: "regra_despesas_externas", planejadorTemValor: false })
        .permitido,
    ).toBe(false);
    expect(
      complementoPropostaPermitido({
        campo: "regra_despesas_externas",
        planejadorTemValor: false,
        declaradoExpressamente: true,
      }).permitido,
    ).toBe(true);
  });

  it("14. prévia final da TESTE fica bloqueada e assinatura/financeiro seguem fechados", () => {
    const r = previaFinalTeste();
    expect(r.liberada).toBe(false);
    expect(r.motivos.length).toBeGreaterThan(0);
    expect(gatesTeste().some((g) => g.gate === "assinatura")).toBe(true);
    expect(financeiroLiberado(null)).toBe(false);
    expect(
      financeiroLiberado({
        assinadoEm: "2026-08-22",
        origem: "assinatura_externa",
        referencia: null,
      }),
    ).toBe(false);
    expect(
      financeiroLiberado({
        assinadoEm: "2026-08-22",
        origem: "assinatura_externa",
        referencia: "REF-1",
      }),
    ).toBe(true);
  });

  it("15. caso familiar: adultos signatários, menor não signatário, representação condicional", () => {
    const f = estruturaFamiliarTeste();
    expect(f.signatarios).toEqual(["TESTE Requerente Um", "TESTE Requerente Dois"]);
    expect(f.naoSignatarios).toEqual(["TESTE Dependente Menor"]);
    expect(f.anexosIndividuais).toHaveLength(2);
    expect(f.representacaoAplicavel).toBe(true);
    expect(f.contratosParalelos).toBe(0);

    const semMenorComRepresentacao = estruturaContratoFamiliar([
      { nome: "Adulto", maiorIdade: true, requerente: true, aplicavel: true },
      { nome: "Menor", maiorIdade: false, requerente: true, aplicavel: true },
    ]);
    expect(semMenorComRepresentacao.representacaoAplicavel).toBe(false);
  });

  it("16. nenhuma assinatura, cobrança, portal, pesquisa externa ou comunicação é criada", () => {
    const gates = gatesTeste().map((g) => g.gate);
    for (const g of ["assinatura", "financeiro", "pesquisa_externa"]) expect(gates).toContain(g);
    const modulo = JSON.stringify({ matriz: matrizClausulasTeste(), previa: previaFinalTeste() });
    expect(modulo).not.toMatch(/assinado_em|cobranca_emitida|portal_convite|disparo_enviado/);
  });
});
