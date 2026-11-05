import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * DB-01 (05/11/2026): a contagem de `audit_logs` era a leitura mais cara do banco (608 chamadas, média 503 ms)
 * e rodava em toda tela que usa os indicadores do kit, embora só a Governança mostre o número.
 */
const funcoes = readFileSync("src/lib/kit-superficies.functions.ts", "utf8");
const telas = readFileSync("src/components/desk/superficies-kit-conectadas.tsx", "utf8");

describe("DB-01 — contagem de auditoria só onde aparece", () => {
  it("a leitura compartilhada dos indicadores não conta mais audit_logs", () => {
    const compartilhada = funcoes.slice(
      funcoes.indexOf("export const carregarSuperficiesKit"),
      funcoes.indexOf("export type SuperficiesKit"),
    );
    expect(compartilhada).not.toContain('"audit_logs"');
    expect(compartilhada).not.toContain("auditoriaTotal");
  });

  it("a contagem própria exige sessão e transforma falha em erro, nunca em zero", () => {
    const propria = funcoes.slice(funcoes.indexOf("export const contarAuditoriaKit"));
    expect(propria).toContain(".middleware([requireSupabaseAuth])");
    expect(propria).toContain('.from("audit_logs")');
    expect(propria).toContain("if (error) throw new Error(");
  });

  it("só a Governança chama a contagem e mostra a falha como erro de leitura", () => {
    expect(telas.split("useServerFn(contarAuditoriaKit)").length - 1).toBe(1);
    const governanca = telas.slice(telas.indexOf("export function GovernancaConectada"));
    expect(governanca).toContain("useServerFn(contarAuditoriaKit)");
    expect(governanca).toContain("A contagem de auditoria falhou");
    expect(governanca).not.toContain("d.auditoriaTotal ?? 0");
  });
});
