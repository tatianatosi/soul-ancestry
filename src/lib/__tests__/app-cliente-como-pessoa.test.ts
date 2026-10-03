import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { GRUPOS_DESK } from "@/lib/navegacao-desk";

const ler = (p: string) => readFileSync(p, "utf8");

const rota = ler("src/routes/_authenticated/app-cliente-como-pessoa.tsx");
const fn = ler("src/lib/app-cliente-como-pessoa.functions.ts");

/**
 * 28/08/2026 — "preciso com o acesso master ter acesso ao app cliente como
 * pessoa" (Proprietária). Antes só existia a demo com dado fictício
 * (Sophia). Esta tela é o "espelho de caso real" já anotado como próximo
 * passo em 25/08: mesmos componentes do App Cliente, dado real de um caso
 * escolhido, autorizado por papel de staff em vez de sessão de cliente.
 */
describe("App Cliente como pessoa (acesso master, dado real)", () => {
  it("renderiza os componentes reais do portal, não uma reprodução", () => {
    expect(ler("src/components/portal/abas-app-cliente.tsx")).toContain('from "@/routes/portal/jornada"');
    expect(ler("src/components/portal/abas-app-cliente.tsx")).toContain('from "@/routes/portal/arvore"');
    expect(ler("src/components/portal/abas-app-cliente.tsx")).toContain('from "@/routes/portal/radar"');
    expect(rota).toContain("ABAS_APP_CLIENTE");
  });

  it("é rota interna do Desk, autenticada e noindex", () => {
    expect(rota).toContain('createFileRoute("/_authenticated/app-cliente-como-pessoa")');
    expect(rota).toContain('{ name: "robots", content: "noindex" }');
  });

  it("exige escolher um caso antes de montar o provider", () => {
    expect(rota).toContain("!casoId");
    expect(rota).toContain("<FontePortalProvider");
  });

  it("nada nesta tela envia, publica ou grava", () => {
    expect(rota).not.toMatch(/useMutation|\.insert\(|\.update\(|\.delete\(|enviar|publicar/i);
  });

  it("a função server só autoriza a Proprietária Administradora", () => {
    expect(fn).toContain("ehProprietariaAdministradora(papel)");
    expect(fn).toContain('throw new Error("Somente a Proprietária Administradora');
  });

  it("lê a projeção sanitizada do caso como staff, via app_projections da organização", () => {
    expect(fn).toContain("app_projections");
    expect(fn).toContain("content_sanitized");
    expect(fn).toContain('.eq("organization_id", organizationId)');
  });

  it("chama semCache() — resposta autenticada não pode ficar em cache", () => {
    expect(fn).toContain('from "@/lib/no-store"');
    expect(fn).toContain("semCache();");
  });
});

describe("navegação — App Cliente como pessoa é alcançável em Casos 360", () => {
  it("está listado em Casos 360; a sessão demo mora no menu da conta", () => {
    const casos = GRUPOS_DESK.find((g) => g.id === "casos")!;
    const rotas = casos.sub.map((s) => ("to" in s ? s.to : null));
    expect(rotas).not.toContain("/app-cliente-demo");
    // V4: a visão administrativa do App mora em Pessoas & Famílias.
    const pessoas = GRUPOS_DESK.find((g) => g.id === "pessoas")!;
    expect(pessoas.sub.some((s) => "to" in s && s.to === "/app-cliente-como-pessoa")).toBe(true);
  });
});

describe("sem ponte admin: RLS da equipe lê as projeções (30/09/2026)", () => {
  const fonte = readFileSync("src/lib/app-cliente-como-pessoa.functions.ts", "utf8");

  it("não importa o cliente service_role — a rota parou de depender dele", () => {
    // O contorno existia só "enquanto 20260911120000 não estiver no projeto
    // remoto"; a migration já está aplicada. Segredo ausente ou de outro
    // projeto era o que virava "Invalid API key" nesta tela.
    expect(fonte).not.toContain("client.server");
    expect(fonte).not.toContain("supabaseAdmin");
    expect((fonte.match(/const leitorProjecoes = supabase;/g) ?? []).length).toBe(2);
  });

  it("continua autorizando antes de ler, e filtrando por organização e caso", () => {
    expect(fonte).toContain("ehProprietariaAdministradora(papel)");
    expect(fonte).toContain('.from("app_projections")');
    for (const filtro of ['.eq("organization_id", organizationId)', '.eq("case_id", data.casoId)'])
      expect(fonte).toContain(filtro);
  });
});
