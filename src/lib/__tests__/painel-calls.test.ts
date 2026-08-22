import { describe, expect, it } from "vitest";

import type { LeadDesk } from "@/lib/crm-desk";
import { avaliarHandoffCall, bloqueiosQualificacao, bloqueiosRegistroCall, estadoCall, filasCalls, resumoCalls } from "@/lib/painel-calls";

const base: LeadDesk = { id: "1", nome: "Lead teste" };

const completo: LeadDesk = {
  ...base,
  status_call: "realizada",
  call_realizada_em: "2026-08-20T14:00",
  resumo_call: "Contexto familiar e documentos existentes.",
  resumo_validado: true,
  discovery_resultado: "aderente",
  proxima_acao: "elaborar_diagnostico",
  proxima_acao_em: "2026-08-25",
  responsavel_nome: "Tati",
  area_responsavel: "comercial",
  elegibilidade_preliminar: "possivel_com_pesquisa",
  confianca_triagem: "media",
  nivel_intencao: "alta",
  objecao_predominante: "nao_houve",
  estado_documental_inicial: "parcial",
  objetivo: "cidadania",
  nacionalidade: "italiana",
  via_juridica_preliminar: "administrativa",
};

describe("estadoCall", () => {
  it("deriva sem agenda quando nada foi registrado", () => {
    expect(estadoCall(base)).toBe("sem_agenda");
  });
  it("deriva agendada pela data quando não há status", () => {
    expect(estadoCall({ ...base, call_agendada_em: "2026-08-20T10:00" })).toBe("agendada");
  });
  it("normaliza cancelamentos", () => {
    expect(estadoCall({ ...base, status_call: "cancelada_lead" })).toBe("cancelada");
  });
});

describe("bloqueiosRegistroCall", () => {
  it("bloqueia call realizada sem resumo validado e resultado", () => {
    const p = bloqueiosRegistroCall({ ...base, status_call: "realizada" });
    expect(p.map((x) => x.campo)).toEqual(
      expect.arrayContaining(["call_realizada_em", "resumo_call", "resumo_validado", "discovery_resultado", "proxima_acao"]),
    );
  });
  it("bloqueia gravação sem consentimento concedido", () => {
    const p = bloqueiosRegistroCall({ ...completo, gravacao_link_interno: "interno://gravacao" });
    expect(p.some((x) => x.campo === "gravacao_link_interno")).toBe(true);
  });
  it("não bloqueia registro completo", () => {
    expect(bloqueiosRegistroCall(completo)).toEqual([]);
  });
});

describe("bloqueiosQualificacao", () => {
  it("exige call realizada antes de qualificar", () => {
    const p = bloqueiosQualificacao({ ...base, status_call: "agendada", call_agendada_em: "2026-08-20T10:00" });
    expect(p).toHaveLength(1);
    expect(p[0]?.campo).toBe("status_call");
  });
  it("exige via, geração e linha quando o sinal é forte", () => {
    const p = bloqueiosQualificacao({ ...completo, elegibilidade_preliminar: "forte", via_juridica_preliminar: null });
    expect(p.map((x) => x.campo)).toEqual(expect.arrayContaining(["via_juridica_preliminar", "geracao_ascendente", "linha_transmissao"]));
  });
  it("aceita qualificação completa", () => {
    expect(bloqueiosQualificacao(completo)).toEqual([]);
  });
});

describe("avaliarHandoffCall", () => {
  it("libera handoff com registro e qualificação completos", () => {
    const a = avaliarHandoffCall(completo);
    expect(a.liberado).toBe(true);
    expect(a.destino).toBe("proposta");
  });
  it("mantém bloqueado sem responsável nominal", () => {
    const a = avaliarHandoffCall({ ...completo, responsavel_nome: null });
    expect(a.liberado).toBe(false);
    expect(a.bloqueios.length).toBeGreaterThan(0);
  });
  it("deriva destino de nutrição em reagendamento", () => {
    expect(avaliarHandoffCall({ ...completo, discovery_resultado: "reagendar" }).destino).toBe("nutricao");
  });
});

describe("filas e resumo", () => {
  it("coloca cada lead em uma única fila", () => {
    const leads = [completo, { ...base, id: "2", status_call: "realizada" }, { ...base, id: "3" }];
    const filas = filasCalls(leads, "2026-08-22T00:00:00Z");
    const ids = filas.flatMap((f) => f.leads.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(3);
  });
  it("ignora leads arquivados", () => {
    const filas = filasCalls([{ ...completo, archived_at: "2026-01-01" }], "2026-08-22T00:00:00Z");
    expect(filas.every((f) => !f.leads.length)).toBe(true);
  });
  it("resume contagens por fila", () => {
    const r = resumoCalls([completo], "2026-08-22T00:00:00Z");
    expect(r.prontoHandoff).toBe(1);
  });
});
