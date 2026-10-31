import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Regressão achada na auditoria de 27/10/2026, na própria mudança de 26/10
 * que trouxe Faturas para dentro da Conta.
 *
 * `minhasFaturas` exige `client_portal_access` ativo e RECUSA quem não tem
 * (`portal-cliente.server.ts`: "Acesso não autorizado."). A query entrou sem
 * `enabled`, então nas duas superfícies de prévia — `/app-cliente-como-pessoa`
 * (o único caminho pelo qual a Proprietária vê o App, por decisão do
 * AGENTS.md) e a demo institucional mostrada a quem ainda não é cliente — a
 * seção caía no aviso de instabilidade financeira. Quebrava a tela
 * exatamente para quem pediu a seção.
 *
 * O teste que eu havia ajustado (`portal-resiliencia-rede.test.tsx`) passou
 * porque o mock devolvia lista vazia: ficou verde sem nunca exercitar o
 * caminho de prévia. Este arquivo trava o invariante que faltava.
 */
const conta = readFileSync("src/routes/portal/conta.tsx", "utf8");

describe("Conta — Faturas não são consultadas em prévia (27/10/2026)", () => {
  it("a query de faturas tem gate de prévia, igual ao usePortal() do shell", () => {
    const inicio = conta.indexOf('queryKey: ["portal-conta-faturas"]');
    expect(inicio, "a query de faturas da Conta desapareceu").toBeGreaterThan(-1);
    const bloco = conta.slice(inicio, inicio + 240);
    expect(bloco, "sem enabled, a prévia do admin e a demo caem em erro de autorização").toContain(
      "enabled: previa === null",
    );
  });

  it("o gate usa a mesma fonte de prévia que o resto da tela, não uma nova", () => {
    // `previa` vem de usePreviaPortal(), já usado para titular/condição/país
    // na mesma tela. Um segundo mecanismo de detecção de prévia aqui seria
    // exatamente a duplicação que o AGENTS.md proíbe.
    expect(conta).toContain("const previa = usePreviaPortal()");
  });
});
