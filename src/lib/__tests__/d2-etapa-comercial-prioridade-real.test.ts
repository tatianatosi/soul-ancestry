import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { etapaComercialDoLead, rotuloEtapaComercial } from "@/lib/golive-comercial";
import { EIXO_COMERCIAL } from "@/lib/crm-desk";

/**
 * D2 Comercial/CRM Vivo (§12) — achado real, mais a fundo: `leads.estagio`
 * tem `DEFAULT 'novo'` no banco e NÃO está entre os campos editáveis do
 * Desk (`CAMPOS_LEAD`) — só muda via a trilha de handoff (empurrada até
 * "ganho" na conversão) ou escritores de piloto/integração. `eixo_comercial`
 * é o campo que `/leads` e `/calls` realmente editam todo dia, com 12
 * valores reais que batem com a progressão do §12 (novo lead → discovery →
 * diagnóstico → proposta → negociação).
 *
 * A prioridade antiga (`estagio` primeiro) fazia o funil e o pipeline
 * mostrarem quase todo lead ativo preso em "novo" — a progressão real que a
 * equipe registra em `eixo_comercial` ficava invisível. Corrigido:
 * `eixo_comercial` primeiro, `estagio` só quando o eixo estiver vazio.
 */
describe("etapaComercialDoLead — prioridade corrigida (eixo_comercial > estagio)", () => {
  it("prioriza eixo_comercial quando os dois campos estão gravados", () => {
    const lead = { estagio: "novo", eixo_comercial: "diagnostico_em_elaboracao" };
    expect(etapaComercialDoLead(lead)).toBe("diagnostico_em_elaboracao");
  });

  it("cai para estagio só quando eixo_comercial está vazio/ausente", () => {
    expect(etapaComercialDoLead({ estagio: "ganho", eixo_comercial: "" })).toBe("ganho");
    expect(etapaComercialDoLead({ estagio: "ganho" })).toBe("ganho");
  });

  it("sem os dois campos, devolve null (nunca inventa etapa)", () => {
    expect(etapaComercialDoLead({})).toBeNull();
  });

  it("reproduz o defeito real: lead com eixo_comercial avançado mas estagio ainda em 'novo' (o default do banco) mostra o eixo, não 'novo'", () => {
    // leads.estagio tem DEFAULT 'novo' e não é escrito pela UI — todo lead
    // ativo tem esse valor gravado independente do progresso real.
    const leadAtivoHaSemanas = { estagio: "novo", eixo_comercial: "proposta_enviada" };
    expect(etapaComercialDoLead(leadAtivoHaSemanas)).not.toBe("novo");
    expect(etapaComercialDoLead(leadAtivoHaSemanas)).toBe("proposta_enviada");
  });
});

describe("rotuloEtapaComercial — rótulo legível para a coluna/funil", () => {
  it("usa o rótulo acentuado do vocabulário fechado quando existe", () => {
    expect(rotuloEtapaComercial("diagnostico_em_elaboracao")).toBe("Diagnóstico em elaboração");
    expect(rotuloEtapaComercial("novo_lead")).toBe("Novo lead");
  });

  it("humaniza valores fora do vocabulário fechado (ex.: estagio legado) em vez de mostrar código cru", () => {
    expect(rotuloEtapaComercial("proposta_em_preparo")).not.toBe("proposta_em_preparo");
    expect(rotuloEtapaComercial("proposta_em_preparo")).toMatch(/proposta em preparo/i);
  });

  it("todo valor do vocabulário EIXO_COMERCIAL tem rótulo próprio (não cai no humanizador genérico)", () => {
    for (const opcao of EIXO_COMERCIAL) {
      expect(rotuloEtapaComercial(opcao.valor)).toBe(opcao.rotulo);
    }
  });
});

describe("D2 · confirma que estagio realmente não é editável pela UI do Desk (motivação do achado)", () => {
  it("CAMPOS_LEAD (crm-lead-campos.ts, usado por crm-desk.functions.ts e pelo handoff) inclui eixo_comercial e não inclui estagio", () => {
    // 28/09/2026: a lista saiu de crm-desk.functions.ts para crm-lead-campos.ts (mesma regra no handoff).
    const arquivo = readFileSync(resolve(__dirname, "../crm-lead-campos.ts"), "utf8");
    const trecho = arquivo.slice(arquivo.indexOf("const CAMPOS_LEAD"), arquivo.indexOf("const CAMPOS_LEAD") + 1200);
    const listaAte = trecho.indexOf("];");
    const lista = trecho.slice(0, listaAte);
    expect(lista).toContain('"eixo_comercial"');
    expect(lista).not.toContain('"estagio"');
  });
});

describe("D2 · pipeline e funil usam o rótulo humanizado, não o código cru, como título/label", () => {
  const componente = readFileSync(
    resolve(__dirname, "../../components/desk/superficies-kit-conectadas.tsx"),
    "utf8",
  );
  const funcoes = readFileSync(resolve(__dirname, "../golive-comercial.ts"), "utf8");

  it("colunasPorEtapaComercial usa rotuloEtapaComercial no title da coluna", () => {
    const trecho = componente.slice(
      componente.indexOf("function colunasPorEtapaComercial"),
      componente.indexOf("function colunasPorEtapaComercial") + 2500,
    );
    expect(trecho).toContain("rotuloEtapaComercial(chave)");
  });

  it("porEtapaComercial usa rotuloEtapaComercial no label da barra do funil", () => {
    const trecho = funcoes.slice(
      funcoes.indexOf("export function porEtapaComercial"),
      funcoes.indexOf("export function porEtapaComercial") + 800,
    );
    expect(trecho).toContain("rotuloEtapaComercial(chave)");
  });
});
