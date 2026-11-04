import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// CA05-CADENCIA-MICROENTREGAS (09/09/2026): conecta a cadência D0–D365 à
// produção de valor sem tabela, checklist ou microentrega nova. Testes
// estáticos sobre as fontes já existentes — mesmo padrão de
// alertas-rota-canonica.test.ts.
const jornadaFn = readFileSync("src/lib/jornada-cliente.functions.ts", "utf8");
const jornadaPuro = readFileSync("src/lib/jornada-cliente.ts", "utf8");
const onboardingJornada = readFileSync("src/lib/onboarding-jornada.ts", "utf8");
const bibliotecaFn = readFileSync("src/lib/biblioteca-evidencias.functions.ts", "utf8");
const portalAtendimentoFn = readFileSync("src/lib/portal-atendimento.functions.ts", "utf8");
const opsFn = readFileSync("src/lib/ops.functions.ts", "utf8");
const onboardingPlanoFn = readFileSync("src/lib/onboarding-plano.functions.ts", "utf8");
const abaOnboarding = readFileSync("src/components/caso/onboarding-caso.tsx", "utf8");

describe("CA05-CADENCIA-MICROENTREGAS — fontes ativas (sem tabela nova)", () => {
  it("onboarding, cadência, microentregas de cliente e app_projections continuam nas mesmas tabelas de sempre", () => {
    expect(onboardingPlanoFn).toContain('.from("onboarding_planos")');
    expect(jornadaFn).toContain('.from("client_deliverables")');
    expect(bibliotecaFn).toContain('.from("app_projections")');
    expect(opsFn).toContain('.from("ops_microentregas")');
    // Nenhum arquivo tocado nesta rodada cria tabela nova.
    for (const f of [jornadaFn, onboardingJornada, bibliotecaFn, opsFn, onboardingPlanoFn]) {
      expect(f).not.toMatch(/create table|client_deliverables_v2|case_alerts_v2/i);
    }
  });

  it("ops_microentregas (trabalho interno) e client_deliverables (cliente-facing) são fontes distintas — uma tarefa não vira microentrega automaticamente", () => {
    // criarMicroentregaCliente só é chamado a partir do formulário manual da
    // Jornada do caso — nenhum escritor de tarefas/ops importa esta função.
    expect(readFileSync("src/components/caso/jornada-cliente.tsx", "utf8")).toContain(
      "criarMicroentregaCliente",
    );
    expect(opsFn).not.toContain("criarMicroentregaCliente");
    expect(readFileSync("src/lib/caso-canonico.functions.ts", "utf8")).not.toContain(
      "criarMicroentregaCliente",
    );
  });
});

describe("CA05-CADENCIA-MICROENTREGAS — evento aponta para microentrega sem duplicar tarefa", () => {
  it("transicionar para 'em_revisao' grava alerta em case_alerts, mesma tabela e mesmo padrão de dedup de prepararAlertaProjecao", () => {
    expect(jornadaFn).toContain('tipo: "microentrega_em_revisao"');
    expect(jornadaFn).toContain('.from("case_alerts")');
    // Dedup: lê alerta pending existente antes de decidir update vs insert —
    // igual ao padrão já usado por prepararAlertaProjecao/registrarProximaAcao.
    const trecho = jornadaFn.slice(
      jornadaFn.indexOf('if (data.para === "em_revisao")'),
      jornadaFn.indexOf("return { ok: true, de, para: data.para };"),
    );
    expect(trecho).toContain('.eq("status", "pending")');
    expect(trecho).toContain("alertaExistente?.id");
    expect(trecho).toContain(".update(alertaPayload)");
    expect(trecho).toContain(".insert(alertaPayload)");
  });

  it("o alerta de microentrega em revisão nunca cria ou duplica uma tarefa", () => {
    const trecho = jornadaFn.slice(
      jornadaFn.indexOf('if (data.para === "em_revisao")'),
      jornadaFn.indexOf("return { ok: true, de, para: data.para };"),
    );
    expect(trecho).not.toMatch(/\.from\("tarefas"\)|salvarTarefa|criarRegistro/);
  });

  it("outras transições ('rascunho', 'aprovado', 'publicado', 'arquivado') não inserem o alerta de revisão", () => {
    // O bloco de alerta só existe dentro do if de 'em_revisao' — nenhuma
    // segunda ocorrência do tipo fora dele.
    const ocorrencias = jornadaFn.match(/tipo: "microentrega_em_revisao"/g) ?? [];
    expect(ocorrencias.length).toBe(1);
  });
});

