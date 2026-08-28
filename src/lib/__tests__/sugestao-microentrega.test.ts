import { describe, expect, it } from "vitest";
import { sugerirProximaMicroentrega } from "@/lib/onboarding-jornada";

/**
 * 28/08/2026 — "a ana fechou, deu o seu aceite verbal, deu o aceite escrito,
 * qual será a primeira microentrega no app" (Proprietária). A biblioteca de
 * micro-entregas era só formulário em branco. Este é o caso real que motivou
 * a engine: aceite verbal + confirmação formal recebida, contrato ainda não
 * assinado.
 */
describe("sugerirProximaMicroentrega", () => {
  it("caso da Ana: aceite verbal + confirmação formal, contrato ainda não assinado → boas-vindas", () => {
    const sugestao = sugerirProximaMicroentrega({
      eixoComercial: "confirmacao_formal_recebida",
      eixoFormalizacao: "formalizacao_em_preparacao",
    });
    expect(sugestao).not.toBeNull();
    expect(sugestao?.tipo).toBe("boas_vindas");
    expect(sugestao?.fase).toBe("aceite_e_formalizacao");
    expect(sugestao?.motivo).toContain("silêncio");
  });

  it("sem aceite comercial registrado, não sugere nada — nunca inventa estágio", () => {
    expect(sugerirProximaMicroentrega({ eixoComercial: "negociacao" })).toBeNull();
    expect(sugerirProximaMicroentrega({ eixoComercial: null })).toBeNull();
    expect(sugerirProximaMicroentrega({})).toBeNull();
  });

  it("contrato assinado, pagamento ainda não confirmado → plano de ação", () => {
    const sugestao = sugerirProximaMicroentrega({
      eixoComercial: "aceite_verbal",
      eixoFormalizacao: "contrato_assinado",
    });
    expect(sugestao?.tipo).toBe("plano_de_acao");
  });

  it("pagamento confirmado, onboarding ainda não iniciado → checklist documental", () => {
    const sugestao = sugerirProximaMicroentrega({
      eixoComercial: "confirmacao_formal_recebida",
      eixoFormalizacao: "cliente_ativo",
    });
    expect(sugestao?.tipo).toBe("checklist_documental");
    expect(sugestao?.fase).toBe("onboarding");
  });

  it("onboarding iniciado, caso ainda não ativo → árvore inicial", () => {
    const sugestao = sugerirProximaMicroentrega({
      eixoComercial: "confirmacao_formal_recebida",
      eixoFormalizacao: "onboarding_iniciado",
    });
    expect(sugestao?.tipo).toBe("arvore_inicial");
    expect(sugestao?.fase).toBe("pesquisa_inicial");
  });

  it("caso já ativo — a fila de execução já tem microentregas próprias, não sugere 'primeira'", () => {
    expect(
      sugerirProximaMicroentrega({ eixoComercial: "confirmacao_formal_recebida", eixoFormalizacao: "caso_ativo" }),
    ).toBeNull();
  });
});
