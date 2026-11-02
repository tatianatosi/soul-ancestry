import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { avisosOperacionaisLeadAtivo } from "@/lib/painel-calls";

// Execução, em 01/11/2026, de peças dos PRs abertos que ainda não estavam na main.
describe("PRs abertos: peças executadas", () => {
  it("#202: 'Observações internas' está montada na aba Resumo do contrato", () => {
    const src = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
    expect(src).toContain('rotulo="Observações internas"');
    expect(src).toContain("internal_notes");
  });

  it("#212: CI com bun fixo, cache e permissão mínima", () => {
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    expect(ci).not.toContain("bun-version: latest");
    expect(ci).toMatch(/bun-version: \d+\.\d+\.\d+/);
    expect(ci).toContain("actions/cache@v4");
    expect(ci).toMatch(/permissions:\s*\n\s+contents: read/);
  });

  it("#110: o aviso de lead ativo sem área, responsável e próxima ação aparece na Mesa", () => {
    const tela = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
    expect(tela).toContain("avisosOperacionaisLeadAtivo(lead)");
    expect(tela).toContain("data-avisos-operacionais-lead");
    const avisos = avisosOperacionaisLeadAtivo({ id: "x" } as never);
    expect(avisos.map((a) => a.campo)).toEqual(
      expect.arrayContaining(["area_responsavel", "responsavel_nome", "proxima_acao", "proxima_acao_em"]),
    );
  });
});
