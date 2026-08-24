/**
 * Exportação SOMENTE-LEITURA do painel contextual da cadeia da jornada.
 *
 * Gera um documento HTML com motivo, evidências, próxima ação, pontuação do
 * melhor ajuste e os 11 elos derivados, para revisão e arquivamento em PDF via
 * impressão do próprio navegador. Nada é enviado, criado ou persistido.
 */

import type { EloDerivado, ProximaAcaoPainel } from "@/lib/cadeia-jornada-visao";

export type DadosImpressaoPainel = {
  evento: string;
  data: string;
  proxima: ProximaAcaoPainel;
  elos: readonly EloDerivado[];
};

const ROTULO_ESTADO_PDF: Record<EloDerivado["estado"], string> = {
  concluido: "cumprido",
  pendente: "pendente",
  bloqueado: "bloqueado",
  nao_aplicavel: "não se aplica",
};

function escaparHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function nomeArquivoPainelContextual(data: string): string {
  return `painel-contextual-cadeia_${data}.pdf`;
}

/** Documento HTML do painel contextual, com a identidade de marca. */
export function htmlImpressaoPainelContextual(dados: DadosImpressaoPainel): string {
  const { proxima, elos } = dados;

  const evidencias = proxima.evidencias.map((e) => `<li>${escaparHtml(e)}</li>`).join("");
  const justificativa = proxima.justificativa.length
    ? `<section><h2>Pontuação do melhor ajuste</h2>
<p class="meta">Pontuação total: <strong>${proxima.pontuacao ?? 0}</strong></p>
<ul>${proxima.justificativa.map((c) => `<li>${escaparHtml(c)}</li>`).join("")}</ul>
<table><thead><tr><th>Elo</th><th>Estado</th><th>Pontos</th></tr></thead><tbody>${proxima.ranking
        .map(
          (r) =>
            `<tr><td>${r.elo.ordem}. ${escaparHtml(r.elo.rotulo)}</td><td>${ROTULO_ESTADO_PDF[r.elo.estado]}</td><td>${r.pontos}</td></tr>`,
        )
        .join("")}</tbody></table></section>`
    : "";

  const linhasElos = elos
    .map(
      (e) =>
        `<tr><td>${e.ordem}</td><td>${escaparHtml(e.rotulo)}</td><td>${ROTULO_ESTADO_PDF[e.estado]}</td><td>${escaparHtml(e.detalhe)}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<title>Painel contextual — cadeia da jornada — Clube Ancestral</title>
<style>
  :root { --navy:#2F4B6E; --gold:#FCB73A; --cream:#ECDFCD; --borda:#DCCDB6; }
  * { box-sizing: border-box; }
  body { margin:0; padding:32px; background:#fff; color:var(--navy); font-family:Inter, system-ui, sans-serif; font-size:11px; }
  h1 { font-family:"Cormorant Garamond", Georgia, serif; font-size:26px; margin:0 0 4px; }
  h2 { font-family:"Cormorant Garamond", Georgia, serif; font-size:17px; margin:22px 0 6px; border-bottom:2px solid var(--gold); padding-bottom:3px; }
  p.meta { margin:0 0 8px; opacity:.75; }
  ul { margin:4px 0 0 16px; padding:0; }
  table { width:100%; border-collapse:collapse; margin-top:6px; }
  th { text-align:left; background:var(--cream); font-size:10px; text-transform:uppercase; letter-spacing:.04em; }
  th, td { border:1px solid var(--borda); padding:4px 6px; vertical-align:top; }
  tr { break-inside:avoid; }
  @page { margin:14mm; }
</style></head>
<body>
  <h1>Painel contextual — cadeia da jornada</h1>
  <p class="meta">Clube Ancestral · evento ${escaparHtml(dados.evento)} · gerado em ${escaparHtml(dados.data)} · visão somente leitura</p>
  <p class="meta">Uso interno. Nenhum envio, publicação ou gravação foi executado para gerar este documento.</p>

  <section><h2>Próxima ação no Painel Hoje</h2>
    <p class="meta">${escaparHtml(proxima.status)}</p>
    <table><tbody>
      <tr><th>Ação</th><td>${escaparHtml(proxima.rotulo)}</td></tr>
      <tr><th>Responsável</th><td>${escaparHtml(proxima.responsavel)}</td></tr>
      <tr><th>Prazo</th><td>${escaparHtml(proxima.prazo)}</td></tr>
      <tr><th>Objeto canônico</th><td>${escaparHtml(proxima.destino ?? "—")}</td></tr>
      <tr><th>Origem da sugestão</th><td>${proxima.origem === "melhor_ajuste" ? "melhor ajuste" : "elo pendente"}</td></tr>
    </tbody></table>
  </section>

  <section><h2>Motivo e evidências</h2>
    <p>${escaparHtml(proxima.motivo)}</p>
    <ul>${evidencias}</ul>
  </section>

  ${justificativa}

  <section><h2>Cadeia da jornada (11 elos)</h2>
    <table><thead><tr><th>#</th><th>Elo</th><th>Estado</th><th>Detalhe</th></tr></thead><tbody>${linhasElos}</tbody></table>
  </section>
</body></html>`;
}

/**
 * Resumo em texto simples do painel contextual, em formato padronizado,
 * para copiar à área de transferência. Não envia nem persiste nada.
 */
export function resumoTextoPainelContextual(dados: DadosImpressaoPainel): string {
  const { proxima, elos } = dados;
  const linhas: string[] = [
    "CLUBE ANCESTRAL — PAINEL CONTEXTUAL DA CADEIA DA JORNADA (somente leitura)",
    `Evento: ${dados.evento}`,
    `Gerado em: ${dados.data}`,
    "",
    "PRÓXIMA AÇÃO NO PAINEL HOJE",
    `- Status: ${proxima.status}`,
    `- Ação: ${proxima.rotulo}`,
    `- Responsável: ${proxima.responsavel}`,
    `- Prazo: ${proxima.prazo}`,
    `- Objeto canônico: ${proxima.destino ?? "—"}`,
    `- Origem da sugestão: ${proxima.origem === "melhor_ajuste" ? "melhor ajuste" : "elo pendente"}`,
    "",
    "MOTIVO",
    proxima.motivo,
    "",
    "EVIDÊNCIAS",
    ...proxima.evidencias.map((e) => `- ${e}`),
  ];

  if (proxima.justificativa.length > 0) {
    linhas.push(
      "",
      `PONTUAÇÃO DO MELHOR AJUSTE: ${proxima.pontuacao ?? 0}`,
      ...proxima.justificativa.map((c) => `- ${c}`),
    );
  }

  linhas.push(
    "",
    "CADEIA DA JORNADA (11 ELOS)",
    ...elos.map((e) => `${e.ordem}. ${e.rotulo} — ${ROTULO_ESTADO_PDF[e.estado]} — ${e.detalhe}`),
    "",
    "Uso interno. Nenhum envio, publicação ou gravação foi executado.",
  );

  return linhas.join("\n");
}

/** Abre a janela de impressão do navegador para salvar em PDF. */
export function imprimirPdfPainelContextual(dados: DadosImpressaoPainel): boolean {
  if (typeof window === "undefined") return false;
  const janela = window.open("", "_blank", "width=1024,height=768");
  if (!janela) return false;
  janela.document.write(htmlImpressaoPainelContextual(dados));
  janela.document.close();
  janela.focus();
  janela.print();
  return true;
}
