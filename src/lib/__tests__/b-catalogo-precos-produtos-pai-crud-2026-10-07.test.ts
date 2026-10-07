import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  MINIMO_MOTIVO_ARQUIVAMENTO,
  PRICE_COMPONENT_VALUES,
  PRICE_STATUS_VALUES,
  agruparPrecosPorPais,
  validarEdicaoPreco,
  validarMotivoArquivamento,
  validarNovoPreco,
  type LinhaPrecoCatalogo,
} from "@/lib/catalogo-precos-produtos-pai";

/**
 * Corte B (07/10/2026) — "Catálogo de produtos-pai com tabela de preços como
 * fonte única da calculadora". A calculadora (orcamento-produtos-pai.functions.ts)
 * já lia só `price_catalog_rescued` desde 04/10; o gap real era zero
 * escritor para essa tabela (confirmado por grep antes deste corte — só
 * leitores em conciliacao-catalogo.server.ts, financeiro-referencia e
 * orcamento-produtos-pai.functions.ts). Esta suíte cobre a validação pura; o
 * arquivo .functions.ts é conferido por asserção de texto abaixo, mesmo
 * padrão já usado nesta sessão para createServerFn wrappers.
 */
const BASE_NOVO = {
  price_component: "honorarios",
  price_status: "PENDENTE_DE_HOMOLOGACAO",
  source_type: "decisao_proprietaria",
  source_reference: "teste",
};

describe("validarNovoPreco", () => {
  it("aceita entrada mínima válida", () => {
    expect(validarNovoPreco(BASE_NOVO)).toEqual({ ok: true });
  });

  it("recusa componente fora do CHECK real", () => {
    const r = validarNovoPreco({ ...BASE_NOVO, price_component: "frete" });
    expect(r.ok).toBe(false);
  });

  it("recusa estado fora do CHECK real", () => {
    const r = validarNovoPreco({ ...BASE_NOVO, price_status: "QUALQUER_COISA" });
    expect(r.ok).toBe(false);
  });

  it("exige tipo e referência de fonte — nunca grava preço sem rastro de origem", () => {
    expect(validarNovoPreco({ ...BASE_NOVO, source_type: "" }).ok).toBe(false);
    expect(validarNovoPreco({ ...BASE_NOVO, source_reference: "  " }).ok).toBe(false);
  });

  it("aceita amount vazio (ainda sem preço) mas recusa negativo ou não numérico", () => {
    expect(validarNovoPreco({ ...BASE_NOVO, amount: "" }).ok).toBe(true);
    expect(validarNovoPreco({ ...BASE_NOVO, amount: null }).ok).toBe(true);
    expect(validarNovoPreco({ ...BASE_NOVO, amount: -10 }).ok).toBe(false);
    expect(validarNovoPreco({ ...BASE_NOVO, amount: "abc" }).ok).toBe(false);
  });

  it("recusa país fora do formato de 2 letras", () => {
    expect(validarNovoPreco({ ...BASE_NOVO, country_code: "Italia" }).ok).toBe(false);
    expect(validarNovoPreco({ ...BASE_NOVO, country_code: "IT" }).ok).toBe(true);
  });

  it("recusa data fora do formato AAAA-MM-DD", () => {
    expect(validarNovoPreco({ ...BASE_NOVO, source_date: "04/10/2026" }).ok).toBe(false);
    expect(validarNovoPreco({ ...BASE_NOVO, source_date: "2026-10-04" }).ok).toBe(true);
  });
});

describe("validarEdicaoPreco", () => {
  it("permite editar só alguns campos, nunca exige todos", () => {
    expect(validarEdicaoPreco({ amount: 100 })).toEqual({ ok: true });
    expect(validarEdicaoPreco({})).toEqual({ ok: true });
  });

  it("recusa estado inválido também na edição", () => {
    expect(validarEdicaoPreco({ price_status: "INVENTADO" }).ok).toBe(false);
  });
});

describe("validarMotivoArquivamento — arquivar nunca é silencioso", () => {
  it(`exige pelo menos ${MINIMO_MOTIVO_ARQUIVAMENTO} caracteres`, () => {
    expect(validarMotivoArquivamento("").ok).toBe(false);
    expect(validarMotivoArquivamento("curto").ok).toBe(false);
    expect(validarMotivoArquivamento(null).ok).toBe(false);
    expect(validarMotivoArquivamento("Duplicado da linha X, decisão da Proprietária.").ok).toBe(true);
  });
});

