import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  briefDaDiscovery,
  patchCasoDaTriagem,
  patchClienteReaproveitado,
  resumoLinhaFamiliarDaDiscovery,
} from "@/lib/handoff-triagem";
import { limparCamposLead } from "@/lib/crm-lead-campos";
import type { LeadDesk } from "@/lib/crm-desk";

/**
 * Corte U1 (28/09/2026): o repasse Discovery → caso leva a triagem já
 * capturada, só para campo vazio, só com equivalente explícito.
 */

const lead = {
  id: "l1",
  nome: "Nádia",
  pais_linha_prioritaria: "hungria",
  via_juridica_preliminar: "reparacao_historica",
  status_via: "confirmada_internamente",
  trilha_referencia_id: "trilha-1",
  resumo_call: "Linha materna Scheuer",
  linha_transmissao: "materna",
  localidades_conhecidas: "Bakonypölöske",
  dossie_mae_ref: "DOSSIE-1",
  discovery_registro: {
    respostas: { ascendente: { texto: "Miguel Scheuer", origem: "relato_call", nao_sabe: false, em: "x", por: "u" } },
  },
} as unknown as LeadDesk;

describe("triagem da Discovery vai ao caso sem redigitar", () => {
  it("caso novo recebe país, via, status, trilha, brief e dossiê — com de-para explícito", () => {
    const p = patchCasoDaTriagem(lead, {});
    expect(p.via_juridica_preliminar).toBe("reparacao_historica_em_confirmacao");
    expect(p.status_via).toBe("confirmada_internamente");
    expect(p.citizenship_track_id).toBe("trilha-1");
    expect(p.dossie_mae_referencia).toBe("DOSSIE-1");
    expect(String(p.brief_interno)).toContain("Vindo da Discovery (a confirmar)");
    expect(String(p.brief_interno)).toContain("Miguel Scheuer");
    // Hungria não existe na lista de país do caso: não inventa; o texto vai para `pais`.
    expect(p.pais_linha_prioritaria).toBeUndefined();
    expect(p.pais).toBe("Hungria");
  });

  it("nunca sobrescreve o que o caso já tem", () => {
    const p = patchCasoDaTriagem(lead, {
      via_juridica_preliminar: "administrativa",
      brief_interno: "escrito pela equipe",
      citizenship_track_id: "outra",
      pais: "Itália",
    });
    expect(p.via_juridica_preliminar).toBeUndefined();
    expect(p.brief_interno).toBeUndefined();
    expect(p.citizenship_track_id).toBeUndefined();
    expect(p.pais).toBeUndefined();
  });

  it("via sem equivalente no caso (descendência) não é copiada", () => {
    expect(patchCasoDaTriagem({ ...lead, via_juridica_preliminar: "descendencia" } as LeadDesk, {}).via_juridica_preliminar).toBeUndefined();
  });

  it("resumo da linha familiar só usa fatos de Situação, com a origem da resposta", () => {
    const r = resumoLinhaFamiliarDaDiscovery(lead);
    expect(r).toContain("Localidades conhecidas: Bakonypölöske");
    expect(r).toContain("Ascendente (relato call): Miguel Scheuer");
    expect(r).not.toMatch(/spin|elegibilidade|score/i);
    expect(briefDaDiscovery({ nome: "x" } as LeadDesk)).toBeNull();
  });

  it("pessoa reaproveitada ganha só o que estiver vazio", () => {
    const p = patchClienteReaproveitado(
      { email: "ja@tem.com", telefone: null, origem: "", indicado_por: null, pais_interesse: "italia" },
      { email: "novo@x.com", telefone: "11999", origem: "indicacao", indicado_por: null, pais_interesse: "hungria" },
    );
    expect(p).toEqual({ telefone: "11999", origem: "indicacao" });
  });
});

describe("handoff usa a mesma regra do lead e liga Pesquisa e Planejador", () => {
  const handoff = readFileSync("src/lib/handoff-discovery.functions.ts", "utf8");
  it("rascunho passa por limpar + validação e fica na trilha", () => {
    expect(handoff).toContain("limparCamposLead(data.rascunho ?? {})");
    expect(handoff).toContain("errosBloqueantesAlteracao(");
    expect(handoff).toContain('acao: "handoff_rascunho_gravado"');
    expect(limparCamposLead({ nome: "A", coluna_inexistente: 1, discovery_registro: {} })).toEqual({ nome: "A" });
  });
  it("caso novo e caso existente recebem a triagem", () => {
    expect(handoff).toContain("...patchCasoDaTriagem(lead, {})");
    expect(handoff).toContain("patchCasoDaTriagem(lead, casoExistente as Record<string, unknown>)");
  });
  it("a pesquisa nasce com a linha da Discovery; autorização externa continua pendente", () => {
    const pesq = readFileSync("src/lib/pesquisa-cadeia.functions.ts", "utf8");
    expect(pesq).toContain("family_line_summary_internal: linhaDaDiscovery");
    expect(pesq).toContain('external_research_authorization_status: "pending"');
  });
  it("sem plano salvo, o Planejador sugere o objetivo da Discovery (a confirmar)", () => {
    expect(readFileSync("src/components/contrato/planejador-operacional.tsx", "utf8")).toContain("Vindo da Discovery (a confirmar).");
  });
});
