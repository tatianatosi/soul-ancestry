import { describe, expect, it } from "vitest";

import {
  EVENTO_BLOQUEIO_ASSISTENTE,
  REGRAS_ASSISTENTE,
  SELO_DEMO_ASSISTENTE,
  assistenteVisivel,
  atalhosDoGrupo,
  casoCandidatoDaRota,
  estadoAssistente,
  grupoDaRota,
} from "@/lib/assistente-transversal";

const CASO = "11111111-2222-3333-4444-555555555555";
const OUTRO = "99999999-8888-7777-6666-555555555555";

describe("CA-UX-03 adendo — Assistente transversal", () => {
  it("1. cobre as 7 telas do mockup + conta, sem aba nova na sidebar", () => {
    expect(REGRAS_ASSISTENTE).toHaveLength(8);
    expect(REGRAS_ASSISTENTE.map((r) => r.grupo)).toEqual([
      "visao-geral",
      "casos-360",
      "checklist",
      "validacao-juridica",
      "radar-interno",
      "alertas",
      "biblioteca-mestre",
      "conta",
    ]);
  });

  it("1b. aparece para papel autorizado e some para papel não autorizado no grupo", () => {
    expect(assistenteVisivel({ superficieInterna: true, papeis: ["admin"], rota: "/equipe" })).toBe(
      true,
    );
    expect(
      assistenteVisivel({ superficieInterna: true, papeis: ["comercial"], rota: "/equipe" }),
    ).toBe(false);
    expect(
      assistenteVisivel({
        superficieInterna: true,
        papeis: ["financeiro"],
        rota: "/pesquisa-modulo",
      }),
    ).toBe(false);
    expect(
      assistenteVisivel({
        superficieInterna: true,
        papeis: ["pesquisador"],
        rota: "/pesquisa-modulo",
      }),
    ).toBe(true);
  });

  it("2/7. nunca aparece fora da superfície interna nem no App Cliente", () => {
    expect(
      assistenteVisivel({ superficieInterna: false, papeis: ["admin"], rota: "/painel" }),
    ).toBe(false);
    expect(
      assistenteVisivel({ superficieInterna: true, papeis: ["admin"], rota: "/portal/casos/x" }),
    ).toBe(false);
    expect(assistenteVisivel({ superficieInterna: true, papeis: [], rota: "/painel" })).toBe(false);
  });

  it("3. não analisa caso sem confirmação explícita de case_id", () => {
    const e = estadoAssistente({ rota: `/casos/${CASO}`, confirmado: null });
    expect(e.casoCandidato).toBe(CASO);
    expect(e.casoConfirmado).toBeNull();
    expect(e.podeAnalisarCaso).toBe(false);
    expect(e.modo).toBe("orientacao");
  });

  it("3b. analisa somente após confirmação explícita", () => {
    const rota = `/casos/${CASO}`;
    const e = estadoAssistente({ rota, confirmado: { casoId: CASO, rota } });
    expect(e.podeAnalisarCaso).toBe(true);
    expect(e.modo).toBe("analise");
  });

  it("4. mudar de URL não troca silenciosamente o caso analisado", () => {
    const e = estadoAssistente({
      rota: `/casos/${OUTRO}`,
      confirmado: { casoId: CASO, rota: `/casos/${CASO}` },
    });
    expect(e.casoConfirmado).toBeNull();
    expect(e.podeAnalisarCaso).toBe(false);
  });

  it("5/6. mantém os textos canônicos de bloqueio e DEMO", () => {
    expect(EVENTO_BLOQUEIO_ASSISTENTE).toBe("analysis_blocked_insufficient_case_data");
    expect(SELO_DEMO_ASSISTENTE).toBe("DEMO — DADOS FICTÍCIOS — NÃO USAR EM OPERAÇÃO");
  });

  it("8. telas sem análise por caso jamais entram em modo de análise", () => {
    for (const regra of REGRAS_ASSISTENTE.filter((r) => !r.analisaCaso)) {
      const rota = regra.grupo === "visao-geral" ? "/painel" : "/configuracoes";
      const e = estadoAssistente({ rota, confirmado: { casoId: CASO, rota } });
      expect(e.podeAnalisarCaso).toBe(false);
    }
  });

  it("resolve a tela pela rota usando o registro canônico de navegação", () => {
    expect(grupoDaRota("/painel")).toBe("visao-geral");
    expect(grupoDaRota("/leads")).toBe("visao-geral");
    expect(grupoDaRota(`/casos/${CASO}`)).toBe("casos-360");
    expect(grupoDaRota("/pesquisa-modulo")).toBe("biblioteca-mestre");
    expect(grupoDaRota("/financeiro")).toBe("casos-360");
    expect(grupoDaRota("/equipe")).toBe("conta");
    expect(grupoDaRota("/marketing")).toBe("visao-geral");
    expect(grupoDaRota("/matriz-juridica")).toBe("validacao-juridica");
    expect(grupoDaRota("/qualidade")).toBe("radar-interno");
    expect(grupoDaRota("/alertas")).toBe("alertas");
  });

  it("atalhos apontam apenas para rotas já existentes da tela", () => {
    const atalhos = atalhosDoGrupo("visao-geral");
    expect(atalhos.length).toBeGreaterThan(0);
    for (const a of atalhos) expect(a.to.startsWith("/")).toBe(true);
  });

  it("candidato de caso vem da URL apenas como sugestão", () => {
    expect(casoCandidatoDaRota("/painel")).toBeNull();
    expect(casoCandidatoDaRota(`/pesquisa/${CASO}`)).toBe(CASO);
  });
});
