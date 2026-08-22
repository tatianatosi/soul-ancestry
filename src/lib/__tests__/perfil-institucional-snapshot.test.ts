import { describe, expect, it } from "vitest";

import {
  EVENTOS_SNAPSHOT_INSTITUCIONAL,
  deveCriarSnapshotInstitucional,
  montarPayloadInstitucional,
  perfilHabilitaAssinatura,
  violacoesDoPayload,
} from "@/lib/perfil-institucional-persistido";

describe("snapshot institucional persistido", () => {
  it("nasce em under_legal_review e não habilita assinatura", () => {
    const payload = montarPayloadInstitucional(false);
    expect(payload.status).toBe("under_legal_review");
    expect(perfilHabilitaAssinatura(payload)).toBe(false);
    expect(violacoesDoPayload(payload)).toEqual([]);
  });

  it("grava snapshot apenas em evento de governança aplicável", () => {
    expect(deveCriarSnapshotInstitucional("versao_contratual_criada", false).criar).toBe(true);
    expect(deveCriarSnapshotInstitucional("versao_contratual_congelada", false).criar).toBe(true);
    expect(deveCriarSnapshotInstitucional("edicao_pelo_caso", false).criar).toBe(false);
  });

  it("nunca sobrescreve snapshot anterior", () => {
    for (const evento of EVENTOS_SNAPSHOT_INSTITUCIONAL) {
      const d = deveCriarSnapshotInstitucional(evento, true);
      expect(d.criar).toBe(false);
      expect(d.motivo).toMatch(/preservad/i);
    }
  });
});
