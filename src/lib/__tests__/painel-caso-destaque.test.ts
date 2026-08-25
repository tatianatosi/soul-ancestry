import { describe, expect, it } from "vitest";

import { escolherCasoDestaque } from "@/lib/painel-caso-destaque";
import type { ItemDia } from "@/lib/painel-dia";

const item = (id: string, extra: Partial<ItemDia> = {}): ItemDia => ({
  id,
  tipo: "caso",
  rotulo: `Caso ${id}`,
  acao: "Próxima ação registrada",
  data: "2020-01-01", // vencido há muito: garante faixa de urgência
  responsavel: "Tati",
  area: "operacoes",
  etapa: "execucao",
  bloqueios: [],
  demo: false,
  semResponsavel: false,
  semPrazo: false,
  ...extra,
});

describe("caso em destaque do Painel Hoje", () => {
  it("devolve nulo quando não há candidato, sem inventar destaque", () => {
    expect(escolherCasoDestaque([])).toBeNull();
  });

  it("escolhe o de prazo mais antigo dentro da mesma faixa de urgência", () => {
    const escolha = escolherCasoDestaque([
      item("b", { data: "2020-06-01" }),
      item("a", { data: "2020-01-01" }),
    ]);
    expect(escolha?.item.id).toBe("a");
  });

  it("registro sem prazo não ganha de registro com prazo vencido", () => {
    const escolha = escolherCasoDestaque([
      item("sem", { data: null, semPrazo: true }),
      item("com", { data: "2020-01-01" }),
    ]);
    expect(escolha?.item.id).toBe("com");
  });

  it("exclui demonstrações por padrão e as aceita com o filtro explícito", () => {
    const apenasDemo = [item("d", { demo: true })];
    expect(escolherCasoDestaque(apenasDemo)).toBeNull();
    expect(escolherCasoDestaque(apenasDemo, { incluirDemo: true })?.item.id).toBe("d");
  });

  it("informa quantos outros disputam a mesma faixa", () => {
    // Três itens idênticos caem na mesma faixa: um vira destaque, dois sobram.
    const escolha = escolherCasoDestaque([item("a"), item("b"), item("c")]);
    expect(escolha?.outrosNaMesmaFaixa).toBe(2);
  });

  it("é estável: mesmos dados, mesma escolha", () => {
    const itens = [item("c"), item("a"), item("b")];
    const primeira = escolherCasoDestaque(itens)?.item.id;
    const segunda = escolherCasoDestaque([...itens].reverse())?.item.id;
    expect(primeira).toBe(segunda);
  });

  it("carrega a regra e a explicação da matriz, sem cálculo próprio", () => {
    const escolha = escolherCasoDestaque([item("a")]);
    expect(escolha?.prioridade.regra.length ?? 0).toBeGreaterThan(0);
    expect(escolha?.prioridade.versao).toContain("matriz-elegibilidade-urgencia");
  });
});
