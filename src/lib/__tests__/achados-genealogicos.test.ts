import { describe, expect, it } from "vitest";

import {
  CAMPOS_INTERNOS_BLOQUEADOS,
  projetarEncontroParaCliente,
  termoProibido,
  validarAchado,
  validarEncontro,
} from "@/lib/achados-genealogicos";

const evid = ["11111111-1111-1111-1111-111111111111"];
const fonte = ["22222222-2222-2222-2222-222222222222"];

describe("G-06 — Achados genealógicos", () => {
  it("1. achado sem evidência e sem fonte é negado", () => {
    const b = validarAchado({ finding_type: "registro_civil", evidence_links: [], source_links: [] });
    expect(b.map((x) => x.codigo)).toContain("ACHADO_SEM_EVIDENCIA");
  });

  it("1b. achado com apenas uma fonte é aceito", () => {
    expect(validarAchado({ finding_type: "registro_civil", source_links: fonte })).toEqual([]);
  });

  it("2. resultado negativo pode ser registrado com fonte, data e próxima ação", () => {
    expect(
      validarAchado({
        finding_type: "resultado_negativo_pesquisa",
        source_links: fonte,
        negative_source_consulted_at: "2026-08-10",
        negative_next_action: "Solicitar busca no arquivo diocesano de Graz.",
      }),
    ).toEqual([]);
  });

  it("2b. resultado negativo sem próxima ação é negado", () => {
    const b = validarAchado({
      finding_type: "resultado_negativo_pesquisa",
      source_links: fonte,
      negative_source_consulted_at: "2026-08-10",
    });
    expect(b.map((x) => x.codigo)).toContain("RESULTADO_NEGATIVO_INCOMPLETO");
  });

  it("3. achado validado não vira entrega sem validação interna, nem impacta árvore antes da revisão", () => {
    const b = validarAchado({
      finding_type: "registro_civil",
      source_links: fonte,
      validation_status: "em_revisao",
      eligible_for_client_deliverable: true,
      tree_impact: "aplicado",
    });
    expect(b.map((x) => x.codigo)).toEqual(
      expect.arrayContaining(["ELEGIBILIDADE_SEM_VALIDACAO", "IMPACTO_SEM_REVISAO"]),
    );
  });

  it("4. hipótese de pesquisa não pode ser marcada como validada", () => {
    const b = validarAchado({
      finding_type: "hipotese_pesquisa",
      evidence_links: evid,
      validation_status: "validado_internamente",
    });
    expect(b.map((x) => x.codigo)).toContain("HIPOTESE_NAO_VALIDAVEL");
  });
});

describe("G-06 — Encontros de linhagem", () => {
  const base = {
    encounter_type: "convergencia_documental",
    lineage_path_a_id: "a",
    lineage_path_b_id: "b",
    evidence_links_a: evid,
    evidence_links_b: fonte,
  } as const;

  it("exige duas linhas e evidência de cada lado", () => {
    const b = validarEncontro({ ...base, evidence_links_b: [] });
    expect(b.map((x) => x.codigo)).toContain("ENCONTRO_SEM_EVIDENCIA_POR_LADO");
    const c = validarEncontro({ ...base, lineage_path_b_id: null });
    expect(c.map((x) => x.codigo)).toContain("ENCONTRO_SEM_DUAS_LINHAS");
  });

  it("marco de origem dispensa a segunda linha, mas não a evidência", () => {
    expect(validarEncontro({ encounter_type: "marco_de_origem", evidence_links_a: evid })).toEqual([]);
    expect(validarEncontro({ encounter_type: "marco_de_origem" }).map((x) => x.codigo)).toContain("MARCO_SEM_EVIDENCIA");
  });

  it("3. encontro sem disclaimer não pode ser aprovado", () => {
    const b = validarEncontro({
      ...base,
      validation_status: "validado_internamente",
      approval_status: "aprovado",
      resumo_aprovado_cliente: "Duas linhas documentadas convergem na mesma paróquia em 1887.",
      disclaimer_obrigatorio: false,
    });
    expect(b.map((x) => x.codigo)).toContain("ENCONTRO_SEM_DISCLAIMER");
  });

  it("4. hipótese não aparece como conexão confirmada", () => {
    const b = validarEncontro({ ...base, encounter_type: "conexao_confirmada", confidence_internal: "hipotese" });
    expect(b.map((x) => x.codigo)).toContain("CONEXAO_NAO_COMPROVADA");
    expect(
      validarEncontro({
        ...base,
        encounter_type: "conexao_confirmada",
        confidence_internal: "documentado",
        validation_status: "validado_internamente",
      }),
    ).toEqual([]);
  });

  it("entrega ao cliente só existe com aprovação", () => {
    const b = validarEncontro({ ...base, client_deliverable_id: "d1" });
    expect(b.map((x) => x.codigo)).toContain("PROJECAO_SEM_APROVACAO");
  });

  it("recusa linguagem determinista, terapêutica ou de traço psicológico", () => {
    expect(termoProibido("Cidadania garantida em 2027")).toBe("cidadania garantida");
    expect(termoProibido("Você herdou a coragem dos antepassados")).toBe("herdou a coragem");
    expect(termoProibido("cura do trauma ancestral")).toBe("cura");
    expect(termoProibido("Registro paroquial de 1887 em Graz")).toBeNull();
    const b = validarEncontro({
      ...base,
      title_client: "Sua cidadania garantida pela linha materna",
    });
    expect(b.map((x) => x.codigo)).toContain("LINGUAGEM_PROIBIDA");
  });
});

describe("G-06 — Projeção para o App Cliente", () => {
  const aprovado = {
    approval_status: "aprovado",
    disclaimer_obrigatorio: true,
    resumo_aprovado_cliente: "Duas linhas documentadas convergem na mesma paróquia em 1887.",
    title_client: "Convergência documental em Graz",
    title_internal: "LE-01 convergência (interno)",
    resumo_interno: "Hipótese H2 sustentada por 3 registros; risco de homonímia.",
    evidence_links: evid,
    source_links: fonte,
    confidence_internal: "documentado",
    data_marco: "1887-04-02",
  };

  it("5. app não lê resumo interno nem fontes restritas", () => {
    const p = projetarEncontroParaCliente(aprovado)!;
    expect(p.resumo).toContain("paróquia");
    const chaves = Object.keys(p);
    for (const proibido of CAMPOS_INTERNOS_BLOQUEADOS) expect(chaves).not.toContain(proibido);
    expect(JSON.stringify(p)).not.toContain("homonímia");
    expect(JSON.stringify(p)).not.toContain(evid[0]);
    expect(p.disclaimer).toMatch(/não constitui conclusão jurídica/i);
  });

  it("sem aprovação, disclaimer ou resumo não há projeção", () => {
    expect(projetarEncontroParaCliente({ ...aprovado, approval_status: "em_aprovacao" })).toBeNull();
    expect(projetarEncontroParaCliente({ ...aprovado, disclaimer_obrigatorio: false })).toBeNull();
    expect(projetarEncontroParaCliente({ ...aprovado, resumo_aprovado_cliente: "  " })).toBeNull();
  });
});
