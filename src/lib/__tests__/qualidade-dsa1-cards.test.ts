import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rotaQualidade = readFileSync(
  path.resolve(__dirname, "../../routes/_authenticated/qualidade.tsx"),
  "utf8",
);

describe("DSA-1-BASE-TOKENS-CARDS: qualidade.tsx (Radar & Matrizes)", () => {
  it("usa o Card canônico (CaCard) para os eixos internos, não uma <section> ad-hoc", () => {
    expect(rotaQualidade).toContain('import { CaCard } from "@/components/ui/ca-card"');
    expect(rotaQualidade).toMatch(/<CaCard\s+titulo="Eixos canônicos da leitura"/);
  });

  it("usa o Selo canônico com texto real (fonte declarada), não um estado fabricado", () => {
    expect(rotaQualidade).toContain('import { Selo } from "@/components/comercial/base"');
    expect(rotaQualidade).toMatch(/<Selo\s+texto="Compartilhado com o Radar do Cliente"/);
    expect(rotaQualidade).toContain("Fonte: src/lib/radar-eixos.ts");
  });

  it("usa o Estado Vazio canônico (defensivo, sem dado fictício) em vez de assumir a lista sempre cheia", () => {
    expect(rotaQualidade).toContain('import { SaasShell, EstadoVazio } from "@/components/saas/shell"');
    expect(rotaQualidade).toMatch(/if \(eixos\.length === 0\)/);
    expect(rotaQualidade).toMatch(/<EstadoVazio mensagem=/);
  });

  it("não introduz nenhum hex literal novo — só classes de tokens já aprovados", () => {
    expect(rotaQualidade).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });

  it("declara e preserva os 4 eixos do Radar & Matrizes (nenhum eixo extra)", () => {
    expect(rotaQualidade).toContain("Radar & Matrizes · 4 eixos");
    expect(rotaQualidade).toContain("EIXOS_RADAR_CANONICOS");
    expect(rotaQualidade).toContain("garantirEixosCanonicos");
  });
});
