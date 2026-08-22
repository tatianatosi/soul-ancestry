import { describe, expect, it } from "vitest";

import {
  BLOQUEIOS_REMANESCENTES,
  CONFIRMACOES_EXTERNAS,
  MAPA_ADMINISTRADORAS,
  PACOTE_APROVACOES,
  aprovacoesPorGrupo,
  bloqueiosPorNatureza,
  validarAlteracaoAcesso,
} from "@/lib/varredura-administracao";

describe("varredura de administração e contingência", () => {
  it("todo bloqueio externo declara confirmação e nunca é superável por decisão interna", () => {
    for (const b of bloqueiosPorNatureza("externo_irreversivel")) {
      expect(b.superavelPorDecisao).toBe(false);
      expect(b.confirmacaoExterna).toBeTruthy();
      expect(b.estadoMaximoInterno).toBeTruthy();
    }
  });

  it("todo bloqueio interno é superável por decisão auditada", () => {
    for (const b of bloqueiosPorNatureza("interno")) {
      expect(b.superavelPorDecisao).toBe(true);
      expect(b.confirmacaoExterna).toBeNull();
    }
  });

  it("cada bloqueio informa módulo, rota, entidade, arquivo, risco e teste", () => {
    for (const b of BLOQUEIOS_REMANESCENTES) {
      for (const campo of [b.modulo, b.rota, b.entidade, b.acao, b.regra, b.arquivo, b.risco, b.teste]) {
        expect(campo.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("cobre as nove classes de confirmação externa exigidas", () => {
    expect(CONFIRMACOES_EXTERNAS).toHaveLength(9);
  });

  it("nenhuma administradora proposta pode remover a principal", () => {
    expect(MAPA_ADMINISTRADORAS).toHaveLength(3);
    expect(MAPA_ADMINISTRADORAS.every((a) => a.podeRemoverPrincipal === false)).toBe(true);
    expect(MAPA_ADMINISTRADORAS.find((a) => a.tipo === "recuperacao")?.estado).toBe("pendente_de_email");
  });

  it("bloqueia alteração crítica com uma única proprietária ativa", () => {
    const erros = validarAlteracaoAcesso(
      { alvoEmail: "tati@pluggedresearch.com", operacao: "remover" },
      [{ email: "tati@pluggedresearch.com", tipo: "principal" }],
    );
    expect(erros.length).toBeGreaterThan(0);
  });

  it("permite propor convite mesmo com uma proprietária ativa", () => {
    const erros = validarAlteracaoAcesso(
      { alvoEmail: "atendimento@clubeancestral.com.br", operacao: "convidar" },
      [{ email: "tati@pluggedresearch.com", tipo: "principal" }],
    );
    expect(erros).toEqual([]);
  });

  it("protege a última administradora principal mesmo com duas proprietárias ativas", () => {
    const erros = validarAlteracaoAcesso(
      { alvoEmail: "tati@pluggedresearch.com", operacao: "rebaixar" },
      [
        { email: "tati@pluggedresearch.com", tipo: "principal" },
        { email: "atendimento@clubeancestral.com.br", tipo: "contingencia_operacional" },
      ],
    );
    expect(erros.some((e) => e.includes("principal"))).toBe(true);
  });

  it("agrupa o pacote de aprovações nos sete grupos pedidos", () => {
    const g = aprovacoesPorGrupo();
    expect(Object.keys(g)).toEqual([
      "saneamento_dados",
      "atribuicao_administradores",
      "convites_comunicacoes",
      "alteracoes_integracao",
      "migration_deploy",
      "backup_rollback",
      "acoes_externas_preparadas",
    ]);
    expect(g.atribuicao_administradores).toHaveLength(3);
    for (const l of PACOTE_APROVACOES) {
      expect(l.previa.trim().length).toBeGreaterThan(0);
      expect(l.confirmacao.trim().length).toBeGreaterThan(0);
    }
  });
});
