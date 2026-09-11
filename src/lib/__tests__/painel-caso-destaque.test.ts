import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { BRAND_LOGO_URL } from "@/lib/brand-asset";

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

describe("marca: logo servido pelo próprio domínio", () => {
  const ler = (p: string) => readFileSync(p, "utf8");

  it("BRAND_LOGO_URL não aponta para rota exclusiva do Lovable", () => {
    expect(BRAND_LOGO_URL).toBe("/clube-ancestral-logo.svg");
    expect(BRAND_LOGO_URL ?? "").not.toContain("__l5e");
  });

  it("o arquivo existe em public/ e é o asset oficial", () => {
    expect(existsSync("public/clube-ancestral-logo.svg")).toBe(true);
    expect(statSync("public/clube-ancestral-logo.svg").size).toBe(127559);
  });

  it("o logo tem fallback textual se a imagem falhar", () => {
    const brand = ler("src/components/brand.tsx");
    expect(brand).toContain("onError");
    expect(brand).toContain("data-brand-logo-fallback");
  });

  it("a vitrine pública declara noindex e usa a variante legível no fundo creme", () => {
    const home = ler("src/routes/index.tsx");
    expect(home).toContain('{ name: "robots", content: "noindex" }');
    expect(home).toContain('variant="client-light"');
  });
});

describe("Sinais de atenção nas abas donas", () => {
  const painel = readFileSync("src/components/painel/painel-dia.tsx", "utf8");

  it("deixou de ser bloco próprio", () => {
    expect(painel).not.toContain('data-painel-bloco="sinais"');
  });

  it("no Hoje só restam atalhos para a aba dona, dentro da descoberta", () => {
    expect(painel).not.toContain("<SinaisPorGrupo");
    const descoberta = painel.indexOf('data-painel-bloco="descoberta"');
    expect(painel.indexOf("GRUPOS_INDICADOR.map")).toBeGreaterThan(descoberta);
  });

  it("nada se perdeu: contagem, gravidade e link continuam no componente da aba", () => {
    const comp = readFileSync("src/components/painel/sinais-por-grupo.tsx", "utf8");
    expect(comp).toContain("{linhas.length}");
    expect(comp).toContain("maiorGravidade");
    expect(comp).toContain("{g.acao}");
    expect(comp).toContain("ChamadaDaAba");
  });

  it("Itens derivados foram para a Cadência, que é o mesmo assunto", () => {
    const prazos = painel.indexOf('data-painel-bloco="prazos"');
    const derivados = painel.indexOf("<ItensDerivados");
    const descoberta = painel.indexOf('data-painel-bloco="descoberta"');
    expect(derivados).toBeGreaterThan(prazos);
    expect(derivados).toBeLessThan(descoberta);
  });

  it("o painel volta aos cinco blocos da norma, mais os auxiliares de leitura e Alertas prioritários (CA-CORTE-ALERTAS-ROTA-CANONICA, 09/09/2026)", () => {
    const blocos = [...painel.matchAll(/data-painel-bloco="([a-z_]+)"/g)].map((m) => m[1]);
    expect(new Set(blocos)).toEqual(
      new Set([
        "cards",
        "jornada",
        "fila_priorizada",
        "excecoes",
        "alertas",
        "comercial",
        "prazos",
        "descoberta",
      ]),
    );
  });
});