describe("CA05-CADENCIA-MICROENTREGAS — revisão/liberação persistem; microentrega não substitui tarefa/responsável/prazo", () => {
  it("criarMicroentregaCliente só grava em client_deliverables — nunca toca crm_casos, tarefas ou responsável/prazo do caso", () => {
    const trecho = jornadaFn.slice(
      jornadaFn.indexOf("export const criarMicroentregaCliente"),
      jornadaFn.indexOf("export const transicionarMicroentrega"),
    );
    // 24/09/2026 — a escrita passou a inserirComVerificacao (insere, relê e
    // compara); a tabela continua sendo só client_deliverables.
    expect(trecho).toContain('tabela: "client_deliverables"');
    expect(trecho).toContain("inserirComVerificacao(");
    expect(trecho).not.toMatch(
      /\.from\("crm_casos"\)|\.from\("tarefas"\)|responsavel_principal|prazo_proxima_acao/,
    );
  });

  it("publicado grava available_at e arquivado grava archived_at/by/motivo — estado de aprovação persiste, nada é apagado", () => {
    expect(jornadaFn).toContain("patch['available_at'] = hojeISO()");
    expect(jornadaFn).toContain("patch['archived_at'] = hojeISO()");
    expect(jornadaFn).toContain("patch['archived_by']");
  });

  it("transição respeita a máquina de estados existente (podeTransicionarEntrega) — sem pular etapa de revisão", () => {
    expect(jornadaFn).toContain("podeTransicionarEntrega(de, data.para)");
    expect(jornadaPuro).toContain('rascunho: ["em_revisao", "arquivado"]');
    expect(jornadaPuro).toContain('em_revisao: ["rascunho", "aprovado", "arquivado"]');
  });
});

describe("CA05-CADENCIA-MICROENTREGAS — conteúdo interno não vai ao App automaticamente", () => {
  it("app_projections (a única fonte hoje lida por rota do App/portal) é sanitizada antes de publicar", () => {
    // 01/11/2026 — não trava na quebra de linha exata do prettier: o erro pode
    // vir em `throw new Error(\n  "...",\n)` tanto quanto numa linha só.
    expect(portalAtendimentoFn).toContain("contemConteudoInterno(conteudo)");
    expect(portalAtendimentoFn).toContain(
      "O texto contém termo interno que não pode ir ao App Cliente. Reescreva em linguagem de cliente.",
    );
  });

  it("client_deliverables ainda não é lido por nenhuma rota do App/portal — App bloqueado por ausência de leitor, não só por approval_status", () => {
    const grep = execSync('grep -rl "client_deliverables" src/routes || true', {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim();
    expect(grep).toBe("");
  });

  it("a projeção pura para o App (projetarEntregasCliente / entregasParaAppCliente) continua exigindo publicado + aprovado + sem termo interno", () => {
    expect(onboardingJornada).toContain('.filter((e) => e.approval_status === "publicado")');
    expect(onboardingJornada).toContain(".filter((e) => Boolean(e.approved_by))");
    expect(onboardingJornada).toContain("!contemConteudoInterno(e.summary_approved)");
  });
});

describe("CA05-CADENCIA-MICROENTREGAS — D0–D365 como jornada contínua por caso", () => {
  it("a aba de onboarding do Caso 360 é sempre parametrizada por caso (casoId/caso), nunca uma lista fixa de datas", () => {
    expect(abaOnboarding).toContain("caseId={String(caso.id)}");
    expect(abaOnboarding).not.toMatch(/cenário da ana|cenario da ana/i);
  });

  it("cadência (D7/D10/D14) e diagnóstico de onboarding são funções puras derivadas do estado real do caso, não datas fixas", () => {
    expect(onboardingJornada).toContain("DIAS_PRIMEIRA_MICROENTREGA");
    expect(onboardingJornada).toContain("DIAS_CADENCIA_ATENCAO");
    expect(onboardingJornada).toContain("DIAS_CADENCIA_CRITICA");
    expect(onboardingJornada).toContain("export function diagnosticarOnboarding(");
    expect(onboardingJornada).toContain("export function avaliarCadencia(");
  });
});
