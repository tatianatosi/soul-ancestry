import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/*
 * 31/10/2026 — verificação de segurança: o histórico de convites e links do
 * portal só pode ser lido por gestão (admin/operações) e só da própria
 * organização, como as demais ações da tela de acessos.
 */
const fonte = readFileSync("src/lib/portal.functions.ts", "utf8");
const trecho = fonte.slice(
  fonte.indexOf("export const listarEventosAcesso"),
  fonte.indexOf("export const criarConvitePortal"),
);

describe("histórico de acesso ao portal", () => {
  it("exige papel de gestão antes de ler eventos", () => {
    expect(trecho).toContain("exigirGestor(");
    expect(trecho.indexOf("exigirGestor(")).toBeLessThan(trecho.indexOf('from("client_access_events")'));
  });

  it("filtra pela organização da pessoa que consulta", () => {
    expect(trecho).toContain('.eq("organization_id", organizationId)');
  });
});
