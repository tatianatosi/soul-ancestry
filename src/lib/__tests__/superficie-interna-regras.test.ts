import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  decidirAcessoDesk,
  decidirSuperficieInterna,
  ehPapelInterno,
  PAPEIS_INTERNOS,
} from "@/lib/superficie-interna-regras";

const raiz = resolve(__dirname, "../..");
const ler = (p: string) => readFileSync(resolve(raiz, p), "utf8");

/** Fixture DEMO: nenhum dado real de cliente é usado nestes testes. */
const CLIENTE_DEMO = { autenticado: true, papeis: [] as string[] };
const EQUIPE_DEMO = { autenticado: true, papeis: ["operacoes"] };
const PROPRIETARIA_DEMO = { autenticado: true, papeis: ["admin"] };

describe("P0.1 — superfície interna", () => {
  it("1. cliente autenticado não renderiza controles internos", () => {
    expect(decidirSuperficieInterna(CLIENTE_DEMO)).toBe(false);
    expect(decidirSuperficieInterna({ autenticado: false, papeis: [] })).toBe(false);
    expect(decidirSuperficieInterna({ ...CLIENTE_DEMO, erroLeitura: true })).toBe(false);
  });

  it("2. cliente não acessa rota Desk por URL direta", () => {
    expect(decidirAcessoDesk(CLIENTE_DEMO)).toBe("portal");
    expect(decidirAcessoDesk({ autenticado: false, papeis: [] })).toBe("entrar");
  });

  it("3. usuário interno autorizado acessa Desk e vê superfície interna", () => {
    for (const papel of PAPEIS_INTERNOS) {
      expect(decidirAcessoDesk({ autenticado: true, papeis: [papel] })).toBe("permitir");
      expect(decidirSuperficieInterna({ autenticado: true, papeis: [papel] })).toBe(true);
    }
    expect(decidirAcessoDesk(EQUIPE_DEMO)).toBe("permitir");
    expect(decidirAcessoDesk(PROPRIETARIA_DEMO)).toBe("permitir");
    expect(ehPapelInterno("cliente")).toBe(false);
  });

  it("4. reload/falha de leitura não cruza perfis: equipe mantém sessão, cliente não ganha superfície", () => {
    // Falha de infraestrutura não derruba a equipe do Desk (RLS segue barrando dados)...
    expect(decidirAcessoDesk({ ...EQUIPE_DEMO, erroLeitura: true })).toBe("permitir");
    // ...mas nunca libera rótulos internos sem prova de papel.
    expect(decidirSuperficieInterna({ ...EQUIPE_DEMO, papeis: [], erroLeitura: true })).toBe(false);
  });

  it("5. rótulos internos e caso-modelo estão condicionados à superfície interna", () => {
    const index = ler("routes/index.tsx");
    expect(index).toMatch(/\{interna && <AppSwitcher/);
    expect(index).toMatch(/\{interna && \(\s*\n\s*<Link to="\/painel"/);
    expect(index).toMatch(/interna && app === "desk"/);

    const entrega = ler("components/entrega-consultiva.tsx");
    expect(entrega).toMatch(/const MODO_DEMO = useSuperficieInterna\(\)/);
    expect(entrega).toMatch(/modelo && MODO_DEMO/);
  });

  it("portão do Desk e portal do cliente checam papel/sessão no roteador", () => {
    const gate = ler("routes/_authenticated/route.tsx");
    expect(gate).toContain("decidirAcessoDesk");
    expect(gate).toContain('redirect({ to: "/portal" })');
    expect(gate).toContain('redirect({ to: "/equipe/entrar" })');

    const portal = ler("routes/portal/route.tsx");
    expect(portal).toContain('redirect({ to: "/acesso" })');
  });
});
