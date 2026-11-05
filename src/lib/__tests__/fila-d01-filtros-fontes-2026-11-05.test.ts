import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  aplicarFiltrosFontes,
  FILTROS_VAZIOS,
  intervaloDeAnos,
  opcoesDosFiltros,
  SEM_REGISTRO,
} from "@/lib/filtros-fontes";

/** Fila, bloco D (05/11/2026): D01 — filtros do catálogo de fontes. */
const fontes = [
  { id: "1", pais_eixo: "Alemanha", tipo_de_acervo: "registro_civil", acesso: "publico", permite_automacao: "nao", cobertura_temporal: "1876–1950" },
  { id: "2", pais_eixo: "Itália", tipo_de_acervo: "arquivo_publico", acesso: "login", permite_automacao: "a-confirmar", cobertura_temporal: null },
  { id: "3", pais_eixo: "Alemanha", tipo_de_acervo: "indice_digitalizado", acesso: "restrito", permite_automacao: null, cobertura_temporal: "séc. XIX" },
];

describe("D01 — filtros por país, período, tipo de acervo, acesso e automação", () => {
  it("país e acesso filtram pelos valores gravados", () => {
    expect(aplicarFiltrosFontes(fontes, { ...FILTROS_VAZIOS, pais: "Alemanha" }).map((f) => f.id)).toEqual(["1", "3"]);
    expect(aplicarFiltrosFontes(fontes, { ...FILTROS_VAZIOS, pais: "Alemanha", acesso: "restrito" }).map((f) => f.id)).toEqual(["3"]);
  });

  it("período só vem de anos escritos; texto sem ano não entra em filtro de período", () => {
    expect(intervaloDeAnos("1876–1950")).toEqual({ inicio: 1876, fim: 1950 });
    expect(intervaloDeAnos("séc. XIX")).toBeNull();
    expect(aplicarFiltrosFontes(fontes, { ...FILTROS_VAZIOS, seculo: "19" }).map((f) => f.id)).toEqual(["1"]);
    expect(aplicarFiltrosFontes(fontes, { ...FILTROS_VAZIOS, seculo: "20" }).map((f) => f.id)).toEqual(["1"]);
    const op = opcoesDosFiltros(fontes);
    expect(op.seculo.map((s) => s.rotulo)).toEqual(["Século XIX", "Século XX"]);
    expect(op.semPeriodo).toBe(2);
  });

  it("grau de automação ausente aparece como Não registrado e pode ser filtrado", () => {
    const op = opcoesDosFiltros(fontes);
    expect(op.automacao.find((o) => o.valor === SEM_REGISTRO)?.rotulo).toBe("Não registrado");
    expect(aplicarFiltrosFontes(fontes, { ...FILTROS_VAZIOS, automacao: SEM_REGISTRO }).map((f) => f.id)).toEqual(["3"]);
    expect(op.tipo.find((o) => o.valor === "registro_civil")?.rotulo).toBe("Registro civil");
  });

  it("a tela de fontes aplica os filtros antes de agrupar o catálogo", () => {
    const tela = readFileSync("src/routes/_authenticated/fontes-genealogicas.tsx", "utf8");
    expect(tela).toContain("aplicarFiltrosFontes((data?.fontes ?? []) as Fonte[], filtros)");
    expect(tela).toContain("<FiltrosCatalogoFontes");
  });
});
