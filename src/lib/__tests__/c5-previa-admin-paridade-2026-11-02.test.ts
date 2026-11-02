import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { estadoDocumentalEPlanoDoCaso } from "../portal-dados-vivos";

const ler = (f: string) => readFileSync(resolve(__dirname, "..", f), "utf8");

/** Chaves do objeto do `return {` final de um handler (nível 1 apenas). */
function chavesDoRetorno(src: string, depoisDe: string): string[] {
  const ini = src.indexOf(depoisDe);
  const r = src.indexOf("\n    return {\n", ini);
  const fim = src.indexOf("\n    };", r);
  return [...src.slice(r, fim).matchAll(/^      (\w+)[,:]/gm)].map((m) => m[1]).sort();
}

describe("C5 prévia do admin tem paridade com dadosVivosDoPortal", () => {
  const real = ler("portal-dados-vivos.functions.ts");
  const admin = ler("app-cliente-como-pessoa.functions.ts");

  it("devolve as mesmas chaves (checklist, solicitacoes, etapa, composicao, historico, proximaEntrega...)", () => {
    const kReal = chavesDoRetorno(real, "export const dadosVivosDoPortal");
    const kAdmin = chavesDoRetorno(admin, "export const dadosVivosDoPortalComoAdmin");
    for (const k of ["checklist", "solicitacoes", "etapa", "composicao", "historico", "proximaEntrega", "casoAtivoId"]) {
      expect(kReal).toContain(k);
      expect(kAdmin).toContain(k);
    }
    // Admin tem a mais apenas `titularNome` e `escopo` (já existiam); nada do real falta nele.
    expect(kReal.filter((k) => !kAdmin.includes(k))).toEqual([]);
  });

  it("ambos usam o mesmo recorte sanitizado e só marcos aprovados para a família", () => {
    expect(real).toContain("estadoDocumentalEPlanoDoCaso(");
    expect(admin).toContain("estadoDocumentalEPlanoDoCaso(");
    expect(admin).toContain('.eq("visibility", "cliente_aprovado")');
  });
});

describe("estadoDocumentalEPlanoDoCaso (recorte comum)", () => {
  it("checklist e solicitações vêm dos pedidos; pendência conta só aguardando/recusado", () => {
    const e = estadoDocumentalEPlanoDoCaso({
      pedidos: [
        { id: "1", status: "aguardando", titulo: "RG" } as any,
        { id: "2", status: "aprovado", titulo: "CPF" } as any,
      ],
      faseJornada: null,
      eventosTimeline: [],
    });
    expect(e.checklist.total).toBe(2);
    expect(e.documentosPendentes).toBe(1);
    expect(e.etapa).toBeNull();
    expect(e.historico).toEqual([]);
  });
});
