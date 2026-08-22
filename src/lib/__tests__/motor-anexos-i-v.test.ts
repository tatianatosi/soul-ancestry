import { describe, expect, it } from "vitest";

import {
  anexoIIIAutorizacao,
  anexoIIDespesas,
  anexoIOrdemServico,
  anexoIVProcuracao,
  anexoVAlteracaoEscopo,
  anexosIaV,
  classificacaoFinanceiraDespesa,
  conflitoDeFonte,
  escopoVigenteAposAlteracao,
  fonteValidaParametro,
  gateLiberado,
  gatesBloqueados,
  modeloGeraPrevia,
  pendenciasDosAnexos,
  pesquisaExternaLiberada,
  precedencia,
  propostaSatisfazGate,
  type EntradaAnexosIaV,
  type PropostaVinculada,
} from "@/lib/anexos-i-v";
import { dicionarioAnexos } from "@/lib/anexos-dicionario";
import {
  aplicarAcaoRascunho,
  chaveRascunho,
  estadoInicial,
  impressaoDigital,
  rascunhoSatisfazGate,
  registrarEventoGovernanca,
} from "@/lib/rascunho-contratual";
import {
  CONFLITOS_TESTE,
  ENTRADA_TESTE_ANEXOS,
  anexosIaVTeste,
  gatesTeste,
  pendenciasAnexosTeste,
} from "@/lib/contrato-base-previa";

const PROPOSTA: PropostaVinculada = {
  id: "P1",
  caseId: "C1",
  estado: "aprovada",
  versao: "v1",
  produtoSku: "SKU-TESTE-000",
  produtoNome: "Produto de teste",
  fontePreco: "planilha_mestre",
  valorContratado: "R$ 0,00",
  modalidade: "Por etapas",
  formaPagamento: "Pix",
  parcelas: "3 etapas",
  primeiroVencimento: "2026-09-03",
  proximoVencimento: "2026-10-03",
  servicosIncluidos: ["Diagnóstico"],
  servicosExcluidos: ["Serviços jurídicos"],
  entregaveis: ["Relatório"],
  objetivoEtapa: "Diagnóstico inicial",
  limitesDependencias: ["Depende de documentos"],
};

const BASE: EntradaAnexosIaV = {
  caseId: "C1",
  clienteNome: "TESTE Cliente",
  responsavel: "TESTE Operações",
  dataContratacao: "2026-08-22",
  contratoBaseVersao: "v1.0",
  modelo: "MODELO-ESTUDO",
  proposta: PROPOSTA,
  politicaDespesas: "pagas_diretamente_pela_cliente",
  despesas: [],
  autorizacaoPesquisa: null,
  procuracao: null,
  alteracaoEscopo: null,
};

describe("modelo e fontes", () => {
  it("1. apenas MODELO-ESTUDO + BASE-GEN-V2 geram prévia", () => {
    expect(modeloGeraPrevia("MODELO-ESTUDO")).toBe(true);
    expect(modeloGeraPrevia("BASE-GEN-V2")).toBe(true);
    for (const m of ["CONTRATO-MAE-BRANCO", "MODELO-SIMPLES", "MODELO-2024", "", null]) {
      expect(modeloGeraPrevia(m)).toBe(false);
    }
  });

  it("13. preço não vem de WhatsApp, transcrição, template ou valor livre", () => {
    const a = anexoIOrdemServico({ ...BASE, proposta: { ...PROPOSTA, fontePreco: "whatsapp" } });
    expect(a.pendencias.join(" ")).toMatch(/fonte comercial homologada/);
    expect(a.campos.find((c) => c.rotulo.includes("Valor contratado"))?.valor).toBeNull();
    for (const f of ["whatsapp", "transcricao", "reuniao", "relato"]) expect(fonteValidaParametro(f)).toBe(false);
    expect(precedencia("planejador_homologado")).toBeLessThan(precedencia("importado_a_confirmar"));
  });

  it("14. conflito entre planejador, proposta e preenchimento humano bloqueia a transição correspondente", () => {
    const c = conflitoDeFonte({
      campo: "escopo_resumo",
      valorAtual: "A",
      origemAtual: "planejador_homologado",
      valorConcorrente: "B",
      origemConcorrente: "preenchimento_humano_confirmado",
      transicaoBloqueada: "previa_final",
    })!;
    expect(c.exigeJustificativa).toBe(true);
    const b = gatesBloqueados({
      anexos: [],
      modelo: "MODELO-ESTUDO",
      perfilInstitucionalAtivo: true,
      metodoAssinaturaConfigurado: true,
      revisorHumanoAprovado: true,
      conflitos: [c],
    });
    expect(gateLiberado("previa_final", b)).toBe(false);
    expect(gateLiberado("rascunho", b)).toBe(true);
    expect(conflitoDeFonte({ ...c, valorConcorrente: "A", valorAtual: "A" })).toBeNull();
  });
});

