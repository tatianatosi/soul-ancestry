import { describe, expect, it } from "vitest";
import { seguro } from "@/lib/clientes.functions";

describe("seguro() — erro de leitura nunca vira lista vazia fabricada", () => {
  it("retorna os dados quando a consulta tem sucesso", async () => {
    const r = await seguro(Promise.resolve({ data: [{ id: "1" }], error: null }));
    expect(r).toEqual([{ id: "1" }]);
  });

  it("retorna [] quando a consulta tem sucesso e não há linha (vazio legítimo)", async () => {
    const r = await seguro(Promise.resolve({ data: [], error: null }));
    expect(r).toEqual([]);
  });

  it("propaga erro em vez de virar [] quando a resposta traz r.error", async () => {
    await expect(seguro(Promise.resolve({ data: null, error: { message: "RLS negou" } }))).rejects.toThrow(
      "RLS negou",
    );
  });

  it("propaga exceção de rede em vez de virar [] silenciosamente", async () => {
    await expect(seguro(Promise.reject(new Error("timeout de rede")))).rejects.toThrow("timeout de rede");
  });
});
