import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { CADEIA_LEGADO_CASO, composicaoDoCaso360, vazioComposicao } from "@/lib/cadeia-legado-caso";
import { itemAlimentoOfereceNoMotor } from "@/lib/planejador-produtos-pai";

describe("Cadeia legado → lista-alimento → planejador → Caso 360 → App → WhatsApp", () => {
  it("declara a cadeia única, sem tabela inventada", () => {
    expect(CADEIA_LEGADO_CASO.map((c) => c.id)).toEqual([
      "legado",
      "lista_alimento",
      "catalogo_planejador",
      "caso_360",
      "desk",
      "app",
      "whatsapp",
    ]);
    const tabelas = CADEIA_LEGADO_CASO.flatMap((c) => [...c.tabelas]);
    expect(tabelas).toContain("planner_catalog_feed");
    expect(tabelas).toContain("product_catalog");
    expect(tabelas).toContain("case_plans");
    expect(tabelas).toContain("case_services");
    expect(tabelas).toContain("communication_queue");
    expect(tabelas.join(" ")).not.toMatch(/citizenship_cases|case_participants|planilha_mestre_viva/);
  });

  it("Caso 360 junta produto-pai, fase, trilha, itens e condição particular", () => {
    const c = composicaoDoCaso360({
      plano: {
        fase_jornada: "pesquisa_e_validacao",
        entregas: ["Relatório de linha"],
        microentregas: ["Mapa preliminar"],
      },
      servicos: [
        {
          product_catalog_id: "p1",
          citizenship_track_id: "t1",
          condicao_comercial_aprovada: "R$ 9.600 — condição particular da proposta aceita",
          escopo_aprovado: "Diagnóstico familiar",
        },
      ],
      produtos: [{ id: "p1", nome_comercial: "Diagnóstico Familiar Multipaís", produto_pai: "Diagnóstico Familiar Multipaís" }],
      trilhas: [{ id: "t1", pais: "Áustria", code: "AT-58c", track_name: "§58c StbG" }],
      entregas: [{ published_at: "2026-09-11T12:00:00Z" }],
      comunicacoes: [{ status: "pending", sent_at: null, approved_at: null }, { sent_at: "2026-09-10T12:00:00Z" }],
    });
    expect(c.produtoPai).toBe("Diagnóstico Familiar Multipaís");
    expect(c.faseRotulo).not.toBe("pesquisa_e_validacao");
    expect(c.trilhas[0]).toContain("Áustria");
    expect(c.itens).toEqual(expect.arrayContaining(["Diagnóstico Familiar Multipaís", "Relatório de linha"]));
    expect(c.condicaoParticular).toMatch(/9\.600/);
    expect(c.appPublicados).toBe(1);
    expect(c.whatsappEnviados).toBe(1);
    expect(c.whatsappAguardando).toBe(1);
    expect(vazioComposicao(c)).toBe(false);
  });

  it("ausência não inventa composição", () => {
    const c = composicaoDoCaso360({ plano: null, servicos: [], produtos: [], trilhas: [] });
    expect(vazioComposicao(c)).toBe(true);
    expect(c.faseRotulo).toBe("Sem fase registrada");
  });

  it("lista-alimento arquivada não entra no motor", () => {
    expect(itemAlimentoOfereceNoMotor("ATIVO_HOMOLOGADO")).toBe(true);
    expect(itemAlimentoOfereceNoMotor("NAO_USAR_NO_MOTOR")).toBe(false);
    expect(itemAlimentoOfereceNoMotor("ARQUIVADO_DECISAO_PROPRIETARIA")).toBe(false);
  });

  it("a ficha do Caso 360 mostra a composição e lê case_plans", () => {
    const ficha = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    const bloco = readFileSync("src/components/caso/composicao-caso-360.tsx", "utf8");
    const canonico = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
    expect(ficha).toContain("ComposicaoCaso360");
    expect(bloco).toContain("data-composicao-caso");
    expect(canonico).toContain('eq("case_plans")');
    expect(canonico).toContain("planos:");
  });

  it("o elo de catálogo da cadeia operacional não chama mais a Planilha de fonte viva", () => {
    const cadeia = readFileSync("src/lib/cadeia-operacional.ts", "utf8");
    expect(cadeia).toContain('titulo: "Catálogo operacional do planejador"');
    expect(cadeia).not.toContain('titulo: "SKU/preço da Planilha Mestre"');
    expect(cadeia).toContain("lista-alimento");
  });

  it("a memória permanente registra a cadeia única", () => {
    const agents = readFileSync("AGENTS.md", "utf8");
    expect(agents).toContain("LISTA-ALIMENTO VERSIONADA");
    expect(agents).toContain("CATÁLOGO OPERACIONAL DO PLANEJADOR");
    expect(agents).toContain("produto-pai + fase + trilha(s) + itens + condição particular");
  });
});