describe("rascunho único e snapshots", () => {
  const chave = chaveRascunho("org1", "C1", "MODELO-ESTUDO");

  it("2. salvar, confirmar e importar atualizam um único rascunho", () => {
    let e = estadoInicial();
    e = aplicarAcaoRascunho(e, { chave, conteudo: { a: 1 }, em: "t1" });
    e = aplicarAcaoRascunho(e, { chave, conteudo: { a: 2 }, em: "t2" });
    e = aplicarAcaoRascunho(e, { chave, conteudo: { a: 2 }, em: "t3" });
    expect(e.rascunhos).toHaveLength(1);
    expect(e.rascunhos[0].revisao).toBe(2);
    expect(e.snapshots).toHaveLength(0);
    expect(impressaoDigital({ a: 2, b: 1 })).toBe(impressaoDigital({ b: 1, a: 2 }));
    expect(rascunhoSatisfazGate()).toBe(false);
  });

  it("3. snapshot imutável só nasce em evento de governança", () => {
    let e = aplicarAcaoRascunho(estadoInicial(), { chave, conteudo: { a: 1 }, em: "t1" });
    e = registrarEventoGovernanca(e, {
      chave,
      evento: "salvar_campo",
      motivo: "x",
      autor: "op",
      em: "t2",
      versaoModelo: "MODELO-ESTUDO",
      perfilInstitucional: "v1.0",
    });
    expect(e.snapshots).toHaveLength(0);
    e = registrarEventoGovernanca(e, {
      chave,
      evento: "aprovacao",
      motivo: "aprovado",
      autor: "op",
      em: "t3",
      versaoModelo: "MODELO-ESTUDO",
      perfilInstitucional: "v1.0",
    });
    expect(e.snapshots).toHaveLength(1);
    expect(e.snapshots[0]).toMatchObject({ evento: "aprovacao", autor: "op", versaoModelo: "MODELO-ESTUDO" });
  });
});

describe("Anexo I — Ordem de Serviço", () => {
  it("4. exige proposta/OS aprovada do mesmo caso", () => {
    expect(propostaSatisfazGate(PROPOSTA, "C1").ok).toBe(true);
    expect(propostaSatisfazGate(PROPOSTA, "C2").ok).toBe(false);
    expect(anexoIOrdemServico({ ...BASE, proposta: null }).pendencias.length).toBeGreaterThan(0);
    expect(anexoIOrdemServico(BASE).pendencias).toEqual([]);
  });

  it("5. proposta arquivada/substituída/recusada/expirada não satisfaz gate", () => {
    for (const estado of ["arquivada", "substituida", "recusada", "expirada", "em_negociacao"]) {
      const a = anexoIOrdemServico({ ...BASE, proposta: { ...PROPOSTA, estado } });
      expect(a.gatesBloqueados).toContain("assinatura");
    }
  });

  it("6. escopo e exclusões não são inventados quando ausentes na fonte", () => {
    const a = anexoIOrdemServico({ ...BASE, proposta: { ...PROPOSTA, servicosExcluidos: null } });
    const linha = a.campos.find((c) => c.rotulo.includes("Exclusões"))!;
    expect(linha.valor).toBeNull();
    expect(linha.observacaoAusencia).toMatch(/não especificado na proposta\/OS/);
    expect(a.pendencias.join(" ")).toMatch(/revisão humana necessária/);
  });

  it("12. vencimentos não são inferidos pelo número de parcelas", () => {
    const a = anexoIOrdemServico({ ...BASE, proposta: { ...PROPOSTA, primeiroVencimento: null, proximoVencimento: null } });
    expect(a.campos.find((c) => c.rotulo.includes("Primeiro vencimento"))?.valor).toBeNull();
    expect(a.campos.find((c) => c.rotulo.includes("Próximo vencimento"))?.valor).toBeNull();
    expect(a.pendencias.join(" ")).toMatch(/não inferido pelo número de parcelas/);
  });
});

