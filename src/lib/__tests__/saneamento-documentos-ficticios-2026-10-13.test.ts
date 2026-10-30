import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * 13/10/2026 — saneamento autorizado pela Proprietária.
 *
 * A tela de Documentos do App Cliente exibia três documentos específicos
 * ("Graz, Áustria · 1895", "Dossiê Genealógico da Família", "Registro da
 * Comunidade Israelita · Viena · 1938–39") sempre que o acervo real estava
 * vazio, tanto na prévia administrativa de caso real quanto na sessão
 * autenticada real. "Graz" e "Friedmann-Reimer" são o núcleo real da Ana
 * Luiza, hardcoded de forma visível a qualquer cliente com acervo vazio.
 *
 * 30/10/2026: a tela foi reescrita depois desse corte e o componente
 * `AcervoEmConferencia` deixou de existir. Este teste passa a travar o
 * invariante, não a estrutura antiga: nenhum documento inventado volta à
 * rota, e o vazio continua honesto e separado de carregando/erro.
 */
const rota = readFileSync("src/routes/portal/documentos.tsx", "utf8");

describe("Documentos (App Cliente) — acervo vazio nunca mostra documento inventado", () => {
  it("nenhum título, local ou nome de caso real/fictício aparece na rota", () => {
    for (const proibido of [
      "Graz",
      "Friedmann-Reimer",
      "Comunidade Israelita",
      "Viena",
      "1895",
      "1938",
      "Dossiê Genealógico da Família",
      "ACERVO_EM_CONFERENCIA",
    ]) {
      expect(rota).not.toContain(proibido);
    }
  });

  it("o vazio é honesto: diz que não há documento, sem inventar um", () => {
    expect(rota).toContain("Nenhum documento");
  });

  it("upload, download e solicitações continuam na rota", () => {
    expect(rota).toContain("EnviarDocumento");
    expect(rota).toContain("baixarEntrega");
    expect(rota).toContain("minhasEntregas");
    expect(rota).toContain("data-documentos-solicitados");
  });

  it("não cria estado de zero artificial: ausência de registros continua distinta de carregando/erro", () => {
    expect(rota).toContain("isLoading");
    expect(rota).toContain("erroLeitura");
    expect(rota).toContain("AvisoFalhaConexao");
  });
});
