import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { inventarioDocumentalDaPessoa } from "@/lib/pessoa-identidade";

const pessoaFn = readFileSync("src/lib/pessoa.functions.ts", "utf8");
const pessoaPg = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

/**
 * CA-INVENTARIO-DOCUMENTAL-PESSOA360 (24/09/2026) — pedido explícito da Proprietária:
 * "Pessoa 360... uso de varredura de dossiê — aqui está o dossiê mãe de
 * cada pessoa". Investigação anterior desta sessão confirmou que o Motor 3
 * do reset ("Varredura de dossiê") exigiria, no sentido literal do
 * documento, integração real com Drive/Dropbox (inexistente no projeto) —
 * decisão de produto que não me cabe tomar sozinho. Escopo reduzido para o
 * que a Proprietária pediu depois: Pessoa 360 é o destino ("dossiê mãe");
 * o inventário agrega o que já está catalogado internamente
 * (case_source_documents), nunca fonte externa.
 *
 * Renomeado em 24/09/2026 (decisão da Proprietária): só o núcleo tem
 * "Dossiê-mãe"; a leitura por pessoa é "Inventário documental da pessoa".
 */
describe("inventarioDocumentalDaPessoa (função pura)", () => {
  it("ordena cronologicamente pela data do documento, sem data por último", () => {
    const r = inventarioDocumentalDaPessoa([
      { id: "1", titulo_interno: "Certidão recente", tipo_documento: "certidao_nascimento", data_documento: "2020-01-01" },
      { id: "2", titulo_interno: "Certidão antiga", tipo_documento: "certidao_casamento", data_documento: "1950-05-10" },
      { id: "3", titulo_interno: "Sem data", tipo_documento: "passaporte" },
    ]);
    expect(r.itens.map((i) => i.id)).toEqual(["2", "1", "3"]);
  });

  it("lista lacunas só dos tipos-chave, nunca inventando um tipo novo", () => {
    const r = inventarioDocumentalDaPessoa([
      { id: "1", tipo_documento: "certidao_nascimento", data_documento: "2020-01-01" },
    ]);
    expect(r.lacunas).toContain("certidao_casamento");
    expect(r.lacunas).toContain("certidao_obito");
    expect(r.lacunas).toContain("naturalizacao");
    expect(r.lacunas).toContain("passaporte");
    expect(r.lacunas).not.toContain("certidao_nascimento");
  });

  it("sem nenhum material, todos os tipos-chave são lacuna — dito, não omitido", () => {
    const r = inventarioDocumentalDaPessoa([]);
    expect(r.itens).toEqual([]);
    expect(r.lacunas.length).toBe(5);
  });
});

describe("Pessoa 360 agrega materiais já catalogados (não busca fonte externa)", () => {
  it("carregarPessoa consulta case_source_documents pelo vínculo real (case_members + research_people)", () => {
    expect(pessoaFn).toContain('.from("case_source_documents")');
    expect(pessoaFn).toContain('.in("pessoa_ref_id", idsPessoaRef)');
    expect(pessoaFn).toContain("materiaisDossie");
  });

  it("a consulta é organization-scoped e ignora materiais arquivados", () => {
    const inicio = pessoaFn.indexOf('.from("case_source_documents")');
    const trecho = pessoaFn.slice(inicio, inicio + 400);
    expect(trecho).toContain('.eq("organization_id", organizationId)');
    expect(trecho).toContain('.is("archived_at", null)');
  });

  it("Pessoa 360 renderiza 'Inventário documental da pessoa' com busca por palavra-chave e lacunas ditas", () => {
    expect(pessoaPg).toContain('titulo="Inventário documental da pessoa"');
    expect(pessoaPg).toContain("inventarioDocumentalDaPessoa(materiaisDossie)");
    expect(pessoaPg).toContain('type="search"');
    expect(pessoaPg).toContain("Ainda sem nenhum material catalogado");
  });

  it("nunca fonte externa — nenhuma menção a Drive/Dropbox na seção nova", () => {
    const inicio = pessoaPg.indexOf('titulo="Inventário documental da pessoa"');
    const trecho = pessoaPg.slice(inicio, inicio + 2500);
    expect(trecho.toLowerCase()).not.toContain("drive");
    expect(trecho.toLowerCase()).not.toContain("dropbox");
    expect(trecho).toContain("nunca busca fonte externa");
  });

  it("estado vazio honesto usa EstadoVazio, não <p> solto", () => {
    const inicio = pessoaPg.indexOf('titulo="Inventário documental da pessoa"');
    const idx = pessoaPg.indexOf("Nenhum material catalogado para esta pessoa ainda.");
    expect(idx).toBeGreaterThan(inicio);
    expect(pessoaPg.slice(inicio, idx)).toContain("EstadoVazio");
  });
});
