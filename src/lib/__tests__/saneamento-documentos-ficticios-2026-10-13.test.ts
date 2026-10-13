import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * 13/10/2026 — saneamento autorizado pela Proprietária.
 *
 * `AcervoEmConferencia` (src/routes/portal/documentos.tsx) exibia três
 * documentos específicos ("Graz, Áustria · 1895", "Dossiê Genealógico da
 * Família", "Registro da Comunidade Israelita · Viena · 1938–39") sempre
 * que o acervo real estava vazio — tanto na prévia administrativa de caso
 * real (linha ~71) quanto na sessão autenticada real (linha ~220). Nenhum
 * dos dois pontos é demonstração isolada: o conteúdo aparecia na
 * experiência real. "Graz" e "Friedmann-Reimer" não eram nem genéricos —
 * são o núcleo real da Ana Luiza (`decisoes-operacionais.ts`), hardcoded
 * de forma visível a qualquer cliente real com acervo vazio.
 *
 * Este teste trava o saneamento: nenhum título/local específico de caso no
 * componente, e as duas chamadas continuam existindo (a moldura do mockup
 * aprovado — ícone de cadeado, "Acervo sob curadoria técnica" — é
 * preservada; só o conteúdo some).
 */
const rota = readFileSync("src/routes/portal/documentos.tsx", "utf8");

describe("Documentos (App Cliente) — acervo vazio nunca mostra documento inventado", () => {
  it("nenhum título, local ou nome de caso real/fictício aparece em AcervoEmConferencia", () => {
    const inicio = rota.indexOf("function AcervoEmConferencia");
    expect(inicio).toBeGreaterThan(-1);
    const trecho = rota.slice(inicio, rota.indexOf("\n}\n", inicio) + 3);
    for (const proibido of [
      "Graz",
      "Áustria",
      "Friedmann-Reimer",
      "Comunidade Israelita",
      "Viena",
      "1895",
      "1938",
      "Dossiê Genealógico da Família",
      "ACERVO_EM_CONFERENCIA",
    ]) {
      expect(trecho).not.toContain(proibido);
    }
    expect(trecho).toContain("Nenhum documento enviado ainda");
  });

  it("os dois pontos de uso continuam ali — a moldura do cartão vazio não desapareceu", () => {
    const usos = [...rota.matchAll(/<AcervoEmConferencia \/>/g)];
    expect(usos.length).toBe(2);
    expect(rota).toContain("Acervo sob curadoria técnica");
    expect(rota).toContain("LockKeyhole");
  });

  it("upload, download, solicitações e persistência continuam intactos (não tocados por este corte)", () => {
    expect(rota).toContain("EnviarDocumento");
    expect(rota).toContain("baixarEntrega");
    expect(rota).toContain("minhasEntregas");
    expect(rota).toContain("data-documentos-solicitados");
  });

  it("não cria estado de zero artificial: ausência de registros continua distinta de carregando/erro", () => {
    // isLoading e erroLeitura seguem como ramos próprios, antes do vazio honesto.
    expect(rota).toContain("isLoading ? (");
    expect(rota).toContain("erroLeitura");
    expect(rota).toContain("AvisoFalhaConexao");
  });
});
