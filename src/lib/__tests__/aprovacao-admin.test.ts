import { describe, expect, it } from "vitest";
import { exigirAdminAprovador } from "../aprovacao-admin.server";

describe("aprovação exclusiva do admin", () => {
  it("permite admin da organização autorizado pelo banco", async () => {
    await expect(exigirAdminAprovador({ rpc: async (_name, args) => ({ data: args._org === "org-a", error: null }) }, "org-a")).resolves.toBeUndefined();
  });
  for (const papel of ["operacoes", "comercial", "financeiro", "pesquisador", "leitura"]) {
    it(`nega aprovação para ${papel}`, async () => {
      const client = { rpc: async () => ({ data: papel === "admin", error: null }) };
      await expect(exigirAdminAprovador(client, "org-a")).rejects.toThrow("Somente admin");
    });
  }
  it("nega admin de outra organização", async () => {
    await expect(exigirAdminAprovador({ rpc: async (_name, args) => ({ data: args._org === "org-a", error: null }) }, "org-b")).rejects.toThrow("Somente admin");
  });
  it("não converte erro de autorização em aprovação", async () => {
    await expect(exigirAdminAprovador({ rpc: async () => ({ data: true, error: { message: "Falha de leitura" } }) }, "org-a")).rejects.toThrow("Falha de leitura");
  });
});