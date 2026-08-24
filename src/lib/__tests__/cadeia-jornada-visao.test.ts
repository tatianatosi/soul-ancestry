import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { descreverCadeia } from "@/lib/cadeia-jornada-visao";
import { ELOS_CADEIA, executarCadeiaJornada } from "@/lib/orquestracao-jornada";

const HOJE = "2026-08-24";

describe("cadeia da jornada — visão derivada", () => {
  const resultado = executarCadeiaJornada({
    hoje: HOJE,
    evento: "proposta_aprovada",
    caso_id: "CA-TESTE-001",
  });
  const elos = descreverCadeia(resultado, { evento: "proposta_aprovada" });

  it("devolve exatamente os 11 elos canônicos em ordem", () => {
    expect(elos.map((e) => e.chave)).toEqual([...ELOS_CADEIA]);
    expect(elos.map((e) => e.ordem)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("mantém publicação bloqueada sem revisão humana", () => {
    const revisao = elos.find((e) => e.chave === "revisao_humana")!;
    const publicacao = elos.find((e) => e.chave === "publicacao_ou_fila")!;
    expect(revisao.estado).not.toBe("concluido");
    expect(publicacao.estado).toBe("bloqueado");
    expect(resultado.publicacao.envioExecutado).toBe(false);
    expect(resultado.contemAcaoExterna).toBe(false);
  });

  it("só marca alerta quando há atraso, bloqueio ou exceção", () => {
    const alerta = elos.find((e) => e.chave === "alerta_derivado")!;
    expect(alerta.estado).toBe(resultado.alerta ? "bloqueado" : "nao_aplicavel");
  });

  it("é renderizada no painel contextual sem ação externa", () => {
    const componente = readFileSync("src/components/desk/cadeia-jornada.tsx", "utf8");
    const painel = readFileSync("src/components/desk/orquestracao-contextual.tsx", "utf8");
    expect(painel).toContain("<CadeiaJornada");
    expect(componente).not.toMatch(/fetch\(|supabase|insert\(|update\(/);
  });
});
