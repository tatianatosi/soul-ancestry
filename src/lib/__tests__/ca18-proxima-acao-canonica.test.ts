import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * CA18-PROXIMA-ACAO-CANONICA (09/09/2026) — Painel Hoje (fila
 * casos_pendencia_documental), Lista de Casos e Caso 360 já usavam a mesma
 * RPC canônica (proxima_acao_prioritaria / _lote) via obterProximaAcaoCanonica
 * (corte anterior, 09/09/2026 também). O painel "Onboarding e jornada" (/ops,
 * onboarding-jornada.functions.ts) calculava sua própria "próxima ação"
 * (diagnosticarOnboarding) — uma segunda narrativa, podendo divergir do texto
 * e prioridade mostrados para o mesmo caso em Painel Hoje/Lista/Caso 360.
 * Passa a usar a mesma RPC em lote e o mesmo empacotamento canônico; o campo
 * manual (crm_casos.proxima_acao) continua funcionando como fallback dentro
 * da própria regra da RPC (nível 8), nunca uma segunda fonte concorrente.
 */

const arquivo = readFileSync("src/lib/onboarding-jornada.functions.ts", "utf8");

describe("CA18 — onboarding-jornada.functions.ts usa a mesma RPC canônica das outras 3 superfícies", () => {
  it("chama proxima_acao_prioritaria_lote em lote, como Painel Hoje", () => {
    expect(arquivo).toContain('rpc("proxima_acao_prioritaria_lote"');
  });

  it("empacota o resultado com obterProximaAcaoCanonica, mesma função de Caso 360/Lista de Casos", () => {
    expect(arquivo).toContain('from "@/lib/caso-ficha"');
    expect(arquivo).toContain("obterProximaAcaoCanonica(");
  });

  it("o texto exibido (detalhes.proxima_acao/prazo) vem da leitura canônica, não mais só do diagnóstico local", () => {
    const bloco = arquivo.slice(arquivo.indexOf("detalhes.push({"), arquivo.indexOf("detalhes.push({") + 400);
    expect(bloco).toContain("proxima_acao: canonica.acao");
    expect(bloco).toContain("prazo: canonica.prazo");
  });

  it("diagnosticarOnboarding continua calculando estado/status/bloqueios — não foi removido, só deixou de narrar a próxima ação exibida", () => {
    expect(arquivo).toContain("diagnosticarOnboarding(");
    expect(arquivo).toContain("diag.status");
    expect(arquivo).toContain("diag.bloqueios");
  });

  it("passa o caso e o responsável para a leitura canônica, nunca cria vínculo novo", () => {
    const bloco = arquivo.slice(arquivo.indexOf("const canonica = obterProximaAcaoCanonica"), arquivo.indexOf("const canonica = obterProximaAcaoCanonica") + 250);
    expect(bloco).toContain("caseId: String(caso[");
    expect(bloco).toContain("responsavelPrincipal: caso[");
  });
});

describe("CA18 — as três superfícies originais continuam usando a leitura canônica (sem regressão)", () => {
  it("Painel Hoje (crm-desk.functions.ts) e Lista de Casos/Caso 360 seguem chamando obterProximaAcaoCanonica", () => {
    const crmDesk = readFileSync("src/lib/crm-desk.ts", "utf8");
    const listaCasos = readFileSync("src/routes/_authenticated/casos.index.tsx", "utf8");
    const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    for (const arq of [crmDesk, listaCasos, caso360]) {
      expect(arq).toContain("obterProximaAcaoCanonica");
    }
  });
});
