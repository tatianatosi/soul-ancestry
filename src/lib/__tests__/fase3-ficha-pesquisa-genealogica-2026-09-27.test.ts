import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";

/**
 * Fase 3 (27/09/2026) — "Prompt Canônicos": Ficha Pesquisa Genealógica.
 * Não cria segundo CHECK de evidência — mapeia vocabulário histórico
 * (CA05/Piloto 5A.1) contra o vigente. Fecha um gap de link no hub real.
 */

describe("Fase 3 — vocabulário histórico nunca virou CHECK novo (confirmação, não regressão)", () => {
  const migrations = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
  const conteudoTodasMigrations = migrations
    .map((f) => readFileSync(`supabase/migrations/${f}`, "utf8"))
    .join("\n");

  it("nenhum estado histórico de EVIDÊNCIA (dado_pesquisa_inicial, validado_por_documento, informacao_compartilhada_familia) existe em CHECK algum", () => {
    for (const termo of [
      "dado_pesquisa_inicial",
      "validado_por_documento",
      "informacao_compartilhada_familia",
    ]) {
      expect(conteudoTodasMigrations).not.toContain(`'${termo}'`);
    }
  });

  it("'em_validacao_documental' existe, mas para um conceito diferente: hipótese de elegibilidade do CASO (crm_casos), não estado de evidência individual", () => {
    expect(conteudoTodasMigrations).toContain("crm_casos_hipotese_elegibilidade_chk");
    expect(conteudoTodasMigrations).toContain(
      "CHECK (hipotese_elegibilidade IN ('nao_avaliada','possivel','em_validacao_documental','documentalmente_confirmada','inconclusiva'))",
    );
  });

  it("o vocabulário real de status_pesquisa continua o mesmo (a_confirmar..refutado)", () => {
    expect(conteudoTodasMigrations).toContain(
      "IN ('a_confirmar','pendente','hipotese','provavel','com_suporte','confirmado','refutado')",
    );
  });

  it("nivel_de_fonte e modo_de_uso_permitido continuam o vocabulário real de fonte", () => {
    expect(conteudoTodasMigrations).toContain("nivel_de_fonte");
    expect(conteudoTodasMigrations).toContain("modo_de_uso_permitido");
  });
});

describe("Fase 3 — hub real (/pesquisa-evidencias/$caseId) cobre as 9 peças, com link p/ relatório", () => {
  const pagina = readFileSync("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", "utf8");

  it("cobre pessoa/linhagem, fonte, evidência, hipótese, achado, relatório e microentrega", () => {
    expect(pagina).toContain('titulo="Pessoas, famílias e ramos"');
    expect(pagina).toContain('titulo="Fontes e documentos"');
    expect(pagina).toContain('titulo="Evidências e validação"');
    expect(pagina).toContain('titulo="Relatórios F1/F2"');
    expect(pagina).toContain('to="/achados/$caseId"');
    expect(pagina).toContain('to="/biblioteca-evidencias/$caseId"');
    expect(pagina).toContain('to="/pessoas-linhagens/$caseId"');
  });

  it("gap fechado: agora linka para /relatorios-fase/$caseId a partir da seção de relatórios", () => {
    const inicio = pagina.indexOf('titulo="Relatórios F1/F2"');
    const trecho = pagina.slice(inicio, inicio + 1200);
    expect(trecho).toContain('to="/relatorios-fase/$caseId"');
  });
});

describe("Fase 3 → Corte Ficha Única (02/10/2026) — preparação de pesquisa unificada à Ficha Master, mesma rota, com link ao hub", () => {
  const modulo = readFileSync("src/lib/ficha-unica-caso.ts", "utf8");
  const casoIndex = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("continua montada em Caso 360, agora como Ficha Única (não moveu de rota, não há mais duas fichas concorrentes)", () => {
    expect(casoIndex).toContain("<PainelFichaUnica caseId={id} />");
    expect(casoIndex).not.toContain("<PainelFichaPiloto caseId={id} />");
    expect(casoIndex).not.toContain("<PainelFichaMaster caseId={id} />");
  });

  it("mantém link explícito para /pesquisa-evidencias/$caseId, sem duplicar dado", () => {
    expect(modulo).toContain('to: "/pesquisa-evidencias/$caseId"');
    expect(modulo).toContain("Abrir Pesquisa e Evidências do caso");
  });
});
