import { describe, expect, it } from "vitest";

import {
  montarRascunhoComunicacao,
  templateVigente,
  TEMPLATE_CONFIRMACAO_FORMAL_JOAO,
  TEMPLATE_FOLLOW_UP_LARA,
  TEMPLATES_CONHECIDOS,
  type ContextoRascunho,
  type TemplateComunicacao,
} from "../rascunhos-comunicacao-governados";

const AGORA = "2026-08-25T12:00:00.000Z";

const ctxJoao = (over: Partial<ContextoRascunho> = {}): ContextoRascunho => ({
  proposito: "solicitar_confirmacao_formal",
  destinatarioResolvido: true,
  contextoCaso: "Aceite verbal com evidência registrado; falta confirmação escrita.",
  faseCaso: "discovery_confirmado",
  destino: "cliente",
  ...over,
});

describe("templates conhecidos (PROMPT 07) — João e Lara", () => {
  it("mensagem de João não menciona a esposa como parte contratual", () => {
    expect(TEMPLATE_CONFIRMACAO_FORMAL_JOAO.corpo.toLowerCase()).not.toMatch(
      /esposa|cônjuge|conjuge/,
    );
  });

  it("mensagem de João é curta e pede confirmação, sem prometer resultado", () => {
    const c = TEMPLATE_CONFIRMACAO_FORMAL_JOAO.corpo;
    expect(c.length).toBeLessThan(300);
    expect(c.toLowerCase()).not.toMatch(/garant|certeza|prometo/);
  });

  it("mensagem de Lara não menciona preço, resultado ou aceite já dado", () => {
    const c = TEMPLATE_FOLLOW_UP_LARA.corpo.toLowerCase();
    expect(c).not.toMatch(/r\$|preço|garant|certeza|você aceitou|confirmado/);
  });
});

describe("escolha da versão vigente do template (PROMPT 07)", () => {
  const v1: TemplateComunicacao = { ...TEMPLATE_CONFIRMACAO_FORMAL_JOAO, versao: 1 };
  const v2: TemplateComunicacao = {
    ...TEMPLATE_CONFIRMACAO_FORMAL_JOAO,
    versao: 2,
    corpo: "versão nova",
  };
  const v1Antiga: TemplateComunicacao = { ...v1, vigente: false };

  it("escolhe a maior versão vigente", () => {
    const t = templateVigente([v1, v2], "solicitar_confirmacao_formal", AGORA);
    expect(t?.versao).toBe(2);
  });

  it("ignora versão não vigente", () => {
    const t = templateVigente([v1Antiga, v2], "solicitar_confirmacao_formal", AGORA);
    expect(t?.versao).toBe(2);
  });

  it("template expirado não é escolhido", () => {
    const expirado: TemplateComunicacao = { ...v2, expiraEm: "2026-01-01T00:00:00.000Z" };
    const t = templateVigente([v1, expirado], "solicitar_confirmacao_formal", AGORA);
    expect(t?.versao).toBe(1);
  });

  it("sem nenhuma versão vigente e não expirada, devolve null — nunca cai para versão antiga", () => {
    const expirado: TemplateComunicacao = { ...v2, expiraEm: "2026-01-01T00:00:00.000Z" };
    const t = templateVigente([v1Antiga, expirado], "solicitar_confirmacao_formal", AGORA);
    expect(t).toBeNull();
  });
});

describe("montarRascunhoComunicacao — bloqueios antes da sugestão (PROMPT 07)", () => {
  it("gera rascunho_interno quando tudo está resolvido", () => {
    const r = montarRascunhoComunicacao(TEMPLATES_CONHECIDOS, ctxJoao(), AGORA);
    expect(r.estado).toBe("rascunho_interno");
    if (r.estado === "rascunho_interno") {
      expect(r.origem.templateId).toBe(TEMPLATE_CONFIRMACAO_FORMAL_JOAO.id);
      expect(r.corpo).toBe(TEMPLATE_CONFIRMACAO_FORMAL_JOAO.corpo);
    }
  });

  it("bloqueia sem destinatário resolvido", () => {
    const r = montarRascunhoComunicacao(
      TEMPLATES_CONHECIDOS,
      ctxJoao({ destinatarioResolvido: false }),
      AGORA,
    );
    expect(r.estado).toBe("bloqueado");
    if (r.estado === "bloqueado") expect(r.motivos.join(" ")).toMatch(/destinatário/i);
  });

  it("bloqueia sem contexto do caso", () => {
    const r = montarRascunhoComunicacao(TEMPLATES_CONHECIDOS, ctxJoao({ contextoCaso: "" }), AGORA);
    expect(r.estado).toBe("bloqueado");
  });

  it("bloqueia sem fase do caso", () => {
    const r = montarRascunhoComunicacao(TEMPLATES_CONHECIDOS, ctxJoao({ faseCaso: null }), AGORA);
    expect(r.estado).toBe("bloqueado");
  });

  it("bloqueia quando não há template vigente para o propósito informado", () => {
    const r = montarRascunhoComunicacao(
      TEMPLATES_CONHECIDOS,
      ctxJoao({ proposito: "propósito-inexistente" }),
      AGORA,
    );
    expect(r.estado).toBe("bloqueado");
    if (r.estado === "bloqueado") expect(r.motivos.join(" ")).toMatch(/nenhuma versão vigente/i);
  });

  it("bloqueia quando o corpo do template reprova a revisão de terminologia", () => {
    const templateSuspeito: TemplateComunicacao = {
      ...TEMPLATE_CONFIRMACAO_FORMAL_JOAO,
      corpo: "Seu score de elegibilidade está ótimo, vamos confirmar?",
    };
    const r = montarRascunhoComunicacao([templateSuspeito], ctxJoao(), AGORA);
    expect(r.estado).toBe("bloqueado");
    if (r.estado === "bloqueado") expect(r.motivos.join(" ")).toMatch(/terminologia/i);
  });

  it("usa o modelo de Lara para o propósito de convite de agendamento", () => {
    const r = montarRascunhoComunicacao(
      TEMPLATES_CONHECIDOS,
      ctxJoao({
        proposito: "convite_agendamento_reuniao",
        contextoCaso: "Proposta pronta, reunião não marcada.",
      }),
      AGORA,
    );
    expect(r.estado).toBe("rascunho_interno");
    if (r.estado === "rascunho_interno")
      expect(r.origem.templateId).toBe(TEMPLATE_FOLLOW_UP_LARA.id);
  });
});

describe("auditabilidade e ausência de handler de envio (PROMPT 07)", () => {
  it("todo rascunho gerado traz a origem exata (template + versão)", () => {
    const r = montarRascunhoComunicacao(TEMPLATES_CONHECIDOS, ctxJoao(), AGORA);
    expect(r.estado).toBe("rascunho_interno");
    if (r.estado === "rascunho_interno") {
      expect(r.origem).toEqual({
        templateId: TEMPLATE_CONFIRMACAO_FORMAL_JOAO.id,
        versao: TEMPLATE_CONFIRMACAO_FORMAL_JOAO.versao,
      });
    }
  });

  it("o módulo não exporta nenhuma função de envio, criação de contato, campanha ou fila externa", async () => {
    const modulo = await import("../rascunhos-comunicacao-governados");
    const nomes = Object.keys(modulo);
    const suspeitos = nomes.filter((n) =>
      /enviar|send|dispatch|disparar|contato|campanha/i.test(n),
    );
    expect(suspeitos).toEqual([]);
  });
});
