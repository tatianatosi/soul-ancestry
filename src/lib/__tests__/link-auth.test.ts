import { describe, expect, it } from "vitest";

import { ROTA_ACESSO_CLIENTE, ROTA_SENHA_EQUIPE, destinoLinkAuth, temTokenAuth } from "@/lib/link-auth";

describe("captura de links oficiais de autenticação", () => {
  it("reencaminha convite que aterrissa na home para a tela pública de senha", () => {
    expect(destinoLinkAuth("/", "?token_hash=abc&type=invite", "")).toBe(
      `${ROTA_SENHA_EQUIPE}?token_hash=abc&type=invite`,
    );
  });

  it("reencaminha recuperação com tokens no fragmento preservando o material", () => {
    const destino = destinoLinkAuth("/", "", "#access_token=a&refresh_token=b&type=recovery");
    expect(destino).toBe(`${ROTA_SENHA_EQUIPE}#access_token=a&refresh_token=b&type=recovery`);
  });

  it("envia link mágico de cliente para a confirmação de acesso", () => {
    expect(destinoLinkAuth("/", "?token_hash=x&type=magiclink", "")).toBe(
      `${ROTA_ACESSO_CLIENTE}?token_hash=x&type=magiclink`,
    );
  });

  it("não reencaminha quando já está na rota terminal", () => {
    expect(destinoLinkAuth(ROTA_SENHA_EQUIPE, "?token_hash=abc&type=invite", "")).toBeNull();
    expect(destinoLinkAuth(ROTA_ACESSO_CLIENTE, "?token_hash=x&type=magiclink", "")).toBeNull();
  });

  it("ignora navegação normal sem token", () => {
    expect(temTokenAuth("?aba=contratos", "")).toBe(false);
    expect(destinoLinkAuth("/painel", "?aba=contratos", "")).toBeNull();
  });
});
