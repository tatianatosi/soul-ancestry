import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  FACE_PRINCIPAL_DESK,
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  TELAS_DESK_MOCKUP,
  faceNavAtiva,
  rotasDoMenu,
  rotasSemLink,
  subItensDaFace,
} from "@/lib/navegacao-desk";

describe("Face Desk 7 telas + 6 grupos internos (decisão 2026-09-11)", () => {
  it("expõe as 7 telas aprovadas como face principal", () => {
    expect(FACE_PRINCIPAL_DESK).toHaveLength(7);
    expect(FACE_PRINCIPAL_DESK.map((f) => f.label)).toEqual([...TELAS_DESK_MOCKUP]);
    expect(FACE_PRINCIPAL_DESK.map((f) => f.to)).toEqual([
      "/painel",
      "/casos",
      "/tarefas",
      "/matriz-juridica",
      "/qualidade",
      "/alertas",
      "/biblioteca",
    ]);
  });

  it("mantém 6 grupos operacionais internos com rótulos curtos", () => {
    expect(GRUPOS_DESK).toHaveLength(6);
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...GRUPOS_OPERACIONAIS_DESK]);
    expect(GRUPOS_OPERACIONAIS_DESK).toEqual([
      "Hoje",
      "Comercial",
      "Casos & Pessoas",
      "Pesquisa",
      "Formalização",
      "Governança",
    ]);
  });

  it("não perde rota preservada ao mudar a face", () => {
    expect(rotasSemLink()).toEqual([]);
    expect(rotasDoMenu()).toEqual(expect.arrayContaining(["/calls", "/tarefas", "/contratos"]));
  });

  it("/alertas ativa a face Alertas, não Visão Geral", () => {
    const visao = FACE_PRINCIPAL_DESK.find((f) => f.id === "visao-geral")!;
    const alertas = FACE_PRINCIPAL_DESK.find((f) => f.id === "alertas")!;
    const faces = FACE_PRINCIPAL_DESK.map((f) => ({ to: f.to }));
    expect(
      faceNavAtiva("/alertas", "", { ...alertas, sub: subItensDaFace(alertas) }, faces),
    ).toBe(true);
    expect(
      faceNavAtiva("/alertas", "", { ...visao, sub: subItensDaFace(visao) }, faces),
    ).toBe(false);
  });

  it("shell renderiza a face, não os 6 grupos como barra principal", () => {
    const shell = readFileSync("src/components/saas/shell.tsx", "utf8");
    expect(shell).toContain("FACE_PRINCIPAL_DESK");
    expect(shell).toContain("subItensDaFace");
    expect(shell).toContain("faceNavAtiva");
    expect(shell).not.toContain("GRUPOS_DESK.map");
  });
});
