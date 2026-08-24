import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { htmlImpressaoPainelContextual, resumoTextoPainelContextual } from "@/lib/cadeia-jornada-pdf";
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

describe("resumoTextoPainelContextual — texto simples para copiar (PROMPT painel contextual)", () => {
  const proxima = proximaAcaoDoPainel(resultadoReal, elosSemPendencias);
  const texto = resumoTextoPainelContextual({
    evento: "Proposta enviada",
    data: HOJE,
    proxima,
    elos: elosSemPendencias,
  });

  it("contém motivo, evidências e próxima ação em texto simples", () => {
    expect(texto).toContain("PRÓXIMA AÇÃO NO PAINEL HOJE");
    expect(texto).toContain(`Ação: ${proxima.rotulo}`);
    expect(texto).toContain(`Responsável: ${proxima.responsavel}`);
    expect(texto).toContain(`Prazo: ${proxima.prazo}`);
    expect(texto).toContain("MOTIVO");
    expect(texto).toContain(proxima.motivo);
    expect(texto).toContain("EVIDÊNCIAS");
    for (const e of proxima.evidencias) expect(texto).toContain(`- ${e}`);
  });

  it("contém a pontuação do melhor ajuste quando aplicável", () => {
    expect(texto).toContain(`PONTUAÇÃO DO MELHOR AJUSTE: ${proxima.pontuacao}`);
    for (const c of proxima.justificativa) expect(texto).toContain(`- ${c}`);
  });

  it("contém os 11 elos da cadeia da jornada em texto simples", () => {
    expect(elosSemPendencias).toHaveLength(11);
    for (const elo of elosSemPendencias) {
      expect(texto).toContain(`${elo.ordem}. ${elo.rotulo}`);
      expect(texto).toContain(elo.detalhe);
    }
  });

  it("declara explicitamente que nada foi enviado, publicado ou gravado", () => {
    expect(texto).toMatch(/uso interno.*nenhum envio, publicação ou gravação/i);
  });

  it("é texto simples (sem marcação HTML) — diferente do documento de impressão", () => {
    expect(texto).not.toMatch(/<[a-z]+[^>]*>/i);
  });
});

describe("botão Copiar resumo — clipboard e fallback acessível", () => {
  const componente = readFileSync("src/components/desk/cadeia-jornada.tsx", "utf8");

  it("usa navigator.clipboard.writeText com o resumo padronizado", () => {
    expect(componente).toContain("navigator.clipboard.writeText(texto)");
    expect(componente).toContain("resumoTextoPainelContextual(dadosImpressao)");
  });

  it("trata rejeição/indisponibilidade do clipboard com fallback, nunca deixando o clique sem retorno", () => {
    expect(componente).toMatch(/try\s*{\s*await navigator\.clipboard\.writeText\(texto\);[\s\S]*?}\s*catch\s*{/);
    expect(componente).toContain('setCopiado("erro")');
  });

  it("mostra a mensagem de status em região aria-live, para leitor de tela", () => {
    expect(componente).toContain('data-cadeia="copiar-status"');
    expect(componente).toContain('role="status"');
    expect(componente).toContain('aria-live="polite"');
    expect(componente).toContain("Resumo copiado para a área de transferência.");
    expect(componente).toContain("Não foi possível copiar automaticamente");
  });
});

describe("prévia de PDF em diálogo com iframe (PROMPT painel contextual)", () => {
  const componente = readFileSync("src/components/desk/cadeia-jornada.tsx", "utf8");

  it("Gerar PDF somente leitura abre a prévia em diálogo modal", () => {
    expect(componente).toContain('data-cadeia="exportar-pdf"');
    expect(componente).toContain("setPrevia(true)");
    expect(componente).toMatch(/data-cadeia="previa-pdf"[\s\S]*?role="dialog"/);
    expect(componente).toContain('aria-modal="true"');
  });

  it("a prévia usa o mesmo documento (mesma função) que a impressão", () => {
    expect(componente).toContain("srcDoc={htmlImpressaoPainelContextual(dadosImpressao)}");
    expect(componente).toContain("imprimirPdfPainelContextual(dadosImpressao)");
  });

  it("Fechar encerra a prévia e devolve o foco ao gatilho que a abriu", () => {
    expect(componente).toContain("gatilhoPreviaRef.current = e.currentTarget");
    expect(componente).toMatch(/fecharPrevia = useCallback\(\(\) => \{\s*setPrevia\(false\);\s*gatilhoPreviaRef\.current\?\.focus\(\);/);
    expect(componente).toContain('aria-label="Fechar prévia do PDF"');
  });

  it("Escape fecha tanto o drawer por elo quanto a prévia de impressão", () => {
    const escapes = componente.match(/e\.key === "Escape"/g) ?? [];
    expect(escapes.length).toBeGreaterThanOrEqual(2);
    expect(componente).toContain("fecharPrevia();");
  });

  it("Tab e Shift+Tab ficam presos dentro do drawer e da prévia (mesma função de trap para os dois)", () => {
    expect(componente).toContain("prenderFoco(painelDrawerRef.current, e)");
    expect(componente).toContain("prenderFoco(previaRef.current, e)");
    expect(componente).toMatch(/const prenderFoco = \(container: HTMLElement \| null, e: KeyboardEvent\)/);
  });
});

describe("ausência de efeitos externos no painel contextual e no PDF (PROMPT painel contextual)", () => {
  it("nem o componente nem o gerador de PDF chamam rede, banco ou API externa", () => {
    const componente = readFileSync("src/components/desk/cadeia-jornada.tsx", "utf8");
    const pdf = readFileSync("src/lib/cadeia-jornada-pdf.ts", "utf8");
    for (const fonte of [componente, pdf]) {
      expect(fonte).not.toMatch(/fetch\(|supabase|\.insert\(|\.update\(|createServerFn/);
    }
  });

  it("a impressão só usa a janela de impressão nativa do navegador, sem envio de dados", () => {
    const pdf = readFileSync("src/lib/cadeia-jornada-pdf.ts", "utf8");
    expect(pdf).toContain("janela.print()");
    expect(pdf).not.toMatch(/XMLHttpRequest|axios|\.post\(|\.send\(/);
  });
});
