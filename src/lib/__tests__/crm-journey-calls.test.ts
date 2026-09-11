import { describe, expect, it } from "vitest";

import {
  CRM_JOURNEY_FONTE_CALLS,
  DE_PARA_CRM_JOURNEY_LEADS,
  hrefPropostaAposHandoff,
  leadComercialAtivo,
  pendenciasLeadAtivoSemProximaAcao,
  searchPropostaAposHandoff,
} from "@/lib/crm-journey-calls";

describe("crm-journey-calls", () => {
  it("mantém fonte canônica em leads (sem crm_calls)", () => {
    expect(CRM_JOURNEY_FONTE_CALLS).toBe("leads");
    expect(DE_PARA_CRM_JOURNEY_LEADS.some((r) => r.leads.includes("leads.id"))).toBe(true);
    expect(DE_PARA_CRM_JOURNEY_LEADS.some((r) => /NÃO CRIAR/i.test(r.leads))).toBe(true);
  });

  it("sinaliza lead ativo sem próxima ação/responsável (pendência informa)", () => {
    const pend = pendenciasLeadAtivoSemProximaAcao({
      eixo_comercial: "discovery_realizada",
      area_responsavel: null,
      responsavel_nome: "",
      proxima_acao: null,
      proxima_acao_em: null,
    });
    expect(pend.length).toBe(4);
    expect(leadComercialAtivo({ eixo_comercial: "perdido" })).toBe(false);
    expect(pendenciasLeadAtivoSemProximaAcao({ eixo_comercial: "perdido" })).toEqual([]);
  });

  it("monta CTA propostas com lead/caso/cliente", () => {
    expect(
      searchPropostaAposHandoff({
        leadId: "l1",
        caseId: "c1",
        clienteId: "p1",
      }),
    ).toEqual({ lead: "l1", caso: "c1", cliente: "p1" });
    expect(hrefPropostaAposHandoff({ leadId: "l1", caseId: "c1" })).toBe(
      "/propostas?lead=l1&caso=c1",
    );
  });
});
