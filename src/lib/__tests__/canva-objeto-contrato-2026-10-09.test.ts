import { describe, expect, it } from "vitest";

import { DE_PARA_CANVA_PARAMETRO, valoresDoCanva, type PaginaCanva } from "@/lib/canva-para-parametros";

/**
 * Decisão da Proprietária (09/10/2026): a proposta do Canva rege o OBJETO do
 * contrato. Ela disse que isso "já estava na regra de extração e não foi
 * executado". Medido: NÃO estava — o de-para cobria escopo, serviços, vínculo,
 * fases, valor, pagamento, parcelas e despesas, mas não `objeto_contrato`. O
 * objeto só vinha da convenção do Planejador (texto fixo por prefixo de caso).
 *
 * A página 2 do deck da Ana (proposal_canva_pages, medido no banco do Lovable)
 * traz o objeto na chave `escopo_macro`.
 */

const OBJETO_DA_PAGINA_2 =
  "Estudo genealógico e assessoria de cidadania austríaca — trilha § 58c StbG — para o núcleo familiar";

const paginas = [
  { page_number: 1, extracao_status: "extraida", page_content_structured: { caso_contexto: "Caso CA-CID-AT-FAM-2026-001" } },
  { page_number: 2, extracao_status: "extraida", page_content_structured: { escopo_macro: OBJETO_DA_PAGINA_2 } },
] as unknown as PaginaCanva[];

describe("a proposta do Canva rege o objeto do contrato", () => {
  it("o de-para tem a regra de objeto_contrato, vinda de escopo_macro na página 2", () => {
    const linha = DE_PARA_CANVA_PARAMETRO.find((l) => l.campo === "objeto_contrato");
    expect(linha).toBeDefined();
    expect(linha?.grupo).toBe("objeto");
    expect(linha?.chaves).toEqual(["escopo_macro"]);
    expect(linha?.paginas).toEqual([2]);
  });

  it("a extração devolve o texto literal do deck, sem reescrever", () => {
    const v = valoresDoCanva(paginas).find((x) => x.campo === "objeto_contrato");
    expect(v?.valor).toBe(OBJETO_DA_PAGINA_2);
    expect(v?.pagina).toBe(2);
    expect(v?.chave).toBe("escopo_macro");
  });

  it("página não extraída não alimenta o objeto", () => {
    const naoExtraida = [{ ...paginas[1], extracao_status: "pendente" }] as unknown as PaginaCanva[];
    expect(valoresDoCanva(naoExtraida).find((x) => x.campo === "objeto_contrato")).toBeUndefined();
  });

  it("deck sem escopo_macro não inventa objeto", () => {
    const semChave = [paginas[0]] as PaginaCanva[];
    expect(valoresDoCanva(semChave).find((x) => x.campo === "objeto_contrato")).toBeUndefined();
  });
});
