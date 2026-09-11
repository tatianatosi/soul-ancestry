import { describe, expect, it } from "vitest";

import {
  CAMPOS_DICIONARIO_CALLS,
  FORMATACAO_CONDICIONAL_CALLS,
  LISTAS_BASE_CALLS,
  avaliarBloqueiosCalls,
  leadParaRegistroCalls,
  pendenciasDicionarioDoLead,
  valorPermitidoCalls,
  type RegistroCallsCrm,
} from "@/lib/dicionario-calls-crm";
import type { LeadDesk } from "@/lib/crm-desk";
import {
  SUBSTITUICOES_OBRIGATORIAS,
  VOCABULARIO_OFICIAL,
  revisarTerminologiaCliente,
} from "@/lib/glossario-oficial";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";

const base: RegistroCallsCrm = { dataRegistro: "2026-08-24" };

describe("Dicionário de validações Calls → CRM", () => {
  it("SPIN no dicionário é pergunta da Mesa, não checkbox", () => {
    const spins = CAMPOS_DICIONARIO_CALLS.filter((c) => c.campo.startsWith("SPIN"));
    expect(spins).toHaveLength(4);
    for (const c of spins) {
      expect(c.tipo).toBe("Pergunta da Mesa");
      expect(c.regra).toMatch(/deriva da resposta/i);
    }
  });

  it("todo campo classificatório aponta para uma lista existente", () => {
    const classificatorios = CAMPOS_DICIONARIO_CALLS.filter((c) => c.tipo.startsWith("Dropdown"));
    expect(classificatorios.length).toBeGreaterThan(20);
    for (const c of classificatorios) {
      if (c.tipo === "Dropdown dependente") continue;
      expect(c.lista, c.campo).toBeTruthy();
      expect(LISTAS_BASE_CALLS[c.lista!], c.campo).toBeTruthy();
    }
  });

  it("rejeita valor fora da lista controlada", () => {
    expect(valorPermitidoCalls("Etapa do funil", "Negociação")).toBe(true);
    expect(valorPermitidoCalls("Etapa do funil", "Quase fechando")).toBe(false);
    expect(valorPermitidoCalls("Lista inexistente", "x")).toBe(false);
  });

  it("bloqueia SKU sem produto recomendado ou marcado inativo no catálogo homologado", () => {
    const r = avaliarBloqueiosCalls({ ...base, skuRecomendado: "CA-CID-001" });
    expect(r.filter((b) => b.regra === 1)).toHaveLength(1);
    const inativo = avaliarBloqueiosCalls({
      ...base,
      skuRecomendado: "CA-CID-001",
      produtosRecomendados: ["Diagnóstico"],
      skuAtivoNoCatalogoHomologado: false,
    });
    expect(inativo.filter((b) => b.regra === 1)).toHaveLength(1);
    const ok = avaliarBloqueiosCalls({
      ...base,
      skuRecomendado: "CA-CID-001",
      produtosRecomendados: ["Diagnóstico"],
      skuAtivoNoCatalogoHomologado: true,
    });
    expect(ok.filter((b) => b.regra === 1)).toHaveLength(0);
  });

  it("exige contrato, pagamento e dossiê para Convertido e motivo para perda", () => {
    expect(
      avaliarBloqueiosCalls({ ...base, resultadoComercial: "Convertido" }).some(
        (b) => b.regra === 2,
      ),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({
        ...base,
        resultadoComercial: "Convertido",
        contratoAssinado: true,
        pagamentoInicialConfirmado: true,
        linkDossie: "https://interno/dossie",
      }).some((b) => b.regra === 2),
    ).toBe(false);
    expect(
      avaliarBloqueiosCalls({ ...base, resultadoComercial: "Perdido — preço" }).some(
        (b) => b.regra === 5,
      ),
    ).toBe(true);
  });

  it("aplica as travas de etapa, call realizada e elegibilidade forte", () => {
    expect(
      avaliarBloqueiosCalls({ ...base, etapaFunil: "Contrato assinado" }).some(
        (b) => b.regra === 3,
      ),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, etapaFunil: "Onboarding" }).some((b) => b.regra === 4),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, statusCall: "Realizada" }).some((b) => b.regra === 6),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, elegibilidadePreliminar: "Forte" }).some(
        (b) => b.regra === 7,
      ),
    ).toBe(true);
  });

  it("bloqueia oferta de protocolo em via encerrada, despesa aprovada sem lastro e gravação sem consentimento", () => {
    expect(
      avaliarBloqueiosCalls({
        ...base,
        statusVia: "Encerrada para novos pedidos",
        ofertaProtocoloAssessoria: true,
      }).some((b) => b.regra === 8),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, statusDespesasTerceiros: "Aprovadas" }).some(
        (b) => b.regra === 9,
      ),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, linkGravacao: "https://x" }).some((b) => b.regra === 10),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, fazParteDeNucleo: true }).some((b) => b.regra === 11),
    ).toBe(true);
  });

  it("exige responsável, etapa e próxima ação datada em lead ativo e prazo não retroativo", () => {
    expect(
      avaliarBloqueiosCalls({ ...base, leadAtivo: true }).some((b) => b.campo === "Lead ativo"),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, prazoProximaAcao: "2026-08-20" }).some(
        (b) => b.campo === "Prazo da próxima ação",
      ),
    ).toBe(true);
  });

  it("mora no contexto comercial de Visão Geral com o Painel de Calls, não na Biblioteca nem na conta", () => {
    expect(FORMATACAO_CONDICIONAL_CALLS).toHaveLength(10);
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral");
    const rotas = visao?.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/calls");
    expect(rotas).toContain("/crm-mestre");
    expect(rotas).toContain("/governanca/dicionario-calls-crm");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("governanca");
    const bib = GRUPOS_DESK.find((g) => g.id === "biblioteca-mestre");
    const rotasBib = bib?.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasBib).not.toContain("/governanca/dicionario-calls-crm");
    expect(rotasBib).not.toContain("/crm-mestre");
  });

  it("avalia o lead canônico do Painel de Calls com as regras do dicionário", () => {
    const lead: LeadDesk = {
      nome: "Ana",
      status_call: "realizada",
      eixo_comercial: "discovery_realizada",
      responsavel_nome: "Tati",
      proxima_acao: "elaborar_diagnostico",
      proxima_acao_em: "2026-09-12",
    };
    const registro = leadParaRegistroCalls(lead);
    expect(registro.statusCall).toBe("Realizada");
    expect(registro.etapaFunil).toBe("Discovery realizada");
    expect(pendenciasDicionarioDoLead(lead).some((p) => p.motivo.includes("regra 6"))).toBe(true);

    const ok = pendenciasDicionarioDoLead({
      ...lead,
      discovery_resultado: "aderente",
    });
    expect(ok.some((p) => p.motivo.includes("regra 6"))).toBe(false);
  });
});

describe("Glossário oficial", () => {
  it("registra os 17 termos oficiais e as substituições obrigatórias", () => {
    expect(VOCABULARIO_OFICIAL).toHaveLength(17);
    expect(SUBSTITUICOES_OBRIGATORIAS.length).toBeGreaterThanOrEqual(10);
  });

  it("aponta termo bloqueado e substituição em texto cliente-facing", () => {
    const avisos = revisarTerminologiaCliente(
      "A linha confirmada indica via judicial para o caso.",
    );
    expect(avisos.some((a) => a.includes("via judicial"))).toBe(true);
    expect(avisos.some((a) => a.includes("linha confirmada"))).toBe(true);
  });

  it("não sinaliza texto já sanitizado", () => {
    expect(
      revisarTerminologiaCliente(
        "Linha familiar em análise. Próximo passo recomendado: enviar documento.",
      ),
    ).toEqual([]);
  });
});
