import { describe, expect, it } from "vitest";

import { caseDataGiovanna } from "@/data/caseDataGiovanna";
import { radarSanitizado } from "@/lib/portal-dados-vivos";
import {
  EIXOS_RADAR_CANONICOS,
  EIXOS_RADAR_IDS,
  eixosRadar,
  garantirEixosCanonicos,
} from "@/lib/radar-eixos";

const ESPERADO = ["historia", "documentos", "estrategia", "proximos"] as const;

describe("Eixos canônicos do Radar (Cliente e Ops)", () => {
  it("o conjunto canônico é exatamente os quatro eixos, sem duplicidade", () => {
    expect(EIXOS_RADAR_IDS).toEqual(ESPERADO);
    expect(EIXOS_RADAR_CANONICOS.map((e) => e.id)).toEqual(ESPERADO);
    expect(new Set(EIXOS_RADAR_CANONICOS.map((e) => e.id)).size).toBe(4);
    expect(Object.isFrozen(EIXOS_RADAR_CANONICOS)).toBe(true);
  });

  it("eixosRadar devolve apenas os eixos canônicos, na ordem canônica", () => {
    const eixos = eixosRadar(caseDataGiovanna);
    expect(eixos).toHaveLength(EIXOS_RADAR_CANONICOS.length);
    expect(eixos.map((e) => e.id)).toEqual(ESPERADO);
    for (const eixo of eixos) {
      const canon = EIXOS_RADAR_CANONICOS.find((c) => c.id === eixo.id)!;
      expect(eixo.titulo).toBe(canon.titulo);
      expect(eixo.resumo).toBe(canon.resumo);
    }
  });

  it("o radar sanitizado do portal usa o mesmo conjunto e a mesma ordem", () => {
    const eixos = radarSanitizado({ projecoes: [], documentos: [] });
    expect(eixos.map((e) => e.id)).toEqual(ESPERADO);
    expect(eixos.map((e) => e.titulo)).toEqual(EIXOS_RADAR_CANONICOS.map((e) => e.titulo));
  });

  it("a guarda descarta eixo extra e reordena para a ordem canônica", () => {
    const sujo = [
      { id: "proximos" as const },
      { id: "financeiro" as unknown as (typeof ESPERADO)[number] },
      { id: "historia" as const },
      { id: "documentos" as const },
      { id: "estrategia" as const },
      { id: "historia" as const },
    ];
    expect(garantirEixosCanonicos(sujo).map((e) => e.id)).toEqual(ESPERADO);
  });

  it("a guarda não inventa eixo ausente", () => {
    expect(garantirEixosCanonicos([{ id: "historia" as const }]).map((e) => e.id)).toEqual(["historia"]);
    expect(garantirEixosCanonicos([]).length).toBe(0);
  });
});
