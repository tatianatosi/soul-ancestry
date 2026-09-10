import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { prepararConsequenciaAchado } from "@/lib/achados-genealogicos.functions";
import { MAPA_CENTRO_INTELIGENCIA } from "@/lib/biblioteca-mestre";

/*
 * CA11-CENTRO-INTELIGENCIA (09/09/2026) — organiza o Centro de Inteligência
 * dentro da Biblioteca Mestre sem criar oitava aba, pesquisa paralela ou
 * base duplicada. Três frentes reais:
 * (1) achado marcado elegível para microentrega e sem entrega vinculada
 *     virava linha morta em genealogical_findings — agora abre/atualiza um
 *     alerta interno pendente (case_alerts), nunca publica sozinho;
 * (2) Biblioteca Mestre passou a expor um mapa das 9 áreas e onde cada
 *     uma mora, incluindo a fonte concorrente real já existente (evidences
 *     vs research_evidence_items; name_variants vs research_name_variants;
 *     /pesquisa legado vs research_cases/evidences/genealogical_findings);
 * (3) o rótulo de navegação que apresentava o dossiê legado /pesquisa como
 *     equivalente ao atual foi corrigido, sem remover ou reativar a rota.
 */

function fakeSupabase(existenteId: string | null) {
  const chamadas: { tipo: "insert" | "update"; payload: Record<string, unknown>; id?: string }[] = [];
  return {
    from: (_t: string) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                limit: () => ({
                  maybeSingle: async () => ({ data: existenteId ? { id: existenteId } : null }),
                }),
              }),
            }),
          }),
        }),
      }),
      insert: async (payload: Record<string, unknown>) => {
        chamadas.push({ tipo: "insert", payload });
        return { data: null, error: null };
      },
      update: (payload: Record<string, unknown>) => ({
        eq: async (_col: string, id: string) => {
          chamadas.push({ tipo: "update", payload, id });
          return { data: null, error: null };
        },
      }),
    }),
    chamadas,
  };
}

describe("CA11 — achado relevante sempre prepara consequência (nunca só uma linha nova)", () => {
  it("sem case_id, não faz nenhuma chamada — nunca inventa vínculo", async () => {
    const sb = fakeSupabase(null);
    await prepararConsequenciaAchado(sb as never, "org-1", { id: "a1", eligible_for_client_deliverable: true });
    expect(sb.chamadas).toEqual([]);
  });

  it("achado elegível e sem microentrega vinculada abre alerta interno pendente (nunca publica)", async () => {
    const sb = fakeSupabase(null);
    await prepararConsequenciaAchado(sb as never, "org-1", {
      id: "a1",
      case_id: "caso-1",
      title: "Certidão de nascimento localizada",
      eligible_for_client_deliverable: true,
      client_deliverable_id: null,
    });
    expect(sb.chamadas).toHaveLength(1);
    expect(sb.chamadas[0].tipo).toBe("insert");
    expect(sb.chamadas[0].payload).toMatchObject({
      case_id: "caso-1",
      tipo: "achado_pendente_decisao",
      status: "pending",
    });
    expect(String(sb.chamadas[0].payload.titulo)).toMatch(/Certidão de nascimento/);
    expect(String(sb.chamadas[0].payload.detalhe)).toMatch(/nada é publicado automaticamente/i);
  });

  it("alerta pendente já existente é atualizado, nunca duplicado", async () => {
    const sb = fakeSupabase("alerta-existente");
    await prepararConsequenciaAchado(sb as never, "org-1", {
      id: "a1",
      case_id: "caso-1",
      title: "Certidão",
      eligible_for_client_deliverable: true,
      client_deliverable_id: null,
    });
    expect(sb.chamadas).toHaveLength(1);
    expect(sb.chamadas[0]).toMatchObject({ tipo: "update", id: "alerta-existente" });
  });

  it("achado com microentrega já vinculada resolve o alerta pendente em aberto", async () => {
    const sb = fakeSupabase("alerta-existente");
    await prepararConsequenciaAchado(sb as never, "org-1", {
      id: "a1",
      case_id: "caso-1",
      eligible_for_client_deliverable: true,
      client_deliverable_id: "entrega-1",
    });
    expect(sb.chamadas).toHaveLength(1);
    expect(sb.chamadas[0].tipo).toBe("update");
    expect(sb.chamadas[0].payload).toMatchObject({ status: "completed" });
  });

  it("achado não elegível e sem alerta prévio não cria nada", async () => {
    const sb = fakeSupabase(null);
    await prepararConsequenciaAchado(sb as never, "org-1", {
      id: "a1",
      case_id: "caso-1",
      eligible_for_client_deliverable: false,
    });
    expect(sb.chamadas).toEqual([]);
  });

  it("achado arquivado nunca mantém alerta pendente, mesmo se elegível", async () => {
    const sb = fakeSupabase("alerta-existente");
    await prepararConsequenciaAchado(sb as never, "org-1", {
      id: "a1",
      case_id: "caso-1",
      eligible_for_client_deliverable: true,
      client_deliverable_id: null,
      archived_at: "2026-09-09T00:00:00Z",
    });
    expect(sb.chamadas[0]).toMatchObject({ tipo: "update", payload: { status: "completed" } });
  });
});

