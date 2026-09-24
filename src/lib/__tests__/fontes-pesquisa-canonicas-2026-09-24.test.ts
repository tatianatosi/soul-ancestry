import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

import {
  FONTES_PESQUISA,
  eventoDeModuloParaGenealogico,
  idsJaCopiados,
  marcadorOrigem,
  mensagemLegadoSemCriacao,
  relacaoDePesquisaParaGenealogica,
} from "@/lib/fontes-pesquisa-canonicas";

/**
 * Fase 1 da consolidação das fontes concorrentes da Pesquisa (24/09/2026):
 * uma canônica por conceito, legado sem registro novo e ponte com prévia.
 */

const ler = (p: string) => readFileSync(p, "utf8");

describe("registro das fontes", () => {
  it("cada conceito tem exatamente uma fonte canônica", () => {
    for (const [conceito, fontes] of Object.entries(FONTES_PESQUISA)) {
      expect(fontes.filter((f) => f.papel === "canonica"), conceito).toHaveLength(1);
    }
  });
  it("canônicas: research_evidence_items, genealogical_relationships, genealogical_events", () => {
    const canonica = (c: keyof typeof FONTES_PESQUISA) => FONTES_PESQUISA[c].find((f) => f.papel === "canonica")!.tabela;
    expect(canonica("evidencia")).toBe("research_evidence_items");
    expect(canonica("relacao")).toBe("genealogical_relationships");
    expect(canonica("evento")).toBe("genealogical_events");
  });
  it("legado nunca tem writer de registro novo e sempre declara a ponte", () => {
    for (const f of Object.values(FONTES_PESQUISA).flat().filter((x) => x.papel === "legado")) {
      expect(f.escritaNova, f.tabela).toBeNull();
      expect(f.ponte, f.tabela).toBeTruthy();
    }
  });
  it("writers declarados existem no disco", () => {
    for (const f of Object.values(FONTES_PESQUISA).flat()) {
      if (!f.escritaNova) continue;
      const [arquivo, funcao] = f.escritaNova.split("#");
      expect(existsSync(arquivo!), f.escritaNova).toBe(true);
      if (funcao) expect(ler(arquivo!), f.escritaNova).toMatch(new RegExp(`export (const|async function|function) ${funcao}\\b`));
    }
  });
  it("evidences continua como decisão pendente, não promovida nem descartada", () => {
    expect(FONTES_PESQUISA.evidencia.find((f) => f.tabela === "evidences")?.papel).toBe("decisao_pendente");
  });
});

describe("ponte — relação de pesquisa → relação genealógica", () => {
  const base = {
    id: "419ff68b-8781-4035-90b1-1789d79939eb",
    person_a_id: "p-a",
    person_b_id: "p-b",
    relationship_type: "parent",
    directionality: "a_to_b",
    status: "asserted",
    confidence_level: "low",
    supporting_evidence_count: 0,
  };
  it("mapeia tipo, direção e marca a origem", () => {
    const r = relacaoDePesquisaParaGenealogica(base, "caso-1");
    expect(r).toMatchObject({
      case_id: "caso-1",
      person_from_id: "p-a",
      person_to_id: "p-b",
      relation_type: "pai_mae",
      directionality: "a_to_b",
      status: "asserted",
      status_pesquisa: "hipotese",
      client_visibility: "interna",
    });
    expect(String(r["internal_notes"])).toContain(marcadorOrigem("research_relationships", base.id));
  });
  it("tipo sem equivalente vira a_confirmar e guarda o original", () => {
    const r = relacaoDePesquisaParaGenealogica({ ...base, relationship_type: "grandparent" }, "c");
    expect(r["relation_type"]).toBe("a_confirmar");
    expect(String(r["internal_notes"])).toContain("Tipo original: grandparent.");
  });
  it("validada sem evidência vinculada não chega a confirmado (o banco recusaria)", () => {
    const r = relacaoDePesquisaParaGenealogica({ ...base, status: "validated" }, "c");
    expect(r["status_pesquisa"]).toBe("provavel");
    expect(r["status"]).toBe("validated");
  });
  it("rejeitada vira refutado", () => {
    expect(relacaoDePesquisaParaGenealogica({ ...base, status: "rejected" }, "c")["status_pesquisa"]).toBe("refutado");
  });
});

