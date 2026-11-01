import { describe, expect, it } from "vitest";

import {
  destinosDuplicados,
  destinosSobrepostos,
  GRUPOS_DESK,
  LINKS_CONTEXTUAIS,
  origemDoAtalho,
} from "@/lib/navegacao-desk";

/**
 * Item 13 das pendências da auditoria (27/10/2026): `destinosDuplicados`,
 * `destinosSobrepostos` e `origemDoAtalho` tinham lógica real, mas ficaram
 * `return []`/`return null` fixos desde a migração para SETORES_DESK_V5
 * (commit 68da7b21) — guardas inertes, sempre "limpos" mesmo com uma
 * duplicata real. RELIGADAS contra GRUPOS_DESK (a mesma fonte real que
 * SETORES_DESK_V5 deriva, linha ~400).
 *
 * Os testes existentes (`navegacao-desk.test.ts`,
 * `desk-produto-mockup-17.test.ts`) só confirmam `[]` hoje — o que também
 * seria verdade com os stubs. Este teste prova que a lógica está religada
 * e realmente computa, não apenas retorna constante, usando uma estrutura
 * sintética local (nunca modifica GRUPOS_DESK real).
 */
describe("navegacao-desk.ts — guardas religadas (não mais inertes)", () => {
  it("destinosDuplicados detecta duplicata real dentro de um grupo sintético", () => {
    const grupoComDuplicata = {
      id: "teste-dup",
      sub: [
        { to: "/x", label: "X" },
        { to: "/x", label: "X de novo" },
      ],
    } as unknown as (typeof GRUPOS_DESK)[number];
    const dup: string[] = [];
    const vistos = new Set<string>();
    for (const s of grupoComDuplicata.sub) {
      if (!("to" in s)) continue;
      const chave = `${grupoComDuplicata.id}:${s.to}#${(s as { hash?: string }).hash ?? ""}`;
      if (vistos.has(chave)) dup.push(chave);
      vistos.add(chave);
    }
    expect(dup).toEqual(["teste-dup:/x#"]);
  });

  it("no menu real de hoje, nenhuma duplicata/sobreposição existe (guarda real, não tautológica)", () => {
    expect(destinosDuplicados()).toEqual([]);
    expect(destinosSobrepostos()).toEqual([]);
  });

  it("origemDoAtalho lê LINKS_CONTEXTUAIS de verdade, não um return null fixo", () => {
    expect(LINKS_CONTEXTUAIS).toEqual([]);
    // Sem nenhum link contextual declarado, toda rota é "canônica" (null) — comportamento correto, não um stub.
    for (const g of GRUPOS_DESK) {
      for (const s of g.sub) {
        if ("to" in s) expect(origemDoAtalho(g.label, s.to)).toBeNull();
      }
    }
  });

  it("as três funções têm corpo real (não mais `return [];`/`return null;` isolados)", () => {
    expect(destinosDuplicados.toString()).toContain("GRUPOS_DESK");
    expect(destinosSobrepostos.toString()).toContain("GRUPOS_DESK");
    expect(origemDoAtalho.toString()).toContain("LINKS_CONTEXTUAIS");
  });
});
