import { describe, expect, it } from "vitest";

import { PERFIL_INSTITUCIONAL, valorInstitucional } from "@/lib/contrato-base-consolidado";
import { renderCorpoContratual } from "@/lib/contrato-corpo.server";

/**
 * Achado ao LER o PDF gerado da prévia da Ana (09/10/2026): a seção "Perfil
 * institucional da contratada" imprimia todos os campos do perfil, inclusive
 *
 *   "WhatsApp: Canal institucional homologado/configurado — não inferir nem
 *    usar número pessoal"
 *
 * Isso é uma instrução interna de uso do perfil, não dado da contratada, e
 * estava dentro do texto do contrato.
 */

const entrada = {
  caseId: "CASE-TESTE",
  casoCodigo: "CA-2026-TESTE-001",
  clienteNome: "Cliente TESTE",
  responsavel: "Operações",
  valores: [],
  anexosInternos: [],
};

describe("o contrato não imprime instrução interna do perfil institucional", () => {
  const html = renderCorpoContratual(entrada).html;

  it("o valor do WhatsApp no perfil é de fato uma instrução, não um número", () => {
    // Premissa do teste: se um dia o perfil ganhar um número real, este teste
    // deve ser revisto — e o contrato passa a imprimi-lo.
    expect(valorInstitucional("whatsapp").replace(/\D/g, "").length).toBeLessThan(10);
  });

  it("a instrução interna não vai para o contrato", () => {
    expect(html).not.toContain("não inferir");
    expect(html).not.toContain("número pessoal");
    expect(html).not.toContain("homologado/configurado");
    expect(html).not.toContain("<strong>WhatsApp:</strong>");
  });

  it("os demais campos do perfil continuam impressos", () => {
    for (const campo of PERFIL_INSTITUCIONAL.filter((c) => c.campo !== "whatsapp")) {
      expect(html).toContain(campo.rotulo);
      expect(html).toContain(campo.valor.replace(/&/g, "&amp;"));
    }
  });
});
