import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Corte de fidelidade visual (23/09/2026, autorização explícita da
 * Proprietária): remove sobreposições legadas que competiam com o mockup de
 * 17 páginas e a prancha Desk, sem tocar banco, RLS, migrations, cálculos,
 * dados reais, contrato jurídico ou writers de domínio.
 */

describe("1. App shell — sem master/demo/seletor/chips/Sair no shell cliente", () => {
  const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");

  it("não renderiza card de acesso master, seletor de caso nem botão Sair", () => {
    expect(shell).not.toMatch(/acesso master/i);
    expect(shell).not.toMatch(/selecione um caso/i);
    expect(shell).not.toContain("Sair");
  });

  it("o selo de prévia/demo é só sr-only, nunca faixa visual", () => {
    expect(shell).toContain("data-previa-portal");
    expect(shell).toContain("sr-only");
  });

  it("o rodapé de 7 itens é a navegação principal em telas estreitas", () => {
    expect(shell).toContain("fixed inset-x-0 bottom-0");
    expect(shell).toMatch(/nav\.length > 0/);
  });
});

describe("2. Jornada — estado vazio sem painel administrativo nem 8 bolhas sem rótulo", () => {
  const jornada = readFileSync("src/routes/portal/jornada.tsx", "utf8");

  it("estado vazio isola o bloco narrativo e os vazios das duas linhas", () => {
    expect(jornada).toContain("data-jornada-vazio");
    expect(jornada).toContain("data-jornada-narrativa-vazia");
    expect(jornada).toContain("Nossa jornada");
    expect(jornada).toContain("Uma história começando a ganhar forma");
  });

  it("não renderiza painel de Caso/Marcos/Ritmo/Atualizações", () => {
    expect(jornada).not.toContain("data-jornada-meta");
    expect(jornada).not.toContain('<ChipMeta rotulo="Caso"');
  });

  it("a trilha de passos (TrilhaCompacta) só renderiza fora do estado vazio", () => {
    const inicioVazio = jornada.indexOf("data-jornada-vazio");
    const dentroDoVazio = jornada.slice(inicioVazio, jornada.indexOf(") : (", inicioVazio));
    expect(dentroDoVazio).not.toContain("<TrilhaCompacta");
    expect(jornada).toContain("<TrilhaCompacta");
  });
});

describe("3. Documentos — 4 cards, envio integrado a Solicitados, sem KPI/painel master", () => {
  const documentos = readFileSync("src/routes/portal/documentos.tsx", "utf8");

  it("nenhum painel de KPI (data-documentos-meta) na composição cliente", () => {
    expect(documentos).not.toContain("data-documentos-meta");
  });

  it("mantém exatamente as 4 caixas do §7", () => {
    for (const attr of [
      "data-documentos-solicitados",
      "data-documentos-recebidos",
      "data-documentos-liberados",
      "data-documentos-entregas",
    ]) {
      expect(documentos).toContain(attr);
    }
  });

  it("a instrução de envio está integrada ao card Solicitados nos dois modos (prévia e real)", () => {
    expect(documentos).toContain("Se precisarmos de algo, o pedido e a orientação para enviar aparecerão aqui.");
    expect(documentos).toContain("<EnviarDocumento casoId={casoAtivo} />");
    /*
      08/10/2026: a âncora deixou de depender da classe CSS (o Lovable trocou
      "overflow-hidden" por "app-v11-faixa"). O que o teste protege é o lugar
      do CTA — dentro da seção Solicitados —, não o nome da classe.
    */
    const inicioSolicitados = documentos.indexOf("data-documentos-solicitados className=");
    const secaoSolicitadosReal = documentos.slice(
      inicioSolicitados,
      documentos.indexOf("</section>", inicioSolicitados),
    );
    expect(inicioSolicitados).toBeGreaterThan(-1);
    expect(secaoSolicitadosReal).toContain("<EnviarDocumento");
  });
});

describe("4. Desk Hoje — sem o segundo dashboard legado depois do cockpit", () => {
  const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

  it("a grade genérica de 7 seções (secoes.map) foi removida", () => {
    expect(painel).not.toContain("secoes.map");
    expect(painel).not.toContain("type Secao =");
  });

  it("o cockpit oficial (4 KPIs + cards com fonte declarada) continua de pé", () => {
    expect(painel).toContain("data-hoje-indicadores");
    expect(painel).toContain("Decisões prioritárias");
    expect(painel).toContain("Funil de leads");
    expect(painel).toContain("Ritmo operacional");
    expect(painel).toContain("Alertas por origem");
  });

  it("os leitores que alimentam o cockpit continuam importados e usados", () => {
    expect(painel).toContain("kpisHoje(caso.carteira, caso.tarefas)");
    expect(painel).toContain("filaDeAprovacoes(");
    expect(painel).toContain("origemDoSinal(caso.eventos ?? [])");
  });
});

describe("5. Caso 360 — visão geral não repete o mesmo bloqueio em banner e KPI", () => {
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("o campo Impacto do hero é o único lugar com o link de resolução do bloqueio prioritário", () => {
    expect(pagina).toContain("data-caso360-impacto");
    expect(pagina).toContain("Resolver bloqueio");
    const ocorrencias = pagina.match(/Resolver bloqueio/g) ?? [];
    expect(ocorrencias.length).toBe(1);
  });

  it("o resumo Jornada/onboarding não reafirma a contagem de bloqueios (já está no hero)", () => {
    expect(pagina).not.toContain("bloqueio(s) de ativação");
  });

  it("as seis seções originais continuam intactas — Documentos e Financeiro somaram-se (P24, 2026-09-26)", () => {
    const secoes = [...pagina.matchAll(/<SecaoAncora id="(\w+)"|<details id="secao-(\w+)"/g)].map(
      (m) => m[1] ?? m[2],
    );
    expect(secoes).toEqual([
      "visao", "comercial", "tecnico", "pessoas", "jornada", "documentos", "financeiro", "log",
    ]);
  });

  it("o checklist de gates (Fechamento) continua consumido dentro de Jornada, não numa aba nova", () => {
    expect(pagina).toContain("<AbaFechamento");
  });
});
