import { describe, expect, it } from "vitest";

import {
  avaliarFechamento,
  DEFINICOES_FECHAMENTO,
  type EstadoFechamento,
} from "@/lib/fechamento-caso";

const base: EstadoFechamento = {
  aceiteComercial: true,
  cadastroCompleto: false,
  contratoPreparado: false,
  contratoEnviado: false,
  contratoAssinado: false,
  cobrancaCriada: false,
  pagamentoInicialConfirmado: false,
  dossieMae: false,
  ambienteDossie: false,
  nucleoFamiliar: false,
  requerentes: false,
  autorizacaoPesquisa: false,
  despesasTerceirosAprovadas: true,
  onboardingIniciado: false,
  onboardingMinimoConcluido: false,
  casoAtivo: false,
  produtoServicoReconciliado: false,
  perfilInstitucionalVigente: false,
  portalAcessoLiberado: false,
  conteudoPortalPreparado: false,
  semBloqueioCritico: true,
};

describe("fechamento do caso", () => {
  it("declara os treze gates na ordem normativa", () => {
    expect(DEFINICOES_FECHAMENTO).toHaveLength(13);
    expect(DEFINICOES_FECHAMENTO.map((d) => d.ordem)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it("mostra Ana como aceite confirmado e formalização pendente", () => {
    const r = avaliarFechamento(base);
    expect(r.rotuloSituacao).toBe("Aceite confirmado — formalização pendente");
    expect(r.gates[0]?.situacao).toBe("concluido");
    expect(r.gates[1]?.situacao).toBe("pendente");
    expect(r.proximoGate?.chave).toBe("cadastro");
  });

  it("bloqueia cobrança, onboarding e caso ativo enquanto o contrato não for assinado", () => {
    const r = avaliarFechamento(base);
    const por = Object.fromEntries(r.gates.map((g) => [g.chave, g.situacao]));
    expect(por["cobranca"]).toBe("bloqueado");
    expect(por["onboarding"]).toBe("bloqueado");
    expect(por["caso_ativo"]).toBe("bloqueado");
    expect(r.permite.onboarding).toBe(false);
    expect(r.permite.casoAtivo).toBe(false);
  });

  it("mantém pesquisa externa bloqueada sem autorização registrada", () => {
    const r = avaliarFechamento({ ...base, cadastroCompleto: true, contratoAssinado: true });
    expect(r.permite.pesquisaExterna).toBe(false);
  });

  it("libera onboarding só com contrato assinado, pagamento e dossiê", () => {
    const r = avaliarFechamento({
      ...base,
      cadastroCompleto: true,
      contratoAssinado: true,
      cobrancaCriada: true,
      pagamentoInicialConfirmado: true,
      dossieMae: true,
      ambienteDossie: true,
    });
    expect(r.permite.onboarding).toBe(true);
    expect(r.permite.casoAtivo).toBe(false);
  });

  it("chega a caso ativo apenas com todos os gates concluídos", () => {
    const r = avaliarFechamento({
      aceiteComercial: true,
      cadastroCompleto: true,
      contratoPreparado: true,
      contratoEnviado: true,
      contratoAssinado: true,
      cobrancaCriada: true,
      pagamentoInicialConfirmado: true,
      dossieMae: true,
      ambienteDossie: true,
      nucleoFamiliar: true,
      requerentes: true,
      autorizacaoPesquisa: true,
      despesasTerceirosAprovadas: true,
      onboardingIniciado: true,
      onboardingMinimoConcluido: true,
      casoAtivo: true,
      produtoServicoReconciliado: true,
      perfilInstitucionalVigente: true,
      portalAcessoLiberado: true,
      conteudoPortalPreparado: true,
      semBloqueioCritico: true,
    });
    expect(r.concluidos).toBe(13);
    expect(r.rotuloSituacao).toBe("Caso ativo");
    expect(r.permite.casoAtivo).toBe(true);
  });

  it("bloqueia caso ativo quando há alerta crítico aberto, mesmo com onboarding concluído", () => {
    const r = avaliarFechamento({
      ...base,
      cadastroCompleto: true,
      contratoAssinado: true,
      cobrancaCriada: true,
      pagamentoInicialConfirmado: true,
      dossieMae: true,
      ambienteDossie: true,
      onboardingIniciado: true,
      onboardingMinimoConcluido: true,
      casoAtivo: true,
      semBloqueioCritico: false,
    });
    const por = Object.fromEntries(r.gates.map((g) => [g.chave, g.situacao]));
    expect(por["sem_bloqueio_critico"]).toBe("pendente");
    expect(por["caso_ativo"]).not.toBe("concluido");
    expect(r.permite.casoAtivo).toBe(false);
  });

  it("gate de conteúdo do portal só cobra entrega preparada quando o acesso está liberado", () => {
    const semAcesso = avaliarFechamento({ ...base, portalAcessoLiberado: false, conteudoPortalPreparado: false });
    const comAcessoSemConteudo = avaliarFechamento({ ...base, portalAcessoLiberado: true, conteudoPortalPreparado: false });
    const comAcessoComConteudo = avaliarFechamento({ ...base, portalAcessoLiberado: true, conteudoPortalPreparado: true });
    const situacao = (r: ReturnType<typeof avaliarFechamento>) =>
      Object.fromEntries(r.gates.map((g) => [g.chave, g.situacao]))["conteudo_portal"];
    expect(situacao(semAcesso)).toBe("concluido");
    expect(situacao(comAcessoSemConteudo)).not.toBe("concluido");
    expect(situacao(comAcessoComConteudo)).toBe("concluido");
  });
});
