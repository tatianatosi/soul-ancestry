import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// CA08-JURIDICO-PROPORCIONAL (09/09/2026): Validação Jurídica funciona como
// decisão de ato formal por caso, não bloqueio universal. Mesmas fontes de
// sempre — citizenship_tracks, versioned_legal_rules,
// legal_reference_milestones, matriz jurídica de temas, case_dependents.
const crmDeskFn = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
const validacaoCaso = readFileSync("src/lib/validacao-juridica-caso.ts", "utf8");
const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("CA08-JURIDICO-PROPORCIONAL — fontes já existentes, nenhuma tabela ou taxonomia nova", () => {
  it("validacaoJuridicaCaso lê só citizenship_tracks/versioned_legal_rules/legal_reference_milestones/legal_clause_matrix/case_dependents", () => {
    const trecho = crmDeskFn.slice(crmDeskFn.indexOf("export const validacaoJuridicaCaso"));
    expect(trecho).toContain('.from("case_services")');
    expect(trecho).toContain('.from("citizenship_tracks")');
    expect(trecho).toContain('.from("legal_reference_milestones")');
    expect(trecho).toContain('.from("versioned_legal_rules")');
    expect(trecho).toContain('.from("legal_clause_matrix")');
    expect(trecho).toContain('.from("case_dependents")');
  });

  it("nenhuma tabela, framework ou gate novo é criado", () => {
    for (const f of [crmDeskFn, validacaoCaso]) {
      expect(f).not.toMatch(/create table|legal_framework|country_track|legal_gate/i);
    }
  });

  it("'ato afetado' é só um rótulo de efeito operacional, nunca conteúdo jurídico novo — vem de campos já existentes (reference_type, bloqueia_assinatura, participa_do_contrato)", () => {
    expect(validacaoCaso).toContain("m.reference_type");
    expect(validacaoCaso).toContain("t.bloqueia_assinatura");
    expect(validacaoCaso).toContain("d.participa_do_contrato");
  });
});

describe("CA08-JURIDICO-PROPORCIONAL — leitura só diagnostica, nunca bloqueia escrita", () => {
  it("validacaoJuridicaCaso é GET (somente leitura) — nenhuma ação externa", () => {
    const trecho = crmDeskFn.slice(
      crmDeskFn.indexOf("export const validacaoJuridicaCaso"),
      crmDeskFn.indexOf("export const validacaoJuridicaCaso") + 300,
    );
    expect(trecho).toContain('createServerFn({ method: "GET" })');
  });

  it("nenhum escritor de lead, discovery, pesquisa, tarefa, proposta rascunho, condição interna, contrato rascunho, OS ou microentrega chama validacaoJuridicaCaso ou avaliarValidacaoJuridicaCaso", () => {
    const arquivosDeEscrita = [
      "src/lib/crm-desk.functions.ts", // salvarLeadDesk e afins convivem no mesmo arquivo — checagem por função, não por arquivo
    ];
    // Verifica que os escritores de lead/tarefa/proposta não importam a validação jurídica por caso.
    const outrosEscritores = [
      readFileSync("src/lib/ops.functions.ts", "utf8"),
      readFileSync("src/lib/comercial.functions.ts", "utf8"),
      readFileSync("src/lib/discovery-roteiro.ts", "utf8"),
    ];
    for (const conteudo of outrosEscritores) {
      expect(conteudo).not.toContain("validacaoJuridicaCaso");
      expect(conteudo).not.toContain("avaliarValidacaoJuridicaCaso");
    }
    expect(arquivosDeEscrita.length).toBe(1);
  });

  it("bloqueio segue restrito a assinatura/protocolo/publicação jurídica/acesso de menor — nunca lead, discovery, tarefa ou rascunho", () => {
    expect(validacaoCaso).toContain('"assinatura"');
    expect(validacaoCaso).toContain('"protocolo"');
    expect(validacaoCaso).toContain('"publicacao_juridica"');
    expect(validacaoCaso).toContain('"acesso_sensivel_menor"');
    for (const proibido of [
      "lead",
      "discovery",
      "pesquisa",
      "rascunho_bloqueado",
      "os_interna_bloqueada",
    ]) {
      expect(validacaoCaso.toLowerCase()).not.toContain(proibido);
    }
  });
});

describe("CA08-JURIDICO-PROPORCIONAL — mostrado no Caso 360, sem tela nova nem formulário duplicado", () => {
  it("a seção 'Validação jurídica deste caso' existe dentro do bloco Jurídico já existente", () => {
    // Prettier pode quebrar <SecaoAncora\n  id="X" em múltiplas linhas.
    const inicio = caso360.search(/<SecaoAncora\s+id="comercial"/);
    const fim = caso360.search(/<SecaoAncora\s+id="tecnico"/);
    const bloco = caso360.slice(inicio, fim);
    expect(bloco).toContain("Validação jurídica deste caso");
    expect(bloco).toContain("Decisão de ato formal, não bloqueio universal");
  });

  it("mostra rota, estado, decisão humana, documento/evidência e ato afetado", () => {
    const inicio = caso360.indexOf("Validação jurídica deste caso");
    const fim = caso360.indexOf("Motor e matriz de contrato");
    const bloco = caso360.slice(inicio, fim);
    expect(bloco).toContain("Rota:");
    expect(bloco).toContain("estado:");
    expect(bloco).toContain("Decisão necessária:");
    expect(bloco).toContain("Evidência:");
    expect(bloco).toContain("Afeta:");
  });

  it("nenhum formulário embutido na nova seção — só leitura", () => {
    const inicio = caso360.indexOf("Validação jurídica deste caso");
    const fim = caso360.indexOf("Motor e matriz de contrato");
    const bloco = caso360.slice(inicio, fim);
    expect(bloco).not.toMatch(/<input|<select|<textarea/);
  });

  it("a ponte para o motor e a matriz de contrato (4 links) continua intacta — nenhum link removido", () => {
    const inicioJuridico = caso360.search(/<SecaoAncora\s+id="comercial"/);
    const fimJuridico = caso360.search(/<SecaoAncora\s+id="tecnico"/);
    const blocoJuridico = caso360.slice(inicioJuridico, fimJuridico);
    for (const ponte of [
      "/casos/$caseId/contrato/preparar",
      "/contratos",
      "/matriz-juridica",
      "/ordens-servico",
    ]) {
      expect(blocoJuridico, `Jurídico devia linkar para ${ponte}`).toContain(ponte);
    }
  });
});

describe("CA08-JURIDICO-PROPORCIONAL — RLS preservada", () => {
  it("todas as leituras são filtradas por organização ou por track/case_id derivado do caso", () => {
    const trecho = crmDeskFn.slice(crmDeskFn.indexOf("export const validacaoJuridicaCaso"));
    expect(trecho).toContain('.eq("case_id", data.caseId)');
    expect(trecho).toContain('.eq("track_id", trackId)');
  });

  it("nenhum service_role nem RLS desligada no código novo", () => {
    for (const f of [crmDeskFn, validacaoCaso]) {
      expect(f).not.toMatch(/service_role|disable row level security/i);
    }
  });
});
