/**
 * Exportação SOMENTE-LEITURA da visão /crm-mestre (CA-04).
 *
 * Gera CSV e uma versão para impressão/PDF a partir das constantes canônicas
 * já exibidas na tela. Nenhum dado é criado, alterado ou enviado para fora:
 * o CSV é montado em memória e o PDF usa a impressão do próprio navegador.
 */

import {
  BLOQUEIOS_EXEMPLARES_HANDOFF,
  BRIEF_DISCOVERY,
  CAMPOS_PROIBIDOS_CLIENTE_CA04,
  DECISOES_PENDENTES_CA04,
  EIXO_COMERCIAL_TRANSICOES,
  EIXO_FORMALIZACAO_TRANSICOES,
  FONTES_VERDADE_CA04,
  LISTAS_BASE_CA04,
  MATRIZ_HANDOFF_CA04,
  ROTEIRO_DISCOVERY_V2,
  type NomeListaCA04,
} from "@/lib/ca04-crm-mestre";

export const CRM_MESTRE_VERSAO = "CA-04-v1.0.1";

export const CABECALHO_CSV_CRM_MESTRE = ["secao", "item", "campo", "valor"] as const;

export type LinhaCrmMestre = {
  secao: string;
  item: string;
  campo: string;
  valor: string;
};

/** Matriz completa da visão somente leitura, seção por seção. */
export function linhasCrmMestre(): LinhaCrmMestre[] {
  const linhas: LinhaCrmMestre[] = [];
  const add = (secao: string, item: string, campo: string, valor: string) =>
    linhas.push({ secao, item, campo, valor });

  for (const f of FONTES_VERDADE_CA04) {
    add("Fontes de verdade", f.camada, "responsabilidade", f.responsabilidade);
    add("Fontes de verdade", f.camada, "nao_usar_como", f.naoUsarComo);
  }

  const eixos = [
    ["Eixo Comercial", EIXO_COMERCIAL_TRANSICOES],
    ["Eixo Formalização/Operação", EIXO_FORMALIZACAO_TRANSICOES],
  ] as const;
  for (const [secao, transicoes] of eixos) {
    for (const t of transicoes) {
      const item = `${t.de === "*" ? "Qualquer etapa" : t.de} → ${t.para}`;
      add(secao, item, "gatilho", t.gatilho);
      add(secao, item, "responsavel", t.responsavel);
      add(secao, item, "dados_minimos", t.dadosMinimos);
      add(secao, item, "bloqueio", t.bloqueio);
      add(secao, item, "fonte_de_verdade", t.fonteVerdade);
    }
  }

  ROTEIRO_DISCOVERY_V2.forEach((passo, i) =>
    add("Roteiro Mestre de Discovery v2", String(i + 1), "passo", passo),
  );

  for (const c of BRIEF_DISCOVERY) {
    add("Brief de Discovery", c.campo, "origem", c.origem);
    add("Brief de Discovery", c.campo, "retorna_ao_crm", c.retornaAoCrm ? "sim" : "nao");
  }

  for (const e of MATRIZ_HANDOFF_CA04) {
    add("Matriz de handoff", e.etapa, "dado_recebido", e.dadoRecebido);
    add("Matriz de handoff", e.etapa, "dado_criado", e.dadoCriado);
    add("Matriz de handoff", e.etapa, "responsavel", e.responsavel);
    add("Matriz de handoff", e.etapa, "condicao_de_aprovacao", e.condicaoAprovacao);
    add("Matriz de handoff", e.etapa, "visibilidade", e.visibilidade);
    add("Matriz de handoff", e.etapa, "bloqueio", e.bloqueio);
  }

  BLOQUEIOS_EXEMPLARES_HANDOFF.forEach((b, i) =>
    add("Bloqueios exemplares", String(i + 1), "bloqueio", b),
  );

  CAMPOS_PROIBIDOS_CLIENTE_CA04.forEach((c) =>
    add("Nunca projetar ao cliente", c, "campo_proibido", c),
  );

  for (const nome of Object.keys(LISTAS_BASE_CA04) as NomeListaCA04[]) {
    for (const valor of LISTAS_BASE_CA04[nome] as readonly string[]) {
      add("Listas controladas", nome, "valor", valor);
    }
  }

  for (const d of DECISOES_PENDENTES_CA04) {
    add("Decisões humanas pendentes", String(d.numero).padStart(2, "0"), "titulo", d.titulo);
    add("Decisões humanas pendentes", String(d.numero).padStart(2, "0"), "responsavel", d.responsavel);
  }

  return linhas;
}

