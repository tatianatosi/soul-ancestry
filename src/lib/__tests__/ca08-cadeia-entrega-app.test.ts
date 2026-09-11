import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// CA08-CADEIA-ENTREGA-APP (09/09/2026): fecha a cadeia canônica decidida —
// tarefa/onboarding/marco → client_deliverables (entrega operacional) →
// revisão e aprovação → app_projections/portal_projecoes → App liberado.
// Achado real (CA05/CA06): client_deliverables "publicado" prometia chegar
// ao App, mas nenhuma rota lia essa tabela. Fechado com uma ponte explícita,
// não automática, reaproveitando 100% da Biblioteca Mestre já existente.
const bibliotecaFn = readFileSync("src/lib/biblioteca-evidencias.functions.ts", "utf8");
const jornadaComponente = readFileSync("src/components/caso/jornada-cliente.tsx", "utf8");

describe("CA08-CADEIA-ENTREGA-APP — ponte client_deliverables → app_projections", () => {
  it("projetarMicroentregaParaApp existe e só age sobre client_deliverables e app_projections — nenhuma tabela nova", () => {
    const trecho = bibliotecaFn.slice(bibliotecaFn.indexOf("export const projetarMicroentregaParaApp"));
    expect(trecho).toContain('.from("client_deliverables")');
    expect(trecho).toContain('.from("app_projections")');
    expect(trecho).not.toMatch(/create table|client_deliverables_v2|app_projections_v2/i);
  });

  it("só projeta uma micro-entrega já 'publicado' — nunca rascunho, em_revisao ou aprovado", () => {
    const trecho = bibliotecaFn.slice(bibliotecaFn.indexOf("export const projetarMicroentregaParaApp"));
    expect(trecho).toContain('entrega.data["approval_status"] !== "publicado"');
  });

  it("dedup: uma micro-entrega nunca gera duas projeções (source_entity_type = milestone no CHECK)", () => {
    const trecho = bibliotecaFn.slice(bibliotecaFn.indexOf("export const projetarMicroentregaParaApp"));
    expect(trecho).toContain('.eq("source_entity_type", "milestone")');
    expect(trecho).toContain('source_entity_type: "milestone"');
    expect(trecho).not.toContain('source_entity_type: "client_deliverable"');
    expect(trecho).toContain('.eq("source_entity_id", data.entregaId)');
    expect(trecho).toContain("existente.data?.id");
    expect(trecho).toContain("criado: false");
  });

  it("a projeção nasce em rascunho (draft) — nunca aprovada ou publicada automaticamente", () => {
    const trecho = bibliotecaFn.slice(
      bibliotecaFn.indexOf("export const projetarMicroentregaParaApp"),
      bibliotecaFn.indexOf("export const aprovarProjecao"),
    );
    expect(trecho).toContain('approval_status: "draft"');
    expect(trecho).not.toMatch(/approval_status:\s*"(approved|published)"/);
  });

  it("o conteúdo passa pela mesma sanitização de sempre (conteudoProjetavel) antes de virar projeção", () => {
    const trecho = bibliotecaFn.slice(
      bibliotecaFn.indexOf("export const projetarMicroentregaParaApp"),
      bibliotecaFn.indexOf("export const aprovarProjecao"),
    );
    expect(trecho).toContain("conteudoProjetavel(conteudo)");
    expect(trecho).toContain("if (!checagem.ok) throw new Error(checagem.erros.join");
  });

  it("depois de projetada, segue o fluxo já existente e testado da Biblioteca Mestre (revisar → aprovar → publicar)", () => {
    expect(bibliotecaFn).toContain("export const revisarProjecao");
    expect(bibliotecaFn).toContain("export const aprovarProjecao");
    // A ponte não pula revisão nem aprovação: cria só o rascunho, nunca chama
    // revisarProjecao/aprovarProjecao por dentro de si mesma.
    const trecho = bibliotecaFn.slice(
      bibliotecaFn.indexOf("export const projetarMicroentregaParaApp"),
      bibliotecaFn.indexOf("export const aprovarProjecao"),
    );
    expect(trecho).not.toMatch(/revisarProjecao\(|aprovarProjecao\(/);
  });
});

describe("CA08-CADEIA-ENTREGA-APP — Desk vê e aciona a ponte, sem tela nova", () => {
  it("o botão 'Projetar ao App' só aparece quando a micro-entrega está publicada", () => {
    const trecho = jornadaComponente.slice(
      jornadaComponente.indexOf('status === "publicado" ?'),
      jornadaComponente.indexOf('status === "publicado" ?') + 900,
    );
    expect(trecho).toContain("Projetar ao App");
    expect(trecho).toContain("mProjetar.mutate");
  });

  it("a cópia da tela não promete mais que 'publicado' sozinho chega ao App — reflete a cadeia real", () => {
    expect(jornadaComponente).not.toContain("Somente publicadas aparecem no App Cliente.");
    expect(jornadaComponente).not.toContain("Nada aparece no App Cliente antes de publicar.");
    expect(jornadaComponente).toContain("Biblioteca Mestre");
  });

  it("nenhuma rota ou componente novo — a ponte mora no mesmo componente e no mesmo arquivo de sempre", () => {
    expect(jornadaComponente).toContain('import { projetarMicroentregaParaApp } from "@/lib/biblioteca-evidencias.functions"');
  });
});
