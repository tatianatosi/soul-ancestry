import { describe, expect, it } from "vitest";

import { entradaDoPlano } from "@/lib/cadeia-operacional.server";

describe("entradaDoPlano — duas fontes reais com schemas diferentes (achado 08/09)", () => {
  it("lê case_plans (schema completo) sem perder nenhum campo", () => {
    const casePlan = {
      objetivo: "Cidadania italiana por linha materna",
      etapa: "Discovery concluído",
      composicao: "nucleo_familiar",
      rota_confirmada: "Itália",
      checklist_aplicavel: ["Documentos de identidade"],
      dependencias_cliente: ["Enviar certidão original"],
      dependencias_terceiros: ["Cartório emitir 2ª via"],
      fontes: { certidao: { estado: "confirmada", referencia: "cartório" } },
      responsavel_user_id: "user-1",
      proxima_acao: "Solicitar apostila",
      prazo_proxima_acao: "2026-10-01",
      fase_jornada: "Fase 01 — Estudo",
      perguntas: ["Confirmar grafia do sobrenome"],
      marcos: ["Assinatura do contrato"],
      entregas: ["Dossiê documental completo"],
      microentregas: ["Certidão de nascimento localizada"],
      regras_anexos: ["ANX-IT"],
    };

    const entrada = entradaDoPlano(casePlan, "case-1", "PP-01");

    expect(entrada.objetivo).toBe("Cidadania italiana por linha materna");
    expect(entrada.composicao).toBe("nucleo_familiar");
    expect(entrada.entregas).toEqual(["Dossiê documental completo"]);
    expect(entrada.fontes).toEqual([{ chave: "certidao", estado: "confirmada", referencia: "cartório" }]);
  });

  it("lê blueprint_parameters (schema reduzido): entregas_previstas vira entregas, o resto é pendência honesta", () => {
    const blueprint = {
      entregas_previstas: ["Relatório F1", "Relatório F2"],
      criterios_aceite: ["Escopo idêntico à proposta aprovada"],
      condicao_comercial_padrao: "a confirmar na conferência comercial",
    };

    const entrada = entradaDoPlano(blueprint, "case-2", null);

    // Real, não perdido: entregas_previstas é o mesmo conceito de entregas.
    expect(entrada.entregas).toEqual(["Relatório F1", "Relatório F2"]);

    // Genuinamente ausente na fonte — null/[] honesto, nunca inventado.
    expect(entrada.objetivo).toBeNull();
    expect(entrada.etapa).toBeNull();
    expect(entrada.composicao).toBeNull();
    expect(entrada.rotaConfirmada).toBeNull();
    expect(entrada.marcos).toEqual([]);
    expect(entrada.checklist).toEqual([]);
    expect(entrada.perguntas).toEqual([]);
    expect(entrada.responsavelUserId).toBeNull();
    expect(entrada.proximaAcao).toBeNull();
    expect(entrada.prazoProximaAcao).toBeNull();
  });

  it("case_plans com `entregas` tem prioridade sobre `entregas_previstas` quando por algum motivo as duas existirem na mesma linha", () => {
    const linha = { entregas: ["Real"], entregas_previstas: ["Não deveria aparecer"] };
    const entrada = entradaDoPlano(linha, "case-3", null);
    expect(entrada.entregas).toEqual(["Real"]);
  });
});
