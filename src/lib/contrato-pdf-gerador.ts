/**
 * Gerador do binário do PDF a partir dos blocos de `contrato-pdf.ts`.
 *
 * Usa `jsPDF` (já dependência do projeto — `client-research-one-page.tsx`),
 * só a API de texto/paginação (sem `.html()`/`.addImage()`/canvas): compatível
 * com o runtime de borda (Cloudflare Workers via Nitro) para onde este app já
 * faz deploy, sem navegador nem DOM.
 */
import { jsPDF } from "jspdf";

import { AVISO_PDF_CONTRATO, type BlocoPdf, type IdentificacaoPdf } from "@/lib/contrato-pdf";

const MARGEM = 48;
const LARGURA_PAGINA = 595.28; // A4 em pt
const ALTURA_PAGINA = 841.89;
const LARGURA_UTIL = LARGURA_PAGINA - MARGEM * 2;
const RODAPE_Y = ALTURA_PAGINA - 28;

export function gerarPdfContrato(blocos: BlocoPdf[], id: IdentificacaoPdf): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  let y = MARGEM;
  let pagina = 1;

  const cabecalho = () => {
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.setTextColor(47, 75, 110); // navy
    doc.text(id.instrumento, MARGEM, y);
    y += 16;
    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(91, 107, 127);
    doc.text(`Caso: ${id.caso}  ·  Versão: ${id.versao}  ·  Revisão: ${id.revisao}  ·  Gerado em: ${id.geradoEm}`, MARGEM, y);
    y += 10;
    if (id.rascunho) {
      doc.setTextColor(154, 58, 47); // terracotta
      doc.setFont("times", "bolditalic");
      doc.text("RASCUNHO — sem assinatura", MARGEM, y);
      y += 10;
    }
    doc.setDrawColor(47, 75, 110);
    doc.setLineWidth(1);
    doc.line(MARGEM, y, LARGURA_PAGINA - MARGEM, y);
    y += 16;
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(74, 51, 48);
    const avisoLinhas = doc.splitTextToSize(AVISO_PDF_CONTRATO, LARGURA_UTIL);
    doc.text(avisoLinhas, MARGEM, y);
    y += avisoLinhas.length * 10 + 10;
    doc.setTextColor(29, 42, 58);
  };

  const rodape = () => {
    doc.setFont("times", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(91, 107, 127);
    doc.text(`${id.instrumento} · ${id.versao} · página ${pagina}`, MARGEM, RODAPE_Y);
  };

  const novaPagina = () => {
    rodape();
    doc.addPage();
    pagina += 1;
    y = MARGEM;
  };

  const garantirEspaco = (alturaBloco: number) => {
    if (y + alturaBloco > RODAPE_Y - 12) novaPagina();
  };

  const escreverLinhas = (linhas: string[], tamanhoLinha: number) => {
    for (const linha of linhas) {
      garantirEspaco(tamanhoLinha);
      doc.text(linha, MARGEM, y);
      y += tamanhoLinha;
    }
  };

  cabecalho();

  for (const b of blocos) {
    if (b.tipo === "titulo1") {
      garantirEspaco(22);
      doc.setFont("times", "bold");
      doc.setFontSize(12.5);
      doc.setTextColor(47, 75, 110);
      const linhas = doc.splitTextToSize(b.texto, LARGURA_UTIL);
      escreverLinhas(linhas, 15);
      y += 4;
    } else if (b.tipo === "titulo2") {
      garantirEspaco(18);
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(47, 75, 110);
      const linhas = doc.splitTextToSize(b.texto, LARGURA_UTIL);
      escreverLinhas(linhas, 13);
      y += 3;
    } else if (b.tipo === "item") {
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(29, 42, 58);
      const linhas = doc.splitTextToSize(`•  ${b.texto}`, LARGURA_UTIL - 10);
      escreverLinhas(linhas, 13);
    } else if (b.tipo === "tabela") {
      doc.setFont("times", "bold");
      doc.setFontSize(9);
      if (b.cabecalho.length) {
        garantirEspaco(13);
        doc.text(b.cabecalho.join("   ·   "), MARGEM, y);
        y += 13;
      }
      doc.setFont("times", "normal");
      for (const linha of b.linhas) {
        const texto = linha.join("   ·   ");
        const linhasQuebradas = doc.splitTextToSize(texto, LARGURA_UTIL);
        escreverLinhas(linhasQuebradas, 12);
      }
      y += 4;
    } else {
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(29, 42, 58);
      const linhas = doc.splitTextToSize(b.texto, LARGURA_UTIL);
      escreverLinhas(linhas, 13);
      y += 3;
    }
  }

  rodape();

  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}
