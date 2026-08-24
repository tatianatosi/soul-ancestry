import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { htmlImpressaoPainelContextual } from "@/lib/cadeia-jornada-pdf";
import {
  descreverCadeia,
  detalharElo,
  pontuarMelhorAjuste,
  proximaAcaoDoPainel,
  type EloDerivado,
} from "@/lib/cadeia-jornada-visao";
import { ELOS_CADEIA, executarCadeiaJornada, type ResultadoCadeia } from "@/lib/orquestracao-jornada";

const HOJE = "2026-08-24";

const resultadoReal = executarCadeiaJornada({
  hoje: HOJE,
  evento: "proposta_enviada",
  caso_id: "CA-TESTE-001",
  responsavel_id: "tati",
  prazo: "2026-08-30",
});

/** Cadeia sintética sem elos pendentes ou bloqueados. */
const elosSemPendencias: EloDerivado[] = ELOS_CADEIA.map((chave, i) => ({
  chave,
  ordem: i + 1,
  rotulo: `Elo ${i + 1}`,
  estado: i % 3 === 0 ? "nao_aplicavel" : "concluido",
  detalhe: `Detalhe do elo ${i + 1}`,
}));

describe("painel contextual sem elos pendentes", () => {
  const proxima = proximaAcaoDoPainel(resultadoReal, elosSemPendencias);

  it("informa status explícito e origem por melhor ajuste", () => {
    expect(proxima.semPendencias).toBe(true);
    expect(proxima.origem).toBe("melhor_ajuste");
    expect(proxima.status).toMatch(/sem elos pendentes/i);
  });

  it("expõe pontuação e justificativa do melhor ajuste", () => {
    expect(proxima.pontuacao).toBeGreaterThan(0);
    expect(proxima.justificativa.length).toBeGreaterThan(0);
    expect(proxima.motivo).toContain(`pontuação ${proxima.pontuacao}`);
  });

  it("ordena o ranking do maior para o menor e escolhe o topo", () => {
    const pontos = proxima.ranking.map((r) => r.pontos);
    expect([...pontos].sort((a, b) => b - a)).toEqual(pontos);
    expect(proxima.elo?.chave).toBe(proxima.ranking[0]?.elo.chave);
    expect(proxima.ranking[0]?.elo.estado).toBe("concluido");
  });

  it("mantém pontuação nula quando existe elo pendente", () => {
    const elos = descreverCadeia(resultadoReal, { evento: "proposta_enviada" });
    const comPendencia = proximaAcaoDoPainel(resultadoReal, elos);
    expect(comPendencia.semPendencias).toBe(false);
    expect(comPendencia.pontuacao).toBeNull();
    expect(comPendencia.ranking).toEqual([]);
  });

  it("pontua apenas elos diferentes do Painel Hoje", () => {
    const ranking = pontuarMelhorAjuste(resultadoReal, elosSemPendencias);
    expect(ranking.some((r) => r.elo.chave === "painel_hoje")).toBe(false);
  });
});

describe("drawer por elo", () => {
  const elos = descreverCadeia(resultadoReal, { evento: "proposta_enviada" });

  it("mostra tarefa, responsável, prazo, modelo e evidências", () => {
    const detalhe = detalharElo(resultadoReal, elos[2]!);
    expect(detalhe.responsavel).toBe("tati");
    expect(detalhe.prazo).toBe("2026-08-30");
    expect(detalhe.templateResumo.length).toBeGreaterThan(0);
    expect(detalhe.evidencias.length).toBeGreaterThan(2);
    expect(detalhe.evidencias.join(" ")).toContain("Envio executado: não");
  });

  it("tem rótulos de acessibilidade e navegação por teclado no componente", () => {
    const componente = readFileSync("src/components/desk/cadeia-jornada.tsx", "utf8");
    expect(componente).toContain('role="dialog"');
    expect(componente).toContain('aria-modal="true"');
    expect(componente).toContain('aria-haspopup="dialog"');
    expect(componente).toContain("aria-expanded");
    expect(componente).toContain('aria-label="Fechar detalhes do elo"');
    expect(componente).toContain('e.key === "Escape"');
    expect(componente).toContain("ArrowDown");
    expect(componente).toContain('data-cadeia="drawer-template"');
    expect(componente).toContain('data-cadeia="drawer-evidencias"');
    expect(componente).not.toMatch(/fetch\(|supabase|insert\(|update\(/);
  });
});

describe("PDF somente leitura do painel contextual", () => {
  it("inclui próxima ação, motivo, evidências, pontuação e os 11 elos", () => {
    const proxima = proximaAcaoDoPainel(resultadoReal, elosSemPendencias);
    const html = htmlImpressaoPainelContextual({
      evento: "Proposta enviada",
      data: HOJE,
      proxima,
      elos: elosSemPendencias,
    });

    expect(html).toContain("Painel contextual — cadeia da jornada");
    expect(html).toContain("Motivo e evidências");
    expect(html).toContain("Pontuação do melhor ajuste");
    expect(html).toContain("somente leitura");
    for (const elo of elosSemPendencias) expect(html).toContain(elo.rotulo);
    expect(html).not.toMatch(/enviar|publicar agora/i);
  });
});
