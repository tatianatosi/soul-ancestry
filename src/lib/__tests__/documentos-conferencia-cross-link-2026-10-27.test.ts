import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Achado 22 da auditoria de espectro completo (27/10/2026): a seção "Em
 * validação" lia o MESMO `checklist.itens(tom="analise")` que já aparece
 * no "Checklist consolidado" no topo da tela, e repetia os títulos sem
 * nenhuma referência cruzada — a família via o mesmo item em dois
 * esquemas diferentes, sem elo entre eles.
 *
 * As outras três seções (Solicitados/Recebidos/Liberados) NÃO foram
 * tocadas: leem fontes genuinamente diferentes (decisão de 26/10/2026,
 * mockup17 §7, "quatro estados que nunca podem se misturar").
 */
const src = readFileSync("src/routes/portal/documentos.tsx", "utf8");

describe("Documentos — 'Em validação' referencia o checklist em vez de repetir em silêncio", () => {
  it("as duas seções (prévia e vivo) existem e citam o checklist consolidado", () => {
    const ocorrencias = [...src.matchAll(/data-documentos-conferencia/g)];
    expect(ocorrencias.length).toBe(2);
    expect(src).toContain("checklist consolidado, acima");
  });

  it("não repete mais a lista de títulos do checklist sem contexto", () => {
    // O .map((i) => i.titulo).join(" · ") duplicava o mesmo título que o
    // checklist do topo já mostra com mais detalhe (inclusive prazo).
    expect(src).not.toContain('.map((i) => i.titulo).join(" · ")');
  });
});
