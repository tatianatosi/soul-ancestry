import { describe, expect, it } from "vitest";

import {
  sanitizarItemLegado,
  visibilidadeLegado,
  contemTermoInterno,
  LEGADO_VAZIO_TITULO,
} from "@/lib/legado-visibilidade";

const base = {
  titulo: "Retrato da linhagem materna",
  texto: "Material publicado sobre a trajetória da família.",
  pessoa_relacionada: "Família Piccoli",
  data: "10/08/2026",
  origem: "app_projection" as const,
  autorizado: true,
  publicado: true,
};

describe("Legado — visibilidade e sanitização", () => {
  it("1. sem itens: estado vazio sanitizado e navegável", () => {
    const r = visibilidadeLegado([]);
    expect(r.navegavel).toBe(true);
    expect(r.estado).toBe("sem_conteudo_publicado");
    expect(r.titulo).toBe(LEGADO_VAZIO_TITULO);
    expect(r.itens).toHaveLength(0);
    expect(r.permiteUpsell).toBe(false);
  });

  it("2. item autorizado e publicado aparece", () => {
    const r = visibilidadeLegado([base]);
    expect(r.estado).toBe("com_conteudo_publicado");
    expect(r.itens[0]?.titulo).toBe(base.titulo);
  });

  it("3. item não publicado ou não autorizado é descartado", () => {
    expect(sanitizarItemLegado({ ...base, publicado: false })).toBeNull();
    expect(sanitizarItemLegado({ ...base, autorizado: false })).toBeNull();
  });

  it("4. origem fora de app_projection/client_deliverable é descartada", () => {
    expect(sanitizarItemLegado({ ...base, origem: "evidences" })).toBeNull();
    expect(sanitizarItemLegado({ ...base, origem: null })).toBeNull();
  });

  it("5. campos internos não são projetados", () => {
    const s = sanitizarItemLegado({
      ...base,
      tipo_evidencia: "pendente_validacao",
      fonte: "Arquivo paroquial X",
      hipotese: "linha materna provável",
      risco: "documento pode não existir",
      preco: 12000,
      documento_interno: "dossie.pdf",
    });
    expect(s).not.toBeNull();
    expect(Object.keys(s!)).toEqual(["titulo", "texto", "pessoa_relacionada", "data", "origem"]);
  });

  it("6. textos com termos internos são suprimidos", () => {
    expect(contemTermoInterno("Hipótese de elegibilidade")).toBe(true);
    const s = sanitizarItemLegado({ ...base, texto: "Fonte: arquivo interno da pesquisa externa" });
    expect(s?.texto).toBe("");
  });

  it("7. título com termo interno invalida o item inteiro", () => {
    expect(sanitizarItemLegado({ ...base, titulo: "Risco documental na linha paterna" })).toBeNull();
  });

  it("8. client_deliverable autorizado também é aceito", () => {
    const r = visibilidadeLegado([{ ...base, origem: "client_deliverable" }]);
    expect(r.itens[0]?.origem).toBe("client_deliverable");
  });
});
