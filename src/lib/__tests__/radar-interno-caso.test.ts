import { describe, expect, it } from "vitest";

import { radarInternoDoCaso } from "@/lib/radar-interno-caso";

describe("radarInternoDoCaso", () => {
  it("devolve exatamente os 4 eixos canônicos, mesma taxonomia do Radar do cliente", () => {
    const eixos = radarInternoDoCaso({
      caso: {},
      nucleoCompletude: false,
      nucleoCriterios: [],
      checksAtivacao: [],
      bloqueiosReais: [],
    });
    expect(eixos.map((e) => e.id)).toEqual(["historia", "documentos", "estrategia", "proximos"]);
  });

  it("história fica 'identificado' só quando o núcleo está completo", () => {
    const completo = radarInternoDoCaso({
      caso: {},
      nucleoCompletude: true,
      nucleoCriterios: [{ chave: "a", rotulo: "A", ok: true, motivo: null }],
      checksAtivacao: [],
      bloqueiosReais: [],
    });
    expect(completo.find((e) => e.id === "historia")!.estado).toBe("identificado");

    const parcial = radarInternoDoCaso({
      caso: {},
      nucleoCompletude: false,
      nucleoCriterios: [{ chave: "a", rotulo: "A", ok: true, motivo: null }],
      checksAtivacao: [],
      bloqueiosReais: [],
    });
    expect(parcial.find((e) => e.id === "historia")!.estado).toBe("em_confirmacao");
  });

  it("documentos conta requisitos confirmados sobre o total real", () => {
    const eixos = radarInternoDoCaso({
      caso: {},
      nucleoCompletude: false,
      nucleoCriterios: [],
      checksAtivacao: [
        { check_key: "a", label: "A", status: "ok", dominio: "x", obrigatorio: true },
        { check_key: "b", label: "B", status: "pendente", dominio: "x", obrigatorio: true },
      ],
      bloqueiosReais: [],
    });
    const documentos = eixos.find((e) => e.id === "documentos")!;
    expect(documentos.estado).toBe("em_confirmacao");
    expect(documentos.itens[0]).toEqual({ rotulo: "Requisitos confirmados", valor: "1 de 2" });
  });

  it("estratégia só mostra hipótese/via/país quando o caso tem esses dados — nunca inventa", () => {
    const semDados = radarInternoDoCaso({
      caso: {},
      nucleoCompletude: false,
      nucleoCriterios: [],
      checksAtivacao: [],
      bloqueiosReais: [],
    });
    expect(semDados.find((e) => e.id === "estrategia")!.itens).toEqual([]);

    const comDados = radarInternoDoCaso({
      caso: { hipotese_elegibilidade: "Bisneto ítalo", via: "judicial", pais: "Itália" },
      nucleoCompletude: false,
      nucleoCriterios: [],
      checksAtivacao: [],
      bloqueiosReais: [],
    });
    expect(comDados.find((e) => e.id === "estrategia")!.itens).toHaveLength(3);
  });

  it("próximos passos usa o primeiro bloqueio real, sem inventar próxima etapa", () => {
    const liberado = radarInternoDoCaso({
      caso: {},
      nucleoCompletude: false,
      nucleoCriterios: [],
      checksAtivacao: [],
      bloqueiosReais: [],
    });
    expect(liberado.find((e) => e.id === "proximos")!.estado).toBe("identificado");

    const bloqueado = radarInternoDoCaso({
      caso: {},
      nucleoCompletude: false,
      nucleoCriterios: [],
      checksAtivacao: [],
      bloqueiosReais: [{ regra: "R1", dominio: "financeiro", motivo: "Pagamento pendente", cta_tela: "/financeiro" }],
    });
    const proximos = bloqueado.find((e) => e.id === "proximos")!;
    expect(proximos.estado).toBe("em_confirmacao");
    expect(proximos.itens.some((i) => i.valor.includes("Pagamento pendente"))).toBe(true);
  });
});
