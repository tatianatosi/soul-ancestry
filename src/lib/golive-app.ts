/**
 * Distribuição do conteúdo publicado pelas sete abas do App Cliente.
 *
 * Funções puras: nada de banco, nada de dedução. Só organiza projeções que a
 * equipe já aprovou ou publicou para o titular. Sem publicação, a aba fica
 * vazia — nunca preenchida com dado interno do Desk.
 */

export type ProjecaoPublicada = {
  id: string;
  tipo: string;
  origem?: string | null;
  resumo?: string | null;
  em?: string | null;
};

export type AbaApp = "Home" | "Jornada" | "Radar" | "Árvore" | "Documentos" | "Legado" | "Conta";

export const ABAS_APP: readonly AbaApp[] = [
  "Home",
  "Jornada",
  "Radar",
  "Árvore",
  "Documentos",
  "Legado",
  "Conta",
];

/** Aba de destino de uma publicação, pela origem canônica do conteúdo. */
export function abaDaPublicacao(p: ProjecaoPublicada): AbaApp | null {
  const chave = `${p.origem ?? ""} ${p.tipo ?? ""}`.toLowerCase();
  if (/lineage|linhagem|arvore|árvore|relationship|parentesco/.test(chave)) return "Árvore";
  if (/evidence|evidencia|evidência|document/.test(chave)) return "Documentos";
  if (/finding|achado|legado|memoria|memória|colec|coleç/.test(chave)) return "Legado";
  if (/milestone|event|case|caso|jornada|resumo|etapa/.test(chave)) return "Jornada";
  return null;
}

/** Publicações de uma aba, da mais recente para a mais antiga. */
export function publicacoesDaAba(
  publicados: readonly ProjecaoPublicada[],
  aba: AbaApp,
): ProjecaoPublicada[] {
  return publicados
    .filter((p) => abaDaPublicacao(p) === aba)
    .slice()
    .sort((a, b) => String(b.em ?? "").localeCompare(String(a.em ?? "")));
}

/** Publicação mais recente do caso, em qualquer aba. */
export function ultimaPublicacao(
  publicados: readonly ProjecaoPublicada[],
): ProjecaoPublicada | null {
  const ordenadas = publicados
    .slice()
    .sort((a, b) => String(b.em ?? "").localeCompare(String(a.em ?? "")));
  return ordenadas[0] ?? null;
}

export type Marco = { id: string; titulo: string; quando: string | null; atual: boolean };

/**
 * Stepper da Jornada: de quatro a seis marcos já publicados. O marco atual é
 * o mais recente; nada é projetado para o futuro.
 */
export function marcosPublicados(publicados: readonly ProjecaoPublicada[]): Marco[] {
  const jornada = publicacoesDaAba(publicados, "Jornada").slice(0, 6).reverse();
  return jornada.map((p, i) => ({
    id: p.id,
    titulo: p.resumo ?? p.tipo,
    quando: p.em ?? null,
    atual: i === jornada.length - 1,
  }));
}

export type DocumentoCliente = { id: string; titulo: string; status?: string | null };

export type SituacaoDocumentos = { solicitados: number; emRevisao: number; liberados: number };

/** Três situações que a família entende: pedido, em conferência e liberado. */
export function situacaoDocumentos(
  documentos: readonly DocumentoCliente[],
): SituacaoDocumentos {
  const combina = (d: DocumentoCliente, re: RegExp) => re.test(String(d.status ?? ""));
  return {
    solicitados: documentos.filter((d) => combina(d, /solicit|pendente|aguard|request/i)).length,
    emRevisao: documentos.filter((d) => combina(d, /revis|analis|conferen|review/i)).length,
    liberados: documentos.filter((d) => combina(d, /liberad|entregue|aprovad|public/i)).length,
  };
}

/* ------------------------------------------------------------------ *
 * Pesquisa e Jurídico já gravados, na leitura da família
 * ------------------------------------------------------------------ */

export type EvidenciaPesquisa = {
  id: string;
  titulo: string;
  status?: string | null;
  validadaEm?: string | null;
  registradaEm?: string | null;
};

/**
 * Evidência só chega à família quando a equipe já a marcou como aprovada
 * para entrega ou publicada. Nenhum outro estado aparece no App.
 */
export function evidenciasParaFamilia(
  evidencias: readonly EvidenciaPesquisa[],
): EvidenciaPesquisa[] {
  return evidencias
    .filter((e) => /aprovada_para_entrega|publicada/.test(String(e.status ?? "")))
    .slice()
    .sort((a, b) =>
      String(b.validadaEm ?? b.registradaEm ?? "").localeCompare(
        String(a.validadaEm ?? a.registradaEm ?? ""),
      ),
    );
}

export type FontePesquisa = { id: string; titulo: string; instituicao?: string | null };

/** Fontes já consultadas, sem interpretação nem juízo sobre o caso. */
export function fontesParaFamilia(fontes: readonly FontePesquisa[]): FontePesquisa[] {
  return fontes.slice(0, 8);
}

