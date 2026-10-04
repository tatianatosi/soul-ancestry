import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/*
 * Item 5 da autorização "Contrato de Uma Hora" (2026-09-24): "fila única de
 * pendências". Investigação prévia mostrou três fontes conceitualmente
 * distintas já existentes — checklist de prontidão pré-contrato, bloqueios
 * de gate, e pendências por anexo (Anexos I-V) — que não deviam ser
 * fundidas numa entidade nova sem decisão explícita. Este corte soma as
 * três num resumo visível na ficha, com link para a seção real de cada
 * uma, sem criar um modelo de pendência paralelo.
 */

const ROTA = resolve(__dirname, "../../routes/_authenticated/casos.$caseId.contrato.preparar.tsx");
const rota = readFileSync(ROTA, "utf8");

describe("Contrato de Uma Hora — fila única de pendências (resumo agregado)", () => {
  it("soma as três fontes reais sem inventar uma quarta", () => {
    expect(rota).toContain("const pendenciasChecklist = checklistPre.filter((i) => i.estado !== \"concluido\").length");
    expect(rota).toContain("const pendenciasAnexos = pendenciasDosAnexos(anexosGovernados).length");
    expect(rota).toContain("const totalPendenciasFicha = pendenciasChecklist + bloqueios.length + pendenciasAnexos");
  });

  /*
   * 04/10/2026 — decisão da Proprietária: "retire ... também os bloqueios
   * humanos do contrato". A lista de pendências humanas e o link do cabeçalho
   * saíram da tela. Quem responde "o que falta agora" é o trilho de prontidão,
   * com uma frase e a âncora do cartão que resolve. As três contagens técnicas
   * continuam somadas e visíveis em Detalhes internos — não foram fundidas
   * nem apagadas.
   */
  it("os bloqueios humanos saíram da tela, e o trilho responde no lugar deles", () => {
    expect(rota).not.toContain('href="#pendencias"');
    expect(rota).not.toContain('titulo="6. Pendências humanas"');
    expect(rota).not.toContain("data-pendencias-humanas");
    expect(rota).toContain("<TrilhoProntidaoContrato");
    expect(rota).toContain("data-fila-pendencias-ficha-interna");
  });

  it("as âncoras do trilho existem de fato na página", () => {
    for (const id of ["proposta", "ficha", "escopo", "comercial", "anexos", "previas", "decisao-humana"]) {
      expect(rota, id).toContain(`id="${id}"`);
    }
  });

  it("as contagens técnicas continuam somadas, agora só no bloco recolhido", () => {
    expect(rota).toContain("totalPendenciasFicha");
    expect(rota).toContain("marcador(es) técnico(s)");
  });
});