describe("ponte — evento do módulo → evento genealógico", () => {
  const base = { id: "11111111-2222-4333-8444-555555555555", person_id: "p-1", event_type: "migration", status: "asserted" };
  it("mapeia tipo, precisão e marca a origem", () => {
    const e = eventoDeModuloParaGenealogico({ ...base, event_date: "1890-05-01", event_date_precision: "year", location_text: "Gênova" }, "c")!;
    expect(e).toMatchObject({
      event_type: "migracao",
      start_date: "1890-05-01",
      data_precisao: "aproximada",
      locality: "Gênova",
      validation_status: "pendente",
      client_visibility: "interna",
    });
    expect(String(e["description_internal"])).toContain(marcadorOrigem("research_case_events", base.id));
  });
  it("sem pessoa não copia (a camada genealógica exige pessoa)", () => {
    expect(eventoDeModuloParaGenealogico({ ...base, person_id: null }, "c")).toBeNull();
  });
  it("validado sem evidência fica em revisão, nunca confirmado", () => {
    expect(eventoDeModuloParaGenealogico({ ...base, status: "validated" }, "c")!["validation_status"]).toBe("em_revisao");
  });
});

describe("ponte idempotente", () => {
  it("lê as marcas de origem já gravadas", () => {
    const id = "419ff68b-8781-4035-90b1-1789d79939eb";
    const copiados = idsJaCopiados([`nota ${marcadorOrigem("research_relationships", id)}`, null, "sem marca"], "research_relationships");
    expect(copiados.has(id)).toBe(true);
    expect(idsJaCopiados([marcadorOrigem("research_relationships", id)], "research_case_events").size).toBe(0);
  });
  it("a ponte só grava com confirmar, pula o já copiado e nunca altera a origem", () => {
    const fn = ler("src/lib/pontes-pesquisa.functions.ts");
    expect(fn).toContain("if (!data.confirmar) return { simulado: true");
    expect(fn).toContain('acao: "ja_copiado"');
    expect(fn).toContain("inserirComVerificacao(");
    expect(fn).not.toMatch(/\.from\("research_(relationships|case_events)"\)[\s\S]{0,200}\.(update|delete|insert)\(/);
  });
});

describe("legado sem registro novo — servidor e tela", () => {
  it("dossiê antigo recusa evidência e evento novos", () => {
    const fn = ler("src/lib/pesquisa.functions.ts");
    expect(fn).toContain('if (!data.id && (data.bloco === "evidencias" || data.bloco === "eventos"))');
  });
  it("módulo antigo recusa relação e evento novos", () => {
    const fn = ler("src/lib/pesquisa-modulo.functions.ts");
    expect(fn).toContain('if (!data.id && (data.bloco === "relacoes" || data.bloco === "eventos"))');
  });
  it("CRUD genérico recusa evidência nova em evidencias", () => {
    expect(ler("src/lib/saas.functions.ts")).toContain('if (data.entidade === "evidencias") throw new Error(mensagemLegadoSemCriacao("evidencia"));');
  });
  it("as três telas trocam o botão de criar pelo aviso de legado", () => {
    expect(ler("src/routes/_authenticated/evidencias.tsx")).toContain('semCriacao={mensagemLegadoSemCriacao("evidencia")}');
    expect(ler("src/components/pesquisa/painel.tsx")).toContain("data-lista-legado");
    expect(ler("src/components/pesquisa/modulo.tsx")).toContain("data-lista-legado");
    expect(ler("src/components/saas/entidade-crud.tsx")).toContain("semCriacao ? (");
  });
  it("a mensagem aponta para a casa canônica", () => {
    expect(mensagemLegadoSemCriacao("relacao")).toContain("/pessoas-linhagens/$caseId");
    expect(mensagemLegadoSemCriacao("evidencia")).toContain("/pesquisa-modulo/$id");
  });
});

describe("leitura canônica primeiro e linhas do tempo separadas", () => {
  const cadeia = ler("src/lib/pesquisa-cadeia.functions.ts");
  const tela = ler("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx");
  it("a pesquisa do caso lê a camada genealógica e só mostra legado ainda não copiado", () => {
    expect(cadeia).toContain('.from("genealogical_relationships")');
    expect(cadeia).toContain('.from("genealogical_events")');
    expect(cadeia).toContain('"research_relationships",\n    );');
    expect(cadeia).toContain("!relacoesCopiadas.has(");
    expect(cadeia).toContain("!eventosModuloCopiados.has(");
  });
  it("rótulos distinguem genealógico, operacional e legado", () => {
    expect(tela).toContain('titulo="Linha do tempo genealógica"');
    expect(tela).toContain('titulo="Relações genealógicas"');
    expect(tela).toContain("legado, ainda não copiad");
    expect(ler("src/routes/_authenticated/casos.$caseId.index.tsx")).toContain("Linha do tempo do caso");
    expect(ler("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx")).toContain('rotulo: "Linha do tempo genealógica"');
    expect(ler("src/components/pesquisa/painel.tsx")).toContain('titulo="Linha do tempo do dossiê (legado)"');
  });
});
