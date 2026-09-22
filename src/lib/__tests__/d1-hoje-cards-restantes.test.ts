import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  kpisPrazo,
  origemDoSinal,
  type AcaoOperacional,
  type EventoCaso,
} from "@/lib/golive-operacao";

/**
 * §11 do De-Para (linhas 5, 6, 7 e 9) — os quatro cards que faltavam no Hoje.
 *
 * Nenhum é conta nova: todos vêm de função pura já usada por outra tela. O
 * Hoje passa a chamar as mesmas, para que os números não divirjam entre as
 * duas superfícies.
 */

const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

describe("os quatro cards restantes existem e citam a função pura", () => {
  it("Cadência dos casos vem de kpisPrazo, sobre as MESMAS tarefas", () => {
    expect(painel).toContain('titulo="Cadência dos casos"');
    expect(painel).toContain("kpisPrazo(caso.tarefas)");
  });

  it("Casos sem próxima ação distingue Parados de Encerrados", () => {
    expect(painel).toContain('titulo="Casos sem próxima ação"');
    expect(painel).toContain("!c.temProximaAcao");
    // §11 linha 6: "Não tratar encerrado como falha."
    expect(painel).toContain("estado normal, não falha");
  });

  it("Microentregas para revisão reusa o número que já existia", () => {
    expect(painel).toContain('titulo="Microentregas para revisão"');
    expect(painel).toContain("{microentregasAguardandoRevisao}");
    // Abre a fila de onde o número sai.
    expect(painel).toContain('to="/golive/microentregas"');
  });

  it("Alertas por origem chama origemDoSinal", () => {
    expect(painel).toContain('titulo="Alertas por origem"');
    expect(painel).toContain("origemDoSinal(caso.eventos ?? [])");
  });
});

describe("nenhuma janela temporal é inventada onde a fonte não tem", () => {
  it("Encerrados no mês (que a prancha nomeia) não existe: cai para total encerrado", () => {
    // A fonte não traz data de encerramento; o card diz "Encerrados" sem
    // recorte, em vez de fabricar "no mês N" como a prancha demonstra. Casa
    // no rótulo mostrado, não em comentário do código.
    expect(painel).not.toContain('>{"Encerrado no mês"');
    expect(painel).not.toMatch(/>\s*Encerrado no mês\s*</);
    expect(painel).toContain("(c.status ?? \"\").toLowerCase() === \"encerrado\"");
  });
});

describe("as funções por trás continuam honrando suas regras", () => {
  it("kpisPrazo devolve quatro chaves fechadas", () => {
    const r = kpisPrazo([] as readonly AcaoOperacional[]);
    expect(Object.keys(r).sort()).toEqual(["externo", "hoje", "proximos7", "vencida"]);
  });

  it("origemDoSinal sem eventos devolve lista vazia, não faz-de-conta", () => {
    expect(origemDoSinal([] as readonly EventoCaso[])).toEqual([]);
  });
});
