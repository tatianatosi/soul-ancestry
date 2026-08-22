/**
 * P0 — Motor contratual executável: contrato-base + Anexos I–V.
 * Os 20 testes obrigatórios da rodada, sobre dados fictícios de TESTE.
 */

import { describe, expect, it } from "vitest";

import {
  anexoIOrdemServico,
  anexoIIDespesas,
  anexoIIIAutorizacao,
  anexoIVProcuracao,
  anexoVAlteracaoEscopo,
  anexosIaV,
  atividadeExternaComProcuracaoLiberada,
  classificacaoFinanceiraDespesa,
  conflitoDeFonte,
  escopoVigenteAposAlteracao,
  gatesBloqueados,
  MARCA_RASCUNHO,
  modeloGeraPrevia,
  pesquisaExternaLiberada,
  propostaSatisfazGate,
  type EntradaAnexosIaV,
} from "@/lib/anexos-i-v";
import {
  aplicarAcaoRascunho,
  chaveRascunho,
  estadoInicial,
  registrarEventoGovernanca,
  rascunhoSatisfazGate,
} from "@/lib/rascunho-contratual";
import { estruturaContratoFamiliar } from "@/lib/matriz-clausulas";
import {
  ENTRADA_TESTE_ANEXOS,
  MARCA_PREVIA_TESTE,
  anexosIaVTeste,
  estruturaFamiliarTeste,
  gatesTeste,
  matrizClausulasTeste,
  matrizRenderizacaoPreviaTeste,
  previaTesteAssinavel,
} from "@/lib/contrato-base-previa";
import { precoDeFonteHomologada, estadoMetodoAssinatura } from "@/lib/perfil-institucional";
import { filtrarClientes, type PessoaLista } from "@/lib/clientes-lista";
import { ANEXOS_FAMILIARES } from "@/lib/matriz-aceite";

const clone = (): EntradaAnexosIaV => JSON.parse(JSON.stringify(ENTRADA_TESTE_ANEXOS)) as EntradaAnexosIaV;

