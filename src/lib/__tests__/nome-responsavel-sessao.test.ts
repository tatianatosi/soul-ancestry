import { describe, expect, it } from "vitest";

import { nomeResponsavelSessao } from "@/lib/cadeia-operacional.server";

/*
 * Decisão 5 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — materializarProposta
 * e salvarCondicaoComercial não podem mais gravar texto fixo ("Comercial
 * responsável", "Operações responsável") nem aceitar do cliente quem
 * homologou. O nome vem sempre da sessão real (staff_access), nunca vazio,
 * nunca inventado.
 */
function supabaseComStaff(row: Record<string, unknown> | null) {
  return {
    from: (tabela: string) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => (tabela === "staff_access" ? { data: row } : { data: null }),
          }),
        }),
      }),
    }),
  } as never;
}

describe("nomeResponsavelSessao", () => {
  it("usa o nome completo do vínculo de equipe quando existe", async () => {
    const nome = await nomeResponsavelSessao(supabaseComStaff({ full_name: "Tati Tosi", email: "tati@pluggedresearch.com" }), "org-1", "user-1");
    expect(nome).toBe("Tati Tosi");
  });

  it("cai para o e-mail quando não há nome completo cadastrado", async () => {
    const nome = await nomeResponsavelSessao(supabaseComStaff({ full_name: null, email: "tati@pluggedresearch.com" }), "org-1", "user-1");
    expect(nome).toBe("tati@pluggedresearch.com");
  });

  it("nunca fica vazio: sem vínculo de equipe, cai no próprio id da sessão", async () => {
    const nome = await nomeResponsavelSessao(supabaseComStaff(null), "org-1", "user-1");
    expect(nome).toBe("user-1");
  });
});
