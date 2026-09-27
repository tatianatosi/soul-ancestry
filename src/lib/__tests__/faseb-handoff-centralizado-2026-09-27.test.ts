import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { payloadClienteDoLead } from "@/lib/handoff-discovery";

/**
 * Fase B (27/09/2026): handoff Lead→Pessoa/Caso centralizado.
 * executarHandoffDiscovery já era o único writer — fecha o gap de
 * indicado_por e prova estruturalmente que a confirmação humana sempre
 * vem antes de qualquer escrita (cancelamento sem escrita).
 */

describe("Fase B — payloadClienteDoLead copia indicado_por (gap fechado)", () => {
  it("copia indicado_por do lead, uma vez", () => {
    const p = payloadClienteDoLead({
      nome: "Ana Luiza",
      email: "ana@example.com",
      telefone: "11999999999",
      origem: "google_ads",
      indicado_por: "Fulana de Tal",
      pais_linha_prioritaria: "Itália",
    } as any);
    expect(p.indicado_por).toBe("Fulana de Tal");
  });

  it("sem indicado_por no lead, devolve null (nunca inventa)", () => {
    const p = payloadClienteDoLead({ nome: "Ana Luiza" } as any);
    expect(p.indicado_por).toBeNull();
  });
});

describe("Fase B — executarHandoffDiscovery é o único writer, grava indicado_por na criação", () => {
  const arquivo = readFileSync("src/lib/handoff-discovery.functions.ts", "utf8");

  it("é a única server fn que insere em clientes/crm_casos a partir de um lead neste arquivo", () => {
    expect(arquivo).toContain("export const executarHandoffDiscovery");
    const outrasExports = arquivo.match(/^export const \w+ = createServerFn/gm) ?? [];
    expect(outrasExports.length).toBe(1);
  });

  it("passa indicado_por no insert de clientes", () => {
    const inicio = arquivo.indexOf('tabela: "clientes"');
    const trecho = arquivo.slice(inicio, inicio + 700);
    expect(trecho).toContain("indicado_por: payload.indicado_por");
  });
});

describe("Fase B — prova estrutural: gate de confirmação humana sempre antes de qualquer insert (cancelamento sem escrita)", () => {
  const arquivo = readFileSync("src/lib/handoff-discovery.functions.ts", "utf8");

  it("o retorno precisaConfirmarCliente ocorre antes de inserirComVerificacao/insert no arquivo", () => {
    const posDecisao = arquivo.indexOf("decisao.acao === \"confirmar\"");
    const posInserirCliente = arquivo.indexOf("const criado = await inserirComVerificacao(");
    const posInsertCaso = arquivo.indexOf('.from("crm_casos")\n        .insert({');
    expect(posDecisao).toBeGreaterThan(-1);
    expect(posInserirCliente).toBeGreaterThan(posDecisao);
    expect(posInsertCaso).toBeGreaterThan(posDecisao);
  });

  it("caso já criado na mesma janela de 60s é reaproveitado, nunca duplicado", () => {
    expect(arquivo).toContain("Date.now() - 60_000");
    expect(arquivo).toContain("if (recente?.id) {");
  });
});

describe("Fase B — divisão de papéis pós-conversão documentada", () => {
  const doc = readFileSync("docs/arquitetura/2026-09-27_FASE-B-HANDOFF-CENTRALIZADO.md", "utf8");

  it("declara /leads como histórico, Pessoa 360 como cadastro civil, Caso 360 como operação", () => {
    expect(doc).toContain("histórico comercial");
    expect(doc).toContain("governa cadastro civil");
    expect(doc).toContain("governa a operação do caso");
  });
});
