import { describe, expect, it } from "vitest";

import {
  BLOQUEIOS_ABERTOS_DA_PROPRIETARIA,
  DECISOES_DA_PROPRIETARIA,
  decisaoDaProprietaria,
  decisoesPendentesDaProprietaria,
} from "@/lib/decisoes-da-proprietaria";

/**
 * Corte DECISÕES (02/10/2026): D-02..D-12 do Adendo Bloco 5A, decididas pela
 * autorização literal da Proprietária na sessão de 02/10. Este módulo é a
 * versão em código do doc `docs/decisoes/DECISOES-PENDENTES-DA-PROPRIETARIA-2026-10-01.md`,
 * para `/governanca/decisoes` poder ler.
 */
describe("Decisões D-02..D-12 da Proprietária (02/10/2026)", () => {
  it("registra exatamente os 8 códigos do Adendo §10, nenhum inventado", () => {
    expect(DECISOES_DA_PROPRIETARIA.map((d) => d.codigo).sort()).toEqual([
      "D-02",
      "D-03",
      "D-07",
      "D-08",
      "D-09",
      "D-10",
      "D-11",
      "D-12",
    ]);
  });

  it("todas as 8 foram decididas em 02/10/2026 pela Proprietária, com conteúdo registrado", () => {
    for (const d of DECISOES_DA_PROPRIETARIA) {
      expect(d.status).toBe("decidida");
      expect(d.valorDecidido).toBeTruthy();
      expect(d.decididoPor).toBe("tati@pluggedresearch.com");
      expect(d.decididoEm).toBe("2026-10-02");
    }
  });

  it("decisaoDaProprietaria localiza pelo código", () => {
    expect(decisaoDaProprietaria("D-10")?.titulo).toMatch(/etapas\/famílias comerciais/i);
  });

  it("decisoesPendentesDaProprietaria não retorna nenhuma — todas decididas", () => {
    expect(decisoesPendentesDaProprietaria()).toHaveLength(0);
  });

  it("D-10 registra 'SKU nunca bloqueia' e D-11 registra o vocabulário proibido", () => {
    expect(decisaoDaProprietaria("D-10")?.valorDecidido).toMatch(/SKU nunca bloqueia/);
    expect(decisaoDaProprietaria("D-11")?.valorDecidido).toMatch(/garantido/);
    expect(decisaoDaProprietaria("D-11")?.valorDecidido).toMatch(/elegível/);
  });
});

describe("Bloqueios abertos — o que ainda depende da Proprietária", () => {
  it("tem ao menos os bloqueios estruturais de longa data, cada um com tema e data de registro", () => {
    expect(BLOQUEIOS_ABERTOS_DA_PROPRIETARIA.length).toBeGreaterThanOrEqual(8);
    for (const b of BLOQUEIOS_ABERTOS_DA_PROPRIETARIA) {
      expect(b.tema.length).toBeGreaterThan(3);
      expect(b.oQueTrava.length).toBeGreaterThan(10);
      expect(b.registradoEm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("inclui o bloqueio dos 43 marcos jurídicos e das fontes de pesquisa ausentes", () => {
    const temas = BLOQUEIOS_ABERTOS_DA_PROPRIETARIA.map((b) => b.tema);
    expect(temas.some((t) => /43 marcos/.test(t))).toBe(true);
    expect(temas.some((t) => /Luxemburgo/.test(t))).toBe(true);
  });

  it("não inclui mais a taxonomia do Desk como aberta sem registrar a decisão de 02/10 de não tocar", () => {
    const desk = BLOQUEIOS_ABERTOS_DA_PROPRIETARIA.find((b) => /6 grupos/.test(b.tema));
    expect(desk?.oQueTrava).toMatch(/redesenho não vamos tocar agora/);
  });
});
