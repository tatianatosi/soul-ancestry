import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Fila v2, B08 (05/11/2026): toda gravação que marca o contrato como assinado deixa o caso consistente
 * (`crm_casos.contrato_assinado`), confere erro e linha afetada, e só registra histórico depois.
 * Antes, o GoLive gravava o contrato assinado e o caso continuava "não assinado".
 */
const arquivos = readdirSync("src/lib").filter((f) => f.endsWith(".functions.ts"));

function blocosQueAssinam(fonte: string): string[] {
  const blocos: string[] = [];
  const inicios = [...fonte.matchAll(/export const \w+ = createServerFn/g)].map((m) => m.index ?? 0);
  inicios.forEach((ini, i) => {
    const bloco = fonte.slice(ini, inicios[i + 1] ?? fonte.length);
    if (/status: "signed",/.test(bloco)) blocos.push(bloco);
  });
  return blocos;
}

describe("B08 — assinatura de contrato sempre consistente com o caso", () => {
  const escritores = arquivos.flatMap((f) =>
    blocosQueAssinam(readFileSync(`src/lib/${f}`, "utf8")).map((b) => ({ arquivo: f, bloco: b })),
  );

  it("os dois escritores conhecidos de assinatura entram na conferência", () => {
    expect(escritores.map((e) => e.arquivo).sort()).toEqual([
      "contrato-parametros.functions.ts",
      "golive-escritores.functions.ts",
    ]);
  });

  it("cada escritor propaga contrato_assinado ao caso e trata erro ou nenhuma linha afetada", () => {
    for (const { bloco } of escritores) {
      expect(bloco).toContain('.update({ contrato_assinado: true })');
      expect(bloco).toContain("if (casoRes.error || !casoRes.data?.length)");
      expect(bloco).toContain("Estado parcial — revisão humana necessária antes de repetir a ação");
    }
  });

  it("o histórico do caso só é gravado depois da propagação confirmada", () => {
    for (const { bloco } of escritores) {
      const propaga = bloco.indexOf("contrato_assinado: true");
      const historico = bloco.indexOf("registrarTimelineCaso(");
      expect(propaga).toBeGreaterThan(-1);
      expect(historico).toBeGreaterThan(propaga);
    }
  });

  it("no GoLive, a propagação fica restrita ao caso escolhido e à organização", () => {
    const golive = escritores.find((e) => e.arquivo === "golive-escritores.functions.ts")!.bloco;
    const trecho = golive.slice(golive.indexOf('.from("crm_casos")'), golive.indexOf("if (casoRes.error"));
    expect(trecho).toContain('.eq("id", casoId)');
    expect(trecho).toContain('.eq("organization_id", organizationId)');
  });
});
