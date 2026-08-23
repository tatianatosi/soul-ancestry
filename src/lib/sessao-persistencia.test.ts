import { describe, expect, it } from "vitest";

import { chavesParaRemover, ehChaveDeSessaoDoProvedor } from "./limpar-sessao";
import { ehTransicaoDeIdentidade, sessaoAusenteConfirmada } from "./guarda-sessao";
import { destinoLinkAuth } from "./link-auth";

describe("persistência de sessão — limpeza de armazenamento", () => {
  it("preserva a chave de sessão do provedor", () => {
    expect(ehChaveDeSessaoDoProvedor("sb-liiqqibnirnpnvjmjrpj-auth-token")).toBe(true);
    expect(ehChaveDeSessaoDoProvedor("sb-liiqqibnirnpnvjmjrpj-auth-token.0")).toBe(true);
    expect(ehChaveDeSessaoDoProvedor("ca:preferencias")).toBe(false);
  });

  it("remove apenas resíduos da aplicação, nunca a sessão de outras abas", () => {
    const chaves = ["sb-liiqqibnirnpnvjmjrpj-auth-token", "ca:filtro-painel", "ultimo-caso"];
    expect(chavesParaRemover(chaves)).toEqual(["ca:filtro-painel", "ultimo-caso"]);
  });
});

describe("guarda de rota administrativa", () => {
  it("não ejeta quando a primeira leitura é vazia e a sessão reaparece", async () => {
    const leituras = [false, true];
    const ausente = await sessaoAusenteConfirmada(async () => leituras.shift() ?? true, {
      esperaMs: 0,
      dormir: async () => {},
    });
    expect(ausente).toBe(false);
  });

  it("confirma ausência só após todas as tentativas negativas", async () => {
    let chamadas = 0;
    const ausente = await sessaoAusenteConfirmada(
      async () => {
        chamadas += 1;
        return false;
      },
      { tentativas: 3, esperaMs: 0, dormir: async () => {} },
    );
    expect(ausente).toBe(true);
    expect(chamadas).toBe(3);
  });

  it("erro de leitura não é tratado como logout", async () => {
    const ausente = await sessaoAusenteConfirmada(
      async () => {
        throw new Error("rede indisponível");
      },
      { esperaMs: 0, dormir: async () => {} },
    );
    expect(ausente).toBe(false);
  });

  it("só reavalia rota e cache em transições reais de identidade", () => {
    expect(ehTransicaoDeIdentidade("SIGNED_IN")).toBe(true);
    expect(ehTransicaoDeIdentidade("SIGNED_OUT")).toBe(true);
    expect(ehTransicaoDeIdentidade("TOKEN_REFRESHED")).toBe(false);
    expect(ehTransicaoDeIdentidade("INITIAL_SESSION")).toBe(false);
  });

  it("navegação normal autenticada não é reencaminhada para telas de token", () => {
    expect(destinoLinkAuth("/modo-proprietaria", "", "")).toBeNull();
    expect(destinoLinkAuth("/painel", "?tab=hoje", "")).toBeNull();
  });
});
