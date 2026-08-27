import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("Caso 360 como página única", () => {
  it("não sobrou nenhuma aba independente", () => {
    // O defeito nomeado no documento de fluxo: "abas independentes que
    // disputam a mesma informação".
    expect(pagina).not.toMatch(/aba === "/);
    expect(pagina).not.toMatch(/setAba\(/);
  });

  it("consolidação concluída (decisão da Proprietária, não regressão) — 13 → 6 blocos", () => {
    // 27/08/2026 — a página única resolveu "abas que disputam a mesma
    // informação", mas por dentro cada seção continuava sendo o componente
    // isolado de antes, só empilhado. A Proprietária pediu o passo seguinte:
    // separar indicador de contexto e reduzir quantas seções existem, sem
    // apagar campo nenhum — só mudar onde cada coisa mora. Passos 1–4
    // (aprovados por ela: "acabei de ver ficou ótimo pode aplicar") fecham
    // em 6 blocos:
    //  - "acao" (Próxima ação e alertas, é sinal) → dentro de "visao";
    //  - "caso" (Identificação/aliases, Responsabilidade, Brief interno)
    //    → dentro de "visao", junto do sinal de prioridade (o que o caso É);
    //  - "cadastro" → dentro de "pessoas" (mesma pergunta: quem está no caso);
    //  - "etiquetas" → dentro de "pessoas" (também descreve a pessoa/família);
    //  - a antiga seção "comercial" ficou enxuta e virou "Jurídico": só o
    //    eixo comercial/formalização deste contrato + ponte para o motor e a
    //    matriz que já existem em /contratos, /matriz-juridica,
    //    /ordens-servico — nunca duplicar formulário;
    //  - "Proposta (referência interna)" saiu do Jurídico e foi para
    //    "pessoas", porque proposta e roteiro Discovery compõem a pessoa,
    //    não o contrato ("o que é lead e faz parte da pessoa... tudo que
    //    compõe ela" — Proprietária);
    //  - "produto", "onboarding" e "fechamento" → dentro de "jornada", porque
    //    produto e ciclo de vida são parte do processo do cliente, não algo
    //    à parte (decisão explícita da Proprietária).
    const secoes = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(secoes).toHaveLength(6);
    for (const fundida of ["acao", "caso", "cadastro", "etiquetas", "produto", "onboarding", "fechamento"]) {
      expect(secoes, `"${fundida}" deveria ter se fundido, não sumido nem sobrado solto`).not.toContain(fundida);
    }
    for (const s of ["visao", "comercial", "tecnico", "pessoas", "jornada", "log"]) {
      expect(secoes, `seção "${s}" sumiu`).toContain(s);
    }
  });

  it("o bloco Jurídico não duplica formulário — só aponta para o motor e a matriz", () => {
    // "acredito que temos uma aba só jurídica aqui sim deve ficar só o
    // motor e a matriz dos contratos" — Proprietária.
    const inicioJuridico = pagina.indexOf('<SecaoAncora id="comercial"');
    const fimJuridico = pagina.indexOf('<SecaoAncora id="tecnico"');
    const blocoJuridico = pagina.slice(inicioJuridico, fimJuridico);
    for (const ponte of ["/casos/$caseId/contrato/preparar", "/contratos", "/matriz-juridica", "/ordens-servico"]) {
      expect(blocoJuridico, `Jurídico devia linkar para ${ponte}`).toContain(ponte);
    }
  });

  it("todos os componentes fundidos continuam renderizados — fundir seção não é apagar funcionalidade", () => {
    for (const componente of [
      "<AbaProximaAcao",
      "<AbaCadastro",
      "<AbaEtiquetas",
      "<AbaProdutoTrilha",
      "<AbaOnboarding",
      "<AbaFechamento",
      "<AbaJornadaCliente",
      "<ConsolidacaoCaseService",
    ]) {
      expect(pagina, `${componente} sumiu — devia ter só mudado de lugar`).toContain(componente);
    }
  });

  it("o índice segue a mesma ordem em que a página rola", () => {
    // Índice numa ordem e DOM em outra confunde quem rola.
    const doIndice = [...pagina.matchAll(/\{ id: "(\w+)", rotulo:/g)].map((m) => m[1]);
    const doDom = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(doIndice).toEqual(doDom);
  });

  it("cada seção tem âncora alcançável pelo índice", () => {
    const ids = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(pagina).toContain("href={`#secao-${a.id}`}");
    expect(pagina).toContain("id={`secao-${id}`}");
    expect(ids.length).toBeGreaterThan(0);
  });
});
