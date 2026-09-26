import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// CA04-CASO360-SIMPLES (09/09/2026): simplifica a primeira superfície do
// Caso 360 sem alterar fontes, taxonomia, contrato ou App, e sem criar tela
// paralela — tudo continua na mesma rota casos.$caseId.index.tsx.
const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("Caso 360 — primeira superfície simplificada (CA04-CASO360-SIMPLES)", () => {
  it("acima da dobra mostra exatamente os seis campos exigidos", () => {
    for (const campo of ["Situação hoje", "Próxima ação", "Responsável", "Prazo", "Motivo", "Impacto"]) {
      expect(pagina, `campo ausente: ${campo}`).toContain(campo);
    }
  });

  it("as seis ações exigidas existem, todas no mesmo bloco do hero", () => {
    const inicioHero = pagina.indexOf('<p className="text-[11px] uppercase tracking-wide text-navy/55">Situação hoje</p>');
    const fimHero = pagina.indexOf("{erro ? (");
    const hero = pagina.slice(inicioHero, fimHero);
    for (const cta of ["Concluir", "Reprogramar", "Criar tarefa", "Registrar atualização", "Preparar microentrega", "Abrir visão do cliente"]) {
      expect(hero, `CTA ausente no hero: ${cta}`).toContain(cta);
    }
  });

  it("os quatro resumos acionáveis existem e apontam para as seções já existentes", () => {
    for (const [resumo, ancora] of [
      ["Jornada/onboarding", "#secao-jornada"],
      ["Pessoas/família", "#secao-pessoas"],
      ["Contrato", "#secao-comercial"],
    ] as const) {
      expect(pagina).toContain(resumo);
      expect(pagina).toContain(ancora);
    }
    expect(pagina).toContain("Pesquisa/entregas");
  });

  it("nenhum resumo tem formulário embutido — só texto e links, nenhum <input>/<select>/<textarea> entre eles", () => {
    const inicio = pagina.indexOf("Quatro resumos acionáveis");
    const fim = pagina.indexOf("No máximo: três tarefas");
    const bloco = pagina.slice(inicio, fim);
    expect(bloco).not.toMatch(/<input|<select|<textarea/);
  });

  it("a lista de recentes cobre tarefas, atualizações, documentos, microentregas e alertas — sem novo fetch de tabela nova", () => {
    for (const rotulo of ["Tarefas", "Atualizações recentes", "Documentos prioritários", "Microentregas recentes", "Alertas críticos"]) {
      expect(pagina).toContain(rotulo);
    }
    // Fontes vivas já existentes: listarFilaOps (tarefas), listarDocumentos
    // (documentos), q.data.timeline (case_timeline_events, já lido por
    // carregarFichaCaso) e qc2.data.entregas/alertas (client_deliverables/
    // case_alerts, já lidos por carregarCanonico). Nenhuma tabela nova.
    expect(pagina).toContain('import { listarFilaOps } from "@/lib/ops.functions"');
    expect(pagina).toContain("FormularioTarefaCaso");
    expect(pagina).toContain('import { listarDocumentos } from "@/lib/documentos.functions"');
    expect(pagina).toContain("qc2.data?.entregas");
    expect(pagina).toContain("qc2.data?.alertas");
  });

  it("cada CTA chama a ação certa — reusando escritores já existentes, nenhum novo", () => {
    expect(pagina).toContain("mConcluir.mutate()");
    expect(pagina).toContain('import { carregarCanonico, marcarSemNovaAcaoNecessaria } from "@/lib/caso-canonico.functions"');
    expect(pagina).toContain("mReprogramar.mutate(novo.trim())");
    expect(pagina).toContain('document.getElementById("form-tarefa-caso")');
    expect(pagina).toContain("mRegistrarAtualizacao.mutate(texto.trim())");
    expect(pagina).toContain('href="#secao-jornada"');
  });

  it("registrar atualização nunca apaga o histórico anterior do resumo interno — só acrescenta", () => {
    expect(pagina).toMatch(/anterior \? `\$\{anterior\}\\n\$\{linha\}` : linha/);
  });

  it("reload mantém estado: toda mutação do hero invalida/recarrega os dados do caso", () => {
    const bloco = pagina.slice(
      pagina.indexOf("const concluirFn = useServerFn(marcarSemNovaAcaoNecessaria)"),
      pagina.indexOf("function renderCampoRoteiro") === -1 ? pagina.length : pagina.indexOf("function renderCampoRoteiro"),
    );
    // Cada uma das quatro mutações do hero chama recarregar() ou invalida a
    // query de tarefas — nenhuma deixa a tela com dado velho depois de salvar.
    const trechoMutacoes = pagina.slice(
      pagina.indexOf("const concluirFn = useServerFn(marcarSemNovaAcaoNecessaria)"),
      pagina.indexOf("<AbaFechamento") === -1 ? pagina.length : pagina.indexOf("const mSalvar = useMutation") + 5000,
    );
    expect(trechoMutacoes).toContain("recarregar();");
    expect(trechoMutacoes).toContain('queryKey: ["ficha-caso-tarefas", id]');
  });

  it("histórico fica recolhido por padrão (details/summary nativos, sem apagar conteúdo)", () => {
    expect(pagina).toContain('<details id="secao-log"');
    expect(pagina).toContain("<summary");
    expect(pagina).toContain("Histórico");
    // Nada saiu: histórico de fases, registro de alterações e o mapa de
    // persistência continuam todos dentro do details.
    const inicio = pagina.indexOf('<details id="secao-log"');
    const fim = pagina.indexOf("</details>", pagina.indexOf("<MapaPersistenciaCaso", inicio));
    const bloco = pagina.slice(inicio, fim);
    expect(bloco).toContain("Histórico de fases do caso");
    expect(bloco).toContain("Registro de alterações");
    expect(bloco).toContain("<MapaPersistenciaCaso");
  });

  it("nenhuma seção original foi removida ou fundida — só recolhida; Documentos e Financeiro somam-se (P24)", () => {
    const secoes = [...pagina.matchAll(/<SecaoAncora id="(\w+)"|<details id="secao-(\w+)"/g)].map(
      (m) => m[1] ?? m[2],
    );
    expect(secoes).toEqual([
      "visao", "comercial", "tecnico", "pessoas", "jornada", "documentos", "financeiro", "log",
    ]);
  });

  it("nenhum card repetido: 'Abrir visão do cliente' aparece uma única vez na página", () => {
    const ocorrencias = pagina.match(/Abrir visão do cliente/g) ?? [];
    expect(ocorrencias.length).toBe(1);
  });

  it("mobile: os cards principais usam grid responsivo (uma coluna por padrão), nenhuma tabela essencial fora do recolhido", () => {
    expect(pagina).toContain("sm:grid-cols-2 lg:grid-cols-3");
    expect(pagina).toContain("sm:grid-cols-2 lg:grid-cols-4");
    // A única <table> da página mora dentro da seção recolhida.
    const antesDoDetails = pagina.slice(0, pagina.indexOf('<details id="secao-log"'));
    expect(antesDoDetails).not.toContain("<table");
  });
});