describe("CA11 — Biblioteca Mestre declara as 9 áreas do Centro de Inteligência e a fonte concorrente real", () => {
  it("cobre exatamente as 9 áreas exigidas pela missão", () => {
    expect(MAPA_CENTRO_INTELIGENCIA).toHaveLength(9);
    const areas = MAPA_CENTRO_INTELIGENCIA.map((l) => l.area);
    for (const esperada of [
      "Bases por país/rota",
      "Fontes",
      "Trilhas/marcos",
      "Evidências",
      "Pessoas/relações/linhagens",
      "Hipóteses/lacunas",
      "Modelos/linguagem",
      "Conteúdos/microentregas",
      "Assistente de Pesquisa",
    ]) {
      expect(areas).toContain(esperada);
    }
  });

  it("declara a fonte concorrente real de evidências (evidences vs research_evidence_items)", () => {
    const linha = MAPA_CENTRO_INTELIGENCIA.find((l) => l.area === "Evidências")!;
    expect(linha.fonte).toContain("evidences");
    expect(linha.fonte).toContain("research_evidence_items");
    expect(linha.nota).toMatch(/fonte concorrente/i);
  });

  it("declara o dossiê legado /pesquisa como sistema paralelo desconectado, sem reativá-lo", () => {
    const linha = MAPA_CENTRO_INTELIGENCIA.find((l) => l.area === "Hipóteses/lacunas")!;
    expect(linha.nota).toMatch(/legado/i);
    expect(linha.nota).toMatch(/desconectad/i);
  });

  it("não inventa tabela nova: toda fonte citada já existe em algum leitor do módulo de pesquisa", () => {
    const arquivos = [
      "src/lib/pesquisa.functions.ts",
      "src/lib/pesquisa-modulo.functions.ts",
      "src/lib/pesquisa-cadeia.functions.ts",
      "src/lib/achados-genealogicos.functions.ts",
      "src/lib/pessoas-linhagens.functions.ts",
      "src/lib/biblioteca-evidencias.functions.ts",
      "src/lib/biblioteca-mestre.functions.ts",
      "src/lib/fontes-genealogicas.functions.ts",
      "src/lib/trilhas-juridicas.functions.ts",
      "src/lib/message-library.functions.ts",
    ]
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    const tabelasCitadas = new Set(
      MAPA_CENTRO_INTELIGENCIA.flatMap((l) => l.fonte.split(/[·(),]/)).map((t) => t.trim()).filter(Boolean),
    );
    for (const tabela of tabelasCitadas) {
      if (tabela.includes(" ") || tabela.includes(".ts")) continue;
      expect(arquivos).toContain(tabela);
    }
  });
});

describe("CA11 — navegação não apresenta o dossiê legado como equivalente ao atual", () => {
  const navegacao = readFileSync("src/lib/navegacao-desk.ts", "utf8");

  it("rótulo de /pesquisa deixa de prometer plano de ação e ficha genealógica (rotas reais são outras)", () => {
    expect(navegacao).not.toMatch(/to: "\/pesquisa", label: "Plano de ação e ficha genealógica"/);
  });

  it("rota /pesquisa continua existindo no menu da conta (não foi removida)", () => {
    expect(navegacao).toContain('to: "/pesquisa"');
  });

  it("âncora morta #historico (sem seção correspondente na tela) foi removida do menu", () => {
    expect(navegacao).not.toMatch(/to: "\/pesquisa", hash: "historico"/);
  });
});

describe("CA11 — Biblioteca Mestre passa a ler proxima_acao e vínculo de trilha de genealogical_sources_catalog", () => {
  const bibliotecaFn = readFileSync("src/lib/biblioteca-mestre.functions.ts", "utf8");

  it("select de bases inclui os campos que já existiam e nunca eram lidos", () => {
    const bloco = bibliotecaFn.slice(
      bibliotecaFn.indexOf('.from("genealogical_sources_catalog")'),
      bibliotecaFn.indexOf('.from("genealogical_sources_catalog")') + 400,
    );
    expect(bloco).toContain("proxima_acao");
    expect(bloco).toContain("citizenship_track_id");
  });

  it("item de biblioteca de bases expõe Próxima ação e Trilha vinculada nos detalhes", () => {
    const bloco = bibliotecaFn.slice(bibliotecaFn.indexOf('subarea: "bases"'));
    expect(bloco.slice(0, 1400)).toContain('det("Próxima ação"');
    expect(bloco.slice(0, 1400)).toContain('det("Trilha vinculada"');
  });
});
