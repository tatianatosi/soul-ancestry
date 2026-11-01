import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Achado 3 do ranking de risco da auditoria de espectro completo
 * (27/10/2026, Frente B): `/devolutiva` mostra one-pages com nomes de
 * clientes fictícios/reais e, em `main`, está sem autenticação. O guard
 * já existia na branch desde 25/10/2026 — este teste trava que ele
 * continue existindo, para não se repetir o padrão de uma correção que
 * só vive numa branch não mesclada.
 */
const src = readFileSync("src/routes/devolutiva.tsx", "utf8");

describe("/devolutiva exige sessão e o mesmo portão de acesso do Desk", () => {
  it("beforeLoad lê a sessão e redireciona para o login sem usuário autenticado", () => {
    const bloco = src.slice(src.indexOf("beforeLoad:"), src.indexOf("validateSearch:"));
    expect(bloco).toContain("supabase.auth.getSession()");
    expect(bloco).toContain('throw redirect({ to: "/equipe/entrar" })');
  });

  it("usa o mesmo decisor de acesso do Desk (decidirAcessoDesk), não uma checagem própria", () => {
    expect(src).toContain('import { decidirAcessoDesk } from "@/lib/superficie-interna-regras"');
    expect(src).toContain("decidirAcessoDesk({");
  });
});
