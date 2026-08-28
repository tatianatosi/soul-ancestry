import { describe, expect, it, vi } from "vitest";

import { efeitoAdministrativo, staffPorUsuarioComRls } from "../equipe.server";

/** Cliente falso que responde como o supabase-js responde. */
function clienteQueDevolve(linhas: unknown[] | null) {
  const cadeia: Record<string, unknown> = {};
  for (const metodo of ["from", "select", "eq", "is"]) {
    cadeia[metodo] = vi.fn(() => cadeia);
  }
  cadeia.limit = vi.fn(async () => ({ data: linhas }));
  return cadeia;
}

describe("a autorização não depende da chave secreta", () => {
  it("lê a própria linha com o cliente do usuário", async () => {
    const linha = { id: "s1", organization_id: "o1", auth_user_id: "u1", role: "admin", status: "active" };
    const cliente = clienteQueDevolve([linha]);
    expect(await staffPorUsuarioComRls(cliente, "u1")).toEqual(linha);
  });

  it("filtra pelo próprio usuário e ignora arquivados", async () => {
    // A política `staff_select_self` já limita ao dono da linha; o filtro
    // explícito garante que não dependemos só dela.
    const cliente = clienteQueDevolve([]);
    await staffPorUsuarioComRls(cliente, "u1");
    expect(cliente.from).toHaveBeenCalledWith("staff_access");
    expect(cliente.eq).toHaveBeenCalledWith("auth_user_id", "u1");
    expect(cliente.is).toHaveBeenCalledWith("archived_at", null);
  });

  it("devolve null quando não há linha, sem lançar", async () => {
    expect(await staffPorUsuarioComRls(clienteQueDevolve(null), "u1")).toBeNull();
    expect(await staffPorUsuarioComRls(clienteQueDevolve([]), "u1")).toBeNull();
  });
});

describe("efeitos administrativos não derrubam o login", () => {
  it("informa sucesso quando a ação passa", async () => {
    expect(await efeitoAdministrativo("teste", async () => "ok")).toBe(true);
  });

  it("engole a falha e segue, em vez de lançar", async () => {
    // Este é exatamente o desenho que faltava: carimbar last_login_at e
    // auditar são consequências de entrar, nunca condições para entrar.
    const console_ = vi.spyOn(console, "error").mockImplementation(() => {});
    const resultado = await efeitoAdministrativo("teste", async () => {
      throw new Error("chave secreta do projeto errado");
    });
    expect(resultado).toBe(false);
    console_.mockRestore();
  });

  it("registra a falha em vez de escondê-la", async () => {
    const console_ = vi.spyOn(console, "error").mockImplementation(() => {});
    await efeitoAdministrativo("carimbar last_login_at", async () => {
      throw new Error("falhou");
    });
    expect(console_).toHaveBeenCalledWith(
      expect.stringContaining("carimbar last_login_at"),
      expect.anything(),
    );
    console_.mockRestore();
  });
});
