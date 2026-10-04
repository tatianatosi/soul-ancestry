import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  NOME_INSTRUMENTO,
  casoGovernadoPeloPlanejador,
  condicaoParticularDoCaso,
  pendenciasHumanasDoContrato,
  type ParteContrato,
} from "@/lib/resgate-contrato-planejador";
import { governancaPlanejadorCanva } from "@/lib/conciliacao-catalogo.server";

/**
 * Resgate Ana (autorização explícita da Proprietária, 27/09/2026): o contrato
 * da Ana é o Contrato de Estudo Genealógico v2, governado por Planejador +
 * Produto-Pai + proposta Canva aprovada — nunca por SKU/catálogo — e a tela só
 * lista fatos humanos reais, uma vez cada.
 */

const partesAna: ParteContrato[] = [
  { id: "p0", person_name: "Clube Ancestral", role: "provider", phone: null, document_number: "00.000.000/0001-00", signature_required: true, client_id: null },
  { id: "p1", person_name: "Ana Luiza", role: "contracting_client", phone: "(62) 98158-4015", document_number: "037.795.711-96", signature_required: true, client_id: "c-ana" },
  { id: "p2", person_name: "Adair", role: "co_contractor", phone: "(62) 99999-0000", document_number: "774.227.321-72", signature_required: true, client_id: "c-adair" },
  { id: "p3", person_name: "Alice", role: "co_contractor", phone: "(62) 98888-0000", document_number: null, signature_required: true, client_id: "c-alice" },
  { id: "p4", person_name: "Felipe", role: "dependent", phone: null, document_number: null, signature_required: false, client_id: "c-ana" },
];
const telefones = { "c-ana": "(62) 8158-4015", "c-adair": "(62) 99999-0000", "c-alice": "(62) 98888-0000" };

describe("Resgate Ana — pendências humanas reais, uma vez cada", () => {
  it("com os dados reais da Ana, devolve exatamente as 4 pendências (telefone, Alice, Felipe, revisão)", () => {
    const p = pendenciasHumanasDoContrato({
      partes: partesAna,
      telefonesCanonicos: telefones,
      aceitos: new Set(),
      dependentes: [{ id: "d1", nome_completo: "Felipe", status_representacao: "pendente" }],
      revisaoAprovada: false,
    });
    expect(p.map((x) => x.chave)).toEqual(["telefone:p1", "documento:p3", "dependente:d1", "revisao_previa"]);
    expect(p[0].detalhe).toContain("(62) 98158-4015");
    expect(p[0].detalhe).toContain("(62) 8158-4015");
    expect(p[3].titulo).toContain(NOME_INSTRUMENTO);
  });

  it("prestadora e dependente nunca geram pendência de documento; divergência decidida com motivo não volta", () => {
    const p = pendenciasHumanasDoContrato({
      partes: partesAna,
      telefonesCanonicos: telefones,
      aceitos: new Set(["telefone:p1"]),
      dependentes: [{ id: "d1", nome_completo: "Felipe", status_representacao: "nao_aplicavel" }],
      revisaoAprovada: true,
    });
    expect(p.map((x) => x.chave)).toEqual(["documento:p3"]);
  });
});

