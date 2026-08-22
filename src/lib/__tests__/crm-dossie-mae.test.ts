import { describe, expect, it } from "vitest";

import { AMBIENTES_DOSSIE, CATALOGOS, NIVEIS_ACESSO_DOSSIE, validarLead, type LeadDesk } from "@/lib/crm-desk";

const base: LeadDesk = {
  nome: "Lead de teste",
  area_responsavel: "operacoes",
  responsavel_nome: "Responsável de teste",
  proxima_acao: "solicitar_documentos",
  proxima_acao_em: "2026-09-01",
  eixo_comercial: "triagem",
  eixo_formalizacao: "nao_iniciado",
} as LeadDesk;

const campos = (l: LeadDesk) => validarLead(l).map((e) => e.campo);

describe("dossiê-mãe autorizado", () => {
  it("exige identificação, ambiente, link, nível de acesso e responsável quando ativo", () => {
    const erros = campos({ ...base, dossie_ativo: true });
    expect(erros).toEqual(
      expect.arrayContaining([
        "dossie_mae_ref",
        "dossie_ambiente",
        "dossie_link_interno",
        "dossie_nivel_acesso",
        "dossie_responsavel",
      ]),
    );
  });

  it("aceita dossiê ativo completo", () => {
    const erros = campos({
      ...base,
      dossie_ativo: true,
      dossie_mae_ref: "DOSSIE-MAE-TESTE",
      dossie_ambiente: "desk_intelligence",
      dossie_link_interno: "desk://dossies/teste",
      dossie_nivel_acesso: "restrito_equipe_caso",
      dossie_responsavel: "Responsável de teste",
    });
    expect(erros).not.toEqual(expect.arrayContaining(["dossie_mae_ref", "dossie_ambiente"]));
  });

  it("não valida nada quando o dossiê não está ativo", () => {
    expect(campos({ ...base, dossie_ativo: false })).not.toContain("dossie_mae_ref");
  });

  it("mantém ambiente e nível de acesso como listas controladas", () => {
    expect(CATALOGOS["dossie_ambiente"]).toBe(AMBIENTES_DOSSIE);
    expect(CATALOGOS["dossie_nivel_acesso"]).toBe(NIVEIS_ACESSO_DOSSIE);
  });
});