describe("P0 — motor contratual executável", () => {
  it("1. apenas MODELO-ESTUDO + BASE-GEN-V2 geram prévia", () => {
    expect(modeloGeraPrevia("MODELO-ESTUDO")).toBe(true);
    expect(modeloGeraPrevia("BASE-GEN-V2")).toBe(true);
    for (const m of ["Contrato-Mãe em branco", "Modelo Simples", "Modelo 2024", null, ""]) {
      expect(modeloGeraPrevia(m)).toBe(false);
    }
  });

  it("2. salvar, confirmar e importar atualizam um único rascunho", () => {
    const chave = chaveRascunho("ORG-TESTE", "CA-TESTE-000", "MODELO-ESTUDO");
    let estado = estadoInicial();
    estado = aplicarAcaoRascunho(estado, { chave, conteudo: { a: 1 }, em: "2026-01-01T10:00:00Z" });
    estado = aplicarAcaoRascunho(estado, { chave, conteudo: { a: 2 }, em: "2026-01-01T11:00:00Z" });
    estado = aplicarAcaoRascunho(estado, { chave, conteudo: { a: 2 }, em: "2026-01-01T12:00:00Z" });
    expect(estado.rascunhos).toHaveLength(1);
    expect(estado.rascunhos[0]!.revisao).toBe(2);
    expect(rascunhoSatisfazGate()).toBe(false);
    expect(MARCA_RASCUNHO).toContain("NÃO APTO PARA ASSINATURA");
  });

  it("3. snapshot imutável só nasce em evento de governança", () => {
    const chave = chaveRascunho("ORG-TESTE", "CA-TESTE-000", "MODELO-ESTUDO");
    let estado = aplicarAcaoRascunho(estadoInicial(), { chave, conteudo: { a: 1 }, em: "2026-01-01T10:00:00Z" });
    const base = { chave, motivo: "teste", autor: "TESTE", em: "2026-01-02T10:00:00Z", versaoModelo: "MODELO-ESTUDO", perfilInstitucional: "v1" };
    estado = registrarEventoGovernanca(estado, { ...base, evento: "salvar_campo" });
    expect(estado.snapshots).toHaveLength(0);
    estado = registrarEventoGovernanca(estado, { ...base, evento: "revisao_solicitada" });
    estado = registrarEventoGovernanca(estado, { ...base, evento: "revisao_solicitada" });
    expect(estado.snapshots).toHaveLength(1);
  });

  it("4. Anexo I exige proposta/OS aprovada do mesmo caso", () => {
    const e = clone();
    expect(propostaSatisfazGate(e.proposta!, e.caseId).ok).toBe(true);
    const outroCaso = { ...e, proposta: { ...e.proposta!, caseId: "CA-OUTRO-999" } };
    expect(propostaSatisfazGate(outroCaso.proposta, e.caseId).ok).toBe(false);
    expect(anexoIOrdemServico({ ...e, proposta: null }).gatesBloqueados).toContain("assinatura");
  });

  it("5. proposta arquivada/substituída/recusada/expirada não satisfaz gate", () => {
    const e = clone();
    for (const estado of ["arquivada", "substituida", "recusada", "expirada"] as const) {
      const r = propostaSatisfazGate({ ...e.proposta!, estado }, e.caseId);
      expect(r.ok).toBe(false);
      expect(anexoIOrdemServico({ ...e, proposta: { ...e.proposta!, estado } }).gatesBloqueados).toContain("previa_final");
    }
  });

  it("6. escopo e exclusões não são inventados quando ausentes na fonte", () => {
    const anexo = anexoIOrdemServico(clone());
    const exclusoes = anexo.campos.find((c) => c.rotulo.startsWith("1.1"))!;
    expect(exclusoes.valor).toBeNull();
    expect(exclusoes.observacaoAusencia).toContain("não especificado na proposta/OS");
    expect(anexo.pendencias.join(" ")).toContain("revisão humana necessária");
  });

  it("7. Anexo II traz política institucional sem criar despesa, pagamento ou cobrança", () => {
    const anexo = anexoIIDespesas(clone());
    const texto = JSON.stringify(anexo).toLowerCase();
    expect(texto).not.toMatch(/checkout|asaas|pix gerado|cobran[çc]a criada|pagamento realizado/);
    expect(anexo.destinos).not.toContain("financeiro_cobranca");
    expect(texto).toMatch(/aprova/);
    expect(texto).toMatch(/despesas de terceiros/);
  });

  it("8. despesa externa não entra como receita/custo/reembolso padrão do Clube", () => {
    expect(classificacaoFinanceiraDespesa()).toBe("nao_contabilizavel_como_receita_ou_custo_do_clube");
  });

  it("9. Anexo III não cria pesquisa externa sem aceite específico", () => {
    const e = clone();
    expect(pesquisaExternaLiberada(e.autorizacaoPesquisa!)).toBe(false);
    const anexo = anexoIIIAutorizacao(e);
    expect(anexo.gatesBloqueados).toContain("pesquisa_externa");
    const comAceite = {
      ...e.autorizacaoPesquisa!,
      aceiteRegistrado: true,
      aceiteEvidencia: "EVID-TESTE",
      prazoUso: "2026-12-31",
      tetoValor: "R$ 0,00",
      responsavelInterno: "TESTE Operações",
      despesaVinculadaId: "ANEXO-II-TESTE-1",
    };
    expect(pesquisaExternaLiberada({ ...comAceite, orgaoExigeProcuracao: false })).toBe(true);
  });

  it("10. Anexo IV não cria procuração, poderes ou assinatura por inferência", () => {
    const e = clone();
    const anexo = anexoIVProcuracao(e);
    expect(anexo.campos.find((c) => /poderes/i.test(c.rotulo))?.valor ?? null).toBeNull();
    expect(atividadeExternaComProcuracaoLiberada(e.procuracao!)).toBe(false);
    expect(anexo.estado).not.toBe("aprovado");
  });

  it("11. Anexo V não muda escopo vigente sem aceite aplicável", () => {
    const e = clone();
    const anexo = anexoVAlteracaoEscopo(e);
    expect(anexo.pendencias.join(" ")).toMatch(/aceite/i);
    expect(escopoVigenteAposAlteracao("Escopo vigente", e.alteracaoEscopo!)).toBe("Escopo vigente");
  });

  it("12. vencimentos não são inferidos pelo número de parcelas", () => {
    const anexo = anexoIOrdemServico(clone());
    const primeiro = anexo.campos.find((c) => c.rotulo.startsWith("4.4"))!;
    expect(primeiro.valor).toBeNull();
    expect(primeiro.observacaoAusencia).toContain("não inferido pelo número de parcelas");
  });

  it("13. preço não vem de WhatsApp, transcrição, template ou valor livre", () => {
    for (const f of ["whatsapp", "transcricao", "template", "manual", null]) expect(precoDeFonteHomologada(f)).toBe(false);
    for (const f of ["planilha_mestre", "planejador_homologado", "sku_homologado"]) expect(precoDeFonteHomologada(f)).toBe(true);
    const e = clone();
    const anexo = anexoIOrdemServico({ ...e, proposta: { ...e.proposta!, fontePreco: "whatsapp" } });
    expect(anexo.campos.find((c) => c.rotulo.startsWith("4.1"))!.valor).toBeNull();
  });

  it("14. conflito entre Planejador, proposta e preenchimento humano bloqueia a transição", () => {
    const c = conflitoDeFonte({
      campo: "valor_contratado",
      valorAtual: "A",
      origemAtual: "planejador_homologado",
      valorConcorrente: "B",
      origemConcorrente: "preenchimento_humano_confirmado",
      transicaoBloqueada: "previa_final",
    });
    expect(c).not.toBeNull();
    expect(c!.transicaoBloqueada).toBe("previa_final");
    const bloqueios = gatesBloqueados({
      anexos: anexosIaVTeste(),
      modelo: "MODELO-ESTUDO",
      perfilInstitucionalAtivo: true,
      metodoAssinaturaConfigurado: true,
      revisorHumanoAprovado: true,
      conflitos: [c!],
    });
    expect(bloqueios.some((b) => b.gate === "previa_final")).toBe(true);
  });

  it("15. caso familiar cria anexos estruturais e individuais, sem contrato paralelo", () => {
    const estrutura = estruturaFamiliarTeste();
    expect(estrutura.contratosParalelos).toBe(0);
    expect(estrutura.anexosIndividuais).toEqual(["TESTE Requerente Um", "TESTE Requerente Dois"]);
    const familiares = ANEXOS_FAMILIARES.map((a) => a.anexo);
    expect(familiares).toContain("ANX-INDIVIDUAL");
    expect(familiares).toContain("ANX-PRIVACIDADE");
    expect(familiares).toContain("ANX-REPRESENTACAO");
  });

  it("16. dependente menor recebe representação somente quando necessário", () => {
    const estrutura = estruturaFamiliarTeste();
    expect(estrutura.naoSignatarios).toContain("TESTE Dependente Menor");
    expect(estrutura.signatarios).not.toContain("TESTE Dependente Menor");
    expect(estrutura.representacaoAplicavel).toBe(true);
    const semNecessidade = estruturaContratoFamiliar([
      { nome: "TESTE Menor Sem Necessidade", maiorIdade: false, requerente: true, aplicavel: true },
    ]);
    expect(semNecessidade.representacaoAplicavel).toBe(false);
  });

  it("17. nenhuma ação externa é disparada pelo motor", () => {
    const conteudo = JSON.stringify(anexosIaV(clone())).toLowerCase();
    expect(conteudo).not.toMatch(/enviado para assinatura|assinado em|cobran[çc]a criada|e-mail enviado|whatsapp enviado|pedido protocolado/);
    expect(previaTesteAssinavel()).toBe(false);
  });

  it("18. isolamento por organização está na chave do rascunho", () => {
    expect(chaveRascunho("ORG-A", "CA-1", "MODELO-ESTUDO")).not.toBe(chaveRascunho("ORG-B", "CA-1", "MODELO-ESTUDO"));
  });

  it("19. dados DEMO não viram fallback", () => {
    const base = { archived_at: null, classificacao: "cliente" } as unknown as PessoaLista;
    const pessoas = [
      { ...base, id: "1", nome: "TESTE Real", is_demo: false },
      { ...base, id: "2", nome: "TESTE Demo", is_demo: true },
    ] as PessoaLista[];
    const visiveis = filtrarClientes(pessoas, { estado: "ativos" } as never);
    expect(visiveis.map((p) => p.id)).toEqual(["1"]);
  });

  it("20. prévia de teste apresenta cláusulas, anexos, fontes, estados e bloqueios", () => {
    expect(MARCA_PREVIA_TESTE).toContain("PRÉVIA TESTE");
    expect(matrizClausulasTeste().length).toBeGreaterThanOrEqual(16);
    expect(matrizRenderizacaoPreviaTeste()).toHaveLength(16);
    const codigos = anexosIaVTeste().map((a) => a.codigo);
    expect(codigos).toEqual([
      "ANEXO_I_ORDEM_SERVICO",
      "ANEXO_II_DESPESAS_EXTERNAS",
      "ANEXO_III_AUTORIZACAO_PESQUISA",
      "ANEXO_IV_PROCURACAO",
      "ANEXO_V_ALTERACAO_ESCOPO",
    ]);
    expect(gatesTeste().length).toBeGreaterThan(0);
    expect(estadoMetodoAssinatura(null).estado).toBe("a_configurar");
    expect(estadoMetodoAssinatura(null).valorRenderizado).toBeNull();
  });
});
