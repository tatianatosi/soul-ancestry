import { describe, expect, it } from "vitest";

import { etapaQuePedeAtencao, lerJornada } from "@/lib/painel-jornada";
import { FASES_JORNADA } from "@/lib/onboarding-jornada";

const caso = (id: string, fase: string | null, status?: string, dias?: number) => ({
  id,
  codigo: id.toUpperCase(),
  fase,
  cadencia: status ? { status, diasSemTouchpoint: dias ?? null } : null,
});

describe("jornada dos casos", () => {
  it("mostra as oito etapas na ordem canônica, mesmo as vazias", () => {
    // Etapa vazia é leitura: diz onde a carteira não tem ninguém.
    const l = lerJornada([caso("a", "onboarding")]);
    expect(l.etapas).toHaveLength(FASES_JORNADA.length);
    expect(l.etapas.map((e) => e.ordem)).toEqual(FASES_JORNADA.map((_, i) => i + 1));
    expect(l.etapas.find((e) => e.id === "onboarding")?.total).toBe(1);
    expect(l.etapas.filter((e) => e.total === 0).length).toBe(FASES_JORNADA.length - 1);
  });

  it("aceita as duas grafias de fase que convivem no banco", () => {
    // `case_plans` grava "aceite_e_formalizacao"; o resto usa
    // "aceite_formalizacao". As duas têm de cair na mesma etapa.
    const l = lerJornada([caso("a", "aceite_e_formalizacao"), caso("b", "aceite_formalizacao")]);
    const etapa = l.etapas.find((e) => e.id === "aceite_e_formalizacao");
    expect(etapa?.total).toBe(2);
    expect(l.foraDoCatalogo).toEqual([]);
  });

  it("cada etapa carrega a linguagem que o cliente lê da mesma fase", () => {
    // É a coluna "Onde unifica" do fluxo: mesma etapa, duas leituras.
    const l = lerJornada([]);
    for (const e of l.etapas) {
      expect(e.rotuloCliente.length).toBeGreaterThan(0);
      expect(e.rotuloCliente).not.toBe(e.id);
    }
  });

  it("caso sem fase não é empurrado para etapa nenhuma", () => {
    const l = lerJornada([caso("a", null), caso("b", "   "), caso("c", "onboarding")]);
    expect(l.semFase).toBe(2);
    expect(l.etapas.reduce((t, e) => t + e.total, 0)).toBe(1);
  });

  it("fase fora do catálogo aparece nomeada, nunca somada à etapa mais parecida", () => {
    const l = lerJornada([caso("a", "fase_inventada"), caso("b", "fase_inventada")]);
    expect(l.foraDoCatalogo).toEqual([{ fase: "fase_inventada", total: 2 }]);
    expect(l.etapas.every((e) => e.total === 0)).toBe(true);
  });

  it("conta como parado só o que a cadência marcou de atenção ou crítico", () => {
    const l = lerJornada([
      caso("a", "onboarding", "regular", 2),
      caso("b", "onboarding", "atencao", 11),
      caso("c", "onboarding", "critico", 20),
    ]);
    const e = l.etapas.find((x) => x.id === "onboarding")!;
    expect(e.total).toBe(3);
    expect(e.semToque).toBe(2);
    expect(e.piorEspera).toBe(20);
    expect(e.exemplo?.rotulo).toBe("C");
  });

  it("aponta a etapa que pede atenção pelo volume parado, com desempate por espera", () => {
    const l = lerJornada([
      caso("a", "onboarding", "critico", 30),
      caso("b", "pesquisa_inicial", "atencao", 11),
      caso("c", "pesquisa_inicial", "critico", 12),
    ]);
    expect(etapaQuePedeAtencao(l)?.id).toBe("pesquisa_inicial");
  });

  it("sem nada parado, não inventa urgência", () => {
    const l = lerJornada([caso("a", "onboarding", "regular", 1)]);
    expect(etapaQuePedeAtencao(l)).toBeNull();
  });

  it("carteira vazia devolve leitura vazia, sem quebrar", () => {
    const l = lerJornada([]);
    expect(l.total).toBe(0);
    expect(l.semFase).toBe(0);
    expect(etapaQuePedeAtencao(l)).toBeNull();
  });
});
