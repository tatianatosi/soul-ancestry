/**
 * PDF real e baixável do contrato — Corte urgente PP-03/PDF (07/10/2026,
 * política de coordenação Claude/Lovable v1.0).
 *
 * Achado da própria Proprietária: "Download PDF do contrato: pendente de
 * implementação e comprovação. Abrir HTML, impressão do navegador ou
 * screenshot não conta como download PDF entregue." O que existia até aqui
 * (`contrato-impressao.ts`/`AbrirDocumentoContrato`) é exatamente isso — uma
 * nova aba com `window.print()`, nunca um arquivo.
 *
 * Este módulo é puro: recebe o MESMO HTML já persistido em
 * `contract_parameter_previews.html` (a mesma fonte da prévia na tela, nunca
 * texto novo) e o transforma em blocos de texto estruturados, prontos para
 * paginação real num gerador de PDF (binário, não impressão).
 *
 * Exclusão deliberada: a "Matriz de renderização (16 blocos)" — tabela
 * interna de fonte/gate/situação por bloco — nunca vai para o PDF do
 * cliente ("não apêndice técnico... gates internos ou tabelas de
 * auditoria"). O HTML inteiro continua intacto na tela/prévia; só a
 * extração para PDF a descarta.
 */

export type BlocoPdf =
  | { tipo: "titulo1"; texto: string }
  | { tipo: "titulo2"; texto: string }
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "item"; texto: string }
  | { tipo: "tabela"; cabecalho: string[]; linhas: string[][] };

const ENTIDADES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

export function desentidadesHtml(s: string): string {
  return s.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTIDADES[m] ?? m);
}

function semTags(s: string): string {
  return desentidadesHtml(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/**
 * Remove o(s) bloco(s) internos que nunca vão ao PDF do cliente — hoje só a
 * "Matriz de renderização (16 blocos)" (`secaoBlocos` em
 * `contrato-corpo.server.ts`). Seção autocontida e sem `<section>` aninhada
 * (confirmado no gerador): regex não-guloso entre o `<section>` que abre com
 * esse título e o primeiro `</section>` depois dele é seguro.
 */
export function removerSecoesInternas(html: string): string {
  return html.replace(/<section>\s*<h2>Matriz de renderiza[^<]*<\/h2>[\s\S]*?<\/section>/i, "");
}

/**
 * Extrai blocos de texto do HTML controlado que `contrato-corpo.server.ts`
 * gera (tags sempre h2/h3/p/ul/ol/li/table/tr/td/th, valores sempre
 * escapados por `esc()`). Não é um parser de HTML genérico — depende da
 * forma conhecida e estável desse gerador.
 */
export function htmlParaBlocos(html: string): BlocoPdf[] {
  const semMatriz = removerSecoesInternas(html);
  const blocos: BlocoPdf[] = [];

  // Tabelas primeiro (para não cair no extrator de parágrafo/h2/h3 por engano).
  const partes = semMatriz.split(/(<table>[\s\S]*?<\/table>)/i);
  for (const parte of partes) {
    if (/^<table>/i.test(parte)) {
      const linhasTr = [...parte.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
      if (!linhasTr.length) continue;
      const celulas = (tr: string, tag: "th" | "td") =>
        [...tr.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "gi"))].map((m) => semTags(m[1]));
      const cabecalho = celulas(linhasTr[0]!, "th");
      const linhas = linhasTr.slice(cabecalho.length ? 1 : 0).map((tr) => celulas(tr, "td"));
      if (cabecalho.length || linhas.length) blocos.push({ tipo: "tabela", cabecalho, linhas });
      continue;
    }

    // h2/h3/p/li, na ordem em que aparecem, ignorando outras tags de estrutura (section/ul/ol/div).
    const tagRe = /<h2>([\s\S]*?)<\/h2>|<h3>([\s\S]*?)<\/h3>|<li>([\s\S]*?)<\/li>|<p(?:\s+class="[^"]*")?>([\s\S]*?)<\/p>/gi;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(parte))) {
      const [, h2, h3, li, p] = m;
      if (h2 !== undefined) blocos.push({ tipo: "titulo1", texto: semTags(h2) });
      else if (h3 !== undefined) blocos.push({ tipo: "titulo2", texto: semTags(h3) });
      else if (li !== undefined) blocos.push({ tipo: "item", texto: semTags(li) });
      else if (p !== undefined) {
        const texto = semTags(p);
        if (texto) blocos.push({ tipo: "paragrafo", texto });
      }
    }
  }

  return blocos;
}

export type IdentificacaoPdf = {
  caso: string;
  instrumento: string;
  versao: string;
  revisao: string;
  geradoEm: string;
  /** true quando a prévia é rascunho vivo (não congelada) — marca "RASCUNHO" no cabeçalho. */
  rascunho: boolean;
};

function fatiaSegura(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** Nome de arquivo, mesma regra de `nomeArquivoContrato` (contrato-impressao.ts), sem duplicar a função. */
export function nomeArquivoPdf(id: Pick<IdentificacaoPdf, "caso" | "versao">): string {
  return `contrato-${fatiaSegura(id.caso)}-${fatiaSegura(id.versao)}.pdf`;
}

/** Mesmo nome-base do PDF, extensão .docx — PDF e DOCX saem da mesma fonte/versão. */
export function nomeArquivoDocx(id: Pick<IdentificacaoPdf, "caso" | "versao">): string {
  return `contrato-${fatiaSegura(id.caso)}-${fatiaSegura(id.versao)}.docx`;
}

export const AVISO_PDF_CONTRATO =
  "Documento gerado para leitura, revisão e arquivamento. Não é via assinada: assinatura, cobrança e envio continuam dependendo dos gates formais e de ato humano explícito.";