function celula(valor: string): string {
  const v = valor ?? "";
  return /[",;\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** CSV com BOM, para abrir corretamente no Excel em pt-BR. */
export function gerarCsvCrmMestre(): string {
  const linhas = [
    CABECALHO_CSV_CRM_MESTRE.join(","),
    ...linhasCrmMestre().map((l) => [l.secao, l.item, l.campo, l.valor].map(celula).join(",")),
  ];
  return `\uFEFF${linhas.join("\r\n")}\r\n`;
}

export function nomeArquivoCrmMestre(extensao: "csv" | "pdf" = "csv"): string {
  return `crm-mestre_${CRM_MESTRE_VERSAO}.${extensao}`;
}

/** Dispara o download do CSV. Não envia nada para fora do dispositivo. */
export function baixarCsvCrmMestre(): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([gerarCsvCrmMestre()], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivoCrmMestre("csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escaparHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Documento HTML da visão somente leitura, com a identidade de marca. */
export function htmlImpressaoCrmMestre(dataISO = new Date().toISOString().slice(0, 10)): string {
  const linhas = linhasCrmMestre();
  const secoes = [...new Set(linhas.map((l) => l.secao))];
  const corpo = secoes
    .map((secao) => {
      const itens = linhas.filter((l) => l.secao === secao);
      const linhasHtml = itens
        .map(
          (l) =>
            `<tr><td>${escaparHtml(l.item)}</td><td>${escaparHtml(l.campo)}</td><td>${escaparHtml(l.valor)}</td></tr>`,
        )
        .join("");
      return `<section><h2>${escaparHtml(secao)}</h2><table><thead><tr><th>Item</th><th>Campo</th><th>Valor</th></tr></thead><tbody>${linhasHtml}</tbody></table></section>`;
    })
    .join("");

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<title>CRM Mestre, Discovery e Handoff — Clube Ancestral</title>
<style>
  :root { --navy:#2F4B6E; --gold:#FCB73A; --cream:#ECDFCD; --fundo:#F7F1E7; --borda:#DCCDB6; }
  * { box-sizing: border-box; }
  body { margin:0; padding:32px; background:#fff; color:var(--navy); font-family:Inter, system-ui, sans-serif; font-size:11px; }
  h1 { font-family:"Cormorant Garamond", Georgia, serif; font-size:26px; margin:0 0 4px; }
  h2 { font-family:"Cormorant Garamond", Georgia, serif; font-size:17px; margin:22px 0 6px; border-bottom:2px solid var(--gold); padding-bottom:3px; }
  p.meta { margin:0 0 8px; color:#2F4B6E; opacity:.7; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; background:var(--cream); font-size:10px; text-transform:uppercase; letter-spacing:.04em; }
  th, td { border:1px solid var(--borda); padding:4px 6px; vertical-align:top; }
  section { break-inside:auto; }
  tr { break-inside:avoid; }
  @page { margin:14mm; }
</style></head>
<body>
  <h1>CRM Mestre, Discovery e Handoff</h1>
  <p class="meta">Clube Ancestral · ${escaparHtml(CRM_MESTRE_VERSAO)} · gerado em ${escaparHtml(dataISO)} · visão somente leitura</p>
  <p class="meta">Uso interno. Nenhum dado foi criado ou alterado e nenhuma ação externa foi disparada.</p>
  ${corpo}
</body></html>`;
}

/** Abre a janela de impressão do navegador para salvar em PDF. */
export function imprimirPdfCrmMestre(): boolean {
  if (typeof window === "undefined") return false;
  const janela = window.open("", "_blank", "width=1024,height=768");
  if (!janela) return false;
  janela.document.write(htmlImpressaoCrmMestre());
  janela.document.close();
  janela.focus();
  janela.print();
  return true;
}
