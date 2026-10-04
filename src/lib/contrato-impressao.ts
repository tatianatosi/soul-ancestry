/**
 * Documento do contrato para leitura, impressão e arquivo em PDF.
 *
 * Achado de 04/10/2026 (Proprietária: "acredito que ainda falta criar e
 * disponibilizar PDF doc"): medido e confirmado — não existia nenhuma saída
 * em documento para o contrato. A prévia só vivia dentro de um `<iframe
 * sandbox="">` da tela, sem imprimir, sem baixar, sem anexar. Não havia a
 * palavra "pdf" em nenhum módulo de contrato.
 *
 * O que este módulo faz: embrulha o MESMO HTML já gerado e aprovado pelo
 * motor de prévia num documento imprimível, com cabeçalho de identificação e
 * margens de página. Não gera cláusula, não reescreve texto, não assina, não
 * envia, não cobra e não persiste nada — o PDF sai pela impressão do próprio
 * navegador, como já se faz em `cadeia-jornada-pdf.ts`.
 */

export type IdentificacaoDocumento = {
  /** Código canônico do caso (nunca o id interno). */
  caso: string;
  instrumento: string;
  /** Rótulo da versão: "rascunho de trabalho" ou "versão v3 (congelada)". */
  versao: string;
  /** Estado da revisão humana, em texto. */
  revisao: string;
  geradoEm: string;
};

export const AVISO_DOCUMENTO_CONTRATO =
  "Documento gerado para leitura, revisão e arquivamento. Não é via assinada: " +
  "assinatura, cobrança e envio continuam dependendo dos gates formais e de ato humano explícito.";

export function escaparHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Remove o invólucro de documento do HTML da prévia, se houver, para não aninhar <html>. */
export function corpoDaPrevia(html: string): string {
  const m = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
  if (m) return m[1];
  return html.replace(/<\/?(?:html|head|body)[^>]*>/gi, "");
}

const ESTILO = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1d2a3a;
    background: #fff;
  }
  .ca-cabecalho {
    border-bottom: 2px solid #2F4B6E;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
  .ca-cabecalho h1 { margin: 0; font-size: 14pt; color: #2F4B6E; }
  .ca-meta { margin-top: 4px; font-size: 9pt; color: #5b6b7f; }
  .ca-meta span { margin-right: 12px; }
  .ca-aviso {
    margin: 0 0 16px;
    padding: 8px 10px;
    border: 1px solid #9A3A2F33;
    background: #9A3A2F0d;
    font-size: 9pt;
    color: #4a3330;
  }
  h2, h3 { color: #2F4B6E; page-break-after: avoid; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10pt; }
  th, td { border: 1px solid #2F4B6E33; padding: 5px 7px; text-align: left; vertical-align: top; }
  th { background: #ECDFCD55; font-weight: 600; }
  ol, ul { padding-left: 20px; }
  li { margin: 2px 0; }
  p { margin: 6px 0; }
  .ca-rodape {
    margin-top: 20px;
    border-top: 1px solid #2F4B6E33;
    padding-top: 6px;
    font-size: 8.5pt;
    color: #5b6b7f;
  }
  @media print { .ca-aviso { break-inside: avoid; } }
`;

/**
 * Monta o documento imprimível a partir do HTML da prévia já gerada.
 * `html` é o conteúdo que o motor de prévia produziu — não é reescrito aqui.
 */
export function documentoImprimivelDoContrato(html: string, id: IdentificacaoDocumento): string {
  const titulo = `${id.instrumento} — ${id.caso}`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escaparHtml(titulo)}</title>
<style>${ESTILO}</style>
</head>
<body>
<header class="ca-cabecalho">
  <h1>${escaparHtml(id.instrumento)}</h1>
  <p class="ca-meta">
    <span><strong>Caso:</strong> ${escaparHtml(id.caso)}</span>
    <span><strong>Versão:</strong> ${escaparHtml(id.versao)}</span>
    <span><strong>Revisão:</strong> ${escaparHtml(id.revisao)}</span>
    <span><strong>Gerado em:</strong> ${escaparHtml(id.geradoEm)}</span>
  </p>
</header>
<p class="ca-aviso">${escaparHtml(AVISO_DOCUMENTO_CONTRATO)}</p>
${corpoDaPrevia(html)}
<footer class="ca-rodape">${escaparHtml(titulo)} · ${escaparHtml(id.versao)} · ${escaparHtml(AVISO_DOCUMENTO_CONTRATO)}</footer>
</body>
</html>`;
}

/** Nome de arquivo sugerido quando a pessoa escolhe "Salvar como PDF". */
export function nomeArquivoContrato(id: Pick<IdentificacaoDocumento, "caso" | "versao">): string {
  const limpo = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  return `contrato-${limpo(id.caso)}-${limpo(id.versao)}.pdf`;
}
