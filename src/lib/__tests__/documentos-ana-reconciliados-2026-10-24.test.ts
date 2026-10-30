import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * CLA-03/CLA-04 do prompt de 24/10/2026 (tarde): "não pedir reenvio... localize
 * antes de pedir ou recriar". Consultei o storage vivo (bucket "documentos")
 * em vez de pedir os arquivos de novo.
 *
 * Medido, não inventado:
 *   objetos no bucket "documentos" para o caso a11a0000-…-002 ...... 3
 *   documents vinculados a esse caso (antes desta proposta) ........ 0
 *   evidences/artifact_register vinculados a esse caso .............. 0
 *   genealogical_findings do caso .................................. 2 (reais)
 *   app_projections do caso ........................................ 24 (reais)
 *
 * Os 3 arquivos existem, estão no caminho certo (org/caso/evidencias/arquivo),
 * e nunca foram indexados em `documents` — "material recebido sem vínculo",
 * não "cliente não enviou".
 *
 * Ressalva registrada no próprio SQL: os nomes reais dos arquivos não batem
 * com "Certidão Graz 1895 / Dossiê Friedmann-Reimer / Viena 1938-39" citados
 * num prompt anterior — não presumi que são os mesmos documentos.
 */
const sql = readFileSync(
  "supabase/pendentes/20261024120000_documentos_reais_ana_liberados.sql",
  "utf8",
);

describe("o SQL dos documentos da Ana usa metadado real do storage, não placeholder", () => {
  it("não tem mais nenhum PREENCHER nos valores inseridos", () => {
    const bloco = sql.slice(sql.indexOf("insert into _docs_reais_ana"), sql.indexOf("-- 2) Guarda"));
    expect(bloco).not.toContain("PREENCHER");
  });

  it("os 3 storage_path batem exatamente com os objetos reais do bucket 'documentos'", () => {
    for (const nome of [
      "evidencias/Dossie-Consolidado-Projeto-Familiar-Austria.pdf",
      "evidencias/Registro-Unificado-e-Timeline.pdf",
      "evidencias/Registro-Unificado-e-Timeline.md",
    ]) {
      expect(sql).toContain(nome);
    }
    // mesmo prefixo org/caso que o storage real usa
    expect(sql).toContain("11f32aae-ea08-47e0-8114-f5d8a900c9a1/a11a0000-0000-4000-8000-000000000002/evidencias/");
  });

  it("registra a ressalva: nomes do arquivo real != apelidos de um prompt anterior", () => {
    expect(sql).toContain("Certidão Graz 1895");
    expect(sql).toContain("Esses nomes NÃO");
    expect(sql).toContain("aparecem nos nomes de arquivo reais");
  });

  it("mantém a idempotência e a guarda flexível da revisão anterior (#193)", () => {
    expect(sql).toContain("not exists (");
    expect(sql).toContain("ex.titulo = d.titulo");
    expect(sql).not.toContain("if n <> 3 then");
  });

  it("o bucket e o padrão de leitura batem com os dois leitores reais", () => {
    const docs = readFileSync("src/lib/documentos.functions.ts", "utf8");
    const portal = readFileSync("src/lib/portal-cliente.functions.ts", "utf8");
    expect(docs).toContain('const BUCKET = "documentos"');
    expect(portal).toContain(".storage");
    expect(portal).toContain("createSignedUrl(doc.data.storage_path");
  });
});
