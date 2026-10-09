import { describe, expect, it } from "vitest";
import {
  condicaoComercialFormal,
  condicaoVersionadaComoRegistro,
  condicaoVigenteDoCaso,
} from "@/lib/cadeia-formalizacao";

/**
 * P0 — o gate comercial lia a tabela superseded.
 *
 * Medido no banco em 09/10/2026, no caso real da Ana
 * (a11a0000-0000-4000-8000-000000000002): há linha nas DUAS tabelas.
 *
 * | campo | `commercial_conditions` (antiga) | `case_commercial_condition` (vigente) |
 * |---|---|---|
 * | status | `rascunho` | `aprovada` (04/10) |
 * | parcelas | null | 10 |
 * | valor_parcela | null | 320 |
 * | product_catalog_id | null | não existe no modelo |
 *
 * `cadeia-formalizacao.server.ts` avaliava só a antiga, então o gate acusava
 * seis pendências — cinco falsas, porque o dado existia na outra tabela.
 */

const LEGADA_ANA = {
  id: "cc-antiga",
  status: "rascunho",
  origem: "proposta",
  forma_pagamento:
    "3 assinaturas mensais de R$ 320 por responsável, durante 10 meses — total R$ 9.600.",
  parcelas: null,
  valor_parcela: null,
  valor_total_referencia: 9600,
  vencimento_dia: null,
  primeiro_vencimento: null,
  product_catalog_id: null,
  homologado_por: null,
  homologado_em: null,
};

const VERSIONADA_ANA = {
  id: "016c4b57-8550-483b-a629-320340792ff7",
  approval_status: "aprovada",
  origem: "proposta_canva",
  payment_terms:
    "3 assinaturas mensais de R$ 320 por responsável, durante 10 meses — total R$ 9.600.",
  parcelas: 10,
  // O banco devolve numeric como string — o de-para precisa aceitar as duas formas.
  valor_parcela: "320",
  fees: "9600",
  aprovado_por: null,
  aprovado_em: "2026-10-04 16:45:36.300605+00",
  archived_at: null,
};

describe("P0 — condição particular versionada rege a formalização", () => {
  it("a versionada vence a legada quando existe", () => {
    const vigente = condicaoVigenteDoCaso({ versionada: VERSIONADA_ANA, legada: LEGADA_ANA });
    expect(vigente?.id).toBe(VERSIONADA_ANA.id);
    expect(vigente?.versionada).toBe(true);
    // numeric vindo como string é convertido, não descartado
    expect(vigente?.parcelas).toBe(10);
    expect(vigente?.valor_parcela).toBe(320);
    expect(vigente?.valor_total_referencia).toBe(9600);
  });

  it("sem versionada, a legada continua valendo — nenhum caso antigo muda de regra", () => {
    const vigente = condicaoVigenteDoCaso({ versionada: null, legada: LEGADA_ANA });
    expect(vigente?.id).toBe("cc-antiga");
    expect(vigente?.versionada).toBeUndefined();
  });

  it("versionada arquivada não rege: cai para a legada", () => {
    const vigente = condicaoVigenteDoCaso({
      versionada: { ...VERSIONADA_ANA, archived_at: "2026-10-09T00:00:00Z" },
      legada: LEGADA_ANA,
    });
    expect(vigente?.id).toBe("cc-antiga");
  });

  it("`aprovada` é o terminal equivalente a `homologada` — de-para, não valor novo", () => {
    expect(condicaoVersionadaComoRegistro(VERSIONADA_ANA)?.status).toBe("homologada");
    // Estado não terminal é preservado como está, nunca promovido.
    expect(condicaoVersionadaComoRegistro({ ...VERSIONADA_ANA, approval_status: "em_revisao" })?.status).toBe(
      "em_revisao",
    );
    expect(condicaoVersionadaComoRegistro({ ...VERSIONADA_ANA, approval_status: "rascunho" })?.status).toBe(
      "rascunho",
    );
  });

  it("catálogo não é exigido quando a condição é versionada", () => {
    const vigente = condicaoVigenteDoCaso({ versionada: VERSIONADA_ANA, legada: LEGADA_ANA });
    const r = condicaoComercialFormal(vigente);
    expect(r.motivos.some((m) => /produto homologado do catálogo/i.test(m))).toBe(false);
  });

  it("no modelo antigo o catálogo continua exigido — a regra não foi afrouxada para todos", () => {
    const r = condicaoComercialFormal({ ...LEGADA_ANA, status: "homologada", homologado_por: "x", homologado_em: "2026-10-01", parcelas: 10, valor_parcela: 320 });
    expect(r.motivos.some((m) => /produto homologado do catálogo/i.test(m))).toBe(true);
    expect(r.ok).toBe(false);
  });

  it("as cinco pendências falsas da Ana desaparecem; a real (vencimentos) permanece", () => {
    const vigente = condicaoVigenteDoCaso({ versionada: VERSIONADA_ANA, legada: LEGADA_ANA });
    const r = condicaoComercialFormal(vigente);
    // Falsas: parcelas, valor da parcela, catálogo, status, homologação sem data.
    expect(r.motivos.some((m) => /parcelas não declarado/i.test(m))).toBe(false);
    expect(r.motivos.some((m) => /Valor da parcela não declarado/i.test(m))).toBe(false);
    expect(r.motivos.some((m) => /catálogo/i.test(m))).toBe(false);
    expect(r.motivos.some((m) => /exige homologação/i.test(m))).toBe(false);
    // Real e ainda aberta: a condição não tem responsável de aprovação
    // registrado (`aprovado_por` nulo no banco) — isso NÃO é inventado aqui.
    expect(r.motivos.some((m) => /Homologação sem responsável/i.test(m))).toBe(true);
    expect(r.ok).toBe(false);
  });

  it("não inventa vencimento: dia e primeiro vencimento seguem ausentes", () => {
    const vigente = condicaoVigenteDoCaso({ versionada: VERSIONADA_ANA, legada: LEGADA_ANA });
    expect(vigente?.vencimento_dia).toBeNull();
    expect(vigente?.primeiro_vencimento).toBeNull();
  });
});
