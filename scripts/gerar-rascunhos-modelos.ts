/**
 * Gera os rascunhos TESTE (DOCX) dos três modelos de composição contratual.
 * Somente leitura para revisão humana: sem dados reais, sem dados demo,
 * sem assinatura, cobrança, envio ou integração.
 *
 * Uso: NODE_PATH=/tmp/node_modules bun scripts/gerar-rascunhos-modelos.ts <destino>
 */
import { writeFileSync } from "node:fs";

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import {
  AVISO_RASCUNHO_TESTE,
  montarRascunhoModelo,
  type ChaveModelo,
  type RascunhoModelo,
} from "../src/lib/matriz-modelos-contratuais";

const DESTINO = process.argv[2] ?? "/mnt/documents";
const DATA = "2026-08-22";

const ARQUIVOS: Record<ChaveModelo, string> = {
  individual: "Rascunho_Modelo_Individual_v1_0.docx",
  casal: "Rascunho_Modelo_Casal_v1_0.docx",
  nucleo_familiar: "Rascunho_Modelo_Nucleo_Familiar_v1_0.docx",
};

const W = 9360;
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const margins = { top: 80, bottom: 80, left: 120, right: 120 };

function p(text: string, opts: { bold?: boolean; size?: number; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}) {
  return new Paragraph({
    alignment: opts.align,
    spacing: { after: 100 },
    children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22, color: opts.color })],
  });
}

function bullet(text: string) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text, size: 20 })] });
}

function tabela(cabecalho: string[], linhas: string[][], larguras: number[]) {
  const cel = (t: string, w: number, head = false) =>
    new TableCell({
      borders,
      margins,
      width: { size: w, type: WidthType.DXA },
      shading: head ? { fill: "1B2B4B", type: ShadingType.CLEAR, color: "auto" } : undefined,
      children: [new Paragraph({ children: [new TextRun({ text: t, size: 18, bold: head, color: head ? "FFFFFF" : undefined })] })],
    });
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: larguras,
    rows: [
      new TableRow({ children: cabecalho.map((h, i) => cel(h, larguras[i]!, true)) }),
      ...linhas.map((l) => new TableRow({ children: l.map((c, i) => cel(c, larguras[i]!)) })),
    ],
  });
}

function corpo(r: RascunhoModelo) {
  const filhos: (Paragraph | Table)[] = [];

  // Capa
  filhos.push(p(AVISO_RASCUNHO_TESTE, { bold: true, color: "8B4513", align: AlignmentType.CENTER, size: 24 }));
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(r.capa.modelo)] }));
  filhos.push(p(`Versão: ${r.capa.versao}`));
  filhos.push(p(`Status: ${r.capa.status}`));
  filhos.push(p(`Contrato-base: ${r.capa.contratoBase}`));
  filhos.push(p(`Data de geração: ${r.capa.dataGeracao}`));
  filhos.push(p(`Identificador técnico: ${r.capa.identificadorTecnico}`));
  filhos.push(p("Documento somente-leitura para revisão humana. Não válido para assinatura, cobrança, pesquisa externa, procuração, portal ou onboarding.", { bold: true }));

  // Sumário simples
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Sumário")] }));
  for (const s of [
    "1. Perfil institucional e qualificação profissional",
    "2. Preâmbulo e cláusulas 1 a 14",
    "3. Bloco de partes e regras de composição",
    "4. Matriz de renderização (16 blocos)",
    "5. Anexos I–V e ANX internos",
    "6. Gates do modelo",
    "7. Pendências para formalização",
  ])
    filhos.push(bullet(s));

  filhos.push(new Paragraph({ children: [new PageBreak()] }));

  // 1 Perfil
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Perfil institucional e qualificação profissional")] }));
  filhos.push(p(`Perfil institucional versionado: ${r.perfil.versao} · status ${r.perfil.status}.`));
  filhos.push(
    tabela(
      ["Campo", "Conteúdo"],
      [
        ...r.perfil.campos.map((c) => [c.rotulo, c.valor]),
        ...r.perfil.placeholders.map((c) => [c.rotulo, c.valor]),
      ],
      [3000, 6360],
    ),
  );
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`${r.perfil.qualificacao.titulo} (${r.perfil.qualificacao.versao} · ${r.perfil.qualificacao.status})`)] }));
  for (const par of r.perfil.qualificacao.paragrafos) filhos.push(p(par));
  for (const pend of r.perfil.qualificacao.pendencias) filhos.push(p(pend, { bold: true, color: "8B4513" }));

  // 2 Preâmbulo e cláusulas
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Preâmbulo e cláusulas 1 a 14")] }));
  filhos.push(p(r.preambulo));
  for (const c of r.clausulas) {
    filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`Cláusula ${c.numero} — ${c.titulo}`)] }));
    for (const item of c.itens) filhos.push(bullet(item));
  }

  // 3 Partes
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Bloco de partes e regras de composição")] }));
  for (const parte of r.partes) filhos.push(bullet(parte));
  filhos.push(p("Regras de composição:", { bold: true }));
  for (const regra of r.regrasComposicao) filhos.push(bullet(regra));

  // 4 Matriz
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Matriz de renderização (16 blocos)")] }));
  filhos.push(
    tabela(
      ["Bloco", "Fonte exigida", "Tipo", "Renderiza", "Gate"],
      r.matriz.map((l) => [l.bloco, l.fonteExigida, l.tipo, l.renderiza, l.gate]),
      [1900, 2400, 1560, 1400, 2100],
    ),
  );

  // 5 Anexos
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Anexos I–V e ANX internos")] }));
  filhos.push(
    tabela(
      ["Anexo", "Aplicabilidade", "Fonte necessária", "Gate", "Estado / bloqueio"],
      r.anexos.map((a) => [
        `${a.codigo} — ${a.titulo}`,
        a.aplicabilidade === "nao_aplicavel_por_padrao" ? "Não aplicável por padrão" : a.aplicabilidade === "fixo" ? "Fixo" : "Condicional",
        a.fonteNecessaria,
        a.gate,
        `${a.estadoTeste}. ${a.motivoBloqueio}`,
      ]),
      [1900, 1500, 2200, 1800, 1960],
    ),
  );

  // 6 Gates
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Gates do modelo")] }));
  filhos.push(
    tabela(
      ["Código", "Regra", "Bloqueia"],
      r.gates.map((g) => [g.codigo, g.regra, g.bloqueia]),
      [1100, 4400, 3860],
    ),
  );

  // 7 Pendências
  filhos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Pendências para formalização")] }));
  filhos.push(
    tabela(
      ["Tema", "Situação", "Gate bloqueado"],
      r.pendencias.map((x) => [x.tema, x.situacao, x.gateBloqueado]),
      [2600, 3400, 3360],
    ),
  );

  return filhos;
}

async function gerar(chave: ChaveModelo) {
  const r = montarRascunhoModelo(chave, DATA);
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: "Arial", color: "1B2B4B" }, paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 25, bold: true, font: "Arial", color: "1B2B4B" }, paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 480, hanging: 260 } } } }],
        },
      ],
    },
    sections: [
      {
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, right: 1440, bottom: 1200, left: 1440 } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: AVISO_RASCUNHO_TESTE, bold: true, size: 16, color: "8B4513" })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${r.capa.modelo} · ${r.capa.status} · página `, size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
                ],
              }),
            ],
          }),
        },
        children: corpo(r),
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);
  const caminho = `${DESTINO}/${ARQUIVOS[chave]}`;
  writeFileSync(caminho, buffer);
  console.log("gerado:", caminho);
}

await gerar("individual");
await gerar("casal");
await gerar("nucleo_familiar");
