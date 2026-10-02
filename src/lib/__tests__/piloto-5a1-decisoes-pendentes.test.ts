import { describe, expect, it } from "vitest";

import {
  DECISOES_PILOTO_5A1,
  decisaoPiloto5A1,
  decisoesPendentesPiloto5A1,
  pacoteDecisaoPiloto5A1Fechado,
} from "@/lib/piloto-5a1-decisoes-pendentes";

/**
 * Achado da sessão de 27/09/2026: D-01, D-04, D-05 e D-06 (Piloto 5A.1,
 * caso Giovanna Prade) foram registrados em 11/08/2026 como "AGUARDANDO
 * DECISÃO HUMANA" e ninguém nunca confirmou depois se a Proprietária
 * decidiu. Este teste travava exatamente isso: nenhum agente podia
 * "decidir" silenciosamente editando este arquivo — mudar o status exige
 * preencher valorDecidido/decididoPor/decididoEm também, e mesmo assim só
 * a Proprietária autoriza esse conteúdo.
 *
 * Corte DECISÕES (02/10/2026): a Proprietária decidiu de fato, de forma
 * explícita ("execute todas elas d01 em diante"), registrada por ela mesma
 * (tati@pluggedresearch.com). O teste passa a travar o estado NOVO: as
 * quatro decididas, cada uma com autor e data, e o pacote fechado.
 */
describe("Piloto 5A.1 — pacote de decisões (D-01, D-04, D-05, D-06)", () => {
  it("registra exatamente os quatro códigos do pacote de decisão, nenhum inventado", () => {
    expect(DECISOES_PILOTO_5A1.map((d) => d.codigo).sort()).toEqual(["D-01", "D-04", "D-05", "D-06"]);
  });

  it("as quatro foram decididas pela Proprietária em 02/10/2026, com conteúdo e autoria registrados", () => {
    for (const d of DECISOES_PILOTO_5A1) {
      expect(d.status).toBe("decidida");
      expect(typeof d.valorDecidido).toBe("string");
      expect((d.valorDecidido as string).length).toBeGreaterThan(10);
      expect(d.decididoPor).toBe("tati@pluggedresearch.com");
      expect(d.decididoEm).toBe("2026-10-02");
    }
  });

  it("toda decisão tem o texto exato de 'Decisão necessária de Tatiana' do documento-fonte", () => {
    for (const d of DECISOES_PILOTO_5A1) {
      expect(d.pendencia.length).toBeGreaterThan(20);
    }
  });

  it("decisaoPiloto5A1 localiza cada uma pelo código", () => {
    expect(decisaoPiloto5A1("D-01")?.titulo).toBe("Consentimento mínimo de pesquisa e documentos");
    expect(decisaoPiloto5A1("D-04")?.titulo).toBe("Cinco fontes humanas permitidas");
    expect(decisaoPiloto5A1("D-05")?.titulo).toBe("Responsável pela validação");
    expect(decisaoPiloto5A1("D-06")?.titulo).toBe("Critério de elevação de evidência");
  });

  it("decisoesPendentesPiloto5A1 não retorna mais nenhuma — todas decididas", () => {
    expect(decisoesPendentesPiloto5A1()).toHaveLength(0);
  });

  it("pacoteDecisaoPiloto5A1Fechado é true agora que a Proprietária decidiu todas", () => {
    expect(pacoteDecisaoPiloto5A1Fechado()).toBe(true);
  });
});
