import { describe, expect, it } from "vitest";
import { briefPreCall, reguaJornadaLead } from "@/lib/regua-jornada-lead";

describe("Régua da jornada do lead — só lê o que está gravado", () => {
  it("lead vazio: sete etapas, nada concluído, ausência explícita", () => {
    const r = reguaJornadaLead({});
    expect(r.map((e) => e.rotulo)).toEqual(["Origem", "Varredura", "Discovery", "Validação jurídica", "Proposta", "Contrato", "Caso 360"]);
    expect(r.some((e) => e.estado === "concluido")).toBe(false);
    expect(r[0].detalhe).toBe("Não registrado");
  });
  it("contrato vinculado nunca vira concluído (assinatura é ato separado)", () => {
    expect(reguaJornadaLead({ contrato_link_interno: "x" })[5].estado).toBe("andamento");
  });
  it("varredura só conclui com sugestão aceita", () => {
    expect(reguaJornadaLead({}, [{ decisao: "rejeitada" }])[1].estado).toBe("andamento");
    expect(reguaJornadaLead({}, [{ decisao: "aceita" }])[1].estado).toBe("concluido");
  });
});

describe("Brief pré-call — nada preenchido sozinho", () => {
  it("campo vazio sem sugestão = Não registrado; sugestão pendente fica a confirmar", () => {
    const b = briefPreCall({}, [{ campo: "objecao_predominante", valor: "prazo" }]);
    expect(b.find((l) => l.campo === "objecao_predominante")?.estado).toBe("sugerido");
    expect(b.find((l) => l.campo === "geracao_ascendente")?.estado).toBe("nao_registrado");
  });
});
