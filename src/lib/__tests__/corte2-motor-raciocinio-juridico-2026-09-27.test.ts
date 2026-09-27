import { describe, expect, it } from "vitest";
import {
  completudeDocumental,
  confiabilidadeJuridica,
  continuidadeDaLinha,
  raciocinioJuridicoDoCaso,
  type LineageEncounterBruto,
  type LineagePathBruto,
} from "@/lib/motor-raciocinio-juridico";

/**
 * Corte 2 (27/09/2026): motor de raciocínio jurídico automático, autorizado
 * explicitamente pela Proprietária. A especificação original proíbe um
 * único score de elegibilidade — 3 índices sempre separados. Função pura,
 * só leitura, nunca escreve, nunca infere fato jurídico/genealógico.
 */

const linha = (over: Partial<LineagePathBruto> = {}): LineagePathBruto => ({
  id: "linha-1",
  status: "em_pesquisa",
  evidencias_chave: ["ev-1"],
  ...over,
});

const encontro = (over: Partial<LineageEncounterBruto> = {}): LineageEncounterBruto => ({
  id: "enc-1",
  lineage_path_a_id: "linha-1",
  lineage_path_b_id: null,
  confidence_internal: "documentado",
  validation_status: "validado_internamente",
  ...over,
});

describe("Corte 2 — continuidadeDaLinha (índice 1, nunca infere o elo que falta)", () => {
  it("sem nenhum encontro, sinaliza continuidade não verificável", () => {
    const r = continuidadeDaLinha(linha(), []);
    expect(r.totalElos).toBe(0);
    expect(r.proporcao).toBeNull();
    expect(r.pendencias).toContain(
      "Nenhum encontro/junção de linhagem registrado para esta linha — continuidade ainda não verificável.",
    );
  });

  it("todos os encontros comprovados (consistente/documentado + validado_internamente) — proporção 1", () => {
    const r = continuidadeDaLinha(linha(), [encontro(), encontro({ id: "enc-2", confidence_internal: "consistente" })]);
    expect(r.totalElos).toBe(2);
    expect(r.elosComprovados).toBe(2);
    expect(r.proporcao).toBe(1);
    expect(r.pendencias.some((p) => p.includes("ainda em hipótese"))).toBe(false);
  });

  it("elo em hipótese/sem validação vira pendência explícita, nunca é inferido como comprovado", () => {
    const r = continuidadeDaLinha(linha(), [
      encontro(),
      encontro({ id: "enc-2", confidence_internal: "hipotese", validation_status: "rascunho" }),
    ]);
    expect(r.totalElos).toBe(2);
    expect(r.elosComprovados).toBe(1);
    expect(r.proporcao).toBe(0.5);
    expect(r.pendencias).toContain("1 elo(s) desta linha ainda em hipótese/indício ou sem validação interna.");
  });

  it("linha bloqueada/descartada sinaliza que a transmissão não pode ser considerada em curso", () => {
    const r = continuidadeDaLinha(linha({ status: "bloqueada" }), [encontro()]);
    expect(r.pendencias.some((p) => p.includes('"bloqueada"'))).toBe(true);
  });

  it("só considera encontros ligados a esta linha (path_a ou path_b), nunca de outra linha", () => {
    const r = continuidadeDaLinha(linha({ id: "linha-2" }), [encontro({ lineage_path_a_id: "linha-1" })]);
    expect(r.totalElos).toBe(0);
  });
});

describe("Corte 2 — completudeDocumental (índice 2, reaproveita documentos_minimos_ok e evidence_status real)", () => {
  it("sem documentos mínimos e sem evidência, lista as duas pendências", () => {
    const r = completudeDocumental(false, []);
    expect(r.pendencias).toContain(
      "Documentos mínimos do caso ainda não confirmados (crm_casos.documentos_minimos_ok).",
    );
    expect(r.pendencias).toContain("Nenhuma evidência registrada para este caso ainda.");
    expect(r.proporcaoValidada).toBeNull();
  });

  it("evidências parcialmente validadas — proporção real, sem arredondar para completo", () => {
    const r = completudeDocumental(true, [
      { evidence_status: "validated" },
      { evidence_status: "under_review" },
    ]);
    expect(r.evidenciasValidadas).toBe(1);
    expect(r.totalEvidencias).toBe(2);
    expect(r.proporcaoValidada).toBe(0.5);
    expect(r.pendencias).toContain("1 evidência(s) ainda não validada(s).");
  });
});

describe("Corte 2 — confiabilidadeJuridica (índice 3, mesmos campos de avaliarValidacaoJuridicaCaso)", () => {
  it("regra em rascunho e marco não vigente geram pendência textual, nunca parecer jurídico", () => {
    const r = confiabilidadeJuridica(
      [{ status: "rascunho" }, { status: "aprovado" }],
      [{ status: "em_revisao", lifecycle_status: "rascunho" }],
    );
    expect(r.proporcaoRegrasAprovadas).toBe(0.5);
    expect(r.proporcaoMarcosVigentes).toBe(0);
    expect(r.pendencias).toContain("1 regra(s) jurídica(s) ainda não aprovada(s).");
    expect(r.pendencias).toContain("1 marco(s) jurídico(s) ainda não vigente(s)/homologado(s).");
  });
});

describe("Corte 2 — raciocinioJuridicoDoCaso nunca funde os 3 índices num score único", () => {
  it("devolve os 3 índices como campos separados, nenhum campo de score/percentual combinado", () => {
    const r = raciocinioJuridicoDoCaso({
      linhas: [linha()],
      encontros: [encontro()],
      documentosMinimosOk: true,
      evidencias: [{ evidence_status: "validated" }],
      regras: [{ status: "aprovado" }],
      marcos: [{ status: "vigente", lifecycle_status: "vigente" }],
    });
    expect(Object.keys(r).sort()).toEqual(["completude", "confiabilidade", "continuidade"]);
    expect(Array.isArray(r.continuidade)).toBe(true);
    expect(r).not.toHaveProperty("score");
    expect(r).not.toHaveProperty("percentualElegibilidade");
  });
});
