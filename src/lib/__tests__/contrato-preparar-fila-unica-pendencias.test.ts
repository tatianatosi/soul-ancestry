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

  // Resgate Ana (27/09/2026): o cabeçalho aponta para UMA lista de
  // pendências humanas; as contagens técnicas ficam só em Detalhes internos.
  it("o cabeçalho linka para a lista única de pendências humanas, não duplica a UI", () => {
    expect(rota).toContain('href="#pendencias"');
    expect(rota).toContain('id="pendencias"');
    expect(rota.match(/data-pendencias-humanas/g)?.length).toBe(2);
  });

  it("os três alvos de âncora existem de fato na página", () => {
    expect(rota).toContain('id="checklist-pre-contrato"');
    expect(rota).toContain('id="decisao-humana"');
    expect(rota).toContain('id="anexos"');
  });

  it('mostra "sem pendência" quando o total é zero, em vez de esconder o bloco', () => {
    expect(rota).toContain("Nenhuma pendência humana aberta.");
  });
});
