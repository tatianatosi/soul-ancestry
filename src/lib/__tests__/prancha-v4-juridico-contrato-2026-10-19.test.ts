import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Jurídico & Contrato na composição da prancha V4 (Proprietária, 19/10/2026):
 * os seis blocos existem sempre, em /contratos (instrumento escolhido no
 * seletor) e no topo de /contratos/$id; somente leitura, sem dado inventado.
 */
const comp = readFileSync("src/components/contratos/prancha-juridico-contrato.tsx", "utf8");
const indice = readFileSync("src/routes/_authenticated/contratos.index.tsx", "utf8");
const ficha = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");

const BLOCOS = [
  "Escopo e assinatura",
  "Assinatura",
  "Validação jurídica",
  "Conflitos e conferências",
  "Alertas do contrato e atos formais",
  "Completude formal",
];

describe("Jurídico & Contrato — composição da prancha V4", () => {
  it("os seis blocos existem com dado e no estado vazio", () => {
    const [comDado, vazio] = comp.split("export function PranchaJuridicoVazia");
    for (const b of BLOCOS) {
      expect(comDado).toContain(`titulo="${b}"`);
      expect(vazio).toContain(`titulo="${b}"`);
    }
  });

  it("cadeia documental usa os 9 elos canônicos como denominador", () => {
    expect(comp).toContain('from "@/lib/cadeia-formalizacao"');
    expect(comp).toContain("ELOS_CADEIA.length");
  });

  it("somente leitura: nenhuma mutação, envio ou assinatura no componente", () => {
    expect(comp).not.toMatch(/useMutation|aprovarParaEnvio|tentarEtapaExterna|derivarAnexoIDaProposta/);
  });

  it("/contratos monta a composição para o instrumento selecionado e a ficha a repete no topo", () => {
    expect(indice).toContain("<PranchaJuridicoContrato contratoId={contratoPrancha}");
    expect(indice).toContain("<PranchaJuridicoVazia");
    expect(ficha).toContain("<PranchaJuridicoContrato contratoId={id} />");
    expect(ficha).toContain("<CadeiaFormalizacao");
  });
});
