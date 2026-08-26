import { describe, expect, it } from "vitest";

import {
  CAMPOS_ESCOPO_PROPOSTA,
  MAPA_ESCOPO_DESTINO,
  extrairEscopoDaProposta,
  mapaCoberturaEscopo,
  validarPropostaCanva,
  type PropostaCanva,
} from "@/lib/escopo-proposta";

const CASE = "11111111-1111-1111-1111-111111111111";

const base: PropostaCanva = {
  id: "p1",
  case_id: CASE,
  versao: 1,
  status: "aprovada",
  archived_at: null,
  origem: "canva",
  origem_referencia: "DECK-ANA-V1",
  paginas_registradas: [1, 2, 3, 4, 5, 6, 7],
  escopo_paginas: { "3": { servicos_incluidos: "Pesquisa documental" } },
};

describe("escopo da proposta Canva", () => {
  it("todo campo de escopo tem parâmetro e anexo de destino", () => {
    for (const c of CAMPOS_ESCOPO_PROPOSTA) {
      const d = MAPA_ESCOPO_DESTINO.find((m) => m.campo === c.campo);
      expect(d, c.campo).toBeTruthy();
      expect(d!.parametros.length).toBeGreaterThan(0);
      expect(d!.anexos.length).toBeGreaterThan(0);
    }
  });

  it("invalida proposta sem páginas 1–7 ou fora do caso", () => {
    expect(validarPropostaCanva({ ...base, paginas_registradas: [1, 2] }, CASE).valida).toBe(false);
    expect(validarPropostaCanva(base, "outro").valida).toBe(false);
    expect(validarPropostaCanva(base, CASE).valida).toBe(true);
  });

  it("classifica cobertura, pendência e divergência campo a campo", () => {
    const extraidos = extrairEscopoDaProposta(base);
    const linhas = mapaCoberturaEscopo({
      proposta: base,
      extraidos,
      valores: [
        {
          campo: "servicos_incluidos",
          valor: "Pesquisa documental",
          origem: "proposta",
          status: "validado",
        },
        {
          campo: "valor_total",
          valor: "R$ 30.000",
          origem: "whatsapp",
          status: "importado_a_confirmar",
        },
      ],
    });
    const porCampo = (c: string) => linhas.find((l) => l.campo === c)!;

    expect(porCampo("servicos_incluidos").estado).toBe("coberto");
    expect(porCampo("servicos_excluidos").estado).toBe("nao_localizado_na_proposta");
    expect(porCampo("prazo_validade").estado).toBe("opcional_nao_declarado");
    expect(porCampo("valor_total").estado).toBe("divergente");
    expect(porCampo("valor_total").divergencia).toContain("whatsapp");
    expect(porCampo("valor_total").anexos).toContain("ANX-COMERCIAL");
  });
});
