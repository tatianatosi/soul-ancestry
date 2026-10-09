import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { geradaEm, previaDefasada, type PreviaRegistro } from "@/lib/previa-vigente";
import { qualificacaoCompletaContratada, qualificacaoContratadaCoerente } from "@/lib/contrato-base-consolidado";

/**
 * Medido no contrato da Ana (prévia 470a93d3) em 09/10/2026:
 *   created_at / congelado_em = 2026-08-21 15:16
 *   updated_at                = 2026-10-08 11:02
 *   último parâmetro COM valor= 2026-10-08 11:08  (pais_rota)
 *
 * E o HTML guardado já contém "Ordem de Serviço (Anexo I)", seção criada em
 * 07/10 — prova de que a prévia foi regerada depois de 21/08.
 *
 * Defeito da primeira versão da regra: `gerarPrevia` ATUALIZA o rascunho no
 * lugar e nunca mexe em `created_at`. Lendo `created_at`, a trava de
 * "Prévia desatualizada" NUNCA limparia — nem segundos após regerar.
 */

const RASCUNHO_ANA: PreviaRegistro = {
  id: "470a93d3",
  versao: 0,
  estado: "rascunho_editavel",
  corpo_contratual: true,
  created_at: "2026-08-21T15:16:04Z",
  congelado_em: "2026-08-21T15:16:04Z",
  updated_at: "2026-10-08T11:02:17Z",
};

describe("rascunho atualizado no lugar vale pela última gravação", () => {
  it("geradaEm do rascunho é updated_at, não created_at", () => {
    expect(geradaEm(RASCUNHO_ANA)).toBe("2026-10-08T11:02:17Z");
  });

  it("versão congelada continua valendo pelo congelamento", () => {
    const congelada: PreviaRegistro = {
      id: "v6",
      versao: 6,
      estado: "congelado",
      congelado_em: "2026-08-17T20:44:58Z",
      created_at: "2026-08-17T20:44:58Z",
      updated_at: "2026-10-08T18:00:00Z",
    };
    expect(geradaEm(congelada)).toBe("2026-08-17T20:44:58Z");
  });

  it("a trava limpa depois de regerar — era o defeito", () => {
    // Parâmetro mudou 11:08; prévia regerada 11:30 → em dia.
    const regerada = { ...RASCUNHO_ANA, updated_at: "2026-10-08T11:30:00Z" };
    expect(previaDefasada(regerada, "2026-10-08T11:08:21Z")).toBe(false);
    // Pela regra antiga (created_at 21/08) ficaria defasada para sempre.
    expect(previaDefasada({ ...regerada, updated_at: null }, "2026-10-08T11:08:21Z")).toBe(true);
  });

  it("o estado real da Ana: defasada por 6 minutos, não por 7 semanas", () => {
    expect(previaDefasada(RASCUNHO_ANA, "2026-10-08T11:08:21Z")).toBe(true);
    expect(previaDefasada(RASCUNHO_ANA, "2026-10-08T11:00:00Z")).toBe(false);
  });
});

describe("parâmetro sem valor não marca o documento como velho", () => {
  it("a tela e os dois servidores filtram valor vazio", () => {
    const tela = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");
    expect(tela).toContain('.filter((v) => String(v.valor ?? "").trim() !== "")');
    for (const f of ["src/lib/contrato-pdf.functions.ts", "src/lib/contrato-docx.functions.ts"]) {
      const fn = readFileSync(f, "utf8");
      expect(fn).toContain('.not("valor", "is", null)');
      expect(fn).toContain("updated_at");
    }
  });
});

describe("qualificação da contratada vem do perfil institucional", () => {
  const fn = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");

  it("o texto canônico traz os canais oficiais — o digitado à mão não trazia", () => {
    const c = qualificacaoCompletaContratada();
    expect(c).toContain("Canais oficiais");
    expect(c).toContain("CNPJ");
  });

  it("divergência passa a ser corrigida, não só campo vazio", () => {
    expect(fn).toContain("const canonico = qualificacaoCompletaContratada();");
    expect(fn).toContain("if (atual === canonico || qualificacaoContratadaCoerente(atual)) return valores;");
  });

  /*
   * Regressão MINHA, achada em 09/10/2026 ao comparar com o perfil: o texto
   * canônico terminava com o valor cru do campo `whatsapp` — que não é um
   * número, é a instrução interna "Canal institucional homologado/configurado
   * — não inferir nem usar número pessoal" — e não dizia quem representa a
   * contratada. A reconciliação publicada em 911aaf9a trocaria o texto bom da
   * Ana por esse pior. Agora: o canônico traz o representante, não traz
   * instrução interna, e texto coerente com o perfil nunca é sobrescrito.
   */
  const ANA_GRAVADO =
    'TATIANA MELANI TOSI – ME, operando sob o nome "Clube Ancestral", CNPJ 10.448.812/0001-58 · com sede em Rua Nova York, 822, Apt. 142, Brooklin, CEP 04560-001, São Paulo – SP, Brasil · representada por Tatiana Melani Tosi · e-mail oficial atendimento@clubeancestral.com.br, site https://clubeancestral.com.br';

  it("o texto canônico diz quem representa a contratada", () => {
    expect(qualificacaoCompletaContratada()).toContain("representada por Tatiana Melani Tosi");
  });

  it("nenhuma instrução interna do perfil vai parar dentro do contrato", () => {
    const c = qualificacaoCompletaContratada();
    expect(c).not.toContain("não inferir");
    expect(c).not.toContain("número pessoal");
    expect(c).not.toContain("homologado/configurado");
  });

  it("o texto hoje gravado na Ana é coerente com o perfil — e por isso fica intocado", () => {
    expect(qualificacaoContratadaCoerente(ANA_GRAVADO)).toBe(true);
    expect(qualificacaoContratadaCoerente(qualificacaoCompletaContratada())).toBe(true);
  });

  it("faltar ou divergir um fato do perfil torna o texto incoerente", () => {
    expect(qualificacaoContratadaCoerente(ANA_GRAVADO.replace("representada por Tatiana Melani Tosi", ""))).toBe(false);
    expect(qualificacaoContratadaCoerente(ANA_GRAVADO.replace("10.448.812/0001-58", "00.000.000/0000-00"))).toBe(false);
    expect(qualificacaoContratadaCoerente("")).toBe(false);
    expect(qualificacaoContratadaCoerente(null)).toBe(false);
  });

  it("nunca toca contrato assinado", () => {
    expect(fn).toContain("contratoAssinadoDoRegistro");
    expect(fn).toContain('.select("signed_at")');
  });

  it("a troca fica auditada", () => {
    expect(fn).toContain("qualificacao_contratada_reconciliada_com_perfil_institucional");
  });
});
