import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 4, batch 14 (P0). Dois
// problemas mais graves que simples adoção: um bug que furava a própria
// garantia de motivo obrigatório do AcaoOperacional, e duas portas para a
// mesma escrita externa sem o guard que a terceira porta já tinha.

const manifesto = readFileSync("src/components/governanca/manifesto.tsx", "utf8");
const painelCalls = readFileSync("src/components/crm/painel-calls.tsx", "utf8");

describe("manifesto.tsx — 'Arquivar decisão' não furra mais a obrigatoriedade do motivo", () => {
  it("usa acaoExterna (exige motivo pelo modal) em vez de capacidade+window.prompt de fallback", () => {
    const idx = manifesto.indexOf('rotulo="Arquivar decisão"');
    const trecho = manifesto.slice(idx, idx + 400);
    expect(trecho).toContain('acaoExterna="arquivar_decisao_governanca"');
    expect(trecho).not.toContain("window.prompt(");
    expect(trecho).not.toContain('capacidade="editar_rascunho"');
  });

  it("nenhum window.prompt() restante no arquivo", () => {
    expect(manifesto).not.toContain("window.prompt(");
  });
});

describe("painel-calls.tsx — as três portas para mutarHandoff usam o mesmo guard", () => {
  it("'Usar esta pessoa' e 'Criar pessoa nova' agora passam por AcaoOperacional com o mesmo gate", () => {
    expect(painelCalls).toContain("const gateHandoff = lead ? podeExecutarHandoffDiscovery(lead)");
    const idxUsar = painelCalls.indexOf('rotulo="Usar esta pessoa"');
    expect(idxUsar).toBeGreaterThan(-1);
    const trechoUsar = painelCalls.slice(idxUsar, idxUsar + 400);
    expect(trechoUsar).toContain('capacidade="avancar_caso_planejador_tarefa"');
    expect(trechoUsar).toContain("pendenciaGate={gateHandoff.ok ? null : gateHandoff.motivo}");

    const idxCriar = painelCalls.indexOf('rotulo="Criar pessoa nova"');
    expect(idxCriar).toBeGreaterThan(-1);
    const trechoCriar = painelCalls.slice(idxCriar, idxCriar + 400);
    expect(trechoCriar).toContain('capacidade="avancar_caso_planejador_tarefa"');
    expect(trechoCriar).toContain("pendenciaGate={gateHandoff.ok ? null : gateHandoff.motivo}");
  });

  it("'Concluir handoff' continua com o mesmo gate (reusa a mesma variável, não regrediu)", () => {
    const idx = painelCalls.indexOf('rotulo="Concluir handoff para pessoa e caso"');
    const trecho = painelCalls.slice(idx, idx + 500);
    expect(trecho).toContain("pendenciaGate={gateHandoff.ok ? null : gateHandoff.motivo}");
  });

  it("nenhum botão cru restante nos dois pontos corrigidos", () => {
    expect(painelCalls).not.toMatch(/onClick=\{\(\) => mutarHandoff\.mutate\(\{ clienteIdConfirmado: c\.id \}\)\}/);
    expect(painelCalls).not.toMatch(/onClick=\{\(\) => mutarHandoff\.mutate\(\{ forcarCriarCliente: true \}\)\}/);
  });
});