describe("Anexo II — despesas externas", () => {
  it("7. traz política institucional sem criar despesa, pagamento ou cobrança", () => {
    const a = anexoIIDespesas(BASE);
    expect(a.campos.find((c) => c.rotulo.includes("Política institucional"))?.valor).toMatch(
      /não estão incluídas nos honorários do Clube Ancestral/,
    );
    expect(a.destinos).not.toContain("portal");
    expect(JSON.stringify(a)).not.toMatch(/asaas|checkout|pix_gerado/i);
  });

  it("8. despesa externa não entra como receita/custo/reembolso padrão do Clube", () => {
    expect(classificacaoFinanceiraDespesa()).toBe("nao_contabilizavel_como_receita_ou_custo_do_clube");
    const a = anexoIIDespesas({
      ...BASE,
      despesas: [
        {
          item: "Certidão",
          finalidade: null,
          estimativa: "R$ 10",
          valorReal: null,
          estado: "estimativa_pendente",
          pagador: "clube_antecipa",
          aprovacaoRegistrada: false,
          comprovante: false,
          fonte: null,
        },
      ],
    });
    expect(a.pendencias.join(" ")).toMatch(/finalidade ausente/);
    expect(a.pendencias.join(" ")).toMatch(/exceção formal/);
    expect(a.pendencias.join(" ")).toMatch(/sem fonte rastreável/);
  });
});

describe("Anexos III, IV e V", () => {
  it("9. Anexo III não libera pesquisa externa sem aceite específico", () => {
    expect(pesquisaExternaLiberada(null)).toBe(false);
    const a = anexoIIIAutorizacao({
      ...BASE,
      autorizacaoPesquisa: {
        finalidade: "f",
        orgao: "Arquivo",
        pessoas: ["X"],
        documentos: ["Certidão"],
        temCustoExterno: false,
        tetoValor: null,
        prazoUso: "30 dias",
        aceiteRegistrado: false,
        aceiteEvidencia: null,
        orgaoExigeProcuracao: false,
        despesaVinculadaId: null,
      },
    });
    expect(a.gatesBloqueados).toContain("pesquisa_externa");
    expect(a.pendencias.join(" ")).toMatch(/Aceite específico/);
  });

  it("10. Anexo IV não cria procuração, poderes ou assinatura por inferência", () => {
    expect(anexoIVProcuracao(BASE).aplicavel).toBe(false);
    const a = anexoIVProcuracao({
      ...BASE,
      procuracao: {
        exigidaPorOrgao: true,
        tipo: null,
        finalidade: null,
        orgaoDestinatario: "Comune",
        pessoas: [],
        poderes: [],
        status: "nao_iniciada",
        revisaoJuridicaAprovada: false,
      },
    });
    expect(a.campos.find((c) => c.rotulo.includes("Poderes"))?.valor).toBeNull();
    expect(a.campos.find((c) => c.rotulo === "Status")?.valor).toBe("NAO_INICIADA");
    expect(a.gatesBloqueados).toEqual(expect.arrayContaining(["pesquisa_externa", "assinatura"]));
  });

  it("11. Anexo V não muda escopo vigente sem aceite aplicável", () => {
    const alteracao = {
      solicitada: true,
      escopoOriginalSnapshot: "Escopo A",
      alteracao: "Escopo B",
      motivo: "m",
      impactoPrazo: "sem_alteracao" as const,
      impactoFinanceiro: "novo_valor" as const,
      novoValor: "R$ 1",
      fonteNovoValor: "manual",
      aceiteRegistrado: false,
      aceiteEvidencia: null,
    };
    expect(escopoVigenteAposAlteracao("Escopo A", alteracao)).toBe("Escopo A");
    const a = anexoVAlteracaoEscopo({ ...BASE, alteracaoEscopo: alteracao });
    expect(a.pendencias.join(" ")).toMatch(/preço homologado|exceção comercial/);
    expect(a.pendencias.join(" ")).toMatch(/Aceite da Cliente não registrado/);
    expect(
      escopoVigenteAposAlteracao("Escopo A", {
        ...alteracao,
        fonteNovoValor: "planilha_mestre",
        aceiteRegistrado: true,
        aceiteEvidencia: "aceite registrado",
      }),
    ).toBe("Escopo B");
  });
});

