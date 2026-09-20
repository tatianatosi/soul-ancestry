import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 1 (Alertas).
// atualizarAlerta (reconhecer/reprogramar) já gravava com gravarComVerificacao
// (erro/linha afetada cobertos) e a fila já saía corretamente no cliente
// (alertas.tsx invalida "alertas-completo" no sucesso da mutation) — mas
// nenhuma das duas ações deixava evento no histórico do caso. Prova por
// leitura do código real, mesmo estilo dos cortes anteriores.

const funcoes = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
const rota = readFileSync("src/routes/_authenticated/alertas.tsx", "utf8");

const trechoAtualizar = funcoes.slice(
  funcoes.indexOf("export const atualizarAlerta"),
  funcoes.indexOf("export const aprovarRascunho"),
);

describe("MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — atualizarAlerta registra histórico", () => {
  it("lê case_id do alerta antes de gravar, checando erro da leitura", () => {
    expect(trechoAtualizar).toContain('.select("case_id,titulo")');
    expect(trechoAtualizar).toContain("if (atual.error) throw new Error(atual.error.message);");
  });

  it("registra evento de histórico depois da escrita confirmada, nunca antes", () => {
    const posGravar = trechoAtualizar.indexOf("await gravarComVerificacao(");
    const posTimeline = trechoAtualizar.indexOf("registrarTimelineCaso(");
    expect(posGravar).toBeGreaterThan(-1);
    expect(posTimeline).toBeGreaterThan(posGravar);
    expect(trechoAtualizar).toContain('sourceEntityType: "case_alerts"');
  });

  it("título do evento distingue reconhecer, concluir e reprogramar", () => {
    expect(trechoAtualizar).toContain('"Alerta reconhecido"');
    expect(trechoAtualizar).toContain('"Alerta concluído"');
    expect(trechoAtualizar).toContain('"Alerta reprogramado"');
  });

  it("import de registrarTimelineCaso presente no módulo", () => {
    expect(funcoes).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("continua sem tabela nova nem segundo escritor — reaproveita gravarComVerificacao", () => {
    expect(trechoAtualizar).toContain("await gravarComVerificacao({");
    expect(trechoAtualizar).toContain('tabela: "case_alerts"');
  });
});

describe("MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — fila do Desk já saía corretamente (não regredir)", () => {
  it("a rota já invalida a lista de alertas no sucesso — comportamento preservado", () => {
    expect(rota).toContain('void qc.invalidateQueries({ queryKey: ["alertas-completo"] });');
  });

  it("reconhecer/reprogramar continuam chamando o mesmo escritor único", () => {
    expect(rota).toContain('import { atualizarAlerta } from "@/lib/caso-canonico.functions"');
  });
});
