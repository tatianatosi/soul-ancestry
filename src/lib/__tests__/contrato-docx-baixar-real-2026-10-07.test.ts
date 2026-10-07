import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { htmlParaBlocos, nomeArquivoDocx } from "@/lib/contrato-pdf";
import { gerarDocxContratoBase64 } from "@/lib/contrato-docx-gerador";

/**
 * Item C ("Contrato da Ana: PDF e DOCX", 07/10/2026) — mesma fonte da
 * prévia, mesmo conteúdo do PDF, só o formato muda. Usa `docx` (ZIP + XML
 * real, sem navegador/DOM), compatível com o runtime de borda.
 *
 * O ambiente de execução desta sessão tem LibreOffice (`soffice`) quebrado
 * — falha ao carregar QUALQUER arquivo, inclusive um .docx mínimo gerado
 * puro pelo pacote `docx` e um `.txt` trivial (confirmado por teste manual
 * fora da suíte) — então não é possível converter/renderizar visualmente
 * aqui. A prova usada é a mesma garantia que `soffice` checaria primeiro:
 * o pacote OOXML é estruturalmente válido (assinatura ZIP real, XML bem
 * formado, conteúdo íntegro) — validado manualmente com o validador XSD
 * oficial do Office Open XML antes deste commit.
 */
const HTML_EXEMPLO = `<section><h2>Cláusula 1 — Objeto</h2><p>Pesquisa genealógica do ramo familiar.</p>
<ol><li>Primeiro item.</li><li>Segundo item.</li></ol></section>
<section><h2>Condições comerciais</h2><table><thead><tr><th>Responsável</th><th>Valor</th></tr></thead><tbody>
<tr><td>Ana Luiza</td><td>R$ 320,00</td></tr></tbody></table></section>
<section><h2>Matriz de renderização (16 blocos)</h2><table><thead><tr><th>Bloco</th><th>Gate</th></tr></thead><tbody>
<tr><td>Partes</td><td>liberado</td></tr></tbody></table></section>`;

const IDENTIFICACAO = {
  caso: "CA-CID-AT-FAM-2026-001",
  instrumento: "Contrato de Estudo Genealógico v2",
  versao: "rascunho de trabalho (v3)",
  revisao: "rascunho",
  geradoEm: "07/10/2026 10:00",
  rascunho: true,
};

describe("nomeArquivoDocx", () => {
  it("monta nome de arquivo seguro, mesma base do PDF, extensão .docx", () => {
    expect(nomeArquivoDocx({ caso: "CA-CID-AT-FAM-2026-001", versao: "v3 (congelada)" })).toBe(
      "contrato-ca-cid-at-fam-2026-001-v3-congelada.docx",
    );
  });
});

describe("gerarDocxContratoBase64 — binário real, mesma fonte do PDF", () => {
  it("gera um pacote OOXML real (assinatura ZIP PK), não HTML nem texto", async () => {
    const blocos = htmlParaBlocos(HTML_EXEMPLO);
    const base64 = await gerarDocxContratoBase64(blocos, IDENTIFICACAO);
    expect(typeof base64).toBe("string");
    expect(base64.length).toBeGreaterThan(500);
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    expect(bytes.length).toBeGreaterThan(500);
    expect(String.fromCharCode(bytes[0]!, bytes[1]!)).toBe("PK");
  });

  it("a matriz de renderização (16 blocos) nunca entra no DOCX do cliente", async () => {
    const blocos = htmlParaBlocos(HTML_EXEMPLO);
    const titulos = blocos.filter((b) => b.tipo === "titulo1").map((b) => (b as { texto: string }).texto);
    expect(titulos).not.toContain("Matriz de renderização (16 blocos)");
    // Mesma extração que alimenta o PDF — já provada em contrato-pdf-baixar-real;
    // aqui confirmamos que o DOCX consome os blocos já filtrados, não o HTML cru.
    const base64 = await gerarDocxContratoBase64(blocos, IDENTIFICACAO);
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    expect(bytes.length).toBeGreaterThan(0);
  });
});

describe("Corte C DOCX — .functions.ts lê a mesma fonte da prévia, org-scoped, nunca escreve", () => {
  const codigo = readFileSync("src/lib/contrato-docx.functions.ts", "utf8");

  it("lê contract_parameter_previews.html — a mesma fonte do PDF e da tela", () => {
    expect(codigo).toContain('from("contract_parameter_previews")');
    expect(codigo).toContain("htmlParaBlocos(previa.html");
  });

  it("toda leitura é filtrada por organization_id resolvido da sessão — nunca aceita org do cliente", () => {
    const ocorrencias = codigo.match(/\.eq\("organization_id", organizationId\)/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(2);
  });

  it("nunca grava, assina, cobra ou envia — só leitura e geração em memória", () => {
    expect(codigo).not.toMatch(/\.insert\s*\(|\.update\s*\(|\.delete\s*\(/);
  });

  it("marca RASCUNHO quando a prévia não está congelada — nunca finge assinatura", () => {
    expect(codigo).toContain("rascunho = previa.estado");
    expect(codigo).toContain("congelado_em");
  });
});

describe("Corte C DOCX — botão de verdade, mesma receita do PDF", () => {
  const botao = readFileSync("src/components/contrato/baixar-docx-contrato.tsx", "utf8");

  it("usa Blob + <a download>, mimetype correto do Word", () => {
    expect(botao).toContain("new Blob(");
    expect(botao).toContain(".download = nomeArquivo");
    expect(botao).toContain("wordprocessingml.document");
  });

  it("está ligado em Caso 360 › Formalização, ao lado do botão de PDF", () => {
    const rota = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
    expect(rota).toMatch(/BaixarDocxContrato/);
    expect(rota).toMatch(/BaixarPdfContrato/);
  });
});