describe("agruparPrecosPorPais", () => {
  const linha = (over: Partial<LinhaPrecoCatalogo>): LinhaPrecoCatalogo => ({
    id: "1",
    item_id: null,
    country_code: null,
    phase: null,
    price_component: "honorarios",
    amount: null,
    currency: "BRL",
    source_type: "x",
    source_reference: "x",
    source_date: null,
    price_status: "VIGENTE",
    effective_from: null,
    effective_to: null,
    case_only: false,
    notes: null,
    created_at: "2026-10-07T00:00:00Z",
    archived_at: null,
    archive_motivo: null,
    ...over,
  });

  it("agrupa por país e separa itens transversais (sem país) num grupo nomeado", () => {
    const grupos = agruparPrecosPorPais([
      linha({ id: "a", country_code: "IT" }),
      linha({ id: "b", country_code: "PT" }),
      linha({ id: "c", country_code: null }),
    ]);
    const paises = grupos.map((g) => g.pais);
    expect(paises).toContain("IT");
    expect(paises).toContain("PT");
    expect(paises.some((p) => p.includes("Transversal"))).toBe(true);
  });
});

describe("Corte B — .functions.ts faz o que a validação pura exige (asserção de texto)", () => {
  const codigo = readFileSync("src/lib/catalogo-precos-produtos-pai.functions.ts", "utf8");

  it("valida antes de criar, nunca grava direto do input", () => {
    expect(codigo).toContain("validarNovoPreco(data)");
  });

  it("nunca exclui fisicamente — só UPDATE de archived_at/archive_motivo", () => {
    expect(codigo).not.toMatch(/\.delete\s*\(/);
    expect(codigo).toContain("archived_at: new Date().toISOString()");
    expect(codigo).toContain("archive_motivo: data.motivo.trim()");
  });

  it("edição e arquivamento nunca tocam linha já arquivada (guard is archived_at null)", () => {
    const ocorrencias = codigo.match(/\.is\("archived_at", null\)/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(2);
  });

  it("toda escrita é org-scoped (eq organization_id) antes de alterar", () => {
    expect(codigo).toContain('.eq("organization_id", organizationId)');
  });

  it("cada escrita grava audit_logs com a ação nomeada", () => {
    expect(codigo).toContain("catalogo_preco_produto_pai_criado");
    expect(codigo).toContain("catalogo_preco_produto_pai_editado");
    expect(codigo).toContain("catalogo_preco_produto_pai_arquivado");
  });

  it("relê após gravar — nunca devolve sucesso sem confirmar a linha no banco", () => {
    const relidas = codigo.match(/const relida = await supabase/g) ?? [];
    expect(relidas.length).toBe(3);
  });
});

describe("Corte B — calculadora continua lendo só price_catalog_rescued VIGENTE, nenhum fallback novo", () => {
  const calculadora = readFileSync("src/lib/orcamento-produtos-pai.functions.ts", "utf8");

  it("não lê product_catalog nem nenhuma tabela de Top 30/Planilha Mestre para preço", () => {
    expect(calculadora).not.toContain('from("product_catalog")');
    expect(calculadora).not.toContain('from("catalogo_importado")');
  });

  it("filtra sempre price_status = VIGENTE", () => {
    expect(calculadora).toContain('.eq("price_status", "VIGENTE")');
  });
});

describe("Corte B — Top 30 (Planilha Mestre) permanece rotulado como legado na tela", () => {
  const pagina = readFileSync("src/routes/_authenticated/catalogo.tsx", "utf8");

  it("a descrição da página já declara a Planilha Mestre como rastreabilidade, não decisão", () => {
    expect(pagina).toContain("Origem (Planilha Mestre) é rastreabilidade, não decisão");
  });

  it("a nova seção de preços dos produtos-pai está montada na página", () => {
    expect(pagina).toContain("PrecosProdutosPaiCrud");
  });
});

describe("Corte B — legacy_sku_mappings permanece somente leitura no Desk (decisão já registrada)", () => {
  it("nenhum escritor novo é criado para legacy_sku_mappings", () => {
    const codigo = readFileSync("src/lib/catalogo-precos-produtos-pai.functions.ts", "utf8");
    expect(codigo).not.toContain('from("legacy_sku_mappings")');
  });
});

describe("Domínio espelha o CHECK real do banco (migration 20261004160000 / 20260904180000)", () => {
  it("price_status e price_component batem com o CHECK aplicado", () => {
    expect(PRICE_STATUS_VALUES).toEqual([
      "VIGENTE",
      "REFERENCIA_RESGATADA",
      "CONDICAO_PARTICULAR_DE_CASO",
      "HOMOLOGADO_CATALOGO",
      "PENDENTE_DE_HOMOLOGACAO",
      "DIVERGENTE",
      "ARQUIVADO",
    ]);
    expect(PRICE_COMPONENT_VALUES).toEqual(["honorarios", "despesas", "taxas", "outros", "parcelas_padrao"]);
  });
});