export type AchadoPesquisa = {
  id: string;
  titulo: string;
  publicavel?: boolean;
  validacao?: string | null;
  validadoEm?: string | null;
};

/**
 * Achado só entra no Legado quando é elegível para entrega e já foi validado.
 * Hipótese nunca aparece como fato.
 */
export function achadosParaFamilia(achados: readonly AchadoPesquisa[]): AchadoPesquisa[] {
  return achados.filter(
    (a) => a.publicavel === true && /confirmad|validad|aprovad/i.test(String(a.validacao ?? "")),
  );
}

export type ContratoCliente = {
  id: string;
  clienteId?: string | null;
  titulo: string;
  numero?: string | null;
  status?: string | null;
  assinadoEm?: string | null;
};

/**
 * Instrumento que a família pode ver: assinado, ou já liberado para envio.
 * Sempre filtrado pelo titular quando o contrato registra o cliente — o App
 * nunca lê instrumento de outra pessoa, mesmo dentro do mesmo caso.
 */
export function contratoParaFamilia(
  contratos: readonly ContratoCliente[],
  titularId?: string | null,
): ContratoCliente | null {
  const doTitular = titularId
    ? contratos.filter((c) => !c.clienteId || c.clienteId === titularId)
    : contratos;
  const assinado = doTitular.find((c) => Boolean(c.assinadoEm));
  if (assinado) return assinado;
  return doTitular.find((c) => /assinad|vigente|ativo/i.test(String(c.status ?? ""))) ?? null;
}

export type ParcelaCliente = {
  id: string;
  clienteId?: string | null;
  numero?: string | null;
  valor?: number | null;
  status?: string | null;
  vencimento?: string | null;
  pagaEm?: string | null;
};

export type SituacaoFinanceira = {
  parcelas: ParcelaCliente[];
  pagas: number;
  emAberto: number;
  proxima: ParcelaCliente | null;
};

/**
 * Financeiro na leitura da família: só parcela já emitida para o cliente.
 * Rascunho e cancelamento não aparecem; nenhum valor é calculado aqui.
 */
export function financeiroParaFamilia(
  faturas: readonly ParcelaCliente[],
  titularId?: string | null,
): SituacaoFinanceira {
  const parcelas = faturas
    .filter((f) => (titularId ? !f.clienteId || f.clienteId === titularId : true))
    .filter((f) => !/rascunho|draft|cancelad/i.test(String(f.status ?? "")))
    .slice()
    .sort((a, b) => String(a.vencimento ?? "").localeCompare(String(b.vencimento ?? "")));
  const paga = (p: ParcelaCliente) => Boolean(p.pagaEm) || /pag|quitad|liquidad/i.test(String(p.status ?? ""));
  const emAberto = parcelas.filter((p) => !paga(p));
  return {
    parcelas,
    pagas: parcelas.length - emAberto.length,
    emAberto: emAberto.length,
    proxima: emAberto[0] ?? null,
  };
}

/* ------------------------------------------------------------------ *
 * Gráficos das abas — só contagem do que já está publicado
 * ------------------------------------------------------------------ */

export type Fatia = { rotulo: string; valor: number };

/** Quanto já foi publicado em cada aba de conteúdo. Zero fica visível. */
export function publicacoesPorAba(publicados: readonly ProjecaoPublicada[]): Fatia[] {
  const abas: AbaApp[] = ["Jornada", "Árvore", "Documentos", "Legado"];
  return abas.map((aba) => ({ rotulo: aba, valor: publicacoesDaAba(publicados, aba).length }));
}

/** Mês a mês das publicações, na data local registrada. Sem data não entra. */
export function publicacoesPorMes(publicados: readonly ProjecaoPublicada[]): Fatia[] {
  const contas = new Map<string, number>();
  for (const p of publicados) {
    const em = p.em ? String(p.em).slice(0, 7) : null;
    if (!em) continue;
    contas.set(em, (contas.get(em) ?? 0) + 1);
  }
  return [...contas.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([mes, valor]) => ({ rotulo: mes.split("-").reverse().join("/"), valor }));
}

/** Fontes já consultadas, agrupadas pela instituição declarada. */
export function fontesPorInstituicao(fontes: readonly FontePesquisa[]): Fatia[] {
  const contas = new Map<string, number>();
  for (const f of fontes) {
    const chave = f.instituicao?.trim() || "Sem instituição registrada";
    contas.set(chave, (contas.get(chave) ?? 0) + 1);
  }
  return [...contas.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([rotulo, valor]) => ({ rotulo, valor }));
}

/** Parcelas pagas x em aberto, para a leitura da família. */
export function parcelasEmFatias(situacao: SituacaoFinanceira): Fatia[] {
  return [
    { rotulo: "Pagas", valor: situacao.pagas },
    { rotulo: "Em aberto", valor: situacao.emAberto },
  ];
}
