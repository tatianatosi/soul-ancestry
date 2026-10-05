/*
 * Decisão da Proprietária em 04/10/2026, literal: "Retire todas as auditorias
 * repetidas do menu, de todas as abas e também os bloqueios humanos do
 * contrato." Saíram da tela de preparação: o cartão "Pendências humanas", o
 * "Checklist operacional — pré-contrato", o cartão "Coerência & Instrumentos"
 * (que reunia instrumentos, matriz jurídica e preparação — três conferências
 * do mesmo ato) e o cartão "Auditoria" (a trilha única vive em
 * /configuracoes). Nenhum componente nem rota foi apagado; só deixaram de ser
 * montados aqui. A decisão anterior, que exigia esses blocos, fica registrada
 * nos comentários abaixo.
 */
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
   * OS/Anexos → Salvar (as "Pendências humanas" eram o 6º cartão e saíram em
   * 04/10/2026); Revisar = Contrato v2 completo → Anexo
   * I/OS e anexos → versões/histórico → solicitar revisão. Os antigos 7
   * cartões técnicos continuam na página, recolhidos em "Detalhes internos".
   */
  it("Preparar segue a ordem Proposta → Partes → Escopo → Condição → OS/Anexos → Salvar", () => {
    const ordem = [
      'titulo="1. Proposta aprovada"',
      'titulo="2. Partes e representação"',
      'titulo="3. Escopo e entregas"',
      'titulo="4. Condição particular do caso"',
      'titulo="5. Ordem de Serviço (Anexo I) e anexos"',
      'titulo="6. Salvar rascunho"',
    ].map((t) => rota.indexOf(t));
    for (const i of ordem) expect(i).toBeGreaterThan(-1);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
    const guarda = rota.lastIndexOf('modo === "preparar"', ordem[0]);
    expect(guarda).toBeGreaterThan(-1);
    expect(rota.indexOf('modo === "revisar"', guarda)).toBeGreaterThan(ordem[ordem.length - 1]);
  });

  it("Revisar segue a ordem Contrato v2 completo → versões → solicitar revisão", () => {
    /*
     * 05/10/2026 — a segunda lista de Anexo I ("2. Anexo I (Ordem de Serviço)
     * e anexos aplicáveis", componente antigo sem a lógica de incorporação)
     * foi removida: a tela tinha duas listas de anexo mostrando estados
     * divergentes (uma dizia "Anexo I pendente" mesmo incorporado ao corpo).
     * A única lista de anexos do modo Preparar (seção "5.") é quem governa.
     */
    const ordem = [
      "1. ${instrumento} — prévia completa",
      'titulo="3. Versões e histórico"',
      'titulo="4. Solicitar revisão, aprovar e preparar assinatura"',
    ].map((t) => rota.indexOf(t));
    for (const i of ordem) expect(i).toBeGreaterThan(-1);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
    expect(rota.lastIndexOf('modo === "revisar"', ordem[0])).toBeGreaterThan(-1);
  });

  it("o que sobrou de técnico fica recolhido em Detalhes internos, depois dos dois modos", () => {
    const detalhes = rota.indexOf('<details id="detalhes-internos"');
    expect(detalhes).toBeGreaterThan(rota.indexOf('titulo="4. Solicitar revisão, aprovar e preparar assinatura"'));
    for (const titulo of ["Cláusulas & Perfil Institucional", "Planejador & Comercial (fontes)"]) {
      expect(rota.indexOf(titulo, detalhes), titulo).toBeGreaterThan(detalhes);
    }
    // Saíram da tela por decisão de 04/10/2026 (ver cabeçalho deste arquivo).
    for (const titulo of ["Coerência & Instrumentos", 'titulo="Auditoria"', "Checklist operacional"]) {
      expect(rota, titulo).not.toContain(titulo);
    }
  });

  it("liga o Contrato registrado (badge) a /contratos/$id — instrumento deixa de ser órfão da tela de preparação", () => {
    expect(rota).toContain('to="/contratos/$id"');
    expect(rota).toContain("params={{ id: d.contrato.id }}");
  });
});
