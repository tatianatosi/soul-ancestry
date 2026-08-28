import { describe, expect, it } from "vitest";

import { instanciasDeAnexos, tipoAnexoPersistido } from "@/lib/anexos-persistidos.server";

const TIPOS_ACEITOS = [
  "scope",
  "service_order",
  "financial_schedule",
  "external_expenses",
  "privacy_data",
  "family_structure",
  "document_list",
  "authorization",
  "other",
];

const STATUS_ACEITOS = [
  "missing",
  "drafting",
  "ready_for_review",
  "approved",
  "attached",
  "signed_with_contract",
  "not_applicable",
  "archived",
];

function anexo(codigo: string, extra: Record<string, unknown> = {}) {
  return {
    codigo,
    titulo: `Título ${codigo}`,
    finalidade: "Finalidade",
    regra: "Regra de aplicabilidade",
    aplicavel: true,
    estado: "em_revisao",
    pendencias: [] as string[],
    motivo: null,
    gatesBloqueados: [] as string[],
    ...extra,
  } as never;
}

describe("domínio persistido dos anexos", () => {
  it("mapeia cada anexo governado para um tipo aceito pelo banco", () => {
    expect(tipoAnexoPersistido("ANEXO_I_ORDEM_SERVICO")).toBe("service_order");
    expect(tipoAnexoPersistido("ANEXO_II_DESPESAS_EXTERNAS")).toBe("external_expenses");
    expect(tipoAnexoPersistido("ANEXO_III_AUTORIZACAO_PESQUISA")).toBe("authorization");
    expect(tipoAnexoPersistido("ANEXO_IV_PROCURACAO")).toBe("authorization");
    expect(tipoAnexoPersistido("ANEXO_V_ALTERACAO_ESCOPO")).toBe("scope");
    expect(tipoAnexoPersistido("CODIGO_DESCONHECIDO")).toBe("other");
  });

  it("gera instâncias com tipo e status dentro do domínio do banco", () => {
    const instancias = instanciasDeAnexos({
      anexos: [
        anexo("ANEXO_I_ORDEM_SERVICO", { pendencias: ["Falta escopo"] }),
        anexo("ANEXO_III_AUTORIZACAO_PESQUISA", {
          aplicavel: false,
          motivo: "Sem pesquisa externa",
        }),
        anexo("ANEXO_V_ALTERACAO_ESCOPO", { estado: "aprovado" }),
      ],
      internos: [
        { codigo: "ANX-ESCOPO", titulo: "Escopo", motivo: "Obrigatório" } as never,
        { codigo: "ANX-COMERCIAL", titulo: "Comercial", motivo: "Obrigatório" } as never,
      ],
    });

    expect(instancias).toHaveLength(5);
    for (const i of instancias) {
      expect(TIPOS_ACEITOS).toContain(i.annex_type);
      expect(STATUS_ACEITOS).toContain(i.status);
    }
    expect(instancias[0].status).toBe("missing");
    expect(instancias[1].status).toBe("not_applicable");
    expect(instancias[2].status).toBe("approved");
    expect(instancias[3].natureza).toBe("interno");
    expect(instancias[3].status).toBe("drafting");
  });
});
