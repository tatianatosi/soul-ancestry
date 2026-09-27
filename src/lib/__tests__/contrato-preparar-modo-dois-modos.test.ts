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

  /*
   * Resgate Ana (autorização da Proprietária, 27/09/2026): a ordem passou a
   * ser Preparar = Proposta → Partes → Escopo → Condição particular →
   * OS/Anexos → Pendências → Salvar; Revisar = Contrato v2 completo → Anexo
   * I/OS e anexos → versões/histórico → solicitar revisão. Os antigos 7
   * cartões técnicos continuam na página, recolhidos em "Detalhes internos".
   */
  it("Preparar segue a ordem Proposta → Partes → Escopo → Condição → OS/Anexos → Pendências → Salvar", () => {
    const ordem = [
      'titulo="1. Proposta aprovada"',
      'titulo="2. Partes e representação"',
      'titulo="3. Escopo e entregas"',
      'titulo="4. Condição particular do caso"',
      'titulo="5. Ordem de Serviço (Anexo I) e anexos"',
      'titulo="6. Pendências humanas"',
      'titulo="7. Salvar rascunho"',
    ].map((t) => rota.indexOf(t));
    for (const i of ordem) expect(i).toBeGreaterThan(-1);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
    const guarda = rota.lastIndexOf('modo === "preparar"', ordem[0]);
    expect(guarda).toBeGreaterThan(-1);
    expect(rota.indexOf('modo === "revisar"', guarda)).toBeGreaterThan(ordem[6]);
  });

  it("Revisar segue a ordem Contrato v2 completo → Anexo I/OS → versões → solicitar revisão", () => {
    const ordem = [
      "1. ${instrumento} — prévia completa",
      'titulo="2. Anexo I (Ordem de Serviço) e anexos aplicáveis"',
      'titulo="3. Versões e histórico"',
      'titulo="4. Solicitar revisão, aprovar e preparar assinatura"',
    ].map((t) => rota.indexOf(t));
    for (const i of ordem) expect(i).toBeGreaterThan(-1);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
    expect(rota.lastIndexOf('modo === "revisar"', ordem[0])).toBeGreaterThan(-1);
  });

  it("matriz técnica, gates, fontes e auditoria ficam recolhidos em Detalhes internos, depois dos dois modos", () => {
    const detalhes = rota.indexOf('<details id="detalhes-internos"');
    expect(detalhes).toBeGreaterThan(rota.indexOf('titulo="4. Solicitar revisão, aprovar e preparar assinatura"'));
    for (const titulo of [
      "Cláusulas & Perfil Institucional",
      "Coerência & Instrumentos",
      "Auditoria",
      "Checklist operacional — pré-contrato",
    ]) {
      expect(rota.indexOf(titulo, detalhes)).toBeGreaterThan(detalhes);
    }
  });

  it("liga o Contrato registrado (badge) a /contratos/$id — instrumento deixa de ser órfão da tela de preparação", () => {
    expect(rota).toContain('to="/contratos/$id"');
    expect(rota).toContain("params={{ id: d.contrato.id }}");
  });
});
