import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// CA06-APP-NO-DESK (09/09/2026): torna visível e operável no Desk o que o
// App Cliente mostra, sem ampliar o App e sem oitava aba — tudo dentro do
// Caso 360, da Biblioteca Mestre e de Alertas já existentes.
const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
const appComoPessoaFn = readFileSync("src/lib/app-cliente-como-pessoa.functions.ts", "utf8");
const bibliotecaFn = readFileSync("src/lib/biblioteca-evidencias.functions.ts", "utf8");
const bibliotecaRota = readFileSync("src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx", "utf8");
const alertasFn = readFileSync("src/lib/alertas.functions.ts", "utf8");
const navegacao = readFileSync("src/lib/navegacao-desk.ts", "utf8");

describe("CA06-APP-NO-DESK — Visão do cliente no Caso 360 (sem oitava aba)", () => {
  // 19/10/2026 — reconciliação com o Lovable: o rótulo visível do card virou
  // "Como a família vê" (mesma id, mesmo card, mesmo dado real).
  it("o resumo mora dentro da mesma rota do Caso 360 — nenhuma tela nova", () => {
    expect(caso360).toContain('id="resumo-visao-cliente"');
    expect(caso360).toContain("Como a família vê");
  });

  // 19/10/2026 — reconciliação com o Lovable: o card "Como a família vê"
  // ganhou o layout de 6 "portas" (Pesquisa/Árvore/Documentos/Publicações/
  // Conta/Histórico); os 7 campos exigidos pela missão continuam todos
  // presentes, só com rótulos novos — cada checagem abaixo mira o texto
  // real que carrega o mesmo campo.
  it("os sete campos exigidos pela missão aparecem no resumo", () => {
    const inicio = caso360.indexOf('id="resumo-visao-cliente"');
    const fim = caso360.indexOf("No máximo: três tarefas");
    const bloco = caso360.slice(inicio, fim);
    for (const campo of [
      "acesso.liberado", // Acesso
      "ultimaAtualizacaoLiberada", // Última atualização liberada
      "microentregasProntasParaRevisao", // Prontas para revisão/liberação
      "documentosDisponiveis", // Documentos disponíveis ao titular
      "projecoesDeArvore", // Projeções de árvore
      "Preferências:", // Preferências
      "estadoPublicacao", // Publicação
    ]) {
      expect(bloco, `campo ausente: ${campo}`).toContain(campo);
    }
  });

  it("preferências sem fonte viva é rotulado como tal — nunca simulado ou inferido", () => {
    expect(caso360).toContain("Preferências: sem fonte viva homologada");
    expect(appComoPessoaFn).toContain("Sem fonte viva homologada nesta rodada — nunca inferido nem simulado");
    expect(appComoPessoaFn).toContain("preferencias: null");
  });

  it("nenhum formulário embutido no card — só leitura e um link", () => {
    const inicio = caso360.indexOf('id="resumo-visao-cliente"');
    const fim = caso360.indexOf("No máximo: três tarefas");
    const bloco = caso360.slice(inicio, fim);
    expect(bloco).not.toMatch(/<input|<select|<textarea/);
  });
});

describe("CA06-APP-NO-DESK — fonte cliente-facing é app_projections/portal_projecoes; client_deliverables não se mistura", () => {
  it("resumoVisaoClienteCaso lê app_projections/client_portal_access/documents; client_deliverables só conta à parte", () => {
    const trecho = appComoPessoaFn.slice(appComoPessoaFn.indexOf("export const resumoVisaoClienteCaso"));
    expect(trecho).toContain('.from("app_projections")');
    expect(trecho).toContain('.from("client_portal_case_access")');
    expect(trecho).toContain('.from("documents")');
    expect(trecho).toContain('.from("client_deliverables")');
    // client_deliverables vira "producaoInternaEmRevisao", nunca soma ao
    // total cliente-facing (estadoPublicacao é calculado só de app_projections).
    expect(trecho).toContain("producaoInternaEmRevisao: entregas.count");
    expect(trecho).not.toMatch(/estadoPublicacao[\s\S]{0,80}entregas\.count/);
  });

  it("nenhuma tabela nova — só leitura das já existentes", () => {
    expect(appComoPessoaFn).not.toMatch(/create table|client_deliverables_v2|app_projections_v2/i);
  });
});

