import { describe, expect, it } from "vitest";
import {
  ANEXOS_TRES_CAMADAS,
  CASO_ANA_CODIGO_CANONICO,
  CASO_ANA_ID,
  CASO_ANA_REFERENCIA_LEGADA,
  CASO_VALIDACAO_MOTOR_ID,
  CONFIRMACAO_RECONCILIACAO_ANEXOS,
  CORRECOES_AFIRMACOES,
  ESTADOS_RECONCILIACAO,
  QUADRO_ANA,
  anexosComInstanciaTecnica,
  anexosComModeloJuridicoAusente,
  anexosSemInstanciaDoCaso,
  evidenciasDoCaso,
  exigeMaterializacaoAntesDeUsoExterno,
  linha,
  linhasLegadasVazias,
  permitePreviaInterna,
  resolveCasoAna,
} from "../anexos-tres-camadas";

describe("reconciliação Anexos I–V — três camadas", () => {
  it("cobre os cinco anexos e usa apenas o vocabulário reconciliado", () => {
    expect(ANEXOS_TRES_CAMADAS).toHaveLength(5);
    for (const a of ANEXOS_TRES_CAMADAS) {
      expect(a.estados.length).toBeGreaterThan(0);
      for (const e of a.estados) expect(ESTADOS_RECONCILIACAO).toContain(e);
    }
  });

  it("nunca declara ausência sem nomear a camada", () => {
    for (const a of ANEXOS_TRES_CAMADAS) {
      const ausenciaJuridica = !a.juridica.presente;
      const ausenciaCaso = !a.caso.presente;
      if (ausenciaJuridica) expect(a.estados).toContain("MODELO_JURIDICO_NAO_LOCALIZADO");
      if (ausenciaCaso) expect(a.estados).toContain("INSTANCIA_DO_CASO_AUSENTE");
      expect(a.frasePadrao).not.toMatch(/NAO_LOCALIZADO/);
    }
  });

  it("instância técnica existente convive com modelo jurídico ausente (II, IV e V)", () => {
    const ausentes = anexosComModeloJuridicoAusente().map((a) => a.codigo);
    expect(ausentes).toEqual(["ANEXO_II", "ANEXO_IV", "ANEXO_V"]);
    for (const codigo of ausentes) {
      const a = linha(codigo as never);
      expect(a.tecnica.presente).toBe(true);
      expect(a.tecnica.registrosAtivos).toBe(1);
      expect(a.tecnica.temStructuredData).toBe(true);
      expect(a.tecnica.temHash).toBe(true);
      expect(a.tecnica.tamanhoRenderedHtml).toBeGreaterThan(0);
      expect(a.estados).toContain("TECNICAMENTE_EXISTE");
      expect(a.estados).toContain("AGUARDA_MATERIALIZACAO");
    }
  });

  it("instância do caso ausente mesmo com contrato vinculado ao caso de Ana", () => {
    expect(anexosSemInstanciaDoCaso()).toHaveLength(5);
    expect(evidenciasDoCaso(CASO_ANA_ID)).toHaveLength(0);
    expect(QUADRO_ANA.anexosComVinculoDeCaso).toEqual([]);
    expect(QUADRO_ANA.contratoId).toBeTruthy();
    expect(QUADRO_ANA.contratoStatus).toBe("pending_data");
    // as cinco instâncias técnicas pertencem ao caso de validação do motor
    expect(evidenciasDoCaso(CASO_VALIDACAO_MOTOR_ID)).toHaveLength(5);
  });

  it("linha legada vazia de Anexo I é identificada e está arquivada", () => {
    const legadas = linhasLegadasVazias();
    expect(legadas).toHaveLength(1);
    expect(legadas[0]!.annexCode).toBe("ANEXO-I");
    expect(legadas[0]!.arquivado).toBe(true);
    expect(legadas[0]!.caseId).toBeNull();
    expect(legadas[0]!.tamanhoRenderedHtml).toBe(0);
  });

  it("caso de Ana resolve pelo ID canônico, inclusive pelo alias histórico", () => {
    expect(resolveCasoAna(CASO_ANA_CODIGO_CANONICO)).toEqual({
      id: CASO_ANA_ID,
      codigo: CASO_ANA_CODIGO_CANONICO,
      alias: false,
    });
    expect(resolveCasoAna(CASO_ANA_REFERENCIA_LEGADA)).toEqual({
      id: CASO_ANA_ID,
      codigo: CASO_ANA_CODIGO_CANONICO,
      alias: true,
    });
    expect(resolveCasoAna("CA-OUTRO-2026-999")).toBeNull();
  });

  it("prévia interna é permitida sem qualquer ação externa", () => {
    expect(anexosComInstanciaTecnica()).toHaveLength(5);
    for (const a of ANEXOS_TRES_CAMADAS) {
      expect(permitePreviaInterna(a)).toBe(true);
      expect(a.acaoExternaPermitida).toBe(false);
    }
    expect(QUADRO_ANA.anexosComPreviaInterna).toHaveLength(5);
  });

  it("exige fonte jurídica antes de uso externo para II, IV e V", () => {
    expect(ANEXOS_TRES_CAMADAS.filter(exigeMaterializacaoAntesDeUsoExterno).map((a) => a.codigo)).toEqual([
      "ANEXO_II",
      "ANEXO_IV",
      "ANEXO_V",
    ]);
  });

  it("registra as correções de afirmações anteriores e a confirmação literal", () => {
    expect(CORRECOES_AFIRMACOES.length).toBeGreaterThanOrEqual(5);
    expect(CONFIRMACAO_RECONCILIACAO_ANEXOS).toContain("Nenhum Anexo I–V foi declarado ausente");
  });
});