describe("caso familiar e prévia TESTE", () => {
  it("15/16. família cria anexos estruturais e individuais, com representação só quando necessária", () => {
    const anexos = dicionarioAnexos({
      produto: "SKU-TESTE-000",
      beneficiarios: "TESTE Um || TESTE Dois",
      dependentes: "TESTE Menor (TESTE Um)",
      representacaoLegal: "Não há representação: todos maiores de idade.",
      escopoResumo: "Escopo de teste",
    });
    expect(anexos.map((a) => a.codigo)).toEqual([
      "ANX-ESCOPO",
      "ANX-PRIVACIDADE",
      "ANX-COMERCIAL",
      "ANX-INDIVIDUAL",
      "ANX-REPRESENTACAO",
    ]);
    expect(anexos.find((a) => a.codigo === "ANX-INDIVIDUAL")!.instancias).toHaveLength(2);
    expect(anexos.find((a) => a.codigo === "ANX-REPRESENTACAO")!.aplicavel).toBe(false);

    const comRep = dicionarioAnexos({
      beneficiarios: "TESTE Um",
      dependentes: "TESTE Menor (TESTE Um)",
      representacaoLegal: "TESTE Menor, menor, representado por TESTE Um para atos documentais.",
      escopoResumo: "Escopo de teste",
      produto: "SKU-TESTE-000",
    });
    expect(comRep.find((a) => a.codigo === "ANX-REPRESENTACAO")!.obrigatorio).toBe(true);
  });

  it("17. nenhuma ação de terceiro é disparada pelo motor", () => {
    const serializado = JSON.stringify(anexosIaV(BASE));
    for (const proibido of ["sendMessage", "fetch(", "asaas", "checkout", "whatsapp.send", "assinar()"]) {
      expect(serializado.toLowerCase()).not.toContain(proibido.toLowerCase());
    }
  });

  it("19. dados de teste não são fallback: exigem marcação explícita e ficam fora de caso real", () => {
    expect(ENTRADA_TESTE_ANEXOS.caseId).toMatch(/^CA-TESTE-/);
    expect(ENTRADA_TESTE_ANEXOS.clienteNome).toMatch(/^TESTE /);
  });

  it("20. prévia de teste apresenta Anexos I–V, estados, pendências e bloqueios", () => {
    const anexos = anexosIaVTeste();
    expect(anexos.map((a) => a.codigo)).toEqual([
      "ANEXO_I_ORDEM_SERVICO",
      "ANEXO_II_DESPESAS_EXTERNAS",
      "ANEXO_III_AUTORIZACAO_PESQUISA",
      "ANEXO_IV_PROCURACAO",
      "ANEXO_V_ALTERACAO_ESCOPO",
    ]);
    const pend = pendenciasAnexosTeste();
    expect(pend.length).toBeGreaterThan(5);
    for (const p of pend) {
      expect(p.motivo.length).toBeGreaterThan(5);
      expect(p.rotaResolucao).toContain("Anexos aplicáveis");
    }
    const gates = gatesTeste();
    for (const g of ["previa_final", "assinatura", "pesquisa_externa"] as const) {
      expect(gateLiberado(g, gates)).toBe(false);
    }
    expect(gateLiberado("rascunho", gates)).toBe(true);
    expect(CONFLITOS_TESTE[0].transicaoBloqueada).toBe("previa_final");
  });
});
