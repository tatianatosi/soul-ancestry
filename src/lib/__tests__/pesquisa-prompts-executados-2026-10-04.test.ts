import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { INTEGRIDADE, LEGIBILIDADE } from "@/lib/fontes-documentos";
import { RESULTADO_CONSULTA } from "@/components/pesquisa/modulo-campos";

/**
 * Proprietária, 04/10/2026: "a varredura que pedi em relação a pesquisa não
 * foi só de órfãos e sim de diversos prompts que não foram executados e
 * somente documentados e arquivados".
 *
 * Ela estava certa. `FICHA-PESQUISA-GENEALOGICA-CANONICA.md` (27/09) listava
 * três itens como "declarado, não construído", e a medição no banco em 04/10
 * confirmou: nenhuma das colunas existia. Dois deles são executáveis sem
 * decisão de produto nova, e foram executados nesta rodada:
 *
 *  1. log de consulta a fonte (`genealogical_source_id`, `resultado_consulta`
 *     em `research_document_requests`);
 *  2. checklist de revisão documental (`legibilidade`, `integridade` em
 *     `case_source_documents`) — que é também o destino dos checklists de
 *     dossiê da Ana, que nunca tiveram onde ser gravados.
 *
 * O terceiro (rastreamento nomeado D-0x) já tinha sido executado em 03/10 e
 * vive em `/governanca/decisoes`.
 */

const leitura = (p: string) => readFileSync(p, "utf8");
const MIGRATION = "supabase/migrations/20261004120000_pesquisa_log_consulta_e_revisao_documental.sql";

describe("log de consulta a fonte — executado, não só documentado", () => {
  it("a migration é aditiva e não cria tabela nova", () => {
    const sql = leitura(MIGRATION);
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS genealogical_source_id");
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS resultado_consulta");
    expect(sql).not.toMatch(/CREATE TABLE/i);
    expect(sql).not.toMatch(/DROP COLUMN/i);
  });

  it("o RESULTADO tem os 5 valores do CHECK, com a busca negativa nomeada", () => {
    expect(RESULTADO_CONSULTA.map(([v]) => v)).toEqual([
      "encontrado",
      "nao_encontrado",
      "parcial",
      "inacessivel",
      "aguardando",
    ]);
    expect(RESULTADO_CONSULTA.find(([v]) => v === "nao_encontrado")?.[1]).toContain("busca negativa");
    const sql = leitura(MIGRATION);
    for (const v of RESULTADO_CONSULTA.map(([x]) => x)) expect(sql).toContain(`'${v}'`);
  });

  it("os dois campos são graváveis e aparecem na aba Pedidos documentais", () => {
    expect(leitura("src/lib/pesquisa-modulo.server.ts")).toContain('"genealogical_source_id"');
    expect(leitura("src/lib/pesquisa-modulo.server.ts")).toContain('"resultado_consulta"');
    const campos = leitura("src/components/pesquisa/modulo-campos.ts");
    expect(campos).toContain('rotulo: "Fonte consultada (catálogo)"');
    expect(campos).toContain('rotulo: "Resultado da consulta"');
  });

  it("a fonte vem do catálogo oficial, e a classificação M não é copiada", () => {
    expect(leitura("src/components/pesquisa/modulo-campos.ts")).toContain('ref: "catalogo_fontes"');
    const fn = leitura("src/lib/pesquisa-modulo.functions.ts");
    expect(fn).toContain('from("genealogical_sources_catalog")');
    expect(fn).toContain("catalogoFontes");
    expect(leitura("src/components/pesquisa/modulo.tsx")).toContain("catalogo_fontes");
    // a coluna é FK, não cópia do M
    expect(leitura(MIGRATION)).toContain("REFERENCES public.genealogical_sources_catalog(id)");
  });
});

describe("checklist de revisão documental — executado", () => {
  it("legibilidade e integridade espelham o CHECK, com a_avaliar como default", () => {
    expect(LEGIBILIDADE.map((o) => o.id)).toEqual(["a_avaliar", "ok", "parcial", "ilegivel"]);
    expect(INTEGRIDADE.map((o) => o.id)).toEqual(["a_avaliar", "ok", "parcial", "comprometida"]);
    const sql = leitura(MIGRATION);
    expect(sql).toContain("DEFAULT 'a_avaliar'");
    expect(sql).toContain("csd_legibilidade_chk");
    expect(sql).toContain("csd_integridade_chk");
  });

  it("o escritor aceita e valida os dois campos novos", () => {
    const fn = leitura("src/lib/fontes-documentos.functions.ts");
    expect(fn).toContain('"legibilidade"');
    expect(fn).toContain('"integridade"');
    expect(fn).toContain('checa("legibilidade", LEGIBILIDADE)');
    expect(fn).toContain('checa("integridade", INTEGRIDADE)');
  });

  it("a aba Fontes e documentos coleta e mostra os dois", () => {
    const tela = leitura("src/components/pesquisa/fontes-documentos.tsx");
    expect(tela).toContain('label="Legibilidade"');
    expect(tela).toContain('label="Integridade"');
    expect(tela).toContain("legibilidade:");
  });

  it("PESSOA_IDENTIFICAVEL não foi duplicado — já existia como pessoa_nao_identificada", () => {
    const fn = leitura("src/lib/fontes-documentos.functions.ts");
    expect(fn).toContain('"pessoa_nao_identificada"');
    expect(fn).not.toContain("pessoa_identificavel");
  });
});

describe("o documento-fonte deixou de dizer “não construído” para estes dois", () => {
  const doc = leitura("docs/arquitetura/FICHA-PESQUISA-GENEALOGICA-CANONICA.md");

  it("as duas linhas passaram a EXECUTADO, com a migration citada", () => {
    expect(doc).toContain("**EXECUTADO em 04/10/2026** (migration `20261004120000`)");
    expect(doc.match(/EXECUTADO em 04\/10\/2026/g) ?? []).toHaveLength(2);
  });

  it("o terceiro item (decisões D-0x) continua declarado — não foi fabricado aqui", () => {
    expect(doc).toContain("Decisões de governança nomeadas");
  });
});
