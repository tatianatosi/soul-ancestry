import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  AVISO_DOCUMENTO_CONTRATO,
  corpoDaPrevia,
  documentoImprimivelDoContrato,
  escaparHtml,
  nomeArquivoContrato,
} from "@/lib/contrato-impressao";

/**
 * Proprietária, 04/10/2026: "acredito que ainda falta criar e disponibilizar
 * PDF doc, revise."
 *
 * Medição: estava certo. Nenhum módulo de contrato mencionava PDF e a prévia
 * só existia dentro de um `<iframe sandbox="">` da tela — sem imprimir, sem
 * baixar, sem anexar. O contrato não tinha saída em documento nenhuma.
 */

const ID = {
  caso: "CA-CID-AT-FAM-2026-001",
  instrumento: "Contrato de Estudo Genealógico v2",
  versao: "versão v3 (congelada)",
  revisao: "aprovada em 03/10/2026",
  geradoEm: "04/10/2026 09:30",
};

describe("Documento do contrato — imprimir e salvar em PDF (04/10/2026)", () => {
  it("1. o documento identifica caso, instrumento, versão e estado da revisão", () => {
    const doc = documentoImprimivelDoContrato("<h2>Cláusula 1</h2><p>Texto</p>", ID);
    expect(doc).toContain("CA-CID-AT-FAM-2026-001");
    expect(doc).toContain("Contrato de Estudo Genealógico v2");
    expect(doc).toContain("versão v3 (congelada)");
    expect(doc).toContain("aprovada em 03/10/2026");
    expect(doc).toContain("04/10/2026 09:30");
  });

  it("2. leva o conteúdo da prévia, sem reescrever cláusula nenhuma", () => {
    const doc = documentoImprimivelDoContrato("<h2>Cláusula 1 — Partes</h2><p>Ana Luiza</p>", ID);
    expect(doc).toContain("Cláusula 1 — Partes");
    expect(doc).toContain("Ana Luiza");
    const mod = readFileSync("src/lib/contrato-impressao.ts", "utf8");
    expect(mod).not.toContain("CLAUSULAS");
    expect(mod).not.toContain("createServerFn");
  });

  it("3. diz, no próprio documento, que não é via assinada", () => {
    const doc = documentoImprimivelDoContrato("<p>x</p>", ID);
    expect(AVISO_DOCUMENTO_CONTRATO).toContain("Não é via assinada");
    expect(doc).toContain("Não é via assinada");
    expect(doc).toContain("ato humano explícito");
    // Aparece no corpo e se repete no rodapé de cada página impressa.
    expect(doc.split("Não é via assinada").length - 1).toBe(2);
  });

  it("4. não aninha documento: o corpo da prévia é extraído do invólucro", () => {
    const comInvolucro = "<!doctype html><html><head><title>x</title></head><body><p>conteúdo</p></body></html>";
    expect(corpoDaPrevia(comInvolucro)).toBe("<p>conteúdo</p>");
    const doc = documentoImprimivelDoContrato(comInvolucro, ID);
    expect(doc.match(/<html/g)?.length).toBe(1);
    expect(doc.match(/<body/g)?.length).toBe(1);
  });

  it("5. identificação do caso é escapada antes de entrar no documento", () => {
    expect(escaparHtml('<b>&"')).toBe("&lt;b&gt;&amp;&quot;");
    const doc = documentoImprimivelDoContrato("<p>x</p>", { ...ID, caso: "<script>alert(1)</script>" });
    expect(doc).not.toContain("<script>alert(1)</script>");
    expect(doc).toContain("&lt;script&gt;");
  });

  it("6. tem folha A4 com margens e evita quebrar título do resto", () => {
    const doc = documentoImprimivelDoContrato("<p>x</p>", ID);
    expect(doc).toContain("@page");
    expect(doc).toContain("size: A4");
    expect(doc).toContain("page-break-after: avoid");
  });

  it("7. sugere nome de arquivo legível, sem acento nem espaço", () => {
    expect(nomeArquivoContrato({ caso: "CA-CID-AT-FAM-2026-001", versao: "versão v3 (congelada)" })).toBe(
      "contrato-ca-cid-at-fam-2026-001-versao-v3-congelada.pdf",
    );
  });

  it("8. a tela abre o documento a partir da prévia, e nunca envia nem persiste", () => {
    const comp = readFileSync("src/components/contrato/abrir-documento-contrato.tsx", "utf8");
    expect(comp).toContain("documentoImprimivelDoContrato");
    expect(comp).toContain("janela.print()");
    expect(comp).toContain("Gere ou abra a prévia do contrato primeiro");
    for (const proibido of ["useMutation", "createServerFn", "fetch(", "supabase"]) {
      expect(comp, proibido).not.toContain(proibido);
    }
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    expect(rota).toContain("<AbrirDocumentoContrato");
    expect(rota).toContain("identificacao={identificacaoDocumento}");
  });
});
