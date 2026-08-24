import { describe, expect, it } from "vitest";

import {
  AGENDA_ASSISTIDA_NUNCA_CHAMA_API_EXTERNA,
  montarSugestaoAgenda,
  pautaContemDadoInterno,
  validarPautaParaDestino,
  type EntradaSugestaoAgenda,
} from "../agenda-assistida";

const base = (over: Partial<EntradaSugestaoAgenda> = {}): EntradaSugestaoAgenda => ({
  titulo: "Reunião de apresentação da proposta — Lara",
  objetivo: "Apresentar a proposta e alinhar próximos passos.",
  participantesPropostos: ["Lara", "Responsável comercial"],
  janela: { inicio: "2026-09-05T14:00:00.000Z", fim: "2026-09-05T15:00:00.000Z" },
  duracaoMinutos: 60,
  contexto: "Follow-up do lead Lara — proposta pronta, reunião ainda não marcada.",
  rotaDoObjeto: "/propostas",
  dependencias: [],
  textoPauta: "Apresentar a proposta e ouvir dúvidas.",
  destino: "interno",
  confirmadoPelaProprietaria: false,
  cancelado: false,
  ...over,
});

describe("agenda assistida — estados (PROMPT 06)", () => {
  it("fica RASCUNHO_INTERNO quando falta campo obrigatório", () => {
    const s = montarSugestaoAgenda(base({ janela: null }));
    expect(s.estado).toBe("RASCUNHO_INTERNO");
    expect(s.camposAusentes).toContain("janela");
  });

  it("fica AGUARDA_CONFIRMACAO_PROPRIETARIA com tudo preenchido mas sem confirmação", () => {
    const s = montarSugestaoAgenda(base());
    expect(s.estado).toBe("AGUARDA_CONFIRMACAO_PROPRIETARIA");
    expect(s.camposAusentes).toEqual([]);
  });

  it("só fica PRONTO_PARA_CRIAR_EVENTO após confirmação explícita da Proprietária", () => {
    const s = montarSugestaoAgenda(base({ confirmadoPelaProprietaria: true }));
    expect(s.estado).toBe("PRONTO_PARA_CRIAR_EVENTO");
  });

  it("cancelado sempre prevalece, mesmo com tudo preenchido e confirmado", () => {
    const s = montarSugestaoAgenda(base({ confirmadoPelaProprietaria: true, cancelado: true }));
    expect(s.estado).toBe("CANCELADO");
  });

  it("PRONTO_PARA_CRIAR_EVENTO não cria nada por si só — é só um rótulo de estado", () => {
    const s = montarSugestaoAgenda(base({ confirmadoPelaProprietaria: true }));
    expect((s as any).criarEvento).toBeUndefined();
    expect((s as any).enviarConvite).toBeUndefined();
  });
});

describe("agenda assistida — pauta sem dado interno para o cliente (PROMPT 06)", () => {
  it("detecta termos de uso interno na pauta", () => {
    expect(pautaContemDadoInterno("Revisar o score de elegibilidade antes da call")).toBe(true);
    expect(pautaContemDadoInterno("Conversar sobre os próximos passos da pesquisa")).toBe(false);
  });

  it("recusa pauta com dado interno quando o destino é o cliente", () => {
    const r = validarPautaParaDestino(base({ destino: "cliente", textoPauta: "Revisar hipótese de linhagem e gate financeiro" }));
    expect(r.valida).toBe(false);
    expect(r.erros.join(" ")).toMatch(/termo de uso interno/i);
  });

  it("mesma pauta é aceita quando o destino é interno", () => {
    const r = validarPautaParaDestino(base({ destino: "interno", textoPauta: "Revisar hipótese de linhagem e gate financeiro" }));
    expect(r.valida).toBe(true);
  });

  it("exige texto de pauta não vazio", () => {
    expect(validarPautaParaDestino(base({ textoPauta: "" })).valida).toBe(false);
  });
});

describe("ausência de chamada externa (PROMPT 06)", () => {
  it("o módulo declara explicitamente que nunca chama API de calendário", () => {
    expect(AGENDA_ASSISTIDA_NUNCA_CHAMA_API_EXTERNA).toBe(true);
  });
});
