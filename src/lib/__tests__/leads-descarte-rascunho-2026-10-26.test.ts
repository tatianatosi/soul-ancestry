import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Achado da auditoria pré-lançamento (25/10/2026, item 6 do "Ainda
 * pendente"): trocar de lead pelo Kanban, "Abrir ficha" ou fechar a ficha
 * descartava rascunho não salvo sem aviso — só o clique na lista de gestão
 * (Corte 1, 27/09/2026) tinha confirmação.
 *
 * `window.confirm` é proibido no projeto, então a correção reaproveita o
 * banner inline que a lista já desenhava ("Há alterações não salvas neste
 * lead" / "Descartar e abrir o outro lead" / "Continuar editando"), extraído
 * para `trocarDeLead` e usado nos três lugares — não um terceiro mecanismo.
 */
const rota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

describe("leads.tsx — trocar de lead nunca descarta rascunho em silêncio", () => {
  it("trocarDeLead existe, não usa window.confirm, e vira leadPendente quando há rascunho", () => {
    const inicio = rota.indexOf("const trocarDeLead = (id: string | null) => {");
    expect(inicio).toBeGreaterThan(-1);
    const bloco = rota.slice(inicio, inicio + 400);
    expect(bloco).toContain("Object.keys(rascunho).length > 0");
    expect(bloco).toContain("setLeadPendente(id)");
    expect(bloco).not.toContain("window.confirm");
  });

  it("os três pontos de troca de lead usam trocarDeLead — nenhum chama setSelecionado direto", () => {
    expect((rota.match(/onClick={\(\) => trocarDeLead\(l\.id \?\? null\)}/g) ?? []).length).toBe(3);
    // fora da própria definição de trocarDeLead e do botão "descartar" do banner
    // (que já passava pelo guard antes de chegar aqui), não deve haver mais
    // nenhum clique que troque de lead sem passar pelo guard.
    const cliquesCrus = [...rota.matchAll(/onClick=\{\(\) => \{\s*setSelecionado\(l\.id/g)];
    expect(cliquesCrus).toEqual([]);
  });

  it("o banner de rascunho pendente continua oferecendo as duas saídas (descartar / continuar)", () => {
    expect(rota).toContain("Há alterações não salvas neste lead.");
    expect(rota).toContain("Descartar e abrir o outro lead");
    expect(rota).toContain("Continuar editando");
  });
});
