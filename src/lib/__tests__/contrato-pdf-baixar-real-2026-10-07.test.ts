import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { desentidadesHtml, htmlParaBlocos, nomeArquivoPdf, removerSecoesInternas } from "@/lib/contrato-pdf";
import { gerarPdfContrato } from "@/lib/contrato-pdf-gerador";

/**
 * Corte urgente PP-03/PDF (07/10/2026, política de coordenação
 * Claude/Lovable v1.0): "Download PDF do contrato: pendente de
 * implementação e comprovação. Abrir HTML, impressão do navegador ou
 * screenshot não conta como download PDF entregue." Esta suíte prova que
 * existe agora um gerador de PDF binário real, a partir da MESMA fonte da
 * prévia (contract_parameter_previews.html), excluindo a matriz interna de
 * 16 blocos (gate/auditoria) que nunca vai ao cliente.
 */
const HTML_EXEMPLO = `<section class="base"><h2>Contrato de Estudo Genealógico v2</h2>
<p><strong>Identificador:</strong> CB-001</p>
<p class="pend">Aviso de prontidão.</p></section>
<section><h2>Perfil institucional da contratada (v1)</h2><ul><li><strong>Razão social:</strong> Clube Ancestral</li></ul></section>
<section><h2>Preâmbulo</h2><p>Texto do preâmbulo com acentuação e &amp; símbolo.</p></section>
<section class="clausula"><h2>Cláusula 1 — Objeto</h2><ol><li>Primeiro item da cláusula.</li><li>Segundo item.</li></ol></section>
<section><h2>Condições específicas deste caso</h2>
<p class="orig">Texto de abertura do bloco.</p>
<section class="bloco-caso"><h3>Composição familiar <span class="orig">(cláusula 2)</span></h3>
<p class="orig">Finalidade do bloco.</p><ul><li><strong>Ana:</strong> titular</li></ul></section></section>
<section><h2>Anexos aplicáveis</h2><section class="anexo"><h3>ANEXO_I — Ordem de Serviço <span class="orig">(aplicável)</span></h3>
<p>Finalidade do anexo.</p><p class="orig">Regra do anexo.</p><ul><li><strong>Escopo:</strong> pesquisa</li></ul></section></section>
<section><h2>Matriz de renderização (16 blocos)</h2><table><thead><tr><th>Bloco</th><th>Fonte exigida</th><th>Tipo</th><th>Situação</th><th>Gate</th></tr></thead><tbody>
<tr><td>Partes</td><td>contract_parties</td><td>obrigatorio</td><td>ok — completo</td><td>liberado</td></tr>
</tbody></table></section>`;

describe("removerSecoesInternas — a matriz de 16 blocos nunca chega ao PDF", () => {
  it("remove a seção da matriz, preservando tudo antes dela", () => {
    const limpo = removerSecoesInternas(HTML_EXEMPLO);
    expect(limpo).not.toContain("Matriz de renderização");
    expect(limpo).not.toContain("Fonte exigida");
    expect(limpo).not.toContain("Gate");
    expect(limpo).toContain("Cláusula 1 — Objeto");
    expect(limpo).toContain("ANEXO_I — Ordem de Serviço");
  });
});

describe("desentidadesHtml", () => {
  it("devolve entidades HTML para texto plano", () => {
    expect(desentidadesHtml("Pesquisa &amp; Genealogia &quot;Silveira&quot;")).toBe('Pesquisa & Genealogia "Silveira"');
  });
});

describe("htmlParaBlocos — fidelidade ao conteúdo aprovado, sem o apêndice técnico", () => {
  const blocos = htmlParaBlocos(HTML_EXEMPLO);

  it("extrai títulos de cláusulas e anexos", () => {
    const titulos = blocos.filter((b) => b.tipo === "titulo1").map((b) => (b as any).texto);
    expect(titulos).toContain("Cláusula 1 — Objeto");
    expect(titulos).toContain("Anexos aplicáveis");
    expect(titulos).not.toContain("Matriz de renderização (16 blocos)");
  });

  it("extrai parágrafos com acentuação e entidades decodificadas", () => {
    const paragrafos = blocos.filter((b) => b.tipo === "paragrafo").map((b) => (b as any).texto);
    expect(paragrafos.some((p) => p.includes("Texto do preâmbulo com acentuação e & símbolo."))).toBe(true);
  });

  it("extrai itens de lista (cláusulas e blocos do caso)", () => {
    const itens = blocos.filter((b) => b.tipo === "item").map((b) => (b as any).texto);
    expect(itens.some((i) => i.includes("Primeiro item da cláusula."))).toBe(true);
    expect(itens.some((i) => i.includes("Ana: titular"))).toBe(true);
  });

  it("a tabela da matriz de 16 blocos nunca vira bloco de tabela (foi removida antes)", () => {
    const tabelas = blocos.filter((b) => b.tipo === "tabela");
    expect(tabelas).toHaveLength(0);
  });

  it("nenhum bloco contém vocabulário interno de gate/auditoria", () => {
    const textoCompleto = JSON.stringify(blocos);
    expect(textoCompleto).not.toMatch(/Fonte exigida|\bGate\b|contract_parties/i);
  });
});

describe("nomeArquivoPdf", () => {
  it("monta nome de arquivo seguro a partir de caso e versão", () => {
    expect(nomeArquivoPdf({ caso: "CA-CID-AT-FAM-2026-001", versao: "v3 (congelada)" })).toBe(
      "contrato-ca-cid-at-fam-2026-001-v3-congelada.pdf",
    );
  });
});

describe("gerarPdfContrato — binário real, paginado, nunca window.print()", () => {
  const blocos = htmlParaBlocos(HTML_EXEMPLO);
  const identificacao = {
    caso: "CA-CID-AT-FAM-2026-001",
    instrumento: "Contrato de Estudo Genealógico v2",
    versao: "rascunho de trabalho (v0)",
    revisao: "rascunho",
    geradoEm: "07/10/2026 10:00",
    rascunho: true,
  };

  it("gera bytes de PDF real (assinatura %PDF, não HTML)", () => {
    const bytes = gerarPdfContrato(blocos, identificacao);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(500);
    const cabecalho = String.fromCharCode(...bytes.slice(0, 5));
    expect(cabecalho).toBe("%PDF-");
  });

  it("gera múltiplas páginas quando o conteúdo é longo (paginação real)", () => {
    const muitosBlocos = Array.from({ length: 200 }, (_, i) => ({
      tipo: "paragrafo" as const,
      texto: `Parágrafo de teste número ${i} com texto suficiente para ocupar espaço vertical na página do PDF.`,
    }));
    const bytes = gerarPdfContrato(muitosBlocos, identificacao);
    const texto = String.fromCharCode(...bytes);
    const ocorrenciasPage = (texto.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(ocorrenciasPage).toBeGreaterThan(1);
  });
});

describe("Corte urgente PDF — .functions.ts lê a mesma fonte da prévia, org-scoped, nunca escreve", () => {
  const codigo = readFileSync("src/lib/contrato-pdf.functions.ts", "utf8");

  it("lê contract_parameter_previews.html — a mesma fonte da tela, nunca monta texto novo", () => {
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

describe("Corte urgente PDF — botão de verdade, não window.print()", () => {
  const botao = readFileSync("src/components/contrato/baixar-pdf-contrato.tsx", "utf8");

  it("usa Blob + <a download>, nunca chama print() de verdade", () => {
    expect(botao).toContain("new Blob(");
    expect(botao).toContain(".download = nomeArquivo");
    expect(botao).not.toMatch(/\bjanela\.print\(\)|\.print\(\);/);
  });
});