describe("CA06-APP-NO-DESK — Biblioteca Mestre confirma as seis ações reais", () => {
  it("preparar, revisar, aprovar, liberar, despublicar e arquivar existem como escritores", () => {
    expect(bibliotecaFn).toContain("export const salvarProjecao");
    expect(bibliotecaFn).toContain("export const revisarProjecao");
    expect(bibliotecaFn).toContain("export const aprovarProjecao");
    expect(bibliotecaFn).toContain("export const despublicarProjecao");
    expect(bibliotecaFn).toContain("export const arquivarRegistroG03");
    // "Liberar" é aprovarProjecao({publicar:true}) — mesmo escritor de aprovar,
    // não um caminho paralelo.
    expect(bibliotecaFn).toContain("approval_status: data.publicar ? \"published\" : \"approved\"");
  });

  it("a rota da Biblioteca chama as seis ações — nenhum botão morto", () => {
    for (const fn of [
      "salvarProjecao",
      "revisarProjecao",
      "aprovarProjecao",
      "despublicarProjecao",
      "arquivarRegistroG03",
    ]) {
      expect(bibliotecaRota).toContain(fn);
    }
    expect(bibliotecaRota).toContain('rotulo="Aprovar e publicar"');
    expect(bibliotecaRota).toContain('rotulo="Despublicar"');
  });

  it("despublicar some do App sem apagar histórico — a linha continua, só muda approval_status/effective_from", () => {
    const trecho = bibliotecaFn.slice(
      bibliotecaFn.indexOf("export const despublicarProjecao"),
      bibliotecaFn.indexOf("export const despublicarProjecao") + 700,
    );
    expect(trecho).toContain('.update({ approval_status: "approved", effective_from: null })');
    expect(trecho).not.toMatch(/\.delete\(\)/);
  });

  it("arquivar nunca é exclusão física — só archived_at/motivo, com trigger de bloqueio de delete já existente", () => {
    expect(bibliotecaFn).toContain("archived_at: new Date().toISOString()");
    expect(bibliotecaFn).not.toMatch(/\.delete\(\)/);
  });
});

describe("CA06-APP-NO-DESK — Alertas listam conteúdo pronto sem duplicar tarefa", () => {
  it("entrar em revisão ou ficar pronta para liberação grava/reaproveita o mesmo alerta — nunca duas linhas para a mesma projeção", () => {
    const ocorrenciasHelper = bibliotecaFn.match(/criarOuReaproveitarAlertaProjecao\(supabase, organizationId, \{/g) ?? [];
    // revisarProjecao, aprovarProjecao (quando !publicar) e prepararAlertaProjecao (manual) — três chamadores, um helper.
    expect(ocorrenciasHelper.length).toBe(2);
    expect(bibliotecaFn).toContain("return criarOuReaproveitarAlertaProjecao(supabase, organizationId, data);");
  });

  it("o helper de alerta nunca cria tarefa — só case_alerts", () => {
    const trecho = bibliotecaFn.slice(
      bibliotecaFn.indexOf("async function criarOuReaproveitarAlertaProjecao"),
      bibliotecaFn.indexOf("export const revisarProjecao"),
    );
    expect(trecho).toContain('.from("case_alerts")');
    expect(trecho).not.toMatch(/\.from\("tarefas"\)|salvarTarefa|criarRegistro/);
  });

  it("a mesma tabela e o mesmo leitor genérico de sempre (case_alerts via listarAlertas) continuam servindo /alertas — nenhum leitor novo", () => {
    expect(alertasFn).toContain('.from("case_alerts")');
    expect(alertasFn).not.toMatch(/create table|case_alerts_v2/i);
  });

  it("dedup: reaproveita alerta pending do mesmo tipo/caso antes de inserir", () => {
    const trecho = bibliotecaFn.slice(
      bibliotecaFn.indexOf("async function criarOuReaproveitarAlertaProjecao"),
      bibliotecaFn.indexOf("export const revisarProjecao"),
    );
    expect(trecho).toContain('.eq("status", "pending")');
    expect(trecho).toContain("existente?.id");
  });
});

describe("CA06-APP-NO-DESK — nada é enviado ao cliente nesta rodada", () => {
  it("nenhuma ação de convite, mensagem ou e-mail aparece no código tocado", () => {
    for (const proibido of ["enviarConvite", "enviarWhatsapp", "enviarEmail", "sendInvite", "sendEmail"]) {
      expect(bibliotecaFn).not.toContain(proibido);
      expect(appComoPessoaFn).not.toContain(proibido);
      expect(caso360.slice(caso360.indexOf('id="resumo-visao-cliente"'))).not.toContain(proibido);
    }
  });

  it("a única ação externa continua sendo publicar/despublicar já existentes — nenhuma nova ação externa", () => {
    expect(bibliotecaRota).toContain('acaoExterna="publicar_no_app_cliente"');
    expect(bibliotecaRota).toContain('acaoExterna="despublicar_no_app_cliente"');
  });
});

describe("CA06-APP-NO-DESK — RLS preservada", () => {
  it("resumoVisaoClienteCaso não usa service_role nem desliga RLS", () => {
    expect(appComoPessoaFn).not.toMatch(/service_role|disable row level security/i);
  });

  it("a leitura de acesso ao portal é sempre filtrada por organização (mesma regra de is_org_member já em produção)", () => {
    const trecho = appComoPessoaFn.slice(appComoPessoaFn.indexOf("export const resumoVisaoClienteCaso"));
    const filtrosOrg = trecho.match(/\.eq\("organization_id", organizationId\)/g) ?? [];
    expect(filtrosOrg.length).toBeGreaterThanOrEqual(3);
  });

  it("navegação do Desk continua com as sete telas — nenhuma rota nova adicionada por esta missão", () => {
    expect(navegacao).not.toContain("/visao-cliente");
    expect(navegacao).not.toContain("/app-no-desk");
  });
});
