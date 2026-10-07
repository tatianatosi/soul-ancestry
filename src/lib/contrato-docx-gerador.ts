/**
 * Gerador do binário do DOCX a partir dos MESMOS blocos de `contrato-pdf.ts`
 * (`htmlParaBlocos`), para o PDF e o DOCX nunca divergirem de conteúdo —
 * só o formato muda. Usa `docx` (npm), que produz o `.docx` real (ZIP +
 * XML) sem navegador nem DOM — compatível com o runtime de borda
 * (Cloudflare Workers via Nitro, `nodejs_compat` habilitado) para onde
 * este app já faz deploy.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { AVISO_PDF_CONTRATO, type BlocoPdf, type IdentificacaoPdf } from "@/lib/contrato-pdf";

const NAVY = "2F4B6E";
const TERRACOTA = "9A3A2F";
const CINZA = "5B6B7F";
const TEXTO = "1D2A3A";

const LARGURA_TABELA_DXA = 9360; // mesma largura útil usada pelas tabelas do corpo

function paragrafoRegra(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 4 } },
    spacing: { after: 160 },
    children: [],
  });
}

function cabecalho(id: IdentificacaoPdf): Paragraph[] {
  const paragrafos: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: id.instrumento, bold: true, color: NAVY, size: 26 })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Caso: ${id.caso}  ·  Versão: ${id.versao}  ·  Revisão: ${id.revisao}  ·  Gerado em: ${id.geradoEm}`,
          color: CINZA,
          size: 17,
        }),
      ],
      spacing: { after: id.rascunho ? 40 : 100 },
    }),
  ];
  if (id.rascunho) {
    paragrafos.push(
      new Paragraph({
        children: [new TextRun({ text: "RASCUNHO — sem assinatura", bold: true, italics: true, color: TERRACOTA, size: 17 })],
        spacing: { after: 100 },
      }),
    );
  }
  paragrafos.push(paragrafoRegra());
  paragrafos.push(
    new Paragraph({
      children: [new TextRun({ text: AVISO_PDF_CONTRATO, italics: true, color: TEXTO, size: 16 })],
      spacing: { after: 240 },
    }),
  );
  return paragrafos;
}

function blocoParaParagrafos(b: BlocoPdf): (Paragraph | Table)[] {
  if (b.tipo === "titulo1") {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: b.texto, bold: true, color: NAVY, size: 25 })],
      }),
    ];
  }
  if (b.tipo === "titulo2") {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 160, after: 80 },
        children: [new TextRun({ text: b.texto, bold: true, color: NAVY, size: 22 })],
      }),
    ];
  }
  if (b.tipo === "item") {
    return [
      new Paragraph({
        spacing: { after: 60 },
        indent: { left: 240 },
        children: [new TextRun({ text: `•  ${b.texto}`, color: TEXTO, size: 20 })],
      }),
    ];
  }
  if (b.tipo === "tabela") {
    const colunas = Math.max(b.cabecalho.length, ...b.linhas.map((l) => l.length), 1);
    const larguraColuna = Math.floor(LARGURA_TABELA_DXA / colunas);
    const columnWidths = Array.from({ length: colunas }, () => larguraColuna);
    const celula = (texto: string, cabecalho: boolean) =>
      new TableCell({
        width: { size: larguraColuna, type: WidthType.DXA },
        shading: cabecalho ? { type: ShadingType.CLEAR, fill: "ECDFCD" } : undefined,
        children: [
          new Paragraph({
            children: [new TextRun({ text: texto, bold: cabecalho, color: TEXTO, size: 18 })],
          }),
        ],
      });
    const linhas: TableRow[] = [];
    if (b.cabecalho.length) {
      linhas.push(new TableRow({ children: b.cabecalho.map((c) => celula(c, true)) }));
    }
    for (const linha of b.linhas) {
      linhas.push(new TableRow({ children: linha.map((c) => celula(c, false)) }));
    }
    return [
      new Table({ width: { size: LARGURA_TABELA_DXA, type: WidthType.DXA }, columnWidths, rows: linhas }),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
    ];
  }
  return [
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: b.texto, color: TEXTO, size: 20 })],
    }),
  ];
}

export async function gerarDocxContratoBase64(blocos: BlocoPdf[], id: IdentificacaoPdf): Promise<string> {
  const children: (Paragraph | Table)[] = [...cabecalho(id)];
  for (const b of blocos) children.push(...blocoParaParagrafos(b));

  const doc = new Document({
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${id.instrumento} · ${id.versao} · página `,
                    color: CINZA,
                    size: 14,
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], color: CINZA, size: 14 }),
                  new TextRun({ text: " de ", color: CINZA, size: 14 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], color: CINZA, size: 14 }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBase64String(doc);
}
