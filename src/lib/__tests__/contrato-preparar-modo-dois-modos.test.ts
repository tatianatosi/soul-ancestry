import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/*
 * Autorização da Proprietária (2026-09-24, "Contrato de Uma Hora"): a tela
 * de preparação ganha dois modos — "Preparar contrato" (trabalho de dado) e
 * "Revisar prévia" (leitura de conferência) — sem remover nenhum dos 7
 * CartaoDetalhe existentes, sem reabrir jurídico, sem criar rota paralela.
 * Este teste confere só a presença real do toggle e o agrupamento por modo
 * no arquivo, no mesmo padrão de string-match usado pelos demais testes
 * desta rota (checklist-pre-contrato-ana, pente-fino-ana-contrato etc.).
 */

const ROTA = resolve(__dirname, "../../routes/_authenticated/casos.$caseId.contrato.preparar.tsx");
const rota = readFileSync(ROTA, "utf8");

describe("Contrato de Uma Hora — dois modos (Preparar contrato / Revisar prévia)", () => {
  it('declara o estado do modo com "preparar" como padrão', () => {
    expect(rota).toContain('useState<"preparar" | "revisar">("preparar")');
  });

  it("renderiza os dois botões de alternância de modo", () => {
    expect(rota).toContain("Preparar contrato");
    expect(rota).toContain("Revisar prévia");
    expect(rota).toContain('setModo("preparar")');
    expect(rota).toContain('setModo("revisar")');
  });

  it("mantém os 7 CartaoDetalhe originais — nenhum foi removido", () => {
    for (const titulo of [
      "1. Planejador & Comercial",
      "2. Formalização & Anexos",
      "3. Cláusulas & Perfil Institucional",
      "4. Estrutura Familiar & Ficha",
      "5. Coerência & Instrumentos",
      "6. Prévia & Versões",
      "7. Auditoria",
    ]) {
      expect(rota).toContain(titulo);
    }
  });

  it('cards de trabalho de dado (1, 2, 4) ficam sob modo === "preparar"', () => {
    const idx1 = rota.indexOf('titulo="1. Planejador & Comercial"');
    const idx2 = rota.indexOf('titulo="2. Formalização & Anexos"');
    const idx4 = rota.indexOf('titulo="4. Estrutura Familiar & Ficha"');
    const guardaPreparar = rota.lastIndexOf('modo === "preparar"', idx1);
    expect(guardaPreparar).toBeGreaterThan(-1);
    expect(rota.lastIndexOf('modo === "preparar"', idx2)).toBeGreaterThan(-1);
    expect(rota.lastIndexOf('modo === "preparar"', idx4)).toBeGreaterThan(-1);
  });

  it('cards de conferência (3, 5, 6, 7) ficam sob modo === "revisar"', () => {
    for (const titulo of [
      "3. Cláusulas & Perfil Institucional",
      "5. Coerência & Instrumentos",
      "6. Prévia & Versões",
      "7. Auditoria",
    ]) {
      const idx = rota.indexOf(`titulo="${titulo}"`);
      expect(rota.lastIndexOf('modo === "revisar"', idx)).toBeGreaterThan(-1);
    }
  });

  it("liga o Contrato registrado (badge) a /contratos/$id — instrumento deixa de ser órfão da tela de preparação", () => {
    expect(rota).toContain('to="/contratos/$id"');
    expect(rota).toContain("params={{ id: d.contrato.id }}");
  });
});
