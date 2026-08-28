import { describe, expect, it } from "vitest";
import { CAMPOS_ENTRADA, derivarJornada } from "@/lib/derivacao-jornada";
import type { LeadDesk } from "@/lib/crm-desk";

const base: LeadDesk = { nome: "Teste" };

const completo: LeadDesk = {
  nome: "Ana Luiza",
  pais_linha_prioritaria: "austria",
  nacionalidades_interesse: ["austriaca"],
  estrutura_familiar: "nucleo_familiar",
  geracao_ascendente: "bisavo",
  linha_transmissao: "paterna",
  estado_documental_inicial: "parcial",
  objetivo: "cidadania",
  responsavel_nome: "Tati",
  status_via: "vigente",
  resumo_validado: true,
  proxima_acao: "Revisar brief",
  proxima_acao_em: "2026-08-25",
};

describe("derivação operacional da jornada", () => {
  it("expõe as 11 entradas canônicas no checklist", () => {
    const r = derivarJornada(base);
    expect(r.checklist_inicial).toHaveLength(CAMPOS_ENTRADA.length);
    expect(r.checklist_inicial.every((c) => c.estado === "pendente")).toBe(true);
  });

  it("inicia em triagem quando faltam entradas essenciais", () => {
    expect(derivarJornada(base).fase).toBe("triagem_inicial");
  });

  it("chega à leitura preliminar interna com entradas essenciais completas", () => {
    expect(derivarJornada(completo).fase).toBe("leitura_preliminar_interna");
  });

  it("gera perguntas prioritárias apenas para o que falta", () => {
    const r = derivarJornada(completo);
    expect(r.perguntas_prioritarias.length).toBeGreaterThan(0);
    expect(r.perguntas_prioritarias.join(" ")).not.toContain("linha prioritária");
  });

  it("mantém pendência interna de autorização enquanto não registrada", () => {
    const r = derivarJornada(completo);
    expect(r.pendencias_internas.some((p) => p.includes("autorização de pesquisa"))).toBe(true);
  });

  it("marca próxima ação datada e responsável nominal", () => {
    const r = derivarJornada(completo);
    expect(r.proxima_acao_datada.estado).toBe("definida");
    expect(r.responsavel).toBe("Tati");
  });

  it("sinaliza ação sem data", () => {
    const r = derivarJornada({ ...completo, proxima_acao_em: null });
    expect(r.proxima_acao_datada.estado).toBe("sem_data");
  });

  it("mantém os 6 bloqueios sempre ativos", () => {
    const r = derivarJornada(completo);
    expect(r.bloqueios).toHaveLength(6);
    expect(r.bloqueios.every((b) => b.ativo)).toBe(true);
  });

  it("não recomenda produto quando não há escopo aprovado", () => {
    const r = derivarJornada(completo);
    expect(r.bloqueios.find((b) => b.codigo === "B3")?.motivo).toContain(
      "Nenhum produto é sugerido",
    );
  });

  it("avança para pesquisa autorizada apenas com onboarding iniciado e autorização registrada", () => {
    const semAuth = derivarJornada({ ...completo, eixo_formalizacao: "onboarding_iniciado" });
    expect(semAuth.fase).toBe("onboarding");
    const comAuth = derivarJornada({
      ...completo,
      eixo_formalizacao: "onboarding_iniciado",
      pesquisa_previa_autorizacao: "registrada",
    });
    expect(comAuth.fase).toBe("pesquisa_autorizada");
  });

  it("exige revisão humana quando há risco de ruptura", () => {
    const r = derivarJornada({ ...completo, risco_ruptura: "naturalizacao" });
    expect(r.revisao_humana_juridica.necessaria).toBe(true);
  });
});
