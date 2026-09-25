import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * P1 "Uma identidade operacional do Lead ao Caso", reaberta em 24/09/2026:
 * o grosso já estava feito (p1-identidade-conversao-lead-cliente.test.ts).
 * Aqui ficam as lacunas que faltavam: cancelamento sem escrita, persistência
 * após reload, a mesma ação de conversão alcançável a partir de /leads e o
 * nome da ação conforme a ordem.
 */

const handoff = readFileSync("src/lib/handoff-discovery.functions.ts", "utf8");
const painel = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
const leads = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
const crm = readFileSync("src/lib/crm-desk.functions.ts", "utf8");

const corpo = handoff.slice(handoff.indexOf("export const executarHandoffDiscovery"));
const pedeConfirmacao = corpo.indexOf("precisaConfirmarCliente: true,");
// Ponto da decisão de identidade (o ramo de lead já convertido, com caso, é outro caminho).
const decisao = corpo.indexOf("decidirClienteDoHandoff(");

describe("cancelamento sem escrita", () => {
  it("com candidatos ambíguos, a função devolve antes de criar pessoa, caso, vínculo ou avançar estágio", () => {
    expect(decisao).toBeGreaterThan(-1);
    expect(pedeConfirmacao).toBeGreaterThan(decisao);
    const antes = corpo.slice(decisao, pedeConfirmacao);
    expect(antes).not.toContain("inserirComVerificacao(");
    expect(antes).not.toMatch(/\.from\("crm_casos"\)\s*\.insert\(/);
    expect(antes).not.toContain("promoverLeadParaGanho(");
    expect(antes).not.toMatch(/case_id:\s*casoId/);
    const depois = corpo.slice(pedeConfirmacao);
    expect(depois).toContain("inserirComVerificacao(");
    expect(depois).toContain("promoverLeadParaGanho(");
  });
  it("o botão Cancelar da confirmação só fecha a escolha, sem chamar o servidor", () => {
    const i = painel.indexOf("Cancelar\n");
    const trecho = painel.slice(painel.lastIndexOf("<button", i), i);
    expect(trecho).toContain("onClick={() => setCandidatosCliente([])}");
    expect(trecho).not.toContain("mutate(");
  });
  it("escolher a pessoa exige confirmação humana com motivo (AcaoOperacional), nunca clique cru", () => {
    expect(painel).toContain('rotulo="Usar esta pessoa"');
    expect(painel).toContain('rotulo="Criar pessoa nova"');
    expect(painel).not.toMatch(/onClick=\{\(\) => mutarHandoff\.mutate\(/);
  });
});

describe("persistência após reload", () => {
  it("toda escrita do handoff passa por gravação com releitura", () => {
    expect(handoff).toContain('import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";');
    expect(corpo.match(/gravarComVerificacao\(\{/g)!.length).toBeGreaterThanOrEqual(4);
  });
  it("a leitura de leads não usa cache: recarregar mostra o que foi gravado", () => {
    const listar = crm.slice(crm.indexOf("export const listarLeadsDesk"), crm.indexOf("export const salvarLeadDesk"));
    expect(listar).toContain("semCache();");
  });
});

describe("uma ação de conversão, alcançável de /calls e /leads", () => {
  it("a ação tem o nome da ordem e continua sendo a mesma mutation com o mesmo gate", () => {
    const i = painel.indexOf('rotulo="Converter em cliente/pessoa canônica e abrir o caso"');
    expect(i).toBeGreaterThan(-1);
    const trecho = painel.slice(i, i + 500);
    expect(trecho).toContain("pendenciaGate={gateHandoff.ok ? null : gateHandoff.motivo}");
    expect(trecho).toContain("mutarHandoff.mutate(");
  });
  it("/leads abre a Mesa já com o lead para converter — sem segundo writer", () => {
    expect(leads).toContain("data-lead-conversao");
    expect(leads).toContain("Converter em cliente/pessoa canônica");
    expect(leads).toContain("search={{ lead: editado.id }}");
    expect(leads).not.toMatch(/import[^;]*executarHandoffDiscovery/);
    expect(leads).not.toContain("useServerFn(executarHandoffDiscovery)");
  });
  it("lead já convertido mostra o caso vinculado em vez de nova conversão (sem caso sem cliente)", () => {
    expect(leads).toContain("editado.case_id ? (");
    expect(leads).toContain("Convertido: abrir o caso vinculado");
  });
});
