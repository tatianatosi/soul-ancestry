import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { avaliarPlanejador, type EntradaPlanejador } from "../cadeia-operacional";
import { PRODUTOS_PAI_CANONICOS, produtoPaiPorId } from "../planejador-produtos-pai";

/**
 * Corte 3 da ordem "Execução Técnica Total" — regra de autoridade 2
 * (21/09/2026): "Planejador + Produtos-Pai PP-01–PP-09 governam jornada,
 * produto, marcos e ligação multipaís. Eles não são catálogo decorativo."
 *
 * Antes deste corte os 9 produtos-pai existiam só em TypeScript e se ligavam
 * ao caso por match de string do nome contra o catálogo legado, calculado em
 * runtime e descartado. Agora há coluna canônica em `case_plans`.
 */

const MIGRATION = "supabase/migrations/20260921150000_case_plans_produto_pai.sql";

const entradaMinima = (): EntradaPlanejador => ({
  caseId: "caso-1",
  objetivo: null,
  etapa: null,
  composicao: null,
  rotaConfirmada: null,
  produtoSkuCodigo: null,
  dadosDisponiveis: [],
  dependenciasCliente: [],
  dependenciasTerceiros: [],
  fontes: [],
  responsavelUserId: null,
  proximaAcao: null,
  prazoProximaAcao: null,
  faseJornada: null,
  produtoPaiId: null,
  checklist: [],
  perguntas: [],
  marcos: [],
  entregas: [],
  microentregas: [],
  regrasAnexos: [],
});

describe("catálogo canônico e CHECK da migration não divergem", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("os 9 códigos do TypeScript estão no CHECK", () => {
    expect(PRODUTOS_PAI_CANONICOS).toHaveLength(9);
    for (const p of PRODUTOS_PAI_CANONICOS) expect(sql).toContain(`'${p.id}'`);
  });

  it("o CHECK não admite código que o catálogo não tem", () => {
    const noCheck = [...sql.matchAll(/'(PP-\d{2})'/g)].map((m) => m[1]);
    const canonicos = PRODUTOS_PAI_CANONICOS.map((p) => p.id);
    for (const codigo of new Set(noCheck)) expect(canonicos).toContain(codigo);
  });

  it("a coluna é aditiva e nullable — caso antigo continua válido", () => {
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS produto_pai_id text");
    expect(sql).toContain("produto_pai_id IS NULL");
    // A coluna em si não pode ser NOT NULL (o "IS NOT NULL" do índice
    // parcial é outra coisa — daí a asserção ser sobre a declaração).
    expect(sql).not.toContain("produto_pai_id text NOT NULL");
    expect(sql).not.toContain("SET NOT NULL");
    expect(sql).not.toContain("DROP COLUMN");
    expect(sql).not.toContain("UPDATE public.case_plans");
  });

  it("é idempotente — reaplicar não quebra", () => {
    expect(sql).toContain("EXCEPTION WHEN duplicate_object THEN NULL");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS");
  });
});

describe("produto-pai atravessa o motor até o payload", () => {
  it("sem escolha, permanece nulo — nunca inventa produto", () => {
    expect(avaliarPlanejador(entradaMinima()).produto_pai_id).toBeNull();
  });

  it("cada um dos 9 atravessa intacto", () => {
    for (const p of PRODUTOS_PAI_CANONICOS) {
      const saida = avaliarPlanejador({ ...entradaMinima(), produtoPaiId: p.id });
      expect(saida.produto_pai_id).toBe(p.id);
    }
  });

  it("o writer grava a coluna a partir da saída do motor", () => {
    const server = readFileSync("src/lib/cadeia-operacional.server.ts", "utf8");
    expect(server).toContain("produto_pai_id: saida.produto_pai_id");
    // e relê a coluna ao montar a entrada, senão o valor some no reload
    expect(server).toContain("produtoPaiId: plano.produto_pai_id ?? null");
  });
});

describe("resolução de código para produto-pai", () => {
  it("devolve o produto-pai canônico do código", () => {
    const p = produtoPaiPorId("PP-03");
    expect(p?.nome).toBe("Pesquisa Genealógica por Ramo Familiar");
    expect(p?.faseDaVida).toBe("Prova e pesquisa");
  });

  it("código fora do catálogo devolve null, não um objeto inventado", () => {
    expect(produtoPaiPorId("PP-99")).toBeNull();
    expect(produtoPaiPorId("")).toBeNull();
    expect(produtoPaiPorId(null)).toBeNull();
  });
});

describe("Caso 360 mostra o produto-pai persistido, não o derivado do catálogo", () => {
  const bloco = readFileSync("src/components/caso/estado-integrado.tsx", "utf8");

  it("resolve pelo código canônico do plano", () => {
    expect(bloco).toContain("produtoPaiPorId(planejador?.produtoPaiId");
  });

  it("o catálogo legado vira referência secundária, nunca a fonte", () => {
    expect(bloco).toContain("catálogo sugere");
  });

  it("relê os marcos em vez de só contá-los", () => {
    // A regra 2 nomeia marcos: `case_plans.marcos[]` era escrito e nenhuma
    // tela relia. Agora o conteúdo aparece.
    expect(bloco).toContain("marcos.join");
    expect(bloco).not.toContain("marco(s) declarado(s)");
  });

  it("a rota passa o produto-pai vindo da cadeia", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(rota).toContain("produtoPaiId: qCadeia.data.planejador.produto_pai_id");
  });
});

describe("a tela do planejador deixa escolher o produto-pai", () => {
  const form = readFileSync("src/components/contrato/planejador-operacional.tsx", "utf8");

  it("oferece os 9 a partir do catálogo canônico, sem lista paralela", () => {
    expect(form).toContain("PRODUTOS_PAI_CANONICOS.map");
    expect(form).toContain('from "@/lib/planejador-produtos-pai"');
  });

  it("envia o escolhido, e nulo quando não escolhido", () => {
    // Corte U2 (28/09/2026): com plano salvo, o produto-pai vem da Jornada (só leitura).
    expect(form).toContain("produtoPaiId: jornada ? jornada.produtoPaiId : estado.produtoPaiId || null");
  });
});
