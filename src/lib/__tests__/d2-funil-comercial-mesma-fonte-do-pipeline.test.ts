import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { porEtapaComercial, etapaComercialDoLead, rotuloEtapaComercial } from "@/lib/golive-comercial";

/**
 * D2 Comercial/CRM Vivo (§12) — achado real: o funil da superfície vinha de
 * `d.porEixoComercial`, agregado sobre `crm_casos` (casos), enquanto o
 * pipeline logo abaixo já usa `listaLeads` (leads) — duas entidades
 * diferentes na mesma superfície, sem garantia nenhuma de correspondência
 * entre os números mostrados. Corrigido para contar o funil sobre o MESMO
 * array e a MESMA classificação de etapa (`etapaComercialDoLead`) que já
 * alimentam o pipeline, para que os dois nunca divirjam.
 */
describe("porEtapaComercial — função pura", () => {
  it("agrupa leads pela mesma etapa que o pipeline usa", () => {
    const leads = [
      { estagio: "Discovery" },
      { estagio: "Discovery" },
      { eixo_comercial: "Proposta" },
      {},
    ];
    const resultado = porEtapaComercial(leads);
    expect(resultado).toEqual([
      { label: "Discovery", value: 2 },
      { label: "Proposta", value: 1 },
      { label: "Sem etapa registrada", value: 1 },
    ]);
  });

  it("bate exatamente com etapaComercialDoLead para cada lead (mesma regra, sem segunda definição)", () => {
    const leads = [{ estagio: "Call" }, { eixo_comercial: "Handoff" }, {}];
    const resultado = porEtapaComercial(leads);
    const esperado = new Map<string, number>();
    for (const l of leads) {
      const chave = etapaComercialDoLead(l) ?? "Sem etapa registrada";
      esperado.set(chave, (esperado.get(chave) ?? 0) + 1);
    }
    for (const { label, value } of resultado) {
      expect(esperado.get(label)).toBe(value);
    }
  });

  it("lista vazia não quebra", () => {
    expect(porEtapaComercial([])).toEqual([]);
  });
});

describe("D2 · ComercialConectado usa a mesma fonte para funil e pipeline", () => {
  const arquivo = readFileSync(
    resolve(__dirname, "../../components/desk/superficies-kit-conectadas.tsx"),
    "utf8",
  );

  it("funnel e columns derivam ambos de listaLeads, não de d.porEixoComercial", () => {
    const trecho = arquivo.slice(
      arquivo.indexOf("export function ComercialConectado"),
      arquivo.indexOf("export function ComercialConectado") + 3000,
    );
    expect(trecho).toContain("funnel={barras(porEtapaComercial(listaLeads)");
    expect(trecho).toContain("columns={colunasPorEtapaComercial(listaLeads)}");
    expect(trecho).not.toContain("d.porEixoComercial");
  });

  it("importa porEtapaComercial do módulo canônico de leads", () => {
    expect(arquivo).toMatch(/from "@\/lib\/golive-comercial"/);
    expect(arquivo).toContain("porEtapaComercial");
  });
});
