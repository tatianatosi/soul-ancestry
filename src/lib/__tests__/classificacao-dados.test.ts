import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  CLASSIFICACOES,
  INVENTARIO_FONTES,
  bloqueadoParaCliente,
  classificarLinha,
  filtrarParaCliente,
  fontesNaoClassificadas,
  fontesProibidasNoCliente,
  normalizarClassificacao,
  rotuloClassificacaoInterno,
  totaisPorClassificacao,
  visivelParaCliente,
} from "@/lib/classificacao-dados";

describe("P0.2 — classificação de origem", () => {
  it("1. toda fonte auditada tem classificação válida e prova registrada", () => {
    for (const f of INVENTARIO_FONTES) {
      expect(CLASSIFICACOES).toContain(f.classificacao);
      expect(f.prova.trim().length).toBeGreaterThan(0);
      expect(f.superficies.length).toBeGreaterThan(0);
    }
    expect(fontesNaoClassificadas()).toHaveLength(0);
  });

  it("2. cliente não enxerga nenhum registro não-real", () => {
    const linhas = [
      { id: "1", classificacao_dado: "real" },
      { id: "2", classificacao_dado: "demo" },
      { id: "3", classificacao_dado: "mock" },
      { id: "4", classificacao_dado: "seed" },
      { id: "5", classificacao_dado: "modelo" },
      { id: "6", classificacao_dado: "importado_a_confirmar" },
      { id: "7" },
      { id: "8", is_demo: true, classificacao_dado: undefined },
      { id: "9", titulo: "Caso de teste" },
    ];
    expect(filtrarParaCliente(linhas).map((l) => l.id)).toEqual(["1"]);
    for (const c of CLASSIFICACOES) {
      expect(visivelParaCliente(c)).toBe(c === "real");
    }
  });

  it("3. nenhuma fonte não-real está declarada na superfície do App Cliente", () => {
    expect(fontesProibidasNoCliente()).toHaveLength(0);
  });

  it("3b. as funções do App Cliente aplicam o filtro de classificação", () => {
    const src = readFileSync("src/lib/portal-cliente.functions.ts", "utf8");
    expect(src).toContain("filtrarParaCliente");
    expect(src).toContain("bloqueadoParaCliente");
    // Nenhuma coluna de origem/classificação é devolvida ao cliente.
    expect(src).not.toMatch(/classificacao_dado:\s*\w/);
    expect(src).not.toMatch(/data_origin:\s*\w/);
    expect(src).not.toMatch(/is_demo:\s*\w/);
  });

  it("4. equipe autorizada vê o rótulo interno; cliente não recebe rótulo algum", () => {
    const linha = { id: "x", classificacao_dado: "modelo" };
    expect(rotuloClassificacaoInterno(linha, true)).toBe("CASO-MODELO");
    expect(rotuloClassificacaoInterno(linha, false)).toBeNull();
    // o registro não é alterado pela leitura
    expect(linha).toEqual({ id: "x", classificacao_dado: "modelo" });
  });

  it("5. registro sem origem comprovada fica bloqueado como nao_classificado", () => {
    expect(classificarLinha({ id: "s" } as never)).toBe("nao_classificado");
    expect(classificarLinha(null)).toBe("nao_classificado");
    expect(normalizarClassificacao("inventado")).toBe("nao_classificado");
    expect(normalizarClassificacao(undefined)).toBe("nao_classificado");
    expect(bloqueadoParaCliente({ id: "s" } as never)).toBe(true);
    // nunca promove a real por omissão
    expect(classificarLinha({ id: "s", origem_confirmada: false } as never)).toBe(
      "nao_classificado",
    );
    expect(classificarLinha({ id: "s", origem_confirmada: true } as never)).toBe("real");
  });

  it("6. a projeção sanitizada continua usando apenas a entrada autorizada", () => {
    const src = readFileSync("src/lib/portal-cliente.functions.ts", "utf8");
    expect(src).toContain("publicacoesParaCliente");
    expect(src).toContain("portal_projecoes");
    const proj = readFileSync("src/lib/projecoes-cliente.ts", "utf8");
    expect(proj).toContain("sanitizarRotuloCliente");
  });

  it("totaliza o inventário sem expor dado pessoal", () => {
    const t = totaisPorClassificacao();
    const soma = Object.values(t).reduce((a, b) => a + b, 0);
    expect(soma).toBe(INVENTARIO_FONTES.length);
    expect(t.real).toBe(0);
  });
});