describe("Resgate Ana — governança pelo Planejador, nunca pelo catálogo", () => {
  it("governado só com Produto-Pai E proposta de origem Canva", () => {
    expect(casoGovernadoPeloPlanejador({ produtoPaiId: "PP-01", origemProposta: "canva" })).toBe(true);
    expect(casoGovernadoPeloPlanejador({ produtoPaiId: null, origemProposta: "canva" })).toBe(false);
    expect(casoGovernadoPeloPlanejador({ produtoPaiId: "PP-01", origemProposta: "manual" })).toBe(false);
  });

  it("condição particular vem do caso (Planejador), não do catálogo", () => {
    const c = condicaoParticularDoCaso(
      { condicao_comercial_aprovada: "3 responsáveis × R$ 320 × 10 meses", preco_acordado: 9600, composicao_familiar: "Ana, Adair, Alice, Felipe" },
      { valor: 9600, forma_pagamento: "mensal" },
    );
    expect(c.valor).toBe(9600);
    expect(c.condicao).toContain("R$ 320");
    expect(c.fonte).toContain("Planejador");
  });

  function supabaseFalso(tabelas: Record<string, any>) {
    return {
      from(t: string) {
        const q: any = {
          select: () => q,
          eq: () => q,
          is: () => q,
          order: () => q,
          limit: () => q,
          maybeSingle: async () => ({ data: tabelas[t] ?? null }),
          then: (r: any) => r({ data: tabelas[t] ?? [] }),
        };
        return q;
      },
    };
  }
  const paginas = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ page_number: n, extracao_status: "extraida", page_content_structured: {} }));
  const propostaAna = {
    id: "prop",
    case_id: "caso",
    organization_id: "org",
    versao: 1,
    status: "aprovada",
    origem: "canva",
    origem_referencia: "deck",
    archived_at: null,
  };

  it("caso governado com proposta Canva completa: nenhum bloqueio de SKU/catálogo, OS liberada", async () => {
    const r = await governancaPlanejadorCanva(
      supabaseFalso({ case_plans: { produto_pai_id: "PP-01" }, proposals: propostaAna, proposal_canva_pages: paginas }),
      { org: "org", caseId: "caso", proposalId: "prop" },
    );
    expect(r?.governanca).toBe("planejador_canva");
    expect(r?.bloqueios).toEqual([]);
    expect(r?.pode_gerar_os).toBe(true);
    expect(r?.fonte).toBeNull();
  });

  it("proposta Canva incompleta continua bloqueando — mas pelo motivo real da proposta, nunca por SKU", async () => {
    const r = await governancaPlanejadorCanva(
      supabaseFalso({ case_plans: { produto_pai_id: "PP-01" }, proposals: propostaAna, proposal_canva_pages: paginas.slice(0, 5) }),
      { org: "org", caseId: "caso", proposalId: "prop" },
    );
    expect(r?.bloqueios.length).toBeGreaterThan(0);
    expect(r?.bloqueios.every((b) => b.startsWith("Proposta Canva:"))).toBe(true);
    expect(r?.bloqueios.join(" ")).not.toMatch(/SKU|catálogo/i);
  });

  it("sem Produto-Pai no Planejador, a conciliação de catálogo segue valendo (devolve null)", async () => {
    const r = await governancaPlanejadorCanva(
      supabaseFalso({ case_plans: { produto_pai_id: null }, proposals: propostaAna, proposal_canva_pages: paginas }),
      { org: "org", caseId: "caso", proposalId: "prop" },
    );
    expect(r).toBeNull();
  });

  it("conciliacaoDoContrato consulta a governança antes do catálogo; aprovarParaEnvio não rotula como catálogo", () => {
    const srv = readFileSync("src/lib/conciliacao-catalogo.server.ts", "utf8");
    const inicio = srv.indexOf("export async function conciliacaoDoContrato");
    const trecho = srv.slice(inicio, srv.indexOf("export async function governancaPlanejadorCanva"));
    expect(trecho.indexOf("governancaPlanejadorCanva(")).toBeLessThan(trecho.indexOf("conciliarPropostaComCatalogo("));
    const fn = readFileSync("src/lib/contratos.functions.ts", "utf8");
    expect(fn).toContain('impedimentos.push(governado ? b : `Conciliação de catálogo: ${b}`)');
  });
});

describe("Resgate Ana — instrumento recuperado: Contrato de Estudo Genealógico v2", () => {
  it("as prévias (ficha e instrumento) apresentam o v2, não 'Contrato-base versionado'", () => {
    expect(readFileSync("src/lib/contrato-corpo.server.ts", "utf8")).toContain("<h2>Contrato de Estudo Genealógico v2</h2>");
    expect(readFileSync("src/lib/contrato-parametros.server.ts", "utf8")).toContain("<h1>Contrato de Estudo Genealógico v2</h1>");
    expect(readFileSync("src/components/contratos/rotulos.tsx", "utf8")).toContain('contract_base: "Contrato de Estudo Genealógico v2"');
  });

  it("migration só renomeia o contrato da Ana se ainda for 'Contrato-base familiar' e não estiver assinado", () => {
    const sql = readFileSync("supabase/migrations/20260927130000_contrato_ana_titulo_estudo_genealogico_v2.sql", "utf8");
    expect(sql).toContain("a11a0000-0000-4000-8000-0000000000c1");
    expect(sql).toContain("title LIKE 'Contrato-base familiar%'");
    expect(sql).toContain("signed_at IS NULL");
  });
});

describe("Resgate Ana — persistência real e decisão do dependente", () => {
  const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

  it("Salvar rascunho existe no modo Preparar e só diz 'salvo' com o rascunho relido do servidor", () => {
    const card7 = rota.slice(rota.indexOf('titulo="6. Salvar rascunho"'));
    expect(card7).toContain('mGerar.mutate("rascunho")');
    expect(card7).toContain("rascunhoAtual");
    expect(card7).toContain("relido do servidor");
  });

  it("linha da ficha remonta com o valor persistido depois de salvar e reler", () => {
    expect(rota).toContain('key={`${v.id}:${v.valor ?? ""}:${v.status ?? ""}`}');
  });

  it("decisão sobre o dependente atualiza a tela de contrato e usa o vocabulário real do CHECK", () => {
    const painel = readFileSync("src/components/contrato/painel-dependentes.tsx", "utf8");
    expect(painel).toContain('queryKey: ["contrato-preparar", caseId]');
    expect(painel).toContain('nao_aplicavel: "Fora deste contrato (não aplicável)"');
    expect(painel).toContain('documentada: "Dependente representado');
  });
});
