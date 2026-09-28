import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { PAPEL_REGISTRO, papelDoRegistro } from "@/lib/caso-ficha";
import { CLAUSULAS_FIXAS } from "@/lib/contrato-base-consolidado";
import { GRUPOS_DESK, MENU_CONTA } from "@/lib/navegacao-desk";
import { parametrosDoPlanejador } from "@/lib/planejador-parametros";
import { COPY_TELAS } from "@/lib/portal-copy";

describe("pente-fino Ana — primeira cliente e contrato decente", () => {
  it("rótulo operacional é Primeira cliente; o CHECK piloto_real permanece", () => {
    expect(PAPEL_REGISTRO.find((p) => p.valor === "piloto_real")?.rotulo).toMatch(/Primeira cliente/);
    expect(papelDoRegistro({ papel_registro: "piloto_real" }).rotulo).toBe("Primeira cliente");
    const ficha = readFileSync("src/lib/caso-ficha.ts", "utf8");
    expect(ficha).toContain('"piloto_real"');
  });

  it("Planejador da Ana preenche objeto, escopo e partes humanas — não é stub", () => {
    const r = parametrosDoPlanejador("CA-CID-AT-FAM-2026-001");
    const por = Object.fromEntries(r.parametros.map((p) => [p.campo, p.valor]));
    expect(por.objeto_contrato).toMatch(/austríaca/i);
    expect(por.escopo_resumo).toMatch(/Pesquisa genealógica/);
    expect(por.contratante_nome).toBe("Ana Luiza Gomes Silveira Rodrigues");
    expect(por.beneficiarios).toMatch(/Adair Pinto Silveira/);
    expect(por.beneficiarios).toMatch(/Alice Gomes Silveira/);
    expect(por.beneficiarios).not.toMatch(/Felipe/);
  });

  it("escritor de preparação usa modelos existentes e cláusulas humanas", () => {
    expect(CLAUSULAS_FIXAS).toHaveLength(16);
    expect(CLAUSULAS_FIXAS[1]?.titulo).toMatch(/Objeto/i);
    const escritor = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");
    expect(escritor).toContain("parametrosDoPlanejador");
    expect(escritor).toContain("importado_a_confirmar");
    expect(escritor).toContain("MODELO-ESTUDO");
    expect(escritor).toContain("BASE-GEN-V2");
    // Corte U2 (28/09/2026): Pessoa 360 (origem "crm") prevalece; o Planejador cobre o resto.
    expect(escritor).toContain('origem: "origem" in c ? c.origem : "planejador"');
  });
});

describe("pente-fino visual — legado fora da face do produto", () => {
  it("grupo Biblioteca Mestre entra no módulo vivo e no dossiê do Legado; DEMO sai da face", () => {
    const bib = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    expect(bib.to).toBe("/biblioteca");
    const rotasBib = bib.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasBib).toContain("/pesquisa");
    expect(rotasBib).toContain("/pesquisa-modulo");
    const casos = GRUPOS_DESK.find((g) => g.id === "casos")!;
    const rotasCasos = casos.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasCasos).not.toContain("/app-cliente-demo");
    expect(rotasCasos).toContain("/app-cliente-como-pessoa");
    const conta = MENU_CONTA.itens.filter((i) => "to" in i).map((i) => i.to);
    expect(conta).not.toContain("/pesquisa");
    expect(conta).toContain("/app-cliente-demo");
  });

  it("App Cliente: Home, 7 abas, sem Entregas/Fase na barra", () => {
    expect(COPY_TELAS.home.navegacao).toBe("Home");
    expect(COPY_TELAS.home.navegacao).not.toBe("Início");
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    expect(shell).toContain("COPY_TELAS.home.navegacao");
    expect(shell).not.toContain("/portal/entregas");
    expect(shell).not.toContain("/portal/fase-01");
    expect(shell).not.toContain("/portal/fase-02");
  });
});
