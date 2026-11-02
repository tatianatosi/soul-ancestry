import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { abasCanonicasDoPortal } from "@/lib/portal-navegacao";

/** C8 (02/11/2026) — mensagens/tickets do caso alcançáveis pelo App, sem 8ª aba. */
const CONTA = readFileSync("src/routes/portal/conta.tsx", "utf8");

describe("C8 — CTA contextual de mensagens do caso na aba Conta", () => {
  it("as rotas de destino existem (arquivo e árvore de rotas)", () => {
    expect(existsSync("src/routes/portal/casos.$id.tsx")).toBe(true);
    expect(existsSync("src/routes/portal/mensagens.$id.tsx")).toBe(true);
    expect(readFileSync("src/routeTree.gen.ts", "utf8")).toContain("/casos/$id");
  });
  it("a tela de destino (caso) já lista e abre tickets e leva a /portal/mensagens/$id", () => {
    const detalhe = readFileSync("src/components/portal/caso-detalhe.tsx", "utf8");
    expect(detalhe).toContain('to="/portal/mensagens/$id"');
    expect(detalhe).toContain("abrirTicket");
  });
  it("Conta liga a /portal/casos/$id com o caso ativo, só com acesso e fora da prévia", () => {
    expect(CONTA).toMatch(/!previa && vivo\.data\?\.casoAtivoId \? \(/);
    expect(CONTA).toContain('to="/portal/casos/$id"');
    expect(CONTA).toMatch(/params=\{\{ id: vivo\.data\.casoAtivoId \}\}/);
    expect(CONTA).toMatch(/search=\{\{ casoId: vivo\.data\.casoAtivoId \}/);
    expect(CONTA).toContain("data-conta-mensagens-caso");
  });
  it("o App continua com exatamente 7 abas", () => {
    expect(abasCanonicasDoPortal().map((a) => a.rota)).toEqual([
      "/portal",
      "/portal/jornada",
      "/portal/radar",
      "/portal/arvore",
      "/portal/documentos",
      "/portal/legado",
      "/portal/conta",
    ]);
  });
});
